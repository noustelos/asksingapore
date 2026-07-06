# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **design-only** landing page for asksingapore.ai — part of the Noustelos Studio "Ask" network (asksantorini.ai · asksingapore.ai · asksydney.ai · askaustralia.ai · asknewyork.ai). The page lives in a single file: [index.html](index.html) — vanilla HTML/CSS/JS, no frameworks, no build step, no backend, no dependencies — plus static discovery files at the root ([robots.txt](robots.txt), [sitemap.xml](sitemap.xml), [llms.txt](llms.txt)) and the social-preview pair ([og-image.png](og-image.png) + [og-card.html](og-card.html)). Standalone: zero sister-site dependency (sister links only).

There is intentionally **no AI or network logic**. The chat is a **SCRIPTED DEMO** (ΦΑΣΗ 2, shipped): four hardcoded Q→A pairs matching the chip prefills play a typing-dots + word-by-word reveal; any other input gets a fallback line. All client-side — the real backend later replaces the `SCRIPTED` map + `respond()` in the inline script (the hooks stay put). Treat this repo as the visual source of truth; do not add fetch/API/state-management code unless explicitly asked.

**Honesty rule: the demo must not fake live-AI signals.** The bold `.caption` under the category chips discloses the scripted demo and links to the live concierge at [asksantorini.ai](https://asksantorini.ai) (the only disclosure line — there is no separate `.disclaimer` anymore), and the chat-window status label reads "Live Demo · Ask Singapore AI". Keep both honest until the real backend lands.

The commercial goal of the page is to **sell the domain**: the `.acquire` pill above the topbar states availability and links out via `mailto:` to `info@asksantorini.ai` (the only outbound contact — keep it a plain mailto, no forms; switch to `info@asksingapore.ai` once that mailbox is set up). The `.foot` footer links to the four sister domains [asksantorini.ai](https://asksantorini.ai), [asksydney.ai](https://asksydney.ai), [askaustralia.ai](https://askaustralia.ai) and [asknewyork.ai](https://asknewyork.ai), and the bottom-left `.studio-mark` links to [noustelos.gr](https://noustelos.gr) — all signal the brand network. `<head>` carries the canonical URL, Open Graph/Twitter cards (pointing at the root [og-image.png](og-image.png), 1200×630 — the repo's only binary asset), an inline SVG favicon, and JSON-LD, so shared links preview well for prospective buyers.

### Discovery / SEO files

- [og-image.png](og-image.png) is a headless-Chrome screenshot of [og-card.html](og-card.html), a standalone card mirroring the hero (brand lockup, "Just Ask", tagline, vermilion acquisition pill, Supertree Grove line-art). To regenerate, edit og-card.html and follow the render commands commented at the top of that file (the card sits in a 20px paper margin inside a 1240×670 window and gets center-cropped past headless Chrome's rounded window corners — don't skip the crop). View the final image before committing; keep its copy/colors in sync with the page.
- [robots.txt](robots.txt) (allow-all + sitemap pointer), [sitemap.xml](sitemap.xml) (single URL) and [llms.txt](llms.txt) (plain-language summary for AI crawlers — sale status, contact, sister network) handle search/LLM discovery. **Keep the sister-domain list in llms.txt in sync with the footer**, and keep llms.txt honest: it must present the chat as a scripted demo, never as a live AI.

## Deploy

⚠️ **Cloudflare Pages, git-connected: push to `main` = INSTANT LIVE on asksingapore.ai** (no branch previews, like the asksantorini frontend). Work on a branch, merge deliberately, verify live after push; rollback = revert commit + push (or dashboard rollback).

## Run

No build. Open [index.html](index.html) directly in a browser, or serve it:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Architecture

The page is one `.hero` section with three layers:

1. **Ambient decoration** (`.deco-*`, `aria-hidden`) — the signature `.deco-grove` "Supertree Grove" (thin jade line-art, inline SVG, bottom-left; Gardens-by-the-Bay canopy architecture) plus the `.deco-weave` adaptive theme layer (transparent by default, dissolves in a pattern per query theme). Purely cosmetic.
2. **`.inner`** — the `.acquire` domain-for-sale pill, the topbar (brand mark + wordmark + SGT clock) and `.main`, which holds the `.hero-row` (the "Just Ask" title on the left, the `.chat` mock window on the right), the `.closing` block, and the `.foot` sister-domain footer.
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

The inline `<script>` drives the scripted demo and presentation feedback — still zero AI/network. Keep additions on this side of that line:

- **Scripted chat** — `#chat-log` is a nested-scroll message list (max-height, thin jade scrollbar; the greeting is the first bot message). `submitQuery()` appends the user bubble (right-aligned, deeper mist); `respond()` shows typing dots (~800ms) then streams the answer word-by-word at 45ms/word (opacity-only spans). Under `prefers-reduced-motion` the **streaming still plays** (30ms/word, instant pop) — only the dots pulse and smooth scrolling are dropped. Copy lives in the `SCRIPTED` array + `FALLBACK` string.
- **Send button** toggles `.is-ready` (vermilion glow) when `#ask-input` holds text, and replays a `.spark` sweep; Send/Enter with text runs `submitQuery()`.
- **Adaptive background** — `detectTheme()` matches query keywords and swaps a `theme-nature` / `theme-luxury` class on `.hero`, which dissolves a faint pattern into `.deco-weave` (jade leaf texture / woven pinstripe) via a brief `weave-shift` dissolve. Keyword→theme maps live in the `THEMES` array.
- **Live SGT clock** — `#sgt-date` + `#sgt-clock` in the topbar show the current Singapore date and time via `Intl.DateTimeFormat({ timeZone: 'Asia/Singapore' })` (computed locally, no network), refreshed on a 15s interval. Editorial lockup, top to bottom: a jade `.clock-date` line, the large light `.clock-time` numeral with a dimmed `.cc` colon, then a small tracked `.clock-meta` line (live dot · `SGT` · "24/7 Islandwide Availability"). `tickClock()` writes both the date text and the `HH<span class="cc">:</span>MM` markup each tick.

### Backend wiring hooks (placeholders only)

These IDs/hooks are where the real backend connects later (replacing the scripted `respond()`) — keep them in place:

- `#ask-input` — chat input field
- `#ask-send` — Send button (runs the scripted `submitQuery()`)
- `#cta-ask` — floating CTA pill
- `.chip[data-prefill]` — category chips: **prefill** `#ask-input`, then auto-send after 300ms (unless a reply is playing)
- `#sgt-temp` — local-weather line under the clock; a static mockup (`29°C · Partly Cloudy`) awaiting live data (real weather needs an API, which is out of the design-only scope)
