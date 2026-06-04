import type { AnalysisResult } from "@/types/analysis";

export function formatProviderName(provider: string) {
  return provider
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatScoreLabel(label: keyof AnalysisResult["scores"]) {
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

export function getTopSignal(scores: AnalysisResult["scores"]) {
  const entries = Object.entries(scores) as Array<[keyof AnalysisResult["scores"], number]>;
  return entries.reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ["hookDriven", scores.hookDriven] as [keyof AnalysisResult["scores"], number]
  );
}
