import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
  const maxSize = 50 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and image files (JPEG, PNG) are supported';
    }

    return null;
  };

  const handleFile = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile, isProcessing]);

  const handleFileInput = useCallback((e) => {
    if (isProcessing) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
    
  e.target.value = '';
  }, [handleFile, isProcessing]);

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-105' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
            dragActive ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Upload className={`w-8 h-8 transition-colors duration-200 ${
              dragActive ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              {dragActive ? 'Drop your document here' : 'Upload your document'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop or click to select a PDF or image file
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Supports PDF, JPEG, PNG , JPG
            </p>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Upload Error</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
