export type UploadedVideoMeta = {
  name: string;
  size: number;
  type: string;
  durationSeconds?: number | null;
  previewUrl?: string | null;
};

export type AnalyzeInput = {
  transcript: string;
  niche: string;
  audience: string;
  caption?: string;
  visualNotes?: string;
  audioNotes?: string;
  remixGoal?: string;
  video?: UploadedVideoMeta | null;
};

export type ScoreBreakdown = {
  hookDriven: number;
  identityBait: number;
  visualContrast: number;
  curiosityGap: number;
};

export type ScoreDetail = {
  label: keyof ScoreBreakdown;
  score: number;
  summary: string;
  factors: string[];
};

export type SceneBeat = {
  title: string;
  summary: string;
  pacing: string;
  evidence: string;
};

export type CaptionStyle = {
  tone: string;
  structure: string;
  emojiDensity: string;
  proofStyle: string;
};

export type PromptPack = {
  disclaimer: string;
  characterConcept: string;
  visualStyle: string;
  contentPremise: string;
  storyboard: string[];
  hookOptions: string[];
  captionOptions: string[];
};

export type ViralDnaCard = {
  headline: string;
  subheadline: string;
  scoreSummary: string;
  bestRemixAngle: string;
  highlights: string[];
};

export type AnalysisResult = {
  id: string;
  createdAt: string;
  input: AnalyzeInput;
  hookFormula: string;
  sceneStructure: SceneBeat[];
  captionStyle: CaptionStyle;
  visualPattern: string;
  audioTempoNotes: string;
  whyItWorked: string[];
  remixIdeas: string[];
  captionVariants: string[];
  ctaVariants: string[];
  promptPack: PromptPack;
  viralDnaCard: ViralDnaCard;
  scores: ScoreBreakdown;
  scoreDetails: ScoreDetail[];
  engine: {
    mode: "local" | "ai-fallback";
    provider: string;
  };
};
