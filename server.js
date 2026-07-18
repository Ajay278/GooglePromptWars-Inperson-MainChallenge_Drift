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
let model = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('✅ Gemini AI initialized');
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

    if (!model) {
      return res.status(503).json({ error: 'AI not configured' });
    }

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ response });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// ─── Health Check ──────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    aiConfigured: !!model,
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
  console.log(`   AI: ${model ? 'Gemini 2.0 Flash' : 'Fallbacks only'}`);
});
