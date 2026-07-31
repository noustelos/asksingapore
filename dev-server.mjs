// Local dev fallback for machines where `npx wrangler pages dev .` can't run
// (workerd needs macOS 13.5+). Serves index.html + static files and adapts
// functions/api/chat.js onto Node's http server — same code path as production.
// Usage:  node dev-server.mjs   →  http://localhost:8788
// Reads AGNES_API_KEY from .dev.vars (copy .dev.vars.example).

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { onRequestPost, onRequest } from './functions/api/chat.js';

const PORT = 8788;

const env = {};
try {
  const vars = await readFile(new URL('./.dev.vars', import.meta.url), 'utf8');
  for (const line of vars.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2];
  }
} catch {
  console.warn('No .dev.vars found — /api/chat will answer 503 (copy .dev.vars.example).');
}

const TYPES = { html: 'text/html', txt: 'text/plain', xml: 'application/xml', png: 'image/png' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/chat') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, {
      method: req.method,
      headers: { ...req.headers, 'CF-Connecting-IP': req.socket.remoteAddress || 'local' },
      body: chunks.length ? Buffer.concat(chunks) : undefined,
    });
    const handler = req.method === 'POST' ? onRequestPost : onRequest;
    const out = await handler({ request, env, waitUntil: (p) => Promise.resolve(p).catch(() => {}) });
    res.writeHead(out.status, Object.fromEntries(out.headers));
    if (out.body) for await (const chunk of out.body) res.write(chunk);
    res.end();
    return;
  }

  try {
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const data = await readFile(new URL('./' + file, import.meta.url));
    const ext = file.split('.').pop();
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => console.log(`AskSingapore dev server → http://localhost:${PORT}`));
