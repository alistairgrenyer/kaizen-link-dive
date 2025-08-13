import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

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

    // DataForSEO API endpoint for Google Organic Live results
    const apiUrl = 'https://api.dataforseo.com/v3/serp/google/organic/live/regular';
    
    const requestBody = [{
      keyword: keyword,
      location_code: 2840, // United States
      language_code: 'en',
      device: 'desktop',
      os: 'windows',
      depth: 10 // Get top 10 results
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

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error searching SERP:', error);
    
    return NextResponse.json(
      { error: 'Failed to search SERP results. Please check your DataForSEO API credentials and try again.' },
      { status: 500 }
    );
  }
}
