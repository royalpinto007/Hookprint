import { describe, expect, it } from "vitest";

import { filterAndSortHistory } from "@/lib/historyFilters";
import type { AnalysisResult } from "@/types/analysis";

function makeResult(id: string): AnalysisResult {
  return {
    id,
    createdAt:
      id === "older"
        ? "2026-06-02T00:00:00.000Z"
        : id === "newer"
          ? "2026-06-04T00:00:00.000Z"
          : "2026-06-03T00:00:00.000Z",
    input: {
      transcript: `POV transcript ${id}`,
      niche: `History niche ${id}`,
      audience: `History audience ${id}`,
      caption: "",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "",
      video: null,
    },
    hookFormula: "History hook formula",
    sceneStructure: [],
    captionStyle: {
      tone: "Conversational with creator authority",
      structure: "Short punchy line with a clean closing thought",
      emojiDensity: "Low emoji use",
      proofStyle: "Opinion plus pattern recognition",
    },
    visualPattern: "Pattern",
    audioTempoNotes: "Audio",
    whyItWorked: [],
    remixIdeas: Array.from({ length: 10 }, (_, index) => `idea ${index + 1}`),
    captionVariants: ["1", "2", "3", "4", "5"],
    ctaVariants: ["1", "2", "3", "4", "5"],
    promptPack: {
      disclaimer: "Use this to create an original synthetic creator, not to impersonate a real person.",
      characterConcept: "Concept",
      visualStyle: "Style",
      contentPremise: "Premise",
      storyboard: [],
      hookOptions: [],
      captionOptions: [],
    },
    viralDnaCard: {
      headline: "Headline",
      subheadline: "Subheadline",
      scoreSummary: `Summary ${id}`,
      bestRemixAngle: `Angle ${id}`,
      highlights: [],
    },
    scores: {
      hookDriven: id === "curious" ? 30 : 60,
      identityBait: 30,
      visualContrast: 25,
      curiosityGap: id === "curious" ? 75 : 20,
    },
    scoreDetails: [],
    engine: {
      mode: id === "fallback" ? "ai-fallback" : "local",
      provider: id === "fallback" ? "openrouter-free-model" : "deterministic-local-engine",
    },
  };
}

describe("filterAndSortHistory", () => {
  it("filters by search query", () => {
    const result = filterAndSortHistory([makeResult("alpha"), makeResult("beta")], {
      query: "beta",
      engineFilter: "all",
      signalFilter: "all",
      sortOrder: "newest",
    });

    expect(result.map((item) => item.id)).toEqual(["beta"]);
  });

  it("filters by engine and dominant signal together", () => {
    const fallbackCurious = {
      ...makeResult("fallback"),
      scores: {
        hookDriven: 25,
        identityBait: 30,
        visualContrast: 20,
        curiosityGap: 80,
      },
    };

    const result = filterAndSortHistory([makeResult("local"), makeResult("curious"), fallbackCurious], {
      query: "",
      engineFilter: "ai-fallback",
      signalFilter: "curiosityGap",
      sortOrder: "newest",
    });

    expect(result.map((item) => item.id)).toEqual(["fallback"]);
  });

  it("sorts by oldest first when requested", () => {
    const result = filterAndSortHistory([makeResult("older"), makeResult("newer")], {
      query: "",
      engineFilter: "all",
      signalFilter: "all",
      sortOrder: "oldest",
    });

    expect(result.map((item) => item.id)).toEqual(["older", "newer"]);
  });
});
