"use client";

import Link from "next/link";
import { Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  filterAndSortHistory,
  type HistoryEngineFilter,
  type HistorySignalFilter,
  type HistorySortOrder,
} from "@/lib/historyFilters";
import { formatProviderName, formatScoreLabel, getTopSignal } from "@/lib/presentation";
import { clearHistory, deleteResult, getHistory } from "@/lib/storage";
import type { AnalysisResult } from "@/types/analysis";

const presetFilters = [
  {
    label: "All reports",
    engine: "all",
    signal: "all",
  },
  {
    label: "Local + Hook",
    engine: "local",
    signal: "hookDriven",
  },
  {
    label: "AI + Curiosity",
    engine: "ai-fallback",
    signal: "curiosityGap",
  },
] as const;

export default function HistoryPage() {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<HistorySortOrder>("newest");
  const [engineFilter, setEngineFilter] = useState<HistoryEngineFilter>("all");
  const [signalFilter, setSignalFilter] = useState<HistorySignalFilter>("all");

  useEffect(() => {
    const sync = () => setItems(getHistory());
    sync();
    window.addEventListener("hookprint-storage-sync", sync);
    return () => window.removeEventListener("hookprint-storage-sync", sync);
  }, []);

  function onDelete(id: string) {
    deleteResult(id);
    setItems(getHistory());
  }

  function onClearAll() {
    clearHistory();
    setItems([]);
  }

  function applyPreset(
    preset: (typeof presetFilters)[number]
  ) {
    setEngineFilter(preset.engine);
    setSignalFilter(preset.signal);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const hasActiveFilters =
    normalizedQuery.length > 0 || engineFilter !== "all" || signalFilter !== "all";
  const filteredItems = useMemo(
    () =>
      filterAndSortHistory(items, {
        query,
        engineFilter,
        signalFilter,
        sortOrder,
      }),
    [engineFilter, items, query, signalFilter, sortOrder]
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel-strong rounded-[32px] p-5 shadow-lg shadow-slate-200/40 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">History</h1>
            <p className="mt-2 text-sm text-slate-600">
              Reports are stored locally in this browser via `localStorage`. {items.length > 0 ? `${items.length} saved report${items.length === 1 ? "" : "s"}.` : "No saved reports yet."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/analyze" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Analyze new reel
            </Link>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={onClearAll}
                className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>
        {items.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Saved reports", String(items.length)],
              ["Local only", String(items.filter((item) => item.engine.mode === "local").length)],
              ["AI fallback", String(items.filter((item) => item.engine.mode === "ai-fallback").length)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm shadow-slate-200/50">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-kicker text-[11px] font-semibold text-cyan-700">Filters</p>
              <h2 className="text-lg font-semibold text-slate-950">Find a saved report</h2>
              <p className="mt-1 text-sm text-slate-600">
                Search by niche, audience, hook formula, transcript notes, caption text, or remix angle.
              </p>
            </div>
            <div className="flex w-full max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Search saved reports"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search saved reports"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <label className="flex flex-col items-start gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
                <span className="font-medium text-slate-700">Engine</span>
                <select
                  aria-label="Filter saved reports by engine"
                  value={engineFilter}
                  onChange={(event) => setEngineFilter(event.target.value as "all" | "local" | "ai-fallback")}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="all">All engines</option>
                  <option value="local">Local engine</option>
                  <option value="ai-fallback">AI fallback</option>
                </select>
              </label>
              <label className="flex flex-col items-start gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
                <span className="font-medium text-slate-700">Signal</span>
                <select
                  aria-label="Filter saved reports by dominant signal"
                  value={signalFilter}
                  onChange={(event) =>
                    setSignalFilter(
                      event.target.value as "all" | keyof AnalysisResult["scores"]
                    )
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="all">All signals</option>
                  <option value="hookDriven">Hook driven</option>
                  <option value="identityBait">Identity bait</option>
                  <option value="visualContrast">Visual contrast</option>
                  <option value="curiosityGap">Curiosity gap</option>
                </select>
              </label>
              <label className="flex flex-col items-start gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
                <span className="font-medium text-slate-700">Sort</span>
                <select
                  aria-label="Sort saved reports"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            {hasActiveFilters
              ? `${filteredItems.length} of ${items.length} report${items.length === 1 ? "" : "s"} shown`
              : `${items.length} report${items.length === 1 ? "" : "s"} available`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {presetFilters.map((preset) => {
              const active = engineFilter === preset.engine && signalFilter === preset.signal;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-12 text-center text-sm text-slate-500">
          No saved analyses yet. Run your first reel breakdown from the analyzer, or come back here after saving a result.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-12 text-center text-sm text-slate-500">
          No saved reports match <span className="font-semibold text-slate-700">&quot;{query}&quot;</span>. Try a niche, audience, hook phrase, or remix angle instead.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, index) => (
            <div key={item.id} className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-600">{item.input.niche}</p>
                  <p className="mt-2 text-xs text-slate-400">Report #{String(index + 1).padStart(2, "0")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      item.engine.mode === "local"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {item.engine.mode === "local" ? "Local engine" : "AI fallback"}
                  </span>
                  {item.engine.mode === "ai-fallback" ? (
                    <span className="text-[11px] font-medium text-amber-700">
                      {formatProviderName(item.engine.provider)}
                    </span>
                  ) : null}
                </div>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">{item.input.audience}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.hookFormula}</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const [topSignal, topScore] = getTopSignal(item.scores);
                    return (
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                        {formatScoreLabel(topSignal)} {topScore}%
                      </span>
                    );
                  })()}
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-900">
                    Best remix
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">
                  {item.viralDnaCard.bestRemixAngle}
                </p>
              </div>
              <p className="mt-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/result/${item.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  Open result
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
