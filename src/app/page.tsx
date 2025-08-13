'use client';

import { useState } from 'react';
import { Search, FileText, Globe, Loader2, Upload } from 'lucide-react';

interface Keyword {
  keyword: string;
  searchVolume?: string;
  difficulty?: string;
}

interface SearchResult {
  title: string;
  url: string;
  description: string;
  position: number;
}

interface FormData {
  clientName: string;
  campaignName: string;
  campaignUrl: string;
  seedKeywords: string;
}

// Initialize test data form fields
const getTestData = (): FormData => ({
  clientName: 'Chill.ie',
  campaignName: 'The Counties With The Most Affordable Homes',
  campaignUrl: 'https://www.chill.ie/blog/the-counties-with-the-most-affordable-homes/',
  seedKeywords: 'affordable homes Ireland, cheap houses Ireland, property prices Ireland'
});

// Initialize empty form data
const getEmptyForm = (): FormData => ({
  clientName: '',
  campaignName: '',
  campaignUrl: '',
  seedKeywords: ''
});

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    campaignName: '',
    campaignUrl: '',
    seedKeywords: ''
  });

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingKeyword, setSearchingKeyword] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') setPdfFile(file);
  };

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') setPdfFile(file);
  };

  const resetForm = () => {
    setFormData(getEmptyForm());
    setPdfFile(null);
  };
  
  const loadTestData = async () => {
    setFormData(getTestData());
    
    try {
      // Create a File object from the test PDF path
      const response = await fetch('/test-data/example.pdf');
      if (!response.ok) throw new Error('Failed to load test PDF');
      
      const blob = await response.blob();
      const file = new File([blob], 'example.pdf', { type: 'application/pdf' });
      setPdfFile(file);
    } catch (error) {
      console.error('Error loading test PDF:', error);
      alert('Failed to load test PDF. Make sure to place example.pdf in public/test-data/ directory.');
    }
  };

  const generateKeywords = async () => {
    if (!pdfFile) {
      alert('Please upload a PDF file first');
      return;
    }

    setLoading(true);
    setKeywords([]);
    setSearchResults([]);
    setSelectedKeyword('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', pdfFile);
      formDataObj.append('clientName', formData.clientName);
      formDataObj.append('campaignName', formData.campaignName);
      formDataObj.append('campaignUrl', formData.campaignUrl);
      formDataObj.append('seedKeywords', formData.seedKeywords);

      const response = await fetch('/api/generate-keywords', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.keywords || !Array.isArray(data.keywords)) {
        throw new Error('Invalid response format');
      }

      setKeywords(data.keywords);
      if (data.keywords.length > 0) {
        setSelectedKeyword(data.keywords[0].keyword);
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
      alert(`Error generating keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const searchKeyword = async (keyword: string) => {
    if (!keyword) return;

    setSearchingKeyword(true);
    try {
      const response = await fetch('/api/search-serp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to search keyword');
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching keyword:', error);
      alert('Failed to search keyword. Please try again.');
    } finally {
      setSearchingKeyword(false);
    }
  };

  const handleKeywordSelect = (keyword: string) => {
    setSelectedKeyword(keyword);
    searchKeyword(keyword);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Link Dive AI</h1>
          <p className="text-lg text-gray-600">Generate search keywords and discover coverage opportunities</p>
        </div>

        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800">Campaign Details</h2>

          <div className="space-y-6">
            <div 
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                pdfFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <input 
                type="file" 
                accept="application/pdf" 
                id="pdf-upload" 
                className="hidden" 
                onChange={onBrowse}
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className={`w-8 h-8 ${
                    pdfFile ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  {pdfFile ? (
                    <>
                      <p className="text-sm font-medium text-green-600">PDF uploaded successfully!</p>
                      <p className="text-xs text-gray-500">{pdfFile.name}</p>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setPdfFile(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                      >
                        Remove PDF
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">Drop PDF here or click to upload</p>
                      <p className="text-xs text-gray-500">Upload a PDF file with your landing page content</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g. Acme Inc."
                />
              </div>
              
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  id="campaignName"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g. Summer Sale 2023"
                />
              </div>
              
              <div>
                <label htmlFor="campaignUrl" className="block text-sm font-medium text-gray-700 mb-1">Campaign URL</label>
                <input
                  type="text"
                  id="campaignUrl"
                  name="campaignUrl"
                  value={formData.campaignUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="https://example.com/campaign"
                />
              </div>
              
              <div>
                <label htmlFor="seedKeywords" className="block text-sm font-medium text-gray-700 mb-1">Additional Keywords (optional)</label>
                <input
                  type="text"
                  id="seedKeywords"
                  name="seedKeywords"
                  value={formData.seedKeywords}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetForm}
              type="button"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Reset form
            </button>
            
            <button
              onClick={loadTestData}
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Load test data
            </button>
          </div>

          <button
            onClick={generateKeywords}
            disabled={loading || !pdfFile}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Keywords...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Generate Keywords
              </>
            )}
          </button>
        </div>

        {/* Keywords Results */}
        {keywords.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Keywords</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {keywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => handleKeywordSelect(keyword.keyword)}
                  className={`p-3 text-left rounded-md border transition-colors ${
                    selectedKeyword === keyword.keyword
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{keyword.keyword}</div>
                </button>
              ))}
            </div>
            
            {selectedKeyword && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected keyword:</strong> {selectedKeyword}
                </p>
                <button
                  onClick={() => searchKeyword(selectedKeyword)}
                  disabled={searchingKeyword}
                  className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 text-sm"
                >
                  {searchingKeyword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Search Google Results
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Top 10 Google Results for "{selectedKeyword}"
            </h2>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-600 hover:text-blue-800">
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          {result.title}
                        </a>
                      </h3>
                      <p className="text-sm text-green-600 mb-1">{result.url}</p>
                      <p className="text-sm text-gray-600">{result.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">
                      #{result.position}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
