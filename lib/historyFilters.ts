import { getTopSignal } from "@/lib/presentation";
import type { AnalysisResult } from "@/types/analysis";

export type HistoryEngineFilter = "all" | "local" | "ai-fallback";
export type HistorySignalFilter = "all" | keyof AnalysisResult["scores"];
export type HistorySortOrder = "newest" | "oldest";

export function filterAndSortHistory(
  items: AnalysisResult[],
  {
    query,
    engineFilter,
    signalFilter,
    sortOrder,
  }: {
    query: string;
    engineFilter: HistoryEngineFilter;
    signalFilter: HistorySignalFilter;
    sortOrder: HistorySortOrder;
  }
) {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const matchesQuery = normalizedQuery
      ? [
          item.input.niche,
          item.input.audience,
          item.hookFormula,
          item.input.transcript,
          item.input.caption ?? "",
          item.viralDnaCard.bestRemixAngle,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesEngine = engineFilter === "all" ? true : item.engine.mode === engineFilter;
    const [topSignal] = getTopSignal(item.scores);
    const matchesSignal = signalFilter === "all" ? true : topSignal === signalFilter;

    return matchesQuery && matchesEngine && matchesSignal;
  });

  return [...filtered].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return sortOrder === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}
