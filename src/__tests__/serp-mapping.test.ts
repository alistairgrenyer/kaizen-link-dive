/**
 * SERP Mapping Tests
 * Tests the transformation of DataForSEO API responses to our app's format
 * Ensures we always get 10 organic results properly formatted
 */

describe('SERP Mapping', () => {
  // Mock the raw DataForSEO response with mixed result types (organic, ads, etc.)
  const mockDataForSEOResponse = {
    tasks: [
      {
        result: [
          {
            items: [
              { type: 'organic', title: 'Result 1', url: 'https://example.com/1', description: 'Description 1' },
              { type: 'paid', title: 'Ad 1', url: 'https://ad.example.com/1', description: 'Ad Description 1' },
              { type: 'organic', title: 'Result 2', url: 'https://example.com/2', description: 'Description 2' },
              { type: 'organic', title: 'Result 3', url: 'https://example.com/3', description: 'Description 3' },
              { type: 'organic', title: 'Result 4', url: 'https://example.com/4', description: 'Description 4' },
              { type: 'related_searches', items: ['related search 1', 'related search 2'] },
              { type: 'organic', title: 'Result 5', url: 'https://example.com/5', description: 'Description 5' },
              { type: 'organic', title: 'Result 6', url: 'https://example.com/6', description: 'Description 6' },
              { type: 'organic', title: 'Result 7', url: 'https://example.com/7', description: 'Description 7' },
              { type: 'organic', title: 'Result 8', url: 'https://example.com/8', description: 'Description 8' },
              { type: 'organic', title: 'Result 9', url: 'https://example.com/9', description: 'Description 9' },
              { type: 'knowledge_graph', title: 'Knowledge Graph', content: 'Some knowledge graph content' },
              { type: 'organic', title: 'Result 10', url: 'https://example.com/10', description: 'Description 10' },
              { type: 'organic', title: 'Result 11', url: 'https://example.com/11', description: 'Description 11' },
              { type: 'organic', title: 'Result 12', url: 'https://example.com/12', description: 'Description 12' },
            ]
          }
        ]
      }
    ]
  };

  // This is a simplified version of the transformation logic from your API route
  // Define interfaces for our result types
  interface SerpItem {
    type: string;
    title?: string;
    url?: string;
    description?: string;
    [key: string]: any; // For other properties we don't care about
  }

  interface SearchResult {
    title: string;
    url: string;
    description: string;
    position: number;
  }

  function transformSerpResults(data: any): SearchResult[] {
    if (!data.tasks || !data.tasks[0] || !data.tasks[0].result) {
      throw new Error('Invalid response from DataForSEO API');
    }

    const serpResults = data.tasks[0].result[0]?.items || [];
    
    // Transform the results to our format
    return serpResults
      .filter((item: SerpItem) => item.type === 'organic')
      .slice(0, 10)
      .map((item: SerpItem, index: number): SearchResult => ({
        title: item.title || 'No title available',
        url: item.url || '#',
        description: item.description || 'No description available',
        position: index + 1
      }));
  }

  test('should filter out non-organic results', () => {
    const results = transformSerpResults(mockDataForSEOResponse);
    // Check that all results are properly transformed organic results
    results.forEach((result: SearchResult) => {
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('position');
    });

    // There should be no "paid" or other types in the results
    expect(results.some((r: SearchResult) => r.title.includes('Ad '))).toBe(false);
    expect(results.some((r: SearchResult) => r.title.includes('Knowledge Graph'))).toBe(false);
  });

  test('should limit to exactly 10 results', () => {
    const results = transformSerpResults(mockDataForSEOResponse);
    expect(results.length).toBe(10);
    // Specifically check that Result 11 and 12 are not included
    expect(results.some((r: SearchResult) => r.title === 'Result 11')).toBe(false);
    expect(results.some((r: SearchResult) => r.title === 'Result 12')).toBe(false);
  });

  test('should handle missing data with fallbacks', () => {
    const incompleteData = {
      tasks: [
        {
          result: [
            {
              items: [
                { type: 'organic' },  // Missing title, url, description
                { type: 'organic', title: 'Complete Item', url: 'https://example.com', description: 'A description' }
              ]
            }
          ]
        }
      ]
    };

    const results = transformSerpResults(incompleteData);
    expect(results[0].title).toBe('No title available');
    expect(results[0].url).toBe('#');
    expect(results[0].description).toBe('No description available');
    
    expect(results[1].title).toBe('Complete Item');
  });

  test('should assign correct position numbers', () => {
    const results = transformSerpResults(mockDataForSEOResponse);
    // Positions should be 1-based and sequential
    results.forEach((result: SearchResult, index: number) => {
      expect(result.position).toBe(index + 1);
    });
    
    // First result should be position 1, last should be position 10
    expect(results[0].position).toBe(1);
    expect(results[9].position).toBe(10);
  });

  test('should throw error for invalid response format', () => {
    expect(() => transformSerpResults({})).toThrow('Invalid response from DataForSEO API');
    expect(() => transformSerpResults({ tasks: [] })).toThrow('Invalid response from DataForSEO API');
  });
});
