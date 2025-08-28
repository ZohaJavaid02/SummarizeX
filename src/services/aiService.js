export class AIService {
  apiKey = null;

  static DEFAULT_GEMINI_API_KEY = null;
  static PLACEHOLDER_KEY = 'PUT_YOUR_KEY_HERE';

  constructor() {
  const viteKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ? import.meta.env.VITE_GEMINI_API_KEY : null;
    const storageKeyNew = localStorage.getItem('gemini_api_key');
    const storageKeyOld = localStorage.getItem('geminiApiKey');

  this.apiKey = viteKey || storageKeyNew || storageKeyOld || AIService.DEFAULT_GEMINI_API_KEY;
  }

  setApiKey(apiKey) {
  this.apiKey = apiKey;
  localStorage.setItem('gemini_api_key', apiKey);
  }

  hasApiKey() {
    return !!this.apiKey;
  }

  getSummaryPrompt(text, options) {
    const lengthInstructions = {
      short: 'in 2-3 sentences (maximum 100 words)',
      medium: 'in 1-2 paragraphs (maximum 300 words)',
      long: 'in 3-4 paragraphs (maximum 500 words)'
    };

    const styleInstructions = {
      bullet: 'Format the summary using bullet points with clear, concise statements.',
      paragraph: 'Format the summary in well-structured paragraphs with smooth transitions.'
    };

    return `
Please summarize the following document ${lengthInstructions[options.length]}.

${options.style ? styleInstructions[options.style] : ''}

Focus on:
- Key points and main ideas
- Important details and conclusions  
- Actionable insights if applicable

Make the summary clear, informative, and easy to understand.

Document text:
${text}

Summary:`;
  }

  async generateSummary(
    text,
    options,
    onProgress
  ) {
  if (this.apiKey === AIService.PLACEHOLDER_KEY || !this.apiKey || this.apiKey.trim() === '') {
      throw new Error('No valid Gemini API key detected. Set your key via VITE_GEMINI_API_KEY, localStorage("gemini_api_key"), or AIService.DEFAULT_GEMINI_API_KEY.');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Document text is too short to generate a meaningful summary.');
    }

    const prompt = this.getSummaryPrompt(text, options);
    const MAX_PROMPT_CHARS = 30000;
    if (prompt.length > MAX_PROMPT_CHARS) {
      throw new Error(`Document too long for a single request (prompt ~${prompt.length} chars). Consider truncating the input or implement chunking. Try reducing input to under ${MAX_PROMPT_CHARS} characters.`);
    }

    try {
      onProgress?.({
        stage: 'ai-processing',
        progress: 10,
        message: 'Connecting to Gemini AI...'
      });

      onProgress?.({
        stage: 'ai-processing',
        progress: 30,
        message: 'Generating summary...'
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: options.length === 'short' ? 150 : options.length === 'medium' ? 400 : 600,
          }
        })
      });

      onProgress?.({
        stage: 'ai-processing',
        progress: 70,
        message: 'Processing AI response...'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverMessage = errorData.error?.message || errorData.message || response.statusText || 'Unknown error';
        if (response.status === 401) {
          throw new Error(`Invalid API key (401). ${serverMessage}`);
        } else if (response.status === 400) {
          throw new Error(`Invalid request (400). Server message: ${serverMessage}. The input may be too long or contain unsupported characters.`);
        } else if (response.status === 429) {
          throw new Error(`API quota exceeded (429). ${serverMessage}`);
        } else {
          throw new Error(`API request failed (${response.status}). ${serverMessage}`);
        }
      }

      const data = await response.json();

      onProgress?.({
        stage: 'ai-processing',
        progress: 90,
        message: 'Finalizing summary...'
      });

      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!summary) {
        throw new Error('No summary generated. The AI response was empty or malformed.');
      }

      onProgress?.({
        stage: 'ai-processing',
        progress: 100,
        message: 'Summary generated successfully'
      });

      return summary.trim();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        'message' in error &&
        typeof (error).name === 'string' &&
        typeof (error).message === 'string' &&
        (error).name === 'TypeError' &&
        (error).message.includes('fetch')
      ) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw error;
    }
  }
}
