/* ═══════════════════════════════════════════════════════════════
   DRIFT Express Server
   Serves static React build + proxies Gemini API calls.
   ═══════════════════════════════════════════════════════════════ */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware ─────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ─── Gemini Setup ──────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini AI SDK initialized');
} else {
  console.warn('⚠️  GEMINI_API_KEY not set — AI features will use fallbacks');
}

// ─── AI Endpoint ───────────────────────────────────────────────

app.post('/api/coach', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!genAI) {
      return res.status(503).json({ error: 'AI not configured' });
    }

    // Try models in order of preference
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return res.json({ response });
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying fallback...`);
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── Health Check ──────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    aiConfigured: !!genAI,
    timestamp: new Date().toISOString(),
  });
});

// ─── SPA Fallback ──────────────────────────────────────────────

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 DRIFT server running on port ${PORT}`);
  console.log(`   AI: ${genAI ? 'Gemini configured' : 'Fallbacks active'}`);
});
