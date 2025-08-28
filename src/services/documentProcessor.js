import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export class DocumentProcessor {
  static instance;
  ocrWorker = null;

  static getInstance() {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor();
    }
    return DocumentProcessor.instance;
  }

  async initializeOCR() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
  }

  async extractTextFromPDF(
    file,
    onProgress
  ) {
    try {
      onProgress?.({
        stage: 'pdf-parsing',
        progress: 10,
        message: 'Reading PDF file...'
      });

      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.({
        stage: 'pdf-parsing',
        progress: 50,
        message: 'Extracting text from PDF...'
      });

      const pdfData = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdfData.numPages; i++) {
        const page = await pdfData.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => (item).str).join(' ');
        fullText += pageText + ' ';
      }
      
      onProgress?.({
        stage: 'pdf-parsing',
        progress: 90,
        message: 'Processing extracted text...'
      });

      const text = fullText.trim();
      
      if (!text || text.length < 10) {
        throw new Error('No readable text found in PDF. The document might be scanned or image-based.');
      }

      onProgress?.({
        stage: 'pdf-parsing',
        progress: 100,
        message: 'PDF text extraction completed'
      });

      return text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractTextFromImage(
    file,
    onProgress
  ) {
    try {
      await this.initializeOCR();

      this.ocrWorker.setParameters({
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      });

      onProgress?.({
        stage: 'ocr-processing',
        progress: 10,
        message: 'Initializing OCR engine...'
      });

      const imageUrl = URL.createObjectURL(file);

      onProgress?.({
        stage: 'ocr-processing',
        progress: 30,
        message: 'Processing image...'
      });

      const { data: { text } } = await this.ocrWorker.recognize(imageUrl);

      URL.revokeObjectURL(imageUrl);

      onProgress?.({
        stage: 'ocr-processing',
        progress: 100,
        message: 'OCR processing completed'
      });

      const trimmedText = text.trim();
      
      if (!trimmedText || trimmedText.length < 10) {
        throw new Error('No readable text found in the image. Please ensure the image contains clear, readable text.');
      }

      return trimmedText;
    } catch (error) {
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }

  async processDocument(
    document,
    onProgress
  ) {
    try {
      let extractedText;

      if (document.type === 'pdf') {
        extractedText = await this.extractTextFromPDF(document.file, onProgress);
      } else {
        extractedText = await this.extractTextFromImage(document.file, onProgress);
      }

      return extractedText;
    } catch (error) {
      throw error;
    }
  }

  async cleanup() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}
