import { describe, expect, it, vi } from "vitest";

import { mergeHostedResult, tryHostedProvider } from "@/lib/hostedAnalysis";
import type { AnalyzeInput } from "@/types/analysis";

const input: AnalyzeInput = {
  transcript: "POV: you're a creator. Wait until the end. Before and after.",
  niche: "Creator education",
  audience: "Solo founders",
  caption: "Nobody tells you this #creators",
  visualNotes: "before and after cuts",
  audioNotes: "fast voiceover",
  remixGoal: "more saves",
  video: null,
};

describe("hostedAnalysis", () => {
  it("merges hosted fields onto the deterministic fallback result", () => {
    const result = mergeHostedResult(input, "groq+local", {
      hookFormula: "Hosted hook",
      remixIdeas: Array.from({ length: 10 }, (_, index) => `idea ${index + 1}`),
      captionVariants: ["a", "b", "c", "d", "e"],
      ctaVariants: ["1", "2", "3", "4", "5"],
    });

    expect(result.engine.mode).toBe("ai-fallback");
    expect(result.hookFormula).toBe("Hosted hook");
    expect(result.remixIdeas[0]).toBe("idea 1");
    expect(result.captionVariants).toHaveLength(5);
  });

  it("preserves full local structures when hosted payloads are underfilled", () => {
    const result = mergeHostedResult(input, "openrouter+local", {
      sceneStructure: [],
      whyItWorked: ["Only one reason"],
      promptPack: {
        disclaimer: "Custom disclaimer",
        characterConcept: "",
        visualStyle: "",
        contentPremise: "",
        storyboard: [],
        hookOptions: ["one hook"],
        captionOptions: ["one caption"],
      },
      viralDnaCard: {
        headline: "Hosted headline",
        subheadline: "",
        scoreSummary: "",
        bestRemixAngle: "",
        highlights: ["one highlight"],
      },
      scoreDetails: [
        {
          label: "hookDriven",
          score: 90,
          summary: "Only one score detail",
          factors: ["factor"],
        },
      ],
    });

    expect(result.sceneStructure.length).toBeGreaterThan(0);
    expect(result.whyItWorked.length).toBeGreaterThan(1);
    expect(result.promptPack.disclaimer).toBe("Custom disclaimer");
    expect(result.promptPack.hookOptions).toHaveLength(3);
    expect(result.promptPack.captionOptions).toHaveLength(3);
    expect(result.viralDnaCard.headline).toBe("Hosted headline");
    expect(result.viralDnaCard.highlights).toHaveLength(3);
    expect(result.scoreDetails).toHaveLength(4);
  });

  it("returns null when the hosted provider is unavailable or non-ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });

    const result = await tryHostedProvider(
      input,
      {
        HOOKPRINT_AI_PROVIDER: "groq",
        GROQ_API_KEY: "test-key",
      },
      fetchMock as typeof fetch
    );

    expect(result).toBeNull();
  });

  it("falls back to deterministic merge when hosted content is returned", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hookFormula: "OpenRouter hook",
                captionVariants: ["a", "b", "c", "d", "e"],
                ctaVariants: ["1", "2", "3", "4", "5"],
                remixIdeas: Array.from({ length: 10 }, (_, index) => `remix ${index + 1}`),
              }),
            },
          },
        ],
      }),
    });

    const result = await tryHostedProvider(
      input,
      {
        HOOKPRINT_AI_PROVIDER: "openrouter",
        OPENROUTER_API_KEY: "test-key",
      },
      fetchMock as typeof fetch
    );

    expect(result?.engine.provider).toBe("openrouter+local");
    expect(result?.hookFormula).toBe("OpenRouter hook");
    expect(result?.remixIdeas).toHaveLength(10);
  });
});
