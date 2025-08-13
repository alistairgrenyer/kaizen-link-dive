import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

function normalizeText(s: string) {
  return s
    .replace(/\r/g, '\n')
    .replace(/-\n/g, '')            // join hyphenated line breaks
    .replace(/[ \t]+\n/g, '\n')     // strip trailing spaces
    .replace(/\n{3,}/g, '\n\n')     // collapse big gaps
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured.' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ---- PDF upload path only ----
    const form = await request.formData();
    const file = form.get('file') as File | null;

    const clientName = String(form.get('clientName') ?? '');
    const campaignName = String(form.get('campaignName') ?? '');
    const campaignUrl = String(form.get('campaignUrl') ?? '');
    const seedKeywords = String(form.get('seedKeywords') ?? '');

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
    }

    // Lazy-import pdf-parse to avoid ENOENT on some builds
    let pdfParse: (buf: Buffer) => Promise<{ text?: string }>;
    try {
      pdfParse = (await import('pdf-parse')).default as any;
    } catch {
      // Fallback path used by some bundlers/Windows setups
      pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default as any;
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const parsedPdf = await pdfParse(buffer);

    let landingPageCopy = normalizeText(parsedPdf?.text ?? '');
    if (!landingPageCopy) {
      return NextResponse.json({ error: 'No text found in PDF.' }, { status: 400 });
    }

    // Cap extremely long docs
    const MAX_CHARS = 20000;
    if (landingPageCopy.length > MAX_CHARS) {
      landingPageCopy = landingPageCopy.slice(0, MAX_CHARS);
    }

    const prompt = `
You are an expert SEO and PR specialist. Based on the campaign information, generate 15–20 Google search keywords that journalists, bloggers, and website owners might use to find coverage related to this campaign.

Campaign Details:
- Client Name: ${clientName || 'Not specified'}
- Campaign Name: ${campaignName || 'Not specified'}
- Campaign URL: ${campaignUrl || 'Not specified'}
- Seed Keywords: ${seedKeywords || 'Not specified'}

Landing Page Copy:
${landingPageCopy}

Focus on:
- News-worthy angles, industry terms
- Location-based queries for Ireland
- Stats / data / ranking comparisons
- Synonyms (affordable, cheapest, budget, low-cost)

Return ONLY valid JSON array, like:
[
  {"keyword": "keyword phrase"},
  {"keyword": "another keyword phrase"}
]
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return only valid JSON: [{"keyword": "..."}]' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const text = completion.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) {
      return NextResponse.json({ error: 'No response from OpenAI.' }, { status: 502 });
    }

    let keywords: Array<{ keyword: string }>;
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Not an array');
      keywords = parsed.slice(0, 20).map((it: any) =>
        typeof it === 'string'
          ? { keyword: it }
          : it && typeof it.keyword === 'string'
          ? { keyword: it.keyword }
          : { keyword: 'Malformed keyword' }
      );
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse OpenAI JSON. Try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ keywords });
  } catch (e) {
    console.error('generate-keywords error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
