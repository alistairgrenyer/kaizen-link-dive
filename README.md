# Link Dive AI

Generate PR/SEO search keywords from landing-page content (PDF) and fetch top Google results.

## Stack

Next.js (App Router) + TypeScript + Tailwind

APIs: OpenAI (keyword generation), DataForSEO Google Organic Live (SERP)

PDF: pdf-parse@1.1.1 (pinned), Node runtime

## Quick Start
```bash
git clone <repo>
cd kaizen-link-dive
npm install
cp .env.local.example .env.local
npm run dev
# open http://localhost:3000
```

## .env.local

```
OPENAI_API_KEY=sk-...
DATAFORSEO_LOGIN=you@example.com
DATAFORSEO_PASSWORD=********
```

## How to Use

1. Fill in Client/Campaign fields.
2. Upload a PDF (drag & drop or browse).
3. Click Generate Keywords → OpenAI returns 15–20 suggestions.
4. Click a keyword → app calls DataForSEO and shows top 10 results.

## API
### POST /api/generate-keywords

**Body:** multipart/form-data

file (required, PDF), clientName?, campaignName?, campaignUrl?, seedKeywords?

**Resp:**
```json
{ "keywords": [ { "keyword": "..." } ] }
```

### POST /api/search-serp

**Body:**
```json
{ "keyword": "..." }
```

**Resp:**
```json
{ "results": [ { "title":"...", "url":"...", "description":"...", "position":1 } ] }
```

## Defaults & Notes

- DataForSEO: language_code: "en", location_name: "Ireland", device: "desktop".
- PDF parsing: text is normalized (line breaks/hyphens) and capped (~20k chars) before sending to OpenAI.
- Runtime: API routes run on Node (export const runtime = 'nodejs').
- Errors: Clear messages for missing keys, empty PDFs, and API failures.
- Caching: SERP results cached for 15 min (in-memory, bypass with ?nocache=1).

## Project Structure (essentials)
```
src/app/
  api/
    generate-keywords/route.ts  # PDF → text → OpenAI
    search-serp/route.ts        # DataForSEO SERP + caching
  page.tsx                      # UI: form, PDF upload, results
src/lib/
  cache.ts                    # TTL in-memory cache system
public/test-data/example.pdf    # (optional demo file)
```

## Deploy

Works out of the box on Vercel (add env vars), or any Node host.

## License

MIT
