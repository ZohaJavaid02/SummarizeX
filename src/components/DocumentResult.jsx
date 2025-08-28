import React, { useState } from 'react';
import { FileText, Copy, Download, CheckCircle, AlertCircle, RefreshCw, Trash2, Loader, Share2 } from 'lucide-react';

export default function DocumentResult({ document: doc, onRegenerateSummary, onSummarize, onDelete, onShare }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopySummary = async () => {
    if (doc.summary) {
      try {
        await navigator.clipboard.writeText(doc.summary);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  };

  const handleDownloadSummary = () => {
    if (doc.summary) {
      const blob = new Blob([doc.summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name.replace(/\.[^/.]+$/, "")}-summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIndicator = () => {
    switch (doc.status) {
      case 'completed':
        return <><CheckCircle className="w-5 h-5 text-green-500" /> <span className="text-sm font-medium text-green-700 dark:text-green-400">Complete</span></>;
      case 'summarizing':
        return <><Loader className="w-5 h-5 text-indigo-500 animate-spin" /> <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Summarizing...</span></>;
      case 'extracted':
        return <><CheckCircle className="w-5 h-5 text-blue-500" /> <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Ready to Summarize</span></>;
      default:
        return null;
    }
  };

  if (doc.status === 'error') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-800/50 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-2">{doc.name}</h3>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">{doc.error}</p>
            <div className="flex items-center space-x-2">
              {onRegenerateSummary && (
                <button
                  onClick={onRegenerateSummary}
                  className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 rounded-md text-sm font-medium text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (doc.status === 'extracting' || !doc.text) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span>Type: {doc.type.toUpperCase()}</span>
                {doc.file && <span>Size: {formatFileSize(doc.file.size)}</span>}
                {doc.summaryLength && <span>Length: {doc.summaryLength}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIndicator()}
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      
      <div className="p-6 space-y-6">
        
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Original Extracted Text
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto border dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {doc.text}
            </p>
          </div>
        </div>

        
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
              Summary
          </h4>
          
          {doc.status === 'extracted' && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-8 h-8 mx-auto mb-4" />
              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Generate Summary</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click the button to create a summary with your selected options.</p>
              <button
                onClick={onSummarize}
                className="inline-flex items-center justify-center mx-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
              >
                Generate Summary
              </button>
            </div>
          )}

          {doc.status === 'summarizing' && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-l-4 border-indigo-500 animate-pulse">
              <p className="text-gray-700 dark:text-gray-300">Generating summary...</p>
            </div>
          )}

          {doc.status === 'completed' && doc.summary && (
            <>
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {doc.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
  <button
    onClick={handleCopySummary}
    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
      copySuccess
        ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
    }`}
  >
    {copySuccess ? <><CheckCircle className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
  </button>

  <button
    onClick={handleDownloadSummary}
    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
  >
    <Download className="w-4 h-4 mr-2" />
    Download
  </button>

  
  {onShare && (
  <button
    onClick={onShare}
    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
               rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 
               bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
  >
    <Share2 className="w-4 h-4 mr-2" />
    Share
  </button>
)}


  {onRegenerateSummary && (
    <button
      onClick={onRegenerateSummary}
      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Regenerate
    </button>
  )}
</div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}