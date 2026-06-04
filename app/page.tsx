import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BrainCircuit, Layers3, Sparkles, WandSparkles } from "lucide-react";

const featureCards: { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: "Deterministic local engine",
    body: "Pattern logic for hooks, contrast, curiosity gaps, pacing, and score output. No API key required.",
    Icon: BrainCircuit,
  },
  {
    title: "Creator-first outputs",
    body: "10 remix ideas, caption variants, CTA variants, and an original synthetic creator prompt pack.",
    Icon: Layers3,
  },
  {
    title: "Visual result system",
    body: "A premium result page plus a downloadable Viral DNA Card built entirely client-side.",
    Icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="glass-panel-strong relative overflow-hidden rounded-[36px] p-8 shadow-xl shadow-cyan-100/70 sm:p-12">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_54%),radial-gradient(circle_at_bottom,rgba(251,191,36,0.12),transparent_46%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Hookprint
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Decode viral reels into remixable creative DNA.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Upload a local video or paste transcript notes, then turn a short-form reel into a structured breakdown: hook formula, pacing, captions, CTAs, remix ideas, and a polished Viral DNA Card you can save or share.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/analyze" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Start analyzing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/history" className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
                Open history
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Free by default", "No paid APIs or billing required"],
                ["Local-first", "History and drafts stay in browser storage"],
                ["Structured output", "Hooks, scenes, prompts, captions, and cards"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm shadow-slate-200/50">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:justify-self-end">
            <div className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/60">
              <p className="section-kicker text-[11px] font-semibold text-cyan-700">Workflow</p>
              <div className="mt-4 space-y-3">
                {[
                  "Upload a reel or paste transcript notes",
                  "Generate the Viral DNA analysis instantly",
                  "Save, remix, export, and revisit the result",
                ].map((step, index) => (
                  <div key={step} className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-cyan-200 bg-[linear-gradient(135deg,#0f172a,#123458_52%,#0ea5e9)] p-5 text-white shadow-2xl shadow-cyan-200/50">
              <div className="flex items-center gap-3">
                <WandSparkles className="h-5 w-5 text-cyan-200" />
                <p className="text-sm font-semibold">Creator outcome</p>
              </div>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                Turn one strong reel into ten remix directions without leaving the browser.
              </p>
              <p className="mt-3 text-sm leading-6 text-cyan-100">
                Hookprint combines deterministic pattern scoring with exportable outputs built for ideation, posting, and handoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featureCards.map(({ title, body, Icon }) => (
          <div key={title} className="glass-panel rounded-[28px] p-6 shadow-lg shadow-slate-200/40">
            <Icon className="h-6 w-6 text-cyan-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[32px] p-6 shadow-lg shadow-slate-200/40">
          <p className="section-kicker text-[11px] font-semibold text-cyan-700">What you get</p>
          <div className="mt-5 grid gap-3 text-sm text-slate-700">
            {[
              "Hook formula and visible scoring logic",
              "Scene-by-scene structure with pacing notes",
              "Caption style, audio tempo, and visual pattern analysis",
              "10 remix ideas, 5 captions, 5 CTAs, and an exportable Viral DNA Card",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-[32px] p-6 shadow-lg shadow-slate-200/40">
          <p className="section-kicker text-[11px] font-semibold text-cyan-700">Why this UX works</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Fast first run", "Use the example dataset or paste notes without waiting on transcription."],
              ["Clear recovery", "Draft restore, history, duplicate replacement, and result deletion reduce friction."],
              ["Export ready", "Copy actions and the downloadable share card support immediate reuse."],
              ["No hidden cost", "The local engine works without keys, and hosted adapters are optional only."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/70 bg-white/75 p-4">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
