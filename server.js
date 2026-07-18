/* ═══════════════════════════════════════════════════════════════
   DRIFT Express Server
   Serves static React build + proxies Gemini API calls.
   ═══════════════════════════════════════════════════════════════ */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware ─────────────────────────────────────────────────

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// ─── Gemini Setup ──────────────────────────────────────────────

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'drift-502807';
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
let genAI = null;

if (process.env.DRIFT_DISABLE_VERTEX_AI === 'true') {
  console.warn('⚠️  Vertex AI disabled by DRIFT_DISABLE_VERTEX_AI');
} else {
  try {
    genAI = new GoogleGenAI({
      vertexai: true,
      project: GOOGLE_CLOUD_PROJECT,
      location: GOOGLE_CLOUD_LOCATION,
      apiVersion: 'v1',
    });
    console.log(`✅ Vertex AI initialized for project ${GOOGLE_CLOUD_PROJECT}`);
  } catch (error) {
    console.error('⚠️  Vertex AI could not be initialized:', error);
  }
}

// ─── AI Endpoint ───────────────────────────────────────────────

app.post('/api/coach', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt must be a non-empty string' });
    }

    if (prompt.length > 12_000) {
      return res.status(413).json({ error: 'Prompt is too long' });
    }

    if (!genAI) {
      return res.status(503).json({ error: 'AI not configured' });
    }

    // Try models in order of preference
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const result = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        const response = result.text;
        if (!response) throw new Error('Vertex AI returned an empty response');
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

export { app };

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () => {
    console.log(`🚀 DRIFT server running on port ${PORT}`);
    console.log(`   AI: ${genAI ? 'Gemini configured' : 'Fallbacks active'}`);
  });
}
