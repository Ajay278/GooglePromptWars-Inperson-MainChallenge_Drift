import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';

// Tests must never invoke Vertex AI or require application credentials.
process.env.DRIFT_DISABLE_VERTEX_AI = 'true';
const { app } = await import('../server.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function postCoach(body) {
  return fetch(`${baseUrl}/api/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('health endpoint reports a healthy app without exposing credentials', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.status, 'healthy');
  assert.equal(body.aiConfigured, false);
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
  assert.equal('apiKey' in body, false);
});

test('coach endpoint rejects missing, blank, and non-string prompts', async () => {
  for (const body of [{}, { prompt: '   ' }, { prompt: { text: 'hello' } }]) {
    const response = await postCoach(body);
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /non-empty string/);
  }
});

test('coach endpoint enforces a prompt-size limit', async () => {
  const response = await postCoach({ prompt: 'a'.repeat(12_001) });
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error, 'Prompt is too long');
});

test('coach endpoint fails closed when Vertex AI is not configured', async () => {
  const response = await postCoach({ prompt: 'Help me reflect on my habits.' });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'AI not configured');
});
