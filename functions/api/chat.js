// ============================================================
// POST /api/chat — Cloudflare Pages Function proxying Agnes AI.
// Same-origin (served on asksingapore.ai alongside index.html),
// so no CORS headers are needed. The AGNES_API_KEY secret lives
// in the Pages project settings (never in the repo); locally it
// comes from .dev.vars via `npx wrangler pages dev .`
// ============================================================

const AGNES_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions';
const MODEL = 'agnes-2.5-flash';

const SYSTEM_PROMPT =
  'You are AskSingapore AI, an AI concierge for Singapore: travel, dining, ' +
  'neighbourhoods, transport, events, business, relocation and local culture. ' +
  'You run on Agnes AI, a Singapore-based AI company. Give precise, practical answers ' +
  'with local Singaporean context. Always reply in the language the visitor ' +
  'writes in. Keep replies concise — under about 150 words — ' +
  'unless the visitor asks for more detail. If you are not certain of a live fact ' +
  '(prices, opening hours, availability, schedules), say so instead of guessing. ' +
  'You cannot make bookings, reservations or purchases; when asked, explain how ' +
  'the visitor can book themselves. If asked about this website: the chat is a ' +
  'live demonstration of what asksingapore.ai could become, and the domain is ' +
  'for sale — enquiries via the link at the top of the page. Politely decline ' +
  'questions unrelated to Singapore or this site, and steer back to Singapore.\n\n' +

  'VENUE RULES (strict): When recommending places, name ONLY entries from the ' +
  'VERIFIED LIST below or truly world-famous Singapore landmarks. NEVER name ' +
  'individual hawker stalls, small restaurants, bars or shops that are not on ' +
  'the list — recommend the hawker centre, mall or neighbourhood instead and ' +
  'tell the visitor to follow the queues or check Google Maps for current ' +
  'stalls. Never state street addresses, unit numbers or exact prices; give ' +
  'broad price ranges at most and note they vary. Never invent a place name. ' +
  'If the list does not cover the request, recommend the most suitable area ' +
  'and how to find current options.\n\n' +

  'VERIFIED LIST —\n' +
  'Hawker centres (with district): Maxwell Food Centre (Chinatown), Lau Pa Sat ' +
  '(CBD/Raffles Place; evening Satay Street), Newton Food Centre (Newton), ' +
  'Old Airport Road Food Centre (Dakota/Mountbatten), East Coast Lagoon Food ' +
  'Village (East Coast Park; seafood/BBQ), Chomp Chomp (Serangoon Gardens), ' +
  'Tiong Bahru Market (Tiong Bahru), Amoy Street Food Centre (Telok Ayer), ' +
  'Hong Lim Food Centre (Chinatown), Chinatown Complex Food Centre (Chinatown), ' +
  'Tekka Centre (Little India), Adam Road Food Centre (near Botanic Gardens).\n' +
  'Established seafood/chili-crab names: Jumbo Seafood, Long Beach Seafood, ' +
  'No Signboard Seafood, Mellben Seafood, Palm Beach Seafood — branches change, ' +
  'so point visitors to the official site or Google Maps for locations.\n' +
  'Iconic dining/rooftops: CE LA VI (Marina Bay Sands), Lantern (Fullerton Bay ' +
  'Hotel), Level33 (Marina Bay Financial Centre), Smoke & Mirrors (National ' +
  'Gallery), Odette (National Gallery), Burnt Ends (Dempsey Hill).\n' +
  'Neighbourhoods: Chinatown, Little India, Kampong Glam & Haji Lane, Tiong ' +
  'Bahru, Katong–Joo Chiat (Peranakan heritage), Dempsey Hill, Holland Village, ' +
  'Orchard Road, Marina Bay, Clarke Quay & Boat Quay, Sentosa, Bugis.\n' +
  'Attractions: Gardens by the Bay, Marina Bay Sands SkyPark, Merlion Park, ' +
  'Singapore Zoo / Night Safari / River Wonders (Mandai), Jewel Changi & Rain ' +
  'Vortex, Singapore Botanic Gardens (UNESCO), National Gallery, ArtScience ' +
  'Museum, Universal Studios (Sentosa), Singapore Flyer, Pulau Ubin, Southern ' +
  'Ridges & Henderson Waves, MacRitchie TreeTop Walk, Haw Par Villa.\n' +
  'Landmark hotels: Marina Bay Sands, Raffles Hotel, The Fullerton, ' +
  'Shangri-La Singapore, Mandarin Oriental, Capella Sentosa; for boutique ' +
  'stays suggest the Tiong Bahru, Joo Chiat or Kampong Glam areas.\n' +
  'Getting around: MRT is the backbone (EZ-Link or contactless bank card); ' +
  'from Changi Airport take the MRT via Tanah Merah interchange (~45 min to ' +
  'the CBD) or a taxi/Grab (roughly S$25–40 to town, varies). Grab is the main ' +
  'ride-hailing app.\n' +
  'Practical: currency SGD; GST 9%; tipping not expected; tap water safe; ' +
  'drinking alcohol in public places is banned 10:30pm–7am; chewing-gum sales ' +
  'are restricted; smoking only in designated areas.';

