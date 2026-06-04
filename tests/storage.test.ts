import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAnalyzeDraft,
  clearHistory,
  deleteResult,
  getAnalyzeDraft,
  getHistory,
  saveAnalyzeDraft,
  saveResult,
} from "@/lib/storage";
import type { AnalysisResult } from "@/types/analysis";

function makeResult(id: string): AnalysisResult {
  return {
    id,
    createdAt: "2026-06-03T00:00:00.000Z",
    input: {
      transcript: `POV: demo transcript ${id}`,
      niche: `Demo niche ${id}`,
      audience: `Demo audience ${id}`,
      caption: "",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "",
      video: null,
    },
    hookFormula: "Demo hook",
    sceneStructure: [],
    captionStyle: {
      tone: "Conversational",
      structure: "Short",
      emojiDensity: "Low",
      proofStyle: "Opinion",
    },
    visualPattern: "Demo visual",
    audioTempoNotes: "Demo audio",
    whyItWorked: [],
    remixIdeas: Array.from({ length: 10 }, (_, index) => `${index + 1}`),
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
      scoreSummary: "Summary",
      bestRemixAngle: "Angle",
      highlights: [],
    },
    scores: {
      hookDriven: 50,
      identityBait: 20,
      visualContrast: 30,
      curiosityGap: 15,
    },
    scoreDetails: [],
    engine: {
      mode: "local",
      provider: "deterministic-local-engine",
    },
  };
}

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and deletes history entries", () => {
    saveResult(makeResult("one"));
    saveResult(makeResult("two"));

    expect(getHistory().map((item) => item.id)).toEqual(["two", "one"]);

    deleteResult("two");
    expect(getHistory().map((item) => item.id)).toEqual(["one"]);
  });

  it("replaces prior entries when the same analysis input is saved again", () => {
    saveResult(makeResult("one"));
    const outcome = saveResult({
      ...makeResult("two"),
      input: makeResult("one").input,
      hookFormula: "Updated hook",
    });

    expect(outcome).toEqual({
      replaced: true,
      replacedId: "one",
    });
    expect(getHistory()).toHaveLength(1);
    expect(getHistory()[0]?.id).toBe("two");
    expect(getHistory()[0]?.hookFormula).toBe("Updated hook");
  });

  it("returns a non-replaced save outcome for unique analyses", () => {
    const outcome = saveResult(makeResult("one"));

    expect(outcome).toEqual({
      replaced: false,
      replacedId: null,
    });
  });

  it("clears history in one action", () => {
    saveResult(makeResult("one"));
    clearHistory();

    expect(getHistory()).toEqual([]);
  });

  it("persists and clears analyze drafts", () => {
    saveAnalyzeDraft({ transcript: "draft", niche: "n", audience: "a" });
    expect(getAnalyzeDraft()?.transcript).toBe("draft");

    clearAnalyzeDraft();
    expect(getAnalyzeDraft()).toBeNull();
  });

  it("persists uploaded video draft metadata", () => {
    saveAnalyzeDraft({
      transcript: "draft",
      niche: "niche",
      audience: "audience",
      video: {
        name: "creator-hook.mp4",
        size: 123456,
        type: "video/mp4",
        durationSeconds: 12.4,
        previewUrl: null,
      },
    });

    expect(getAnalyzeDraft()).toMatchObject({
      transcript: "draft",
      niche: "niche",
      audience: "audience",
      video: {
        name: "creator-hook.mp4",
        size: 123456,
        type: "video/mp4",
        durationSeconds: 12.4,
        previewUrl: null,
      },
    });
  });
});
