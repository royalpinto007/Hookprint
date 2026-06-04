import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ResultPage from "@/app/result/[id]/page";
import type { AnalysisResult } from "@/types/analysis";
import * as storage from "@/lib/storage";

vi.mock("@/components/result/result-view", () => ({
  ResultView: ({ result }: { result: AnalysisResult }) => <div>Rendered result {result.id}</div>,
}));

function makeResult(): AnalysisResult {
  return {
    id: "result-1",
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
    hookFormula: "POV identity hook",
    sceneStructure: [],
    captionStyle: {
      tone: "Conversational with creator authority",
      structure: "Short punchy line with a clean closing thought",
      emojiDensity: "Low emoji use",
      proofStyle: "Opinion plus pattern recognition",
    },
    visualPattern: "Visual pattern",
    audioTempoNotes: "Audio notes",
    whyItWorked: ["Why it worked"],
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
      scoreSummary: "This reel is 60% hook-driven.",
      bestRemixAngle: "Best remix angle",
      highlights: ["Hook", "Tone", "Audio"],
    },
    scores: {
      hookDriven: 60,
      identityBait: 30,
      visualContrast: 25,
      curiosityGap: 20,
    },
    scoreDetails: [
      {
        label: "hookDriven",
        score: 60,
        summary: "Hook summary",
        factors: ["Factor 1"],
      },
    ],
    engine: {
      mode: "local",
      provider: "deterministic-local-engine",
    },
  };
}

describe("ResultPage", () => {
  it("shows a loading state before params resolve", async () => {
    vi.spyOn(storage, "getResultById").mockReturnValue(makeResult());

    let resolveParams: ((value: { id: string }) => void) | undefined;
    const params = new Promise<{ id: string }>((resolve) => {
      resolveParams = resolve;
    });

    render(<ResultPage params={params} />);

    expect(screen.getByText("Loading result...")).toBeInTheDocument();

    resolveParams?.({ id: "result-1" });

    await waitFor(() => {
      expect(screen.getByText("Rendered result result-1")).toBeInTheDocument();
    });
  });

  it("renders the not-found state when no saved result exists", async () => {
    vi.spyOn(storage, "getResultById").mockReturnValue(null);

    render(<ResultPage params={Promise.resolve({ id: "missing" })} />);

    await waitFor(() => {
      expect(screen.getByText("Result not found")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Analyze a reel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open history" })).toBeInTheDocument();
  });

  it("renders the result view when the saved report exists", async () => {
    vi.spyOn(storage, "getResultById").mockReturnValue(makeResult());

    render(<ResultPage params={Promise.resolve({ id: "result-1" })} />);

    await waitFor(() => {
      expect(screen.getByText("Rendered result result-1")).toBeInTheDocument();
    });
  });
});
