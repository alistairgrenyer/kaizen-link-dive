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
2. Select a location for search results.
3. Upload a PDF (drag & drop or browse).
4. Click Generate Keywords → OpenAI returns 15–20 suggestions.
5. Click a keyword → app calls DataForSEO and shows top 10 results.

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
{ "keyword": "...", "location": "Ireland" }
```

**Resp:**
```json
{ "results": [ { "title":"...", "url":"...", "description":"...", "position":1 } ] }
```

## Defaults & Notes

- DataForSEO: language_code: "en", device: "desktop", customizable location via dropdown.
- PDF parsing: text is normalized (line breaks/hyphens) and capped (~20k chars) before sending to OpenAI.
- Runtime: API routes run on Node (export const runtime = 'nodejs').
- Errors: Clear messages for missing keys, empty PDFs, and API failures.
- Caching: SERP results cached for 15 min (in-memory, bypass with ?nocache=1).

## Testing

The app includes Jest tests for core functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

Tests cover three key areas:

1. **Text Normalization**: Tests how text extracted from PDFs is processed to fix line breaks, hyphenation, and extra whitespace.
2. **SERP Mapping**: Tests the transformation of DataForSEO responses to the app's format, ensuring exactly 10 organic results.
3. **Cache TTL**: Tests the in-memory cache system with proper TTL expiry, hit/miss behavior, and memory management.

## Project Structure (essentials)
```
src/app/
  api/
    generate-keywords/route.ts  # PDF → text → OpenAI
    search-serp/route.ts        # DataForSEO SERP + caching
  page.tsx                      # UI: form, PDF upload, results
src/components/
  LocationDropdown.tsx        # Location selection with fuzzy search
src/lib/
  cache.ts                    # TTL in-memory cache system
src/__tests__/
  text-normalization.test.ts  # Tests for text normalization
  serp-mapping.test.ts        # Tests for SERP data processing
  cache-ttl.test.ts           # Tests for caching system
public/test-data/
  example.pdf                 # (optional demo file)
  locations.json              # DataForSEO location options
```

## Deploy

Works out of the box on Vercel (add env vars), or any Node host.

## License

MIT
