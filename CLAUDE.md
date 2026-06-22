# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **design-only** landing page for asksingapore.ai. Everything lives in a single file: [index.html](index.html) — vanilla HTML/CSS/JS, no frameworks, no build step, no backend, no dependencies.

There is intentionally **no chat, AI, or network logic**. The backend is wired separately later. Treat this repo as the visual source of truth; do not add fetch/API/state-management code unless explicitly asked.

## Run

No build. Open [index.html](index.html) directly in a browser, or serve it:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Architecture

The page is one `.hero` section with three layers:

1. **Ambient decoration** (`.deco-*`, `aria-hidden`) — stacked absolutely-positioned layers: glow, rings, the faint `.deco-weave` Peranakan quatrefoil lattice, dot grid, and bottom fade. Purely cosmetic.
2. **`.inner`** — the topbar (brand mark + wordmark + availability) and `.main`, which holds the `.hero-row` (the "Just Ask" title on the left, the `.chat` mock window on the right) and the `.closing` block below.
3. **`.cta-pill`** — the floating "Ask Singapore AI" button.

### Styling system

All design decisions are centralized as CSS custom properties in `:root` (the **"Jade Orchid"** palette). Change colors there, not at call sites:

- `--ink` — champagne-cream body text; `--gold` and `--rose-gold` — accents.
- `--hero-bg` — layered jade-green background gradient.
- `--diamond-grad`, `--wordmark-grad`, `--title-grad`, `--send-grad(-hover)` — the gold/rosé gradients reused across the brand mark, wordmark, "Just Ask" title, and Send button.
- `--font-display` (Cormorant Garamond, serif display) and `--font-ui` (Hanken Grotesk) — loaded from Google Fonts in `<head>`.

Animations are defined as `@keyframes sc*` near the top of the `<style>` block (e.g. `scTitleSheen` title sheen, `scMarkShimmer`/`scDiamondPulse` "living" logo, `scLivePulse`, `scGlowDrift`). All motion is gated behind a `prefers-reduced-motion: reduce` guard — extend that rule when adding new animations. Layout is non-wrapping by design and only stacks below the `max-width: 760px` media query.

### Backend wiring hooks (placeholders only)

The inline `<script>` is intentionally minimal. These IDs/hooks exist for the backend to connect later — keep them in place:

- `#ask-input` — chat input field
- `#ask-send` — Send button (no logic yet)
- `#cta-ask` — floating CTA pill
- `.chip[data-prefill]` — category chips that currently only **prefill** `#ask-input`
