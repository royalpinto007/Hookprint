import { formatScoreLabel } from "@/lib/presentation";
import type { AnalysisResult } from "@/types/analysis";

export function ScoreStrip({
  scores,
  variant = "full",
}: {
  scores: AnalysisResult["scores"];
  variant?: "full" | "share";
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {(Object.entries(scores) as Array<[keyof AnalysisResult["scores"], number]>).map(
        ([label, score]) => (
          <span
            key={label}
            className={
              variant === "share"
                ? "rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
                : "rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
            }
          >
            {formatScoreLabel(label)} {score}%
          </span>
        )
      )}
    </div>
  );
}
