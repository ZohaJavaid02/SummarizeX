import React, { useState } from 'react';
import { Key, X, ExternalLink, AlertCircle } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, onSave, currentApiKey }) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('Invalid Gemini API key format. It should start with "AIza"');
      return;
    }

    onSave(apiKey.trim());
    onClose();
  };

  const handleClose = () => {
    setError(null);
    setApiKey(currentApiKey || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Key className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Gemini API Key</h3>
            <p className="text-sm text-gray-500 mt-2">
              Enter your Google Gemini API key to enable AI-powered summaries
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                placeholder="AIzaSyC..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {error && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to get your API key:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to Google AI Studio</li>
                <li>Sign in with your Google account</li>
                <li>Create a new API key</li>
                <li>Copy and paste it above</li>
              </ol>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-3 transition-colors"
              >
                Open Google AI Studio
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Save API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
