import type { AnalysisResult, AnalyzeInput } from "@/types/analysis";

const STORAGE_KEY = "hookprint-history";
const DRAFT_KEY = "hookprint-analyze-draft";

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function normalizeFingerprintPart(value: string | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getInputFingerprint(input: AnalyzeInput) {
  return [
    normalizeFingerprintPart(input.transcript),
    normalizeFingerprintPart(input.niche),
    normalizeFingerprintPart(input.audience),
    normalizeFingerprintPart(input.caption),
    normalizeFingerprintPart(input.visualNotes),
    normalizeFingerprintPart(input.audioNotes),
    normalizeFingerprintPart(input.remixGoal),
    normalizeFingerprintPart(input.video?.name),
  ].join("::");
}

export function getHistory(): AnalysisResult[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResult(result: AnalysisResult) {
  if (!canUseStorage()) return;
  const fingerprint = getInputFingerprint(result.input);
  const history = getHistory();
  const replaced = history.find(
    (item) => item.id !== result.id && getInputFingerprint(item.input) === fingerprint
  );
  const next = [result, ...history.filter((item) => item.id !== result.id && item.id !== replaced?.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("hookprint-storage-sync"));
  return {
    replaced: Boolean(replaced),
    replacedId: replaced?.id ?? null,
  };
}

export function getResultById(id: string) {
  return getHistory().find((item) => item.id === id) ?? null;
}

export function deleteResult(id: string) {
  if (!canUseStorage()) return;
  const next = getHistory().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("hookprint-storage-sync"));
}

export function clearHistory() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("hookprint-storage-sync"));
}

export function getAnalyzeDraft(): Partial<AnalyzeInput> | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AnalyzeInput>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAnalyzeDraft(draft: Partial<AnalyzeInput>) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearAnalyzeDraft() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DRAFT_KEY);
}
