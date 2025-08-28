# SummarizeX

A small client-side app that extracts text from PDFs/images and summarizes it using Google Gemini (Generative Language) API.

This README shows how to configure, run, and troubleshoot the project locally.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Configure your Gemini API key (one of these options):

- Recommended (local dev): create a `.env` file in the project root and add:

```text
VITE_GEMINI_API_KEY=YOUR_REAL_KEY_HERE
```

Then restart the dev server after changing `.env`.

- Browser localStorage (quick test): open the app in the browser, open devtools Console and run:

```javascript
localStorage.setItem('gemini_api_key', 'YOUR_REAL_KEY_HERE')
```

Note: Do NOT commit real API keys to source control. For production, put the key on a server and proxy requests.

3. Start dev server

```powershell
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## How to use

- Upload a PDF or image using the Upload panel.
- Wait for text extraction to complete (the document will show "Ready to Generate Summary").
- Click "Generate Summary" to request a summary from Gemini.

## File locations and behavior

- `src/services/aiService.js` — sends requests to the Gemini API; it reads the key from (in order):
  - `import.meta.env.VITE_GEMINI_API_KEY` (if provided by Vite)
  - `localStorage.getItem('gemini_api_key')`
  - `AIService.DEFAULT_GEMINI_API_KEY` (not recommended to set)

- `src/services/documentProcessor.js` — extracts text from PDFs (pdf.js) and images (Tesseract OCR).
- `src/components/*` — UI components for upload, status, results, and options.
- `src/App.jsx` — main app layout and wiring.

## Recent UI tweaks
- App title changed to **SummarizeX**.
- Logo and decorative elements were removed/adjusted.
- The API key modal is left in the repo but the UI no longer forces users to enter a key (the app expects keys via env/localStorage).
- The "Generate Summary" button was centered in `DocumentResult.jsx`.

## Troubleshooting

- 400 Bad Request from the API:
  - Ensure your API key is valid and has quota.
  - The app now surfaces server error messages; check browser console for the full message.
  - Very long inputs may trigger 400. The client enforces a conservative prompt length guard (~30,000 chars). For very long documents, implement chunking: split text into smaller parts, summarize each, then summarize the summaries.

- 401 Unauthorized:
  - Key invalid or missing. Verify `VITE_GEMINI_API_KEY` or `localStorage('gemini_api_key')`.

- Network errors:
  - Check connectivity and that the browser can reach `generativelanguage.googleapis.com`.

## Security notes
- Never commit real API keys to public repositories. Use server-side proxies for production. The current app is client-side; keys in the client can be inspected by users.

## Development notes & suggestions
- Add server-side proxy to hide the API key in production.
- Implement automatic chunking and merging in `aiService.generateSummary` to handle large documents gracefully.
- Add tests for document extraction and summarization flows.

## License
This project is provided as-is for local development and learning.


