import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ViralDnaCard } from "@/components/result/viral-dna-card";
import type { AnalysisResult } from "@/types/analysis";

const { toPng } = vi.hoisted(() => ({
  toPng: vi.fn(),
}));

vi.mock("html-to-image", () => ({
  toPng,
}));

function makeResult(): AnalysisResult {
  return {
    id: "result-1",
    createdAt: "2026-06-03T00:00:00.000Z",
    input: {
      transcript: "POV: you're a creator.",
      niche: "Creator Education",
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

describe("ViralDnaCard", () => {
  const originalCreateElement = document.createElement.bind(document);
  const click = vi.fn();

  beforeEach(() => {
    toPng.mockReset();
    click.mockReset();
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        Object.defineProperty(element, "click", {
          value: click,
          configurable: true,
        });
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the full card layout by default", () => {
    render(<ViralDnaCard result={makeResult()} />);

    expect(screen.getByText("Hookprint")).toBeInTheDocument();
    expect(screen.getByText("Share Format")).toBeInTheDocument();
    expect(screen.getByText("Local Engine")).toBeInTheDocument();
    expect(screen.getByText("Hook-driven")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("renders the compact card layout without the share-format panel", () => {
    render(<ViralDnaCard result={makeResult()} compact />);

    expect(screen.getByText("Card Highlights")).toBeInTheDocument();
    expect(screen.queryByText("Share Format")).not.toBeInTheDocument();
  });

  it("formats the provider badge for ai-fallback cards", () => {
    render(
      <ViralDnaCard
        result={{
          ...makeResult(),
          engine: {
            mode: "ai-fallback",
            provider: "openrouter-free-model",
          },
        }}
      />
    );

    expect(screen.getByText("Openrouter Free Model")).toBeInTheDocument();
  });

  it("downloads the card as an image", async () => {
    toPng.mockResolvedValue("data:image/png;base64,fake");

    render(<ViralDnaCard result={makeResult()} />);

    fireEvent.click(screen.getByRole("button", { name: "Download Card" }));

    expect(screen.getByRole("button", { name: "Rendering..." })).toBeDisabled();
    await waitFor(() => expect(toPng).toHaveBeenCalledTimes(1));
    expect(toPng).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      cacheBust: true,
      pixelRatio: 2,
    });
    expect(click).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Download Card" })).toBeInTheDocument()
    );
  });
});
