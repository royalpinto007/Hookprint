# Hookprint

Hookprint is a free local-first web app that breaks down viral short-form reels into a structured "Viral DNA" report.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage for saved history
- Open-source npm packages only

## Features

- Upload a local video for preview and metadata
- Paste transcript or reel notes for required analysis input
- Deterministic local analysis engine with no API keys
- Optional hosted open-source model adapter via env vars
- Full result output:
  - Hook formula
  - Scene-by-scene structure
  - Caption style
  - Visual pattern
  - Audio / tempo notes
  - Why it worked
  - 10 remix ideas
  - 5 caption variants
  - 5 CTA variants
  - AI influencer prompt pack for original synthetic creators
  - Downloadable Viral DNA Card
- Local history with open and delete actions

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run test
```

For browser e2e testing in this repo, run the app on port `3001` in one shell:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Then run in another shell:

```bash
npm run test:e2e
```

## Optional free hosted model adapter

Hookprint works fully without any external AI provider. If you want optional hosted refinement, create a `.env.local` file using the example below.

Supported today:

- `groq`
- `openrouter`

Example:

```bash
HOOKPRINT_AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

```bash
HOOKPRINT_AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

If the provider is missing, fails, or rate-limits, Hookprint automatically falls back to the deterministic local TypeScript engine.
