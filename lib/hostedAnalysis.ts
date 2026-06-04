import { analyzeReel } from "@/lib/analyzeReel";
import type { AnalysisResult, AnalyzeInput } from "@/types/analysis";

type EnvLike = Record<string, string | undefined>;
type FetchLike = typeof fetch;

function pickHostedList<T>(value: unknown, minimumLength: number, fallback: T[]) {
  return Array.isArray(value) && value.length >= minimumLength ? (value.slice(0, fallback.length) as T[]) : fallback;
}

export function mergeHostedResult(
  input: AnalyzeInput,
  provider: string,
  parsed: Partial<AnalysisResult>
): AnalysisResult {
  const local = analyzeReel(input, { mode: "ai-fallback", provider });

  return {
    ...local,
    hookFormula: parsed.hookFormula || local.hookFormula,
    sceneStructure: pickHostedList(parsed.sceneStructure, 1, local.sceneStructure),
    captionStyle:
      parsed.captionStyle &&
      typeof parsed.captionStyle.tone === "string" &&
      typeof parsed.captionStyle.structure === "string" &&
      typeof parsed.captionStyle.emojiDensity === "string" &&
      typeof parsed.captionStyle.proofStyle === "string"
        ? parsed.captionStyle
        : local.captionStyle,
    visualPattern: parsed.visualPattern || local.visualPattern,
    audioTempoNotes: parsed.audioTempoNotes || local.audioTempoNotes,
    whyItWorked: pickHostedList(parsed.whyItWorked, 3, local.whyItWorked),
    remixIdeas: pickHostedList(parsed.remixIdeas, 10, local.remixIdeas),
    captionVariants: pickHostedList(parsed.captionVariants, 5, local.captionVariants),
    ctaVariants: pickHostedList(parsed.ctaVariants, 5, local.ctaVariants),
    promptPack: {
      disclaimer: parsed.promptPack?.disclaimer || local.promptPack.disclaimer,
      characterConcept: parsed.promptPack?.characterConcept || local.promptPack.characterConcept,
      visualStyle: parsed.promptPack?.visualStyle || local.promptPack.visualStyle,
      contentPremise: parsed.promptPack?.contentPremise || local.promptPack.contentPremise,
      storyboard: pickHostedList(parsed.promptPack?.storyboard, 1, local.promptPack.storyboard),
      hookOptions: pickHostedList(parsed.promptPack?.hookOptions, 3, local.promptPack.hookOptions),
      captionOptions: pickHostedList(parsed.promptPack?.captionOptions, 3, local.promptPack.captionOptions),
    },
    viralDnaCard: {
      headline: parsed.viralDnaCard?.headline || local.viralDnaCard.headline,
      subheadline: parsed.viralDnaCard?.subheadline || local.viralDnaCard.subheadline,
      scoreSummary: parsed.viralDnaCard?.scoreSummary || local.viralDnaCard.scoreSummary,
      bestRemixAngle: parsed.viralDnaCard?.bestRemixAngle || local.viralDnaCard.bestRemixAngle,
      highlights: pickHostedList(parsed.viralDnaCard?.highlights, 3, local.viralDnaCard.highlights),
    },
    scoreDetails: pickHostedList(parsed.scoreDetails, 4, local.scoreDetails),
  };
}

async function requestHostedCompletion(
  url: string,
  apiKey: string,
  model: string,
  input: AnalyzeInput,
  fetchImpl: FetchLike
) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return JSON only. Improve or refine the supplied reel analysis fields, but keep outputs safe and original. Never suggest impersonation.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  return JSON.parse(content) as Partial<AnalysisResult>;
}

async function tryGroq(input: AnalyzeInput, env: EnvLike, fetchImpl: FetchLike): Promise<AnalysisResult | null> {
  if (!env.GROQ_API_KEY) return null;

  try {
    const parsed = await requestHostedCompletion(
      "https://api.groq.com/openai/v1/chat/completions",
      env.GROQ_API_KEY,
      env.GROQ_MODEL || "llama-3.3-70b-versatile",
      input,
      fetchImpl
    );
    return parsed ? mergeHostedResult(input, "groq+local", parsed) : null;
  } catch {
    return null;
  }
}

async function tryOpenRouter(input: AnalyzeInput, env: EnvLike, fetchImpl: FetchLike): Promise<AnalysisResult | null> {
  if (!env.OPENROUTER_API_KEY) return null;

  try {
    const parsed = await requestHostedCompletion(
      "https://openrouter.ai/api/v1/chat/completions",
      env.OPENROUTER_API_KEY,
      env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
      input,
      fetchImpl
    );
    return parsed ? mergeHostedResult(input, "openrouter+local", parsed) : null;
  } catch {
    return null;
  }
}

export async function tryHostedProvider(
  input: AnalyzeInput,
  env: EnvLike = process.env,
  fetchImpl: FetchLike = fetch
): Promise<AnalysisResult | null> {
  const provider = env.HOOKPRINT_AI_PROVIDER;

  if (provider === "groq") return tryGroq(input, env, fetchImpl);
  if (provider === "openrouter") return tryOpenRouter(input, env, fetchImpl);

  return null;
}