// Input guards — keep free-tier usage sane and payloads small.
const MAX_MESSAGE_CHARS = 600;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_CHARS = 1200; // per history message
const MAX_TOKENS = 600;
const UPSTREAM_TIMEOUT_MS = 50000; // covers the whole stream

// Per-isolate sliding-window rate limit. Not a hard guarantee (each
// isolate/colo keeps its own map) but it stops any single visitor from
// hammering the shared free-tier quota (~20 req/min account-wide).
const WINDOW_MS = 60000;
const MAX_PER_IP = 6;
const MAX_GLOBAL = 18;
const ipHits = new Map();
let globalHits = [];

function rateLimited(ip) {
  const now = Date.now();
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  const mine = (ipHits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (mine.length >= MAX_PER_IP || globalHits.length >= MAX_GLOBAL) return true;
  mine.push(now);
  globalHits.push(now);
  ipHits.set(ip, mine);
  if (ipHits.size > 500) {
    for (const [k, v] of ipHits) if (!v.some((t) => now - t < WINDOW_MS)) ipHits.delete(k);
  }
  return false;
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.AGNES_API_KEY) {
    return jsonError(503, 'Concierge is not configured yet.');
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (rateLimited(ip)) {
    return jsonError(429, 'Too many requests — please wait a minute.');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON body.');
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return jsonError(400, 'Missing message.');
  if (message.length > MAX_MESSAGE_CHARS) {
    return jsonError(400, 'Message too long — please keep it under 600 characters.');
  }

  // Sanitize history: only well-formed user/assistant turns, capped.
  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim()
        )
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }))
    : [];

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  let upstream;
  try {
    upstream = await fetch(AGNES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AGNES_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        temperature: 0.6,
        max_tokens: MAX_TOKENS,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return jsonError(timedOut ? 504 : 502, 'Concierge is unreachable right now.');
  }

  if (!upstream.ok) {
    // Don't leak upstream details; map to a small honest set.
    if (upstream.status === 429) return jsonError(429, 'The concierge is busy right now.');
    return jsonError(502, 'Concierge is unreachable right now.');
  }

  // Pass the SSE stream straight through to the browser. When the log
  // webhook is configured, tee the stream and reassemble the answer
  // server-side after it ends — fire-and-forget via waitUntil, so the
  // visitor is never delayed and a webhook failure never breaks a reply.
  // Secret name: LOG_WEBHOOK_URL canonical; AGNES_WEBHOOK_URL accepted
  // because that's what the production dashboard entry was named.
  const logUrl = env.LOG_WEBHOOK_URL || env.AGNES_WEBHOOK_URL;
  let bodyOut = upstream.body;
  if (logUrl) {
    const [toClient, toLog] = upstream.body.tee();
    bodyOut = toClient;
    context.waitUntil(logExchange(logUrl, message, toLog).catch(() => {}));
  }

  return new Response(bodyOut, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}

// Anonymous Q&A logging to a Google Sheet via an Apps Script web app.
// Privacy: question + answer only — no IP, no identifiers (PDPA-friendly);
// the timestamp is stamped by the Apps Script on arrival, in SGT.
async function logExchange(webhookUrl, question, stream) {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let answer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const delta = JSON.parse(data).choices[0].delta;
        if (delta && delta.content) answer += delta.content;
      } catch { /* tolerate keep-alives / partial frames */ }
    }
  }
  if (!answer) return; // nothing worth a row
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer }),
    signal: AbortSignal.timeout(10000),
  });
}

// POST is routed to onRequestPost above; every other method lands here.
export async function onRequest() {
  return jsonError(405, 'Method not allowed.');
}
