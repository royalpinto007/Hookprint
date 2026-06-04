"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, PlayCircle, RotateCcw, Sparkles, Upload } from "lucide-react";

import { clearAnalyzeDraft, getAnalyzeDraft, saveAnalyzeDraft, saveResult } from "@/lib/storage";
import type { AnalysisResult, AnalyzeInput, UploadedVideoMeta } from "@/types/analysis";
import { validateAnalyzeInput } from "@/lib/validation";

const initialState: AnalyzeInput = {
  transcript: "",
  niche: "",
  audience: "",
  caption: "",
  visualNotes: "",
  audioNotes: "",
  remixGoal: "",
  video: null,
};

const demoState: AnalyzeInput = {
  transcript:
    "POV: you're a wellness creator and nobody tells you this.\nScene 1: Show the messy before.\nThen explain the one fix I tried.\nFinally reveal the calmer after and ask viewers to save it.",
  niche: "Wellness creators",
  audience: "Burned-out founders",
  caption: "Nobody tells you this about calming your content down.",
  visualNotes: "before and after cuts, hand-held b-roll, oversized text overlays, calmer closing frame",
  audioNotes: "soft beat drop, fast opener, pause before the after reveal",
  remixGoal: "more saves",
  video: null,
};

export function AnalyzeForm() {
  const router = useRouter();
  const [form, setForm] = useState<AnalyzeInput>(() => {
    const draft = getAnalyzeDraft();
    if (!draft) return initialState;

    return {
      ...initialState,
      ...draft,
      video: draft.video
        ? {
            ...draft.video,
            previewUrl: null,
          }
        : null,
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draftRestored, setDraftRestored] = useState(() => Boolean(getAnalyzeDraft()));

  const transcriptCount = useMemo(() => form.transcript.trim().split(/\s+/).filter(Boolean).length, [form.transcript]);

  useEffect(() => {
    saveAnalyzeDraft({
      transcript: form.transcript,
      niche: form.niche,
      audience: form.audience,
      caption: form.caption,
      visualNotes: form.visualNotes,
      audioNotes: form.audioNotes,
      remixGoal: form.remixGoal,
      video: form.video
        ? {
            ...form.video,
            previewUrl: null,
          }
        : null,
    });
  }, [form]);

  function update<K extends keyof AnalyzeInput>(key: K, value: AnalyzeInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = previewUrl;
    video.onloadedmetadata = () => {
      const payload: UploadedVideoMeta = {
        name: file.name,
        size: file.size,
        type: file.type,
        durationSeconds: Number.isFinite(video.duration) ? video.duration : null,
        previewUrl,
      };
      update("video", payload);
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { input, errors } = validateAnalyzeInput(form);
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Request failed");
      }
      const result = payload as AnalysisResult;
      const saveOutcome = saveResult(result);
      clearAnalyzeDraft();
      router.push(`/result/${result.id}${saveOutcome?.replaced ? "?replaced=1" : ""}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Hookprint couldn't finish the analysis. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function onResetDraft() {
    setForm(initialState);
    clearAnalyzeDraft();
    setDraftRestored(false);
    setError("");
  }

  function onUseExample() {
    setForm(demoState);
    setError("");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel-strong rounded-[32px] p-5 shadow-xl shadow-cyan-100/70 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Hookprint Analyzer
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Upload a reel or paste the notes</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Hookprint works locally by default. Optional hosted open-source model support can be added later through env vars, but no key is required to generate a complete Viral DNA report.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Home
            </Link>
            <button
              type="button"
              onClick={onUseExample}
              className="rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
            >
              Use example
            </button>
            <Link href="/history" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              History
            </Link>
          </div>
        </div>
      </div>

      {draftRestored ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>A saved analysis draft was restored from local storage. Re-upload the video if you want the live preview back.</p>
            <button
              type="button"
              onClick={onResetDraft}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear draft
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/50 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-kicker text-[11px] font-semibold text-cyan-700">Step 1</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">Source Reel</h2>
              </div>
              <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                Optional video + required notes
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-white bg-white p-6 text-center shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
                <Upload className="h-8 w-8 text-cyan-600" />
                <span className="text-sm font-semibold text-slate-900">Choose a local video file</span>
                <span className="text-xs text-slate-500">Preview only. Paste transcript or notes below. Local transcription can be added later.</span>
                <input type="file" accept="video/*" className="hidden" onChange={onVideoChange} />
              </label>

              {form.video ? (
                <div className="mt-4 space-y-3">
                  <video src={form.video.previewUrl ?? undefined} controls className="w-full rounded-2xl bg-slate-900" />
                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <p><span className="font-semibold text-slate-900">File:</span> {form.video.name}</p>
                    <p><span className="font-semibold text-slate-900">Size:</span> {(form.video.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><span className="font-semibold text-slate-900">Duration:</span> {form.video.durationSeconds ? `${form.video.durationSeconds.toFixed(1)}s` : "Loading..."}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Transcript or notes</span>
              <textarea
                required
                value={form.transcript}
                onChange={(event) => update("transcript", event.target.value)}
                rows={12}
                placeholder="Paste transcript or notes here. Local transcription can be added later."
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
              <p className="mt-2 text-xs text-slate-500">{transcriptCount} words detected for pacing and scene logic.</p>
            </label>
          </section>

          <section className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/50 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-kicker text-[11px] font-semibold text-cyan-700">Step 2</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">Context</h2>
              </div>
              <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
                Niche + audience shape the analysis
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["niche", "Niche", "Fitness coaches"],
                ["audience", "Audience", "Beginner creators"],
                ["caption", "Optional caption", "Paste the original caption if you have it"],
                ["remixGoal", "Remix goal", "More saves, shares, or leads"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className={key === "caption" ? "sm:col-span-2" : ""}>
                  <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
                  <input
                    value={(form as Record<string, string | null | undefined>)[key] ?? ""}
                    onChange={(event) => update(key as keyof AnalyzeInput, event.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-900">Visual notes</span>
                <textarea
                  rows={4}
                  value={form.visualNotes}
                  onChange={(event) => update("visualNotes", event.target.value)}
                  placeholder="Cuts, camera moves, text style, gestures, before/after visuals"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-900">Audio notes</span>
                <textarea
                  rows={4}
                  value={form.audioNotes}
                  onChange={(event) => update("audioNotes", event.target.value)}
                  placeholder="Trend audio, voiceover energy, beat drops, pauses"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/30 sm:p-6">
            <div className="flex items-center gap-3">
              <PlayCircle className="h-6 w-6 text-cyan-300" />
              <h2 className="text-lg font-semibold">What Hookprint will generate</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-200">
              {[
                "Hook formula with pattern detection",
                "Scene-by-scene structure and pacing",
                "Caption style and visual pattern notes",
                "Audio / tempo reading from transcript density",
                "Why it worked plus visible score logic",
                "10 remix ideas, 5 captions, 5 CTAs",
                "Original synthetic creator prompt pack",
                "Downloadable Viral DNA Card",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{item}</div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-5 shadow-lg shadow-slate-200/50 sm:p-6">
            <p className="section-kicker text-[11px] font-semibold text-cyan-700">Submission</p>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a,#0ea5e9)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing reel..." : "Analyze"}
            </button>
            {error ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Free by default. Hosted model usage is optional and never required for the app to work.
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                <p className="font-semibold text-slate-950">Draft safety</p>
                <p className="mt-1 leading-6 text-slate-600">Your notes and safe video metadata are restored locally if you come back later.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                <p className="font-semibold text-slate-950">Fallback path</p>
                <p className="mt-1 leading-6 text-slate-600">If optional hosted analysis is unavailable, Hookprint falls back to the local engine automatically.</p>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
