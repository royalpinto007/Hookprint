"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Sparkles, Trash2, Video, WandSparkles } from "lucide-react";

import { formatProviderName } from "@/lib/presentation";
import type { AnalysisResult } from "@/types/analysis";
import { CopyButton } from "@/components/ui/copy-button";
import { ScoreStrip } from "@/components/result/score-strip";
import { ViralDnaCard } from "@/components/result/viral-dna-card";
import { deleteResult } from "@/lib/storage";

const sectionLinks = [
  { id: "hook-formula", label: "Hook Formula" },
  { id: "scene-structure", label: "Scene Structure" },
  { id: "creative-signals", label: "Creative Signals" },
  { id: "remix-ideas", label: "Remix Ideas" },
  { id: "captions", label: "Captions" },
  { id: "ctas", label: "CTAs" },
  { id: "scoring-logic", label: "Scoring Logic" },
  { id: "prompt-pack", label: "Prompt Pack" },
];

function Section({
  id,
  title,
  children,
  action,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className="glass-panel scroll-mt-28 rounded-[28px] p-6 shadow-lg shadow-slate-200/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ResultView({ result }: { result: AnalysisResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareMode = searchParams.get("view") === "share";
  const replacedExisting = searchParams.get("replaced") === "1";
  const fullReportText = [
    `Hookprint Viral DNA Report`,
    `Niche: ${result.input.niche}`,
    `Audience: ${result.input.audience}`,
    `Created: ${new Date(result.createdAt).toLocaleString()}`,
    "",
    `Hook Formula`,
    result.hookFormula,
    "",
    `Scene-by-Scene Structure`,
    ...result.sceneStructure.map(
      (scene) =>
        `${scene.title}\n${scene.summary}\n${scene.pacing}\n${scene.evidence}`
    ),
    "",
    `Creative Signals`,
    `Caption Style: ${result.captionStyle.tone} | ${result.captionStyle.structure} | ${result.captionStyle.emojiDensity} | ${result.captionStyle.proofStyle}`,
    `Visual Pattern: ${result.visualPattern}`,
    `Audio / Tempo Notes: ${result.audioTempoNotes}`,
    "",
    `Why It Worked`,
    ...result.whyItWorked.map((item) => `- ${item}`),
    "",
    `10 Remix Ideas`,
    ...result.remixIdeas,
    "",
    `Caption Variants`,
    ...result.captionVariants,
    "",
    `CTA Variants`,
    ...result.ctaVariants,
    "",
    `AI Influencer Prompt Pack`,
    result.promptPack.disclaimer,
    `Character Concept: ${result.promptPack.characterConcept}`,
    `Visual Style: ${result.promptPack.visualStyle}`,
    `Content Premise: ${result.promptPack.contentPremise}`,
    ...result.promptPack.storyboard,
    ...result.promptPack.hookOptions,
    ...result.promptPack.captionOptions,
    "",
    `Scoring Logic`,
    ...result.scoreDetails.map(
      (detail) =>
        `${detail.label}: ${detail.score}%\n${detail.summary}\n- ${detail.factors.join("\n- ")}`
    ),
  ].join("\n");

  function onDeleteResult() {
    deleteResult(result.id);
    router.push("/history");
  }

  if (shareMode) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-panel-strong rounded-[32px] p-5 shadow-xl shadow-cyan-100/80 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Share Mode
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{result.input.niche}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Compact Viral DNA view for sharing or exporting.
                </p>
                <ScoreStrip scores={result.scores} variant="share" />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/result/${result.id}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Full report
              </Link>
              <Link href="/history" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                History
              </Link>
            </div>
          </div>
        </div>

        <ViralDnaCard result={result} compact />

        <section className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/40 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Share Summary</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p className="rounded-2xl bg-slate-50 px-4 py-3">{result.hookFormula}</p>
            <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-950">{result.viralDnaCard.bestRemixAngle}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel-strong rounded-[32px] p-5 shadow-xl shadow-cyan-100/80 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Viral DNA Report
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{result.input.niche}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Built for {result.input.audience} • {new Date(result.createdAt).toLocaleString()}
              </p>
              <ScoreStrip scores={result.scores} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <CopyButton value={fullReportText} label="Copy full report" />
            <Link href="/analyze" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Analyze another
            </Link>
            <Link href={`/result/${result.id}?view=share`} className="rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50">
              Share view
            </Link>
            <button
              type="button"
              onClick={onDeleteResult}
              className="inline-flex items-center gap-2 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete report
            </button>
            <Link href="/history" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View history
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["Best remix angle", result.viralDnaCard.bestRemixAngle],
            ["Visual pattern", result.visualPattern],
            ["Audio tempo", result.audioTempoNotes],
          ].map(([label, body]) => (
            <div key={label} className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-sm shadow-slate-200/50">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {replacedExisting ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
          This analysis replaced an older saved report with the same reel input, so your history stays clean.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Section id="hook-formula" title="Hook Formula" action={<CopyButton value={result.hookFormula} />}>
            <p className="text-base leading-7 text-slate-700">{result.hookFormula}</p>
          </Section>

          <Section id="scene-structure" title="Scene-by-Scene Structure">
            <div className="space-y-4">
              {result.sceneStructure.map((scene) => (
                <div key={scene.title + scene.summary} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Video className="h-4 w-4 text-cyan-600" />
                    {scene.title}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{scene.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">{scene.pacing}</p>
                  <p className="mt-1 text-xs text-slate-400">{scene.evidence}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Why It Worked">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {result.whyItWorked.map((item) => (
                <li key={item} className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-950">
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="scoring-logic"
            title="Scoring Logic"
            action={<CopyButton value={result.scoreDetails.map((detail) => `${detail.label}: ${detail.score}%\n${detail.summary}\n- ${detail.factors.join("\n- ")}`).join("\n\n")} label="Copy logic" />}
          >
            <div className="space-y-4">
              {result.scoreDetails.map((detail) => (
                <div key={detail.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <BarChart3 className="h-4 w-4 text-cyan-600" />
                      {detail.label.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                    </div>
                    <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {detail.score}%
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{detail.summary}</p>
                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    {detail.factors.map((factor) => (
                      <p key={factor} className="rounded-xl bg-white px-3 py-2">
                        {factor}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="prompt-pack"
            title="AI Influencer Prompt Pack"
            action={
              <CopyButton
                value={[
                  result.promptPack.disclaimer,
                  result.promptPack.characterConcept,
                  result.promptPack.visualStyle,
                  result.promptPack.contentPremise,
                  ...result.promptPack.storyboard,
                  ...result.promptPack.hookOptions,
                  ...result.promptPack.captionOptions,
                ].join("\n")}
              />
            }
          >
            <div className="space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-rose-50 p-4 text-rose-900">{result.promptPack.disclaimer}</div>
              <div>
                <p className="font-semibold text-slate-950">Character Concept</p>
                <p className="mt-1">{result.promptPack.characterConcept}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Visual Style</p>
                <p className="mt-1">{result.promptPack.visualStyle}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Content Premise</p>
                <p className="mt-1">{result.promptPack.contentPremise}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Hook Options</p>
                <div className="mt-2 space-y-2">
                  {result.promptPack.hookOptions.map((option) => (
                    <p key={option} className="rounded-2xl bg-violet-50 px-4 py-3 text-violet-950">{option}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Storyboard</p>
                <div className="mt-2 space-y-2">
                  {result.promptPack.storyboard.map((item) => (
                    <p key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Caption Options</p>
                <div className="mt-2 space-y-2">
                  {result.promptPack.captionOptions.map((option) => (
                    <p key={option} className="rounded-2xl bg-fuchsia-50 px-4 py-3 text-fuchsia-950">{option}</p>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Report Outline">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-900"
                >
                  {section.label}
                </a>
              ))}
            </div>
          </Section>

          <ViralDnaCard result={result} />

          <Section id="creative-signals" title="Creative Signals">
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-950">Analysis Engine</p>
                <p className="mt-1">
                  {result.engine.mode === "local"
                    ? "Local engine"
                    : `AI fallback via ${formatProviderName(result.engine.provider)}`}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Caption Style</p>
                <p className="mt-1">
                  {result.captionStyle.tone} • {result.captionStyle.structure} • {result.captionStyle.emojiDensity} • {result.captionStyle.proofStyle}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Visual Pattern</p>
                <p className="mt-1">{result.visualPattern}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Audio / Tempo Notes</p>
                <p className="mt-1">{result.audioTempoNotes}</p>
              </div>
            </div>
          </Section>

          <Section
            id="remix-ideas"
            title="10 Remix Ideas"
            action={<CopyButton value={result.remixIdeas.join("\n")} label="Copy ideas" />}
          >
            <div className="space-y-2 text-sm text-slate-700">
              {result.remixIdeas.map((idea) => (
                <p key={idea} className="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-950">{idea}</p>
              ))}
            </div>
          </Section>

          <Section
            id="captions"
            title="Caption Variants"
            action={<CopyButton value={result.captionVariants.join("\n")} label="Copy captions" />}
          >
            <div className="space-y-2 text-sm text-slate-700">
              {result.captionVariants.map((caption) => (
                <p key={caption} className="rounded-2xl bg-slate-50 px-4 py-3">{caption}</p>
              ))}
            </div>
          </Section>

          <Section
            id="ctas"
            title="CTA Variants"
            action={<CopyButton value={result.ctaVariants.join("\n")} label="Copy CTAs" />}
          >
            <div className="space-y-2 text-sm text-slate-700">
              {result.ctaVariants.map((cta) => (
                <p key={cta} className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-950">{cta}</p>
              ))}
            </div>
          </Section>

          <Section title="Prompt Hooks" action={<WandSparkles className="h-5 w-5 text-slate-400" />}>
            <div className="space-y-2 text-sm text-slate-700">
              {result.promptPack.hookOptions.map((hook) => (
                <p key={hook} className="rounded-2xl bg-violet-50 px-4 py-3 text-violet-950">{hook}</p>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
