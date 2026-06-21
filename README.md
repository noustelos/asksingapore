# asksingapore.ai — Landing Page

A standalone, **design-only** landing page for **asksingapore.ai**.

Single-file vanilla HTML/CSS/JS — no frameworks, no build step, no backend.

## Run

Open `index.html` directly in a browser, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Aesthetic

Premium "Singapore concierge" look — deep emerald background with gold accents (no marble).

- **Display serif:** Cormorant Garamond
- **UI sans:** Hanken Grotesk
- Loaded from Google Fonts.

## Scope / status

This repo is **design only**. There is intentionally no chat, AI, or network logic.

Wiring points left as commented hooks for the backend (connected separately later):

- `#ask-input` — chat input field (`// TODO: wire to backend stub`)
- `#ask-send` — Send button (placeholder hook, no logic)
- `#cta-ask` — floating "Ask Singapore AI" CTA pill (placeholder hook)
- Category chips currently only **prefill** the input.
