import React from 'react';
import { FileText, Eye, Brain, CheckCircle } from 'lucide-react';

export default function ProcessingStatus({ status, documentName }) {
  const getStageIcon = () => {
    switch (status.stage) {
      case 'pdf-parsing':
        return <FileText className="w-5 h-5" />;
      case 'ocr-processing':
        return <Eye className="w-5 h-5" />;
      case 'ai-processing':
        return <Brain className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStageTitle = () => {
    switch (status.stage) {
      case 'pdf-parsing':
        return 'Extracting Text from PDF';
      case 'ocr-processing':
        return 'Reading Text from Image';
      case 'ai-processing':
        return 'Generating AI Summary';
      default:
        return 'Processing Document';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="space-y-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            {getStageIcon()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{documentName}</p>
            <p className="text-sm text-gray-500">{getStageTitle()}</p>
          </div>
        </div>

        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-indigo-600">{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">{status.message}</p>
        </div>

        
        <div className="flex items-center space-x-2 text-sm">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            status.stage === 'pdf-parsing' || status.stage === 'ocr-processing'
              ? 'bg-indigo-100 text-indigo-700'
              : status.progress > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {status.progress > 0 && status.stage !== 'pdf-parsing' && status.stage !== 'ocr-processing' ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <FileText className="w-3 h-3" />
            )}
            <span>Extract</span>
          </div>

          <div className="w-4 h-px bg-gray-300"></div>

          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            status.stage === 'ai-processing'
              ? 'bg-indigo-100 text-indigo-700'
              : status.progress === 100
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {status.progress === 100 ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Brain className="w-3 h-3" />
            )}
            <span>Summarize</span>
          </div>
        </div>
      </div>
    </div>
  );
}
