import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const APIAccessPanel: React.FC = () => {
  const { user, getItemListingLimits } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  
  const limits = getItemListingLimits();

  const generateApiKey = async () => {
    setIsGeneratingKey(true);
    try {
      // Simulate API key generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockApiKey = `rfsp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(mockApiKey);
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      alert('Copied to clipboard!');
    });
  };

  if (!limits.hasAPIAccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">API Access Not Available</h4>
          <p className="text-gray-600 mb-4">
            API access is available for Premium and Enterprise subscribers.
          </p>
          <a 
            href="/subscription" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
          >
            Upgrade Plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
      
      {/* API Key Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">API Key</h4>
          {!apiKey && (
            <button
              onClick={generateApiKey}
              disabled={isGeneratingKey}
              className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-400"
            >
              {isGeneratingKey ? 'Generating...' : 'Generate Key'}
            </button>
          )}
        </div>
        
        {apiKey ? (
          <div className="flex items-center space-x-2">
            <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
              {apiKey}
            </code>
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Copy to clipboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Generate an API key to start uploading items programmatically.
          </p>
        )}
      </div>

      {/* Usage Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Usage Limits</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium capitalize">{user?.subscriptionPlan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Max items per upload:</span>
            <span className="font-medium">{limits.maxItems === -1 ? 'Unlimited' : limits.maxItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rate limit:</span>
            <span className="font-medium">100 requests/hour</span>
          </div>
        </div>
      </div>

      {/* API Documentation Toggle */}
      <div>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
        >
          <span className="font-medium text-gray-900">API Documentation</span>
          <svg 
            className={`w-5 h-5 text-gray-600 transition-transform ${showDocs ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDocs && (
          <div className="mt-4 p-4 border rounded-lg space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Upload Food Items</h5>
              <div className="bg-gray-900 rounded p-3 text-sm text-green-400 font-mono overflow-x-auto">
                <div className="text-blue-400">POST</div>
                <div className="text-yellow-400">https://api.recapfoodsurplus.com/v1/items</div>
                <div className="mt-2 text-gray-300">Headers:</div>
                <div className="text-white">Authorization: Bearer YOUR_API_KEY</div>
                <div className="text-white">Content-Type: application/json</div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Example Request Body</h5>
              <div className="bg-gray-900 rounded p-3 text-sm text-white font-mono overflow-x-auto">
                <pre>{`{
  "title": "Organic Apples",
  "description": "Fresh organic apples",
  "category": "fruits",
  "type": "sale",
  "price": 3.99,
  "quantity": 5,
  "unit": "kg",
  "condition": "good",
  "expiryDate": "2024-08-20",
  "location": {
    "address": "123 Farm St",
    "city": "Cityville",
    "zipCode": "12345",
    "country": "US"
  }
}`}</pre>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Response Codes</h5>
              <ul className="text-sm space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">201</code> - Item created successfully</li>
                <li><code className="bg-gray-100 px-1 rounded">400</code> - Validation error</li>
                <li><code className="bg-gray-100 px-1 rounded">401</code> - Invalid API key</li>
                <li><code className="bg-gray-100 px-1 rounded">429</code> - Rate limit exceeded</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
