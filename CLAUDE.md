# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A landing page **with a live AI chat** for asksingapore.ai — part of the Noustelos Studio "Ask" network (asksantorini.ai · asksingapore.ai · asksydney.ai · askaustralia.ai · asknewyork.ai · askmykonos.ai). The page lives in a single file: [index.html](index.html) — vanilla HTML/CSS/JS, no frameworks, no build step, no dependencies — plus one serverless endpoint ([functions/api/chat.js](functions/api/chat.js), a Cloudflare Pages Function proxying Agnes AI), and static discovery files at the root ([robots.txt](robots.txt), [sitemap.xml](sitemap.xml), [llms.txt](llms.txt)) and the social-preview pair ([og-image.png](og-image.png) + [og-card.html](og-card.html)). Standalone: zero sister-site dependency (sister links only).

The chat is **LIVE** (ΦΑΣΗ 3, shipped): the inline script POSTs to `/api/chat` — a Cloudflare Pages Function in this repo ([functions/api/chat.js](functions/api/chat.js)) that proxies **Agnes AI** (`agnes-2.5-flash`, OpenAI-compatible, `https://apihub.agnes-ai.com/v1/chat/completions`) with SSE streaming, a Singapore-concierge system prompt, input guards and per-IP rate limiting. Same-origin, so no CORS. The `AGNES_API_KEY` secret lives in the Pages dashboard (production) and `.dev.vars` (local, gitignored) — never in the repo. Everything else on the page (clock, themes, decoration) stays local and network-free; don't add further network calls unless explicitly asked.

**Honesty rule: no fake signals, no false promises.** The `.caption` under the category chips discloses that the chat runs on a third-party AI API, that AI can err, and that chats are logged anonymously. The system prompt forbids fake bookings, guessing live facts and inventing venues; API failures show an honest busy/error line (never a canned answer posing as live). Keep all of this truthful — and keep [llms.txt](llms.txt) in sync with reality.

**Vendor branding stays neutral: what's for sale is the domain, not the engine** (owner's decision, Aug 2026). The page must read as a clean asset, so no third-party vendor is promoted and no outbound link pulls attention off the page. Concretely: the chat status label reads **"Live demo"**, the greeting bubble names no vendor ("Hi! I'm AskSingapore AI. Ask me anything."), and the meta description / og:description / twitter:description / JSON-LD carry **no** "Powered by Agnes AI" clause. **There must be no hyperlink to `agnes-ai.com` anywhere** — not in the chips caption, not in the blog. Honesty is carried by the chips caption alone, which reads exactly:

> The live demo runs on a third-party AI API (Agnes AI) purely to show local-answer quality — it isn't part of the sale. You'd bring your own engine. AI can err, so double-check key details. Chats are logged anonymously.

That sentence names the vendor on purpose — disclosure, not promotion — and the blog's architecture piece names it in plain unlinked text for the same reason. Don't re-add branded labels, and don't strip the disclosure either. Two known leftovers the owner chose to keep: `functions/api/chat.js` still tells the model "You run on Agnes AI…" in the system prompt, and the endpoint/model constants obviously still reference the vendor.

**If Agnes is ever named in prose, it is "a Singapore-based AI company" — never "Singapore's homegrown model".** Fact-checking (Aug 2026) found no independent confirmation that `agnes-2.5-flash` is trained in-house, and Singapore's *national* homegrown LLM is SEA-LION (AI Singapore / National Multimodal LLM Programme), not Agnes. The company-based phrasing is verifiable; the model-provenance phrasing is not. Don't reintroduce the latter anywhere — and note the former is no longer used on the landing page at all, by the neutrality rule above.

