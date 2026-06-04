import type { AnalyzeInput, ScoreBreakdown, ScoreDetail } from "@/types/analysis";

const countMatches = (source: string, patterns: RegExp[]) =>
  patterns.reduce((total, pattern) => total + (source.match(pattern)?.length ?? 0), 0);

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function scoreTranscript(input: AnalyzeInput): ScoreBreakdown {
  const transcript = `${input.transcript} ${input.caption ?? ""}`.toLowerCase();
  const visualNotes = (input.visualNotes ?? "").toLowerCase();
  const audioNotes = (input.audioNotes ?? "").toLowerCase();
  const caption = (input.caption ?? "").trim();

  const lines = input.transcript.split(/\n+/).filter(Boolean);
  const captionLines = caption.split(/\n+/).filter(Boolean);
  const punctuationHits = countMatches(transcript, [/!/g, /\?/g, /:/g]);
  const sceneMarkerHits = countMatches(transcript, [
    /\bscene\s*\d+\b/g,
    /\bcut to\b/g,
    /\bthen\b/g,
    /\bnext\b/g,
    /\bmeanwhile\b/g,
    /\bfinally\b/g,
  ]);
  const identityHits = countMatches(transcript, [
    /\bpov\b/g,
    /\bif you'?re\b/g,
    /\bfor creators\b/g,
    /\bnobody tells you\b/g,
    /\byou need this\b/g,
    /\bif you work in\b/g,
  ]);
  const curiosityHits = countMatches(transcript, [
    /\bwait until\b/g,
    /\bthe reason\b/g,
    /\bi tried\b/g,
    /\bwhat happened\b/g,
    /\byou won't believe\b/g,
    /\bhere's why\b/g,
  ]);
  const contrastHits = countMatches(transcript, [
    /\bbefore\b/g,
    /\bafter\b/g,
    /\bmistake\b/g,
    /\bfix\b/g,
    /\bproblem\b/g,
    /\bsolution\b/g,
    /\binstead\b/g,
  ]);
  const visualHits = countMatches(visualNotes, [
    /\bcut\b/g,
    /\bzoom\b/g,
    /\bcaption\b/g,
    /\btransition\b/g,
    /\bcomparison\b/g,
    /\bb-roll\b/g,
  ]);
  const audioTempoHits = countMatches(audioNotes, [
    /\bfast\b/g,
    /\bpunchy\b/g,
    /\bbeat drop\b/g,
    /\bpause\b/g,
    /\btempo\b/g,
    /\bvoiceover\b/g,
  ]);
  const hashtagHits = countMatches(caption.toLowerCase(), [/#\w+/g]);
  const emojiHits = countMatches(caption, [/[\u{1F300}-\u{1FAFF}]/gu]);
  const transcriptWords = input.transcript.trim().split(/\s+/).filter(Boolean).length;
  const pacingPenalty = transcriptWords > 140 ? Math.min(18, Math.floor((transcriptWords - 140) / 12)) : 0;
  const captionDensityBoost = Math.min(10, captionLines.length * 2 + hashtagHits + emojiHits);

  return {
    hookDriven: clamp(34 + lines.length * 4 + punctuationHits * 3 + identityHits * 6 + sceneMarkerHits * 2 - pacingPenalty),
    identityBait: clamp(8 + identityHits * 12 + Number(input.audience.length > 0) * 10 + Math.min(8, hashtagHits)),
    visualContrast: clamp(10 + contrastHits * 8 + visualHits * 6 + sceneMarkerHits * 2),
    curiosityGap: clamp(8 + curiosityHits * 14 + Number(transcript.includes("?")) * 8 + audioTempoHits + captionDensityBoost),
  };
}

export function dominantAngle(scores: ScoreBreakdown) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "hookDriven";
}

export function formatScoreSummary(scores: ScoreBreakdown) {
  return `This reel is ${scores.hookDriven}% hook-driven, ${scores.identityBait}% identity bait, ${scores.visualContrast}% visual contrast, and ${scores.curiosityGap}% curiosity gap.`;
}

export function explainScores(input: AnalyzeInput, scores: ScoreBreakdown): ScoreDetail[] {
  const transcript = `${input.transcript} ${input.caption ?? ""}`.toLowerCase();
  const visualNotes = (input.visualNotes ?? "").toLowerCase();
  const audioNotes = (input.audioNotes ?? "").toLowerCase();
  const caption = (input.caption ?? "").trim();
  const lines = input.transcript.split(/\n+/).filter(Boolean);
  const captionLines = caption.split(/\n+/).filter(Boolean);

  const punctuationHits = countMatches(transcript, [/!/g, /\?/g, /:/g]);
  const sceneMarkerHits = countMatches(transcript, [
    /\bscene\s*\d+\b/g,
    /\bcut to\b/g,
    /\bthen\b/g,
    /\bnext\b/g,
    /\bmeanwhile\b/g,
    /\bfinally\b/g,
  ]);
  const identityHits = countMatches(transcript, [
    /\bpov\b/g,
    /\bif you'?re\b/g,
    /\bfor creators\b/g,
    /\bnobody tells you\b/g,
    /\byou need this\b/g,
    /\bif you work in\b/g,
  ]);
  const curiosityHits = countMatches(transcript, [
    /\bwait until\b/g,
    /\bthe reason\b/g,
    /\bi tried\b/g,
    /\bwhat happened\b/g,
    /\byou won't believe\b/g,
    /\bhere's why\b/g,
  ]);
  const contrastHits = countMatches(transcript, [
    /\bbefore\b/g,
    /\bafter\b/g,
    /\bmistake\b/g,
    /\bfix\b/g,
    /\bproblem\b/g,
    /\bsolution\b/g,
    /\binstead\b/g,
  ]);
  const visualHits = countMatches(visualNotes, [
    /\bcut\b/g,
    /\bzoom\b/g,
    /\bcaption\b/g,
    /\btransition\b/g,
    /\bcomparison\b/g,
    /\bb-roll\b/g,
  ]);
  const audioTempoHits = countMatches(audioNotes, [
    /\bfast\b/g,
    /\bpunchy\b/g,
    /\bbeat drop\b/g,
    /\bpause\b/g,
    /\btempo\b/g,
    /\bvoiceover\b/g,
  ]);
  const hashtagHits = countMatches(caption.toLowerCase(), [/#\w+/g]);
  const emojiHits = countMatches(caption, [/[\u{1F300}-\u{1FAFF}]/gu]);
  const transcriptWords = input.transcript.trim().split(/\s+/).filter(Boolean).length;
  const pacingPenalty = transcriptWords > 140 ? Math.min(18, Math.floor((transcriptWords - 140) / 12)) : 0;

  return [
    {
      label: "hookDriven",
      score: scores.hookDriven,
      summary: "Measures how aggressively the reel tries to stop the scroll in the first seconds.",
      factors: [
        `${lines.length} transcript line(s) contribute to beat density.`,
        `${punctuationHits} punctuation cue(s) add emphasis and urgency.`,
        `${identityHits} audience-hook phrase(s) increase directness.`,
        `${sceneMarkerHits} scene marker(s) imply deliberate beat changes.`,
        pacingPenalty > 0
          ? `Long transcript density applies a ${pacingPenalty}-point pacing penalty.`
          : "Transcript density stays within a tight short-form pacing range.",
      ],
    },
    {
      label: "identityBait",
      score: scores.identityBait,
      summary: "Measures how clearly the reel makes a specific audience feel called out.",
      factors: [
        `${identityHits} identity cue(s) detected in transcript or caption.`,
        `${hashtagHits} caption hashtag(s) reinforce targeting signals.`,
        input.audience.trim()
          ? `Audience field "${input.audience}" adds explicit targeting context.`
          : "No explicit audience field was provided.",
      ],
    },
    {
      label: "visualContrast",
      score: scores.visualContrast,
      summary: "Measures how much transformation, comparison, or visual switching is implied.",
      factors: [
        `${contrastHits} contrast keyword hit(s) found in transcript.`,
        `${visualHits} visual editing cue(s) found in notes.`,
        `${sceneMarkerHits} scene marker(s) suggest visible reframes or transitions.`,
      ],
    },
    {
      label: "curiosityGap",
      score: scores.curiosityGap,
      summary: "Measures how strongly the reel withholds payoff to make the viewer wait.",
      factors: [
        `${curiosityHits} curiosity phrase(s) detected.`,
        transcript.includes("?")
          ? "A question mark adds open-loop tension."
          : "No explicit question mark, so the score leans on phrasing instead.",
        `${audioTempoHits} audio pacing cue(s) imply timed reveals or held payoff.`,
        `${captionLines.length} caption line(s), ${hashtagHits} hashtag(s), and ${emojiHits} emoji(s) add caption density cues.`,
      ],
    },
  ] satisfies ScoreDetail[];
}
