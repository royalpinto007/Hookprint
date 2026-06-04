"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

import { formatProviderName } from "@/lib/presentation";
import type { AnalysisResult } from "@/types/analysis";

type Props = {
  result: AnalysisResult;
  compact?: boolean;
};

export function ViralDnaCard({ result, compact = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const highlightLines = result.viralDnaCard.highlights.slice(0, 3);

  async function onDownload() {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${result.input.niche.toLowerCase().replace(/\s+/g, "-")}-viral-dna-card.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={ref}
        className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_35%),linear-gradient(135deg,#10336b,#0f172a_45%,#3f2f91)] p-6 text-white shadow-2xl shadow-slate-950/40"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Hookprint</p>
            <h3 className="mt-3 text-2xl font-semibold">{result.viralDnaCard.headline}</h3>
            <p className="mt-1 text-sm text-slate-200">{result.viralDnaCard.subheadline}</p>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            {result.engine.mode === "local" ? "Local Engine" : formatProviderName(result.engine.provider)}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Hook-driven", `${result.scores.hookDriven}%`],
            ["Identity bait", `${result.scores.identityBait}%`],
            ["Visual contrast", `${result.scores.visualContrast}%`],
            ["Curiosity gap", `${result.scores.curiosityGap}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Best Remix Angle</p>
          <p className="mt-2 text-lg font-semibold">{result.viralDnaCard.bestRemixAngle}</p>
          <p className="mt-3 text-sm text-slate-100">{result.viralDnaCard.scoreSummary}</p>
        </div>

        {compact ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Card Highlights</p>
            <div className="mt-3 space-y-2 text-sm text-slate-100">
              {highlightLines.map((line) => (
                <p key={line} className="rounded-xl bg-white/6 px-3 py-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Card Highlights</p>
              <div className="mt-3 space-y-2 text-sm text-slate-100">
                {highlightLines.map((line) => (
                  <p key={line} className="rounded-xl bg-white/6 px-3 py-2">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Share Format</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                The downloaded image uses a compact share layout with scores, remix angle, and top highlights. Full scoring logic stays on the result page.
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {downloading ? "Rendering..." : "Download Card"}
      </button>
    </div>
  );
}