The commercial goal of the page is to **sell the domain**: the `.acquire` pill above the topbar states availability and links out via `mailto:` to `info@asksingapore.ai` (the only outbound contact — keep it a plain mailto, no forms). The `.foot` footer links to the five sister domains [asksantorini.ai](https://asksantorini.ai), [asksydney.ai](https://asksydney.ai), [askaustralia.ai](https://askaustralia.ai), [asknewyork.ai](https://asknewyork.ai) and [askmykonos.ai](https://askmykonos.ai), and the bottom-left `.studio-mark` links to [noustelos.gr](https://noustelos.gr) — all signal the brand network. `<head>` carries the canonical URL, Open Graph/Twitter cards (pointing at the root [og-image.png](og-image.png), 1200×630 — the repo's only binary asset), an inline SVG favicon, and JSON-LD, so shared links preview well for prospective buyers.

### Discovery / SEO files

- [og-image.png](og-image.png) is a headless-Chrome screenshot of [og-card.html](og-card.html), a standalone card mirroring the hero (brand lockup, "Just Ask", tagline, vermilion acquisition pill, Supertree Grove line-art). To regenerate, edit og-card.html and follow the render commands commented at the top of that file (the card sits in a 20px paper margin inside a 1240×670 window and gets center-cropped past headless Chrome's rounded window corners — don't skip the crop). View the final image before committing; keep its copy/colors in sync with the page.
- [robots.txt](robots.txt) (allow-all + sitemap pointer), [sitemap.xml](sitemap.xml) (root + the four blog URLs) and [llms.txt](llms.txt) (plain-language summary for AI crawlers — sale status, contact, sister network, blog index) handle search/LLM discovery. **Keep the sister-domain list in llms.txt in sync with the footer**, and keep llms.txt honest: it presents the chat as live answers generated by a third-party AI API (which can err) and states that the API isn't part of the sale — keep that description in sync with what actually ships and with the chips caption. Adding or renaming a blog post means updating [sitemap.xml](sitemap.xml) and [llms.txt](llms.txt) too.

### Blog (`/blog/`)

Four static pages sharing one stylesheet — [blog/blog.css](blog/blog.css) (the only shared CSS file in the repo; it re-declares the same `:root` tokens as index.html, so a colour change must be made in both) — plus [blog/index.html](blog/index.html) (the listing) and three articles: [ai-concierge-that-refuses-to-invent.html](blog/ai-concierge-that-refuses-to-invent.html) (how the chat is built, the hallucination problem, the guardrails), [own-the-verb.html](blog/own-the-verb.html) (what transfers with the domain and what doesn't) and [singapore-ai-tourism.html](blog/singapore-ai-tourism.html) (sourced market context). Same no-build, no-dependency rule as the landing page; body copy is set in Newsreader rather than the UI grotesque because these pages are read, not scanned. Each article carries canonical + OG/Twitter tags and `BlogPosting` JSON-LD. The landing footer links to all three under a "Notes ·" line.

**The blog is bound by the same honesty rule, and more strictly, because it makes factual claims about third parties.** Every external figure in the market-context piece was verified against a primary source and is linked in a `.sources` block at the foot of that article; counter-arguments (arrivals came in under STB's own forecast, .com still outsells .ai, only one of the five reported .ai sales is independently corroborated) are stated in the text rather than omitted. **Never publish an unsourced figure here, and never publish a price** — the pages explicitly invite offers instead of naming one, which is a deliberate commercial decision by the owner, not an oversight. If a new claim can't be sourced, cut it.

## Deploy

⚠️ **Cloudflare Pages, git-connected: push to `main` = INSTANT LIVE on asksingapore.ai** (no branch previews, like the asksantorini frontend). Work on a branch, merge deliberately, verify live after push; rollback = revert commit + push (or dashboard rollback).

## Run

No build. For the full experience (page + live chat) serve it with wrangler, which runs the Pages Function locally and reads `AGNES_API_KEY` from `.dev.vars` (copy [.dev.vars.example](.dev.vars.example)):

```bash
npx wrangler pages dev .      # http://localhost:8788 — page + /api/chat
node dev-server.mjs           # same, for macOS < 13.5 where workerd can't run
```

[dev-server.mjs](dev-server.mjs) is a dev-only Node shim (never deployed) that adapts the same Function onto Node's http server. Opening [index.html](index.html) directly (or via `python3 -m http.server`) still shows the page, but the chat will answer with its honest error line since `/api/chat` isn't there.

## Architecture

The page is one `.hero` section with three layers:

1. **Ambient decoration** (`.deco-*`, `aria-hidden`) — the signature `.deco-grove` "Supertree Grove" (thin jade line-art, inline SVG, bottom-left; Gardens-by-the-Bay canopy architecture) plus the `.deco-weave` adaptive theme layer (transparent by default, dissolves in a pattern per query theme). Purely cosmetic.
2. **`.inner`** — the `.acquire` domain-for-sale pill, the topbar (brand mark + wordmark + SGT clock) and `.main`, which holds the `.hero-row` (the "Just Ask" title on the left, the `.chat` mock window on the right), the `.closing` block, the `.revenue` section, and the `.foot` sister-domain footer. Revenue section ("What this domain could become"): 4 monetisation paths + flagship proof, end-of-scroll before the footer, effortless-card idiom, no earnings claims. Pattern for the sibling demos (Paros/Australia/Sydney/NewYork).
3. **Floating anchors** — the `.cta-pill` "Ask Singapore AI" button (bottom right) and the `.studio-mark` Noustelos Studio attribution (bottom left; joins the flow under the footer on narrow screens).

### Styling system

Design language: **"Garden City Precision"** (light, editorial-warm). All design decisions are centralized as CSS custom properties in `:root`. Change colors there, not at call sites:

- `--paper: #FBFAF7` — warm off-white page field; `--ink: #16241E` — deep botanical green-black body text.
- `--jade: #2E7D5B` (+ `--jade-deep`) — primary botanical green accents; `--mist: #E8EDE9` — soft green-grey surfaces/dividers.
- `--vermilion: #D62828` — Singapore red, **CTAs ONLY**: the Send button (`--send-grad`) and the acquisition pill. Nowhere else.
- `--diamond-grad`, `--wordmark-grad` — jade/ink gradients for the brand mark and wordmark.
- `--font-display` (**Newsreader**, warm editorial serif — hero title roman, with "Ask" in jade via `.display .accent`) and `--font-ui` (Hanken Grotesk) — loaded from Google Fonts in `<head>`.

Animations are defined as `@keyframes sc*` near the top of the `<style>` block (`scMarkShimmer`/`scDiamondPulse` "living" logo, `scSendGlow`/`scSendSpark` Send-button feedback, `scLivePulse`, `scRise` staged page entrance). No continuous full-surface animations or `backdrop-filter` — keep it light for older machines. All motion is gated behind a `prefers-reduced-motion: reduce` guard — extend that rule when adding new animations. Keyboard focus uses a global jade `:focus-visible` outline (the input row carries the ring via `:focus-within` instead of the field itself). Layout is non-wrapping by design and only stacks below the `max-width: 760px` media query.

### Interactive behaviour (client-side only, no network)

The inline `<script>` drives the live chat and presentation feedback. The page makes exactly **two** network calls — the chat (`/api/chat`) and the Open-Meteo weather fetch — keep everything else local:

- **Live chat** — `#chat-log` is a nested-scroll message list (max-height, thin jade scrollbar; the greeting is the first bot message). `submitQuery()` appends the user bubble (right-aligned, deeper mist); `respond()` shows typing dots until the first token, then `streamChat()` reads the SSE stream from `/api/chat` and a paced word queue (`makeReveal`) reveals it word-by-word at 45ms/word (opacity-only spans) — real tokens, steady cadence. Conversation context lives in `HISTORY` (capped at 10 turns, mirrored server-side). Failures show `ERROR_LINE`/`BUSY_LINE` — honest lines, never canned answers. Under `prefers-reduced-motion` the **streaming still plays** (30ms/word, instant pop) — only the dots pulse and smooth scrolling are dropped.
- **Send button** toggles `.is-ready` (vermilion glow) when `#ask-input` holds text, and replays a `.spark` sweep; Send/Enter with text runs `submitQuery()`.
- **Adaptive background** — `detectTheme()` matches query keywords and swaps a `theme-nature` / `theme-luxury` class on `.hero`, which dissolves a faint pattern into `.deco-weave` (jade leaf texture / woven pinstripe) via a brief `weave-shift` dissolve. Keyword→theme maps live in the `THEMES` array.
- **Live SGT clock** — `#sgt-date` + `#sgt-clock` in the topbar show the current Singapore date and time via `Intl.DateTimeFormat({ timeZone: 'Asia/Singapore' })` (computed locally, no network), refreshed on a 15s interval. Editorial lockup, top to bottom: a jade `.clock-date` line, the large light `.clock-time` numeral with a dimmed `.cc` colon, then a small tracked `.clock-meta` line (live dot · `SGT` · "24/7 Islandwide Availability"). `tickClock()` writes both the date text and the `HH<span class="cc">:</span>MM` markup each tick.

### Backend (`/api/chat`) — the one live wire

[functions/api/chat.js](functions/api/chat.js) is a Cloudflare Pages Function (deployed automatically with the same git push as the page). It validates `{ message, history }` (600-char message cap — mirrored by the input's `maxlength` — 10-turn history cap), applies a per-isolate rate limit (6 req/min per IP, 18 req/min global soft cap — the free Agnes tier allows ~20 RPM account-wide), injects the Singapore-concierge system prompt, calls Agnes AI with `stream: true`, and passes the SSE stream through untouched. The system prompt carries strict **VENUE RULES + a curated VERIFIED LIST** (hawker centres, established restaurants, neighbourhoods, attractions, transport/practical facts): the model may only name places from that list or world-famous landmarks — never individual stalls/small venues, addresses or exact prices — because `agnes-2.5-flash` otherwise invents plausible-sounding venues (caught in owner QA). It must also reply in the visitor's language. If hallucinations show up in a new category, extend the VERIFIED LIST there rather than loosening the rules. Errors map to honest JSON (`400`/`429`/`502`/`503`/`504`) that the frontend turns into `ERROR_LINE`/`BUSY_LINE`. Secrets: `wrangler` reads `.dev.vars` locally; production values are set in the Pages dashboard (Settings → Variables and Secrets): `AGNES_API_KEY` (required) and `LOG_WEBHOOK_URL` (optional; the code also accepts `AGNES_WEBHOOK_URL`, the name used in the production dashboard — a Google Apps Script web-app URL; when set, each completed Q&A is teed off the stream and appended anonymously to a Google Sheet via `logExchange()`: question + answer only, **never IPs or identifiers**, disclosed in the chips caption and llms.txt. Unset = logging fully off).

Frontend IDs/hooks (keep them in place):

- `#ask-input` — chat input field (`maxlength="600"`)
- `#ask-send` — Send button (runs `submitQuery()`)
- `#cta-ask` — floating CTA pill (focuses the input)
- `.chip[data-prefill]` — category chips: **prefill** `#ask-input`, then auto-send after 300ms (unless a reply is playing)
- `#sgt-weather` (`#sgt-temp` + `#sgt-cond`) — **live** Singapore weather under the clock via Open-Meteo (free, no key; fetched on load + every 30 min). Honesty: the line ships `hidden` and only appears when real data arrives — on any failure it stays gone; never re-add a hardcoded fallback
