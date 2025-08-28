import React, { useState, useCallback, useRef } from 'react';
import { FileText, Trash2, BarChart2, CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import SummaryOptions from './components/SummaryOptions';
import DocumentResult from './components/DocumentResult';
import ThemeSwitcher from './components/ThemeSwitcher';
import { DocumentProcessor } from './services/documentProcessor';
import { AIService } from './services/aiService';

function App() {
  const [documents, setDocuments] = useState([]);
  const [summaryOptions, setSummaryOptions] = useState({
    length: 'medium',
    style: 'paragraph'
  });
  const [processingStatus, setProcessingStatus] = useState(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  const documentProcessor = useRef(DocumentProcessor.getInstance());
  const aiService = useRef(new AIService());

  const isProcessing = processingStatus !== null;
  const hasApiKey = true;

  const generateDocumentId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback(async (file) => {

    const documentId = generateDocumentId();
    const newDocument = {
      id: documentId,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      file,
      createdAt: new Date(),
      status: 'extracting',
      summaryLength: summaryOptions.length
    };

    setDocuments(prev => [newDocument, ...prev]);

    try {
      const extractedText = await documentProcessor.current.processDocument(
        newDocument,
        (status) => setProcessingStatus({ ...status, documentName: newDocument.name })
      );

      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, text: extractedText, status: 'extracted' }
          : doc
      ));

    } catch (error) {
      console.error('Processing error:', error);
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, status: 'error', error: error.message }
          : doc
      ));
    } finally {
      setProcessingStatus(null);
    }
  }, [summaryOptions, hasApiKey]);

  const handleSummarize = async (document) => {
    if (!document.text || !hasApiKey) return;

    const documentId = document.id;

    setDocuments(prev => prev.map(doc =>
      doc.id === documentId
        ? { ...doc, status: 'summarizing', error: undefined, summaryLength: summaryOptions.length }
        : doc
    ));

    try {
      const summary = await aiService.current.generateSummary(
        document.text,
        summaryOptions,
        (status) => setProcessingStatus({ ...status, documentName: document.name })
      );

      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, summary, status: 'completed' }
          : doc
      ));

    } catch (error) {
      console.error('Summarization error:', error);
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, status: 'error', error: error.message }
          : doc
      ));
    } finally {
      setProcessingStatus(null);
    }
  };

  const handleRegenerateSummary = useCallback(async (document) => {
    handleSummarize(document);
  }, [summaryOptions, hasApiKey]);

  const handleShare = async (document) => {
  if (!document.summary) return;
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Summary of ${document.name}`,
        text: document.summary,
      });
    } else {
      await navigator.clipboard.writeText(document.summary);
      alert('Summary copied to clipboard!');
    }
    } catch (err) {
    console.error('Share failed:', err);
  }
 };



  const handleDeleteDocument = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleClearAll = () => {
    setDocuments([]);
    setProcessingStatus(null);
  };

  const handleApiKeySave = (apiKey) => {
    aiService.current.setApiKey(apiKey);
  };

  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      aiService.current.setApiKey(savedApiKey);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      documentProcessor.current.cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">SummarizeX</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
              
              {documents.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors dark:bg-red-900/50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 dark:bg-gray-800/80 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-indigo-500" />
                Upload Document
              </h2>
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </div>

            <SummaryOptions 
              options={summaryOptions}
              onChange={setSummaryOptions}
              disabled={isProcessing}
            />

            {documents.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 dark:bg-gray-800/80 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BarChart2 className="w-6 h-6 mr-3 text-indigo-500" />
                  Statistics
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center"><FileText className="w-4 h-4 mr-2" />Total Documents:</span>
                    <span className="font-semibold text-lg">{documents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Completed:</span>
                    <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                      {documents.filter(d => d.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center"><Loader className="w-4 h-4 mr-2 text-indigo-500 animate-spin" />In Progress:</span>
                    <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                      {documents.filter(d => ['extracting', 'summarizing'].includes(d.status)).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-red-500" />Errors:</span>
                    <span className="font-semibold text-lg text-red-600 dark:text-red-400">
                      {documents.filter(d => d.status === 'error').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-8">
              {processingStatus && (
                <ProcessingStatus 
                  status={processingStatus}
                  documentName={processingStatus.documentName || 'Document'}
                />
              )}

              {documents.length === 0 && !isProcessing && (
                <div className="text-center py-24 bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50">
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Document Hub is Empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                    Start by uploading a PDF or image file. SummarizeX will automatically extract the text and prepare it for summarization.
                  </p>
                  
                </div>
              )}

              {documents.map((document) => (
            <div key={document.id} data-extracted-text>
              <DocumentResult
                document={document}
                onRegenerateSummary={() => handleRegenerateSummary(document)}
                onSummarize={() => handleSummarize(document)}
                onDelete={() => handleDeleteDocument(document.id)}
                onShare={() => handleShare(document)}   
              />
            </div>
              ))}
            </div>
          </div>
        </div>
      </main>

  
    </div>
  );
}

export default App;