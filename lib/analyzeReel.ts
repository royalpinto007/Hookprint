import type { AnalysisResult, AnalyzeInput, CaptionStyle, PromptPack, SceneBeat } from "@/types/analysis";
import { dominantAngle, explainScores, formatScoreSummary, scoreTranscript } from "@/lib/scoring";

const identityPatterns = [
  { test: /\bpov\b/i, label: "POV identity hook" },
  { test: /\bif you'?re a\b/i, label: "If-you-are audience qualifier" },
  { test: /\bfor creators\b/i, label: "Direct niche callout" },
  { test: /\bnobody tells you\b/i, label: "Hidden-truth framing" },
];

const curiosityPatterns = [
  { test: /\bwait until\b/i, label: "Delayed payoff curiosity" },
  { test: /\bthe reason\b/i, label: "Reason-why explanation" },
  { test: /\bi tried\b/i, label: "First-person experiment" },
  { test: /\bwhat happened\b/i, label: "Outcome teaser" },
];

const contrastPatterns = [
  { test: /\bbefore\b.*\bafter\b/i, label: "Before/after transformation" },
  { test: /\bmistake\b.*\bfix\b/i, label: "Mistake/fix correction" },
  { test: /\bproblem\b.*\bsolution\b/i, label: "Problem/solution relief" },
  { test: /\bdon't\b.*\binstead\b/i, label: "Wrong way/right way contrast" },
];

const sceneMarkerPattern =
  /(?:\bscene\s*\d+\b|\bcut to\b|\bthen\b|\bnext\b|\bmeanwhile\b|\bfinally\b|->|=>)/i;

const inlinePivotPattern =
  /(?=\bbut\b|\bso\b|\bbecause\b|\bthen\b|\bnext\b|\bfinally\b|\binstead\b|\bmeanwhile\b)/i;

function safeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildHookFormula(input: AnalyzeInput, transcript: string) {
  const matchedIdentity = identityPatterns.find((pattern) => pattern.test.test(transcript));
  const matchedCuriosity = curiosityPatterns.find((pattern) => pattern.test.test(transcript));
  const matchedContrast = contrastPatterns.find((pattern) => pattern.test.test(transcript));
  const pieces = [
    matchedIdentity?.label,
    matchedCuriosity?.label,
    matchedContrast?.label,
  ].filter(Boolean);

  if (pieces.length > 0) {
    return `${pieces.join(" + ")} tailored for ${input.audience} in the ${input.niche} niche.`;
  }

  const firstLine = input.transcript.split(/\n+/).find(Boolean)?.trim() ?? "Direct opening line";
  return `Direct outcome-led opener built around "${firstLine.slice(0, 70)}" with quick payoff framing for ${input.audience}.`;
}

function buildSceneStructure(input: AnalyzeInput): SceneBeat[] {
  const normalizedTranscript = input.transcript
    .replace(/([.!?])(?=[A-Z])/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
  const lines = input.transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const sentenceSegments = normalizedTranscript
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const markerSegments = normalizedTranscript
    .split(/\n|(?=\bscene\s*\d+\b)|(?=\bcut to\b)|(?=\bthen\b)|(?=\bnext\b)|(?=\bmeanwhile\b)|(?=\bfinally\b)|(?=->)|(?==>)/i)
    .map((line) => line.trim())
    .filter(Boolean);
  const pivotSegments = sentenceSegments.flatMap((segment) => {
    if (segment.length < 90 || !inlinePivotPattern.test(segment)) {
      return [segment];
    }

    return segment
      .split(/(?=\bbut\b|\bso\b|\bbecause\b|\bthen\b|\bnext\b|\bfinally\b|\binstead\b|\bmeanwhile\b)/i)
      .map((piece) => piece.trim())
      .filter(Boolean);
  });
  const segments =
    markerSegments.length > 1
      ? markerSegments
      : lines.length > 1
        ? lines
        : pivotSegments.length > 1
          ? pivotSegments
          : sentenceSegments;

  if (segments.length === 0) {
    return [
      {
        title: "Hook",
        summary: `Lead with a niche-specific pain point for ${input.audience}.`,
        pacing: "0-3 seconds, fast text-on-screen entry",
        evidence: "No transcript was provided, so this beat is inferred from the requested niche and audience.",
      },
    ];
  }

  const chunkSize = Math.max(1, Math.ceil(segments.length / Math.min(segments.length, 4)));

  return Array.from({ length: Math.min(4, segments.length) }, (_, index) => {
    const start = index * chunkSize;
    const segment = segments.slice(start, start + chunkSize).join(" ");
    if (!segment) {
      return null;
    }

    const title =
      index === 0 ? "Hook" : index === 1 ? "Context" : index === 2 ? "Payoff" : "CTA/Button-up";

    return {
      title,
      summary: segment,
      pacing:
        segment.length < 80
          ? "Quick-cut beat, likely 1-2 seconds"
          : segment.length < 180
            ? "Medium beat, likely 2-4 seconds"
            : "Slower beat, likely 4+ seconds or layered visuals",
      evidence: `Built from transcript segment ${start + 1}-${Math.min(segments.length, start + chunkSize)}.`,
    };
  }).filter(Boolean) as SceneBeat[];
}

function buildCaptionStyle(input: AnalyzeInput): CaptionStyle {
  const caption = input.caption?.trim() ?? "";
  const lower = `${caption} ${input.transcript}`.toLowerCase();
  const captionLines = caption.split(/\n+/).filter(Boolean);
  const emojiHits = caption.match(/[\u{1F300}-\u{1FAFF}]/gu)?.length ?? 0;
  const hashtagHits = caption.match(/#\w+/g)?.length ?? 0;
  const proofHits =
    (lower.match(/\bresults|clients|views|sales|tested|revenue|screenshots|proof|ctr|retention\b/g) ?? []).length +
    (caption.match(/\b\d+%|\b\d+x\b|\b\d+k\b/gi)?.length ?? 0);
  const educationalHits = (lower.match(/\bhow to|step|steps|tips|framework|breakdown|checklist\b/g) ?? []).length;
  const confessionalHits = (lower.match(/\bsecret|nobody tells you|truth|confession|wish i knew\b/g) ?? []).length;
  const storyHits = (lower.match(/\bi tried|i learned|here's what happened|my experience\b/g) ?? []).length;

  return {
    tone: educationalHits > 0
      ? "Educational and tactical"
      : confessionalHits > 0 && proofHits === 0
          ? "Insider and confessional"
        : storyHits > 0 && proofHits === 0
          ? "Personal and reflective"
        : "Conversational with creator authority",
    structure: captionLines.length >= 3
      ? "Stacked short lines with scan-friendly spacing"
      : hashtagHits >= 2
        ? "Single hook line followed by discovery hashtags"
        : caption.length > 120
        ? "One longer story caption with proof and takeaway"
        : "Short punchy line with a clean closing thought",
    emojiDensity:
      emojiHits >= 4
        ? "High emoji use"
        : emojiHits >= 1
          ? "Light-to-medium emoji use"
          : "Low emoji use",
    proofStyle: proofHits >= 2
      ? "Strong performance proof and receipts"
      : proofHits === 1
        ? "Performance proof and receipts"
      : "Opinion plus pattern recognition",
  };
}

function buildVisualPattern(input: AnalyzeInput, sceneStructure: SceneBeat[]) {
  const visualNotes = input.visualNotes?.trim();
  if (visualNotes) {
    return `Visuals lean on ${visualNotes}. The pacing suggests ${sceneStructure.length > 2 ? "frequent reframes and stacked context" : "a simpler single-idea visual build"}.`;
  }

  return `Likely text-led short-form composition with ${sceneStructure.length} primary visual beats, fast subtitle dependency, and contrast moments highlighted through framing changes rather than complex production.`;
}

function buildAudioNotes(input: AnalyzeInput, sceneStructure: SceneBeat[]) {
  const noteBase = input.audioNotes?.trim();
  const transcriptLength = input.transcript.length;
  const sceneMarkerCount = (input.transcript.match(/(?:\bscene\s*\d+\b|\bcut to\b|\bthen\b|\bnext\b|\bmeanwhile\b|\bfinally\b|->|=>)/gi) ?? []).length;
  const tempo =
    transcriptLength < 180 ? "snappy, under 120 words per minute equivalent" :
    transcriptLength < 420 ? "balanced mid-tempo delivery with room for caption emphasis" :
    "dense pacing that benefits from tight jump cuts or on-screen text support";

  if (noteBase) {
    return `Audio notes mention ${noteBase}. Recommended tempo: ${tempo}. Scene count of ${sceneStructure.length} and ${sceneMarkerCount} transcript-level scene marker(s) suggest clear rhythm changes between hook and payoff.`;
  }

  return `No audio notes were provided, so the pacing is inferred from transcript density, punctuation, and ${sceneMarkerCount} detected scene marker(s). Recommended tempo: ${tempo}. Open hard in the first beat, then relax slightly once the promise is established.`;
}

function buildWhyItWorked(input: AnalyzeInput, hookFormula: string, scores: ReturnType<typeof scoreTranscript>) {
  const sceneMarkerCount = (input.transcript.match(sceneMarkerPattern) ?? []).length;
  return [
    `The opening pattern is recognizable and fast to classify: ${hookFormula}`,
    `It speaks directly to ${input.audience}, which increases self-selection and hold rate.`,
    `The score mix shows the strongest lift coming from ${dominantAngle(scores).replace(/([A-Z])/g, " $1").toLowerCase()}.`,
    `The transcript implies ${sceneMarkerCount} explicit scene marker(s), which helps the pacing feel edited rather than rambly.`,
    "The structure moves from promise to explanation quickly enough to feel immediately actionable.",
    "The creative is remixable because the logic can be swapped into many adjacent creator scenarios without changing the core pattern.",
  ];
}

function buildRemixIdeas(input: AnalyzeInput, scores: ReturnType<typeof scoreTranscript>) {
  const bestAngle = dominantAngle(scores);
  const angleLabel = bestAngle.replace(/([A-Z])/g, " $1").toLowerCase();
  const prompts = [
    `Swap the original example for a beginner-friendly mistake/fix moment that ${input.audience} instantly recognizes.`,
    `Turn the hook into a niche-specific POV opener and reveal the payoff only in the third beat.`,
    `Use a side-by-side before/after visual to make the transformation legible without audio.`,
    `Reframe the same lesson as "what I would do differently" to make it feel more personal and coach-like.`,
    `Aim for more saves by converting the explanation into a three-step checklist with text overlays.`,
    `Aim for more shares by making the first line feel like an industry truth nobody says out loud.`,
    `Build a quieter version with fewer cuts and stronger captions for audiences who watch on mute.`,
    `Adapt it for client results or proof screenshots so the story feels more evidence-backed.`,
    `Test a controversial opener that challenges a common ${input.niche} best practice, then resolves it fast.`,
    `Close with a direct CTA tied to ${input.remixGoal || "the next action you want viewers to take"} instead of a generic follow ask.`,
  ];

  return prompts.map(
    (prompt, index) =>
      `${index + 1}. Rebuild this for ${input.niche} creators targeting ${input.audience}, center it on ${angleLabel}, and ${prompt}`
  );
}

function buildCaptionVariants(input: AnalyzeInput) {
  return [
    `Most ${input.niche} creators are copying trends. This angle gives your audience a reason to stop and stay.`,
    `If you're trying to reach ${input.audience}, this is the reel structure worth stealing and remaking.`,
    `Nobody tells you this about short-form in ${input.niche}: clarity beats complexity almost every time.`,
    `I broke down why this reel worked, and the remix angle is cleaner than the original.`,
    `This is the kind of hook that makes ${input.audience} feel seen before you even explain the point.`,
  ];
}

function buildCtaVariants(input: AnalyzeInput) {
  return [
    `Want the ${input.niche} version of this? Save this and test it this week.`,
    `Comment your niche and I'll show you how to remix this angle.`,
    `Use this structure in your next reel, then compare your first-three-second retention.`,
    `Send this to the creator on your team who keeps overcomplicating hooks.`,
    `Follow for more breakdowns built for ${input.audience}.`,
  ];
}

function buildPromptPack(input: AnalyzeInput, sceneStructure: SceneBeat[], captionVariants: string[]): PromptPack {
  return {
    disclaimer: "Use this to create an original synthetic creator, not to impersonate a real person.",
    characterConcept: `An original synthetic creator who teaches ${input.niche} tactics to ${input.audience} with calm authority, quick pattern recognition, and practical examples.`,
    visualStyle: "Editorial short-form look, clean daylight lighting, sharp wardrobe contrast, oversized kinetic captions, and handheld-but-polished camera energy.",
    contentPremise: `Break down viral content patterns in the ${input.niche} niche and turn them into usable creator playbooks for ${input.audience}.`,
    storyboard: sceneStructure.map(
      (beat, index) => `Scene ${index + 1}: ${beat.title}. ${beat.summary} Visual pacing: ${beat.pacing}.`
    ),
    hookOptions: [
      `POV: you're a ${input.niche} creator trying to win ${input.audience} in 3 seconds.`,
      `Nobody tells ${input.audience} this about viral ${input.niche} reels.`,
      `I studied a viral reel so you can remake it without copying it.`,
    ],
    captionOptions: captionVariants.slice(0, 3),
  };
}

export function analyzeReel(input: AnalyzeInput, engine: AnalysisResult["engine"] = { mode: "local", provider: "deterministic-local-engine" }): AnalysisResult {
  const transcript = input.transcript.trim();
  const scores = scoreTranscript(input);
  const scoreDetails = explainScores(input, scores);
  const hookFormula = buildHookFormula(input, transcript.toLowerCase());
  const sceneStructure = buildSceneStructure(input);
  const captionStyle = buildCaptionStyle(input);
  const visualPattern = buildVisualPattern(input, sceneStructure);
  const audioTempoNotes = buildAudioNotes(input, sceneStructure);
  const whyItWorked = buildWhyItWorked(input, hookFormula, scores);
  const remixIdeas = buildRemixIdeas(input, scores);
  const captionVariants = buildCaptionVariants(input);
  const ctaVariants = buildCtaVariants(input);
  const promptPack = buildPromptPack(input, sceneStructure, captionVariants);
  const bestRemixAngle = remixIdeas[0]?.replace(/^\d+\.\s*/, "") ?? `Remix for ${input.niche}`;

  return {
    id: safeId(),
    createdAt: new Date().toISOString(),
    input,
    hookFormula,
    sceneStructure,
    captionStyle,
    visualPattern,
    audioTempoNotes,
    whyItWorked,
    remixIdeas,
    captionVariants,
    ctaVariants,
    promptPack,
    viralDnaCard: {
      headline: `${input.niche} Viral DNA`,
      subheadline: `Pattern map for reaching ${input.audience}`,
      scoreSummary: formatScoreSummary(scores),
      bestRemixAngle,
      highlights: [
        hookFormula,
        captionStyle.tone,
        audioTempoNotes,
      ],
    },
    scores,
    scoreDetails,
    engine,
  };
}
