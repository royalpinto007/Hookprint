import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/hostedAnalysis", () => ({
  tryHostedProvider: vi.fn(),
}));

import { POST } from "@/app/api/analyze/route";
import { tryHostedProvider } from "@/lib/hostedAnalysis";

const mockedTryHostedProvider = vi.mocked(tryHostedProvider);

describe("api/analyze route", () => {
  it("returns validation errors for bad input", async () => {
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: "", niche: "", audience: "" }),
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Transcript or notes are required.",
    });
  });

  it("falls back to local analysis when hosted analysis is unavailable", async () => {
    mockedTryHostedProvider.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "POV: you're a creator. Wait until the end. Before and after.",
          niche: "Creator education",
          audience: "Solo founders",
          caption: "Nobody tells you this",
        }),
      })
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.hookFormula).toContain("POV identity hook");
    expect(data.engine).toMatchObject({ mode: "local" });
    expect(data.sceneStructure.length).toBeGreaterThan(0);
    expect(data.remixIdeas).toHaveLength(10);
    expect(data.captionVariants).toHaveLength(5);
    expect(data.ctaVariants).toHaveLength(5);
    expect(data.promptPack.hookOptions).toHaveLength(3);
    expect(data.promptPack.captionOptions).toHaveLength(3);
    expect(data.promptPack.disclaimer).toContain("original synthetic creator");
    expect(data.scoreDetails).toHaveLength(4);
    expect(data.viralDnaCard.highlights).toHaveLength(3);
  });

  it("falls back to local analysis when the hosted adapter throws", async () => {
    mockedTryHostedProvider.mockRejectedValueOnce(new Error("adapter failed"));

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "POV: you're a creator. Wait until the end.",
          niche: "Creator education",
          audience: "Solo founders",
        }),
      })
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.engine).toMatchObject({ mode: "local" });
  });

  it("returns hosted analysis when available", async () => {
    mockedTryHostedProvider.mockResolvedValueOnce({
      id: "hosted-result",
      createdAt: "2026-06-03T00:00:00.000Z",
      input: {
        transcript: "POV: you're a creator.",
        niche: "Creator education",
        audience: "Solo founders",
        caption: "",
        visualNotes: "",
        audioNotes: "",
        remixGoal: "",
        video: null,
      },
      hookFormula: "Hosted hook",
      sceneStructure: [],
      captionStyle: {
        tone: "Conversational",
        structure: "Short",
        emojiDensity: "Low",
        proofStyle: "Opinion",
      },
      visualPattern: "Hosted visual",
      audioTempoNotes: "Hosted audio",
      whyItWorked: ["Hosted reason"],
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
        scoreSummary: "Summary",
        bestRemixAngle: "Angle",
        highlights: [],
      },
      scores: {
        hookDriven: 50,
        identityBait: 20,
        visualContrast: 30,
        curiosityGap: 10,
      },
      scoreDetails: [],
      engine: {
        mode: "ai-fallback",
        provider: "groq+local",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "POV: you're a creator.",
          niche: "Creator education",
          audience: "Solo founders",
        }),
      })
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.hookFormula).toBe("Hosted hook");
    expect(data.engine.provider).toBe("groq+local");
  });

  it("returns 400 for malformed JSON bodies", async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error("bad json")),
    } as unknown as Request;

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Unable to analyze this reel.",
    });
  });
});
