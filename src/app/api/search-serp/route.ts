import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/cache';

export const runtime = 'nodejs';

// Short-lived TTL for MVP
const TTL_SECONDS = 15 * 60; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, location } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    // Check if we have valid credentials
    if (!login || !password || login === 'your_dataforseo_login_here' || password === 'your_dataforseo_password_here') {
      return NextResponse.json(
        { error: 'DataForSEO credentials are not configured. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your environment variables.' },
        { status: 400 }
      );
    }

    // Set default or use provided location
    const params = {
      language_code: 'en',
      device: 'desktop',
      os: 'windows',
      depth: 20                // request deeper, then take first 10 organic
    };
    
    // Use location_name if provided, otherwise default to Ireland
    if (location) {
      (params as any).location_name = location;
    } else {
      (params as any).location_name = 'Ireland';
    }

    // Allow manual bypass with ?nocache=1
    const noCache = request.nextUrl.searchParams.get('nocache') === '1';

    const cacheKey = `serp:${keyword}|${(params as any).location_name}|${params.language_code}|${params.device}|${params.os}|${params.depth}`;

    if (!noCache) {
      const cached = cacheGet<{ results: any[] }>(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
      }
    }

    // DataForSEO API endpoint for Google Organic Live results
    const apiUrl = 'https://api.dataforseo.com/v3/serp/google/organic/live/regular';
    
    const requestBody = [{
      keyword,
      ...params
    }];

    const credentials = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.tasks || !data.tasks[0] || !data.tasks[0].result) {
      throw new Error('Invalid response from DataForSEO API');
    }

    const serpResults = data.tasks[0].result[0]?.items || [];
    
    // Transform the results to our format
    const results = serpResults
      .filter((item: any) => item.type === 'organic')
      .slice(0, 10)
      .map((item: any, index: number) => ({
        title: item.title || 'No title available',
        url: item.url || '#',
        description: item.description || 'No description available',
        position: index + 1
      }));

    // Save to cache
    cacheSet(cacheKey, { results }, TTL_SECONDS);

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error searching SERP:', error);
    
    return NextResponse.json(
      { error: 'Failed to search SERP results. Please check your DataForSEO API credentials and try again.' },
      { status: 500 }
    );
  }
}
