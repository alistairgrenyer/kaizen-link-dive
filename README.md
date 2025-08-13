# Link Dive AI

A production-quality MVP for generating search keywords from landing page copy and analyzing Google search results to discover coverage opportunities.

## Features

- **Keyword Generation**: Uses OpenAI GPT to generate 15-20 relevant search keywords from landing page copy
- **SERP Analysis**: Integrates with DataForSEO API to fetch top 10 Google search results for selected keywords
- **Clean UI**: Modern, responsive interface built with Next.js, TypeScript, and Tailwind CSS
- **Test Data**: Includes sample data for the "Most Affordable Homes in Ireland" campaign
- **Production Ready**: Proper error handling, loading states, and fallback data

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **APIs**: OpenAI GPT-3.5-turbo, DataForSEO Google Organic Live API
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- DataForSEO account credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kaizen-link-dive
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.local.example .env.local
```

Edit `.env.local` and add your API credentials:
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# DataForSEO API Configuration
DATAFORSEO_LOGIN=your_dataforseo_login_here
DATAFORSEO_PASSWORD=your_dataforseo_password_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Workflow

1. **Enter Campaign Details**: Fill in client name, campaign name, campaign URL, and optional seed keywords
2. **Add Landing Page Copy**: Paste your landing page content in the text area
3. **Generate Keywords**: Click "Generate Keywords" to get AI-powered keyword suggestions
4. **Analyze Results**: Select any keyword to see the top 10 Google search results
5. **Discover Opportunities**: Review the results to identify potential coverage opportunities

### Test Data

Click "Load Test Data" to populate the form with sample data from the "Most Affordable Homes in Ireland" campaign by Chill.ie.

## API Endpoints

### POST `/api/generate-keywords`

Generates search keywords using OpenAI GPT.

**Request Body:**
```json
{
  "landingPageCopy": "Your landing page content...",
  "clientName": "Client Name",
  "campaignName": "Campaign Name",
  "campaignUrl": "https://example.com/campaign",
  "seedKeywords": "optional, seed, keywords"
}
```

**Response:**
```json
{
  "keywords": [
    {"keyword": "generated keyword 1"},
    {"keyword": "generated keyword 2"}
  ]
}
```

### POST `/api/search-serp`

Searches Google results using DataForSEO API.

**Request Body:**
```json
{
  "keyword": "search keyword"
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "Page Title",
      "url": "https://example.com",
      "description": "Page description...",
      "position": 1
    }
  ]
}
```

## Configuration

### OpenAI Settings

The app uses GPT-3.5-turbo with the following parameters:
- Temperature: 0.7 (balanced creativity)
- Max tokens: 1000
- Optimized prompt for PR/SEO keyword generation

### DataForSEO Settings

- Location: United States (code: 2840)
- Language: English
- Device: Desktop
- OS: Windows
- Depth: 10 results

## Error Handling

- **Missing API Keys**: Falls back to mock data when credentials aren't configured
- **API Failures**: Provides fallback keywords and results
- **Network Issues**: Graceful error messages with retry options
- **Invalid Input**: Client-side validation with helpful error messages

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-keywords/route.ts    # OpenAI integration
│   │   └── search-serp/route.ts          # DataForSEO integration
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Main application
└── ...
```

### Key Components

- **Main Page** (`page.tsx`): Single-page application with form, keyword display, and results
- **API Routes**: Serverless functions for OpenAI and DataForSEO integration
- **TypeScript Interfaces**: Type safety for keywords and search results

### Styling

- Tailwind CSS for utility-first styling
- Responsive design (mobile-first)
- Clean, professional UI with proper loading states
- Accessible form controls and navigation

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## API Keys Setup

### OpenAI API Key

1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

### DataForSEO Credentials

1. Sign up at [DataForSEO](https://dataforseo.com/)
2. Get your login and password from the dashboard
3. Add to `.env.local` as `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`

## Testing

The application includes comprehensive error handling and fallback data, so it can be tested even without API credentials configured.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
