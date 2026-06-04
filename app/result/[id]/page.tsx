"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ResultView } from "@/components/result/result-view";
import { getResultById } from "@/lib/storage";
import type { AnalysisResult } from "@/types/analysis";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const [result, setResult] = useState<AnalysisResult | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    params.then(({ id }) => {
      if (!active) return;
      setResult(getResultById(id));
    });
    return () => {
      active = false;
    };
  }, [params]);

  if (result === undefined) {
    return <div className="mx-auto w-full max-w-4xl px-4 py-16 text-sm text-slate-500">Loading result...</div>;
  }

  if (!result) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Result not found</h1>
        <p className="mt-3 text-sm text-slate-600">This report is stored in local browser history, so it may have been deleted or created in another browser.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/analyze" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Analyze a reel</Link>
          <Link href="/history" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Open history</Link>
        </div>
      </div>
    );
  }

  return <ResultView result={result} />;
}
