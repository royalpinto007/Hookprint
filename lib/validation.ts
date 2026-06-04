import type { AnalyzeInput, UploadedVideoMeta } from "@/types/analysis";

const MAX_TEXT_LENGTH = 12000;
const MAX_SHORT_LENGTH = 160;
const MAX_NOTES_LENGTH = 1200;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateLength(label: string, value: string, max: number, errors: string[]) {
  if (value.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
  }
}

function normalizeVideo(value: unknown): UploadedVideoMeta | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  const name = asTrimmedString(raw.name);
  const type = asTrimmedString(raw.type);
  const size = typeof raw.size === "number" && Number.isFinite(raw.size) ? raw.size : 0;
  const durationSeconds =
    typeof raw.durationSeconds === "number" && Number.isFinite(raw.durationSeconds)
      ? raw.durationSeconds
      : null;
  const previewUrl = asTrimmedString(raw.previewUrl) || null;

  if (!name) return null;

  return {
    name,
    type,
    size,
    durationSeconds,
    previewUrl,
  };
}

export function normalizeAnalyzeInput(value: unknown): AnalyzeInput {
  const raw = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  return {
    transcript: asTrimmedString(raw.transcript),
    niche: asTrimmedString(raw.niche),
    audience: asTrimmedString(raw.audience),
    caption: asTrimmedString(raw.caption),
    visualNotes: asTrimmedString(raw.visualNotes),
    audioNotes: asTrimmedString(raw.audioNotes),
    remixGoal: asTrimmedString(raw.remixGoal),
    video: normalizeVideo(raw.video),
  };
}

export function validateAnalyzeInput(value: unknown) {
  const input = normalizeAnalyzeInput(value);
  const errors: string[] = [];

  if (!input.transcript) errors.push("Transcript or notes are required.");
  if (!input.niche) errors.push("Niche is required.");
  if (!input.audience) errors.push("Audience is required.");

  validateLength("Transcript or notes", input.transcript, MAX_TEXT_LENGTH, errors);
  validateLength("Niche", input.niche, MAX_SHORT_LENGTH, errors);
  validateLength("Audience", input.audience, MAX_SHORT_LENGTH, errors);
  validateLength("Caption", input.caption ?? "", MAX_NOTES_LENGTH, errors);
  validateLength("Visual notes", input.visualNotes ?? "", MAX_NOTES_LENGTH, errors);
  validateLength("Audio notes", input.audioNotes ?? "", MAX_NOTES_LENGTH, errors);
  validateLength("Remix goal", input.remixGoal ?? "", MAX_SHORT_LENGTH, errors);

  if (input.video && input.video.size < 0) {
    errors.push("Video metadata is invalid.");
  }

  return {
    input,
    errors,
  };
}
