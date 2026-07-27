# Hookprint

> Paste a reel. Get its Viral DNA: the hook formula, the scene structure, why it worked, and 10 ways to remix it.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black.svg)
![Local-first](https://img.shields.io/badge/local--first-no%20API%20key-brightgreen.svg)

Hookprint is a free, local-first web app that reverse-engineers a viral short-form video into a structured report you can act on. No account, no API key required: the analysis engine runs deterministically in your browser, and an optional hosted model just sharpens the output.

<!-- Add a short screen-recording GIF of a reel going in and the Viral DNA card coming out (public/demo.gif). Lead the README with it. -->

## Why

Everyone tells creators to "study what goes viral," but studying means rewatching a clip 20 times and guessing. Hookprint turns that guesswork into a repeatable teardown: same clip in, the same structured breakdown out, so you can copy the pattern instead of the video.

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

## Optional transcript extraction

Upload a clip on the Analyze page and click **Extract transcript** to auto-transcribe it via Groq Whisper. This needs a `GROQ_API_KEY` (the same key as above); set `GROQ_TRANSCRIBE_MODEL` to override the default `whisper-large-v3-turbo`. Files are capped at 25MB. Without a key, paste the transcript manually — everything else still works locally.

## Theme

The UI ships with a dark, neon-accented theme and a header toggle for light mode. Your choice persists in `localStorage` and is applied before first paint (no flash).
