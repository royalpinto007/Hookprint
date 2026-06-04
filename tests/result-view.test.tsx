import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResultView } from "@/components/result/result-view";
import type { AnalysisResult } from "@/types/analysis";
import * as storage from "@/lib/storage";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

import { useRouter, useSearchParams } from "next/navigation";

const mockedUseSearchParams = vi.mocked(useSearchParams);
const mockedUseRouter = vi.mocked(useRouter);
const push = vi.fn();
const writeText = vi.fn().mockResolvedValue(undefined);

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
      storyboard: ["Scene 1: Hook."],
      hookOptions: ["Hook option 1", "Hook option 2"],
      captionOptions: ["Caption option 1", "Caption option 2"],
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

describe("ResultView", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({ push } as never);
    mockedUseSearchParams.mockReturnValue(new URLSearchParams("") as never);
    push.mockReset();
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });
  });

  it("renders share mode when the query string requests it", () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams("view=share") as never);

    render(<ResultView result={makeResult()} />);

    expect(screen.getByText("Share Mode")).toBeInTheDocument();
    expect(screen.getByText("Compact Viral DNA view for sharing or exporting.")).toBeInTheDocument();
    expect(screen.getByText("Hook Driven 60%")).toBeInTheDocument();
    expect(screen.getByText("Identity Bait 30%")).toBeInTheDocument();
    expect(screen.getByText("Visual Contrast 25%")).toBeInTheDocument();
    expect(screen.getByText("Curiosity Gap 20%")).toBeInTheDocument();
    expect(screen.queryByText("Scoring Logic")).not.toBeInTheDocument();
  });

  it("renders the full report by default", () => {
    render(<ResultView result={makeResult()} />);

    expect(screen.getByText("Viral DNA Report")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Report Outline" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scoring Logic" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy full report" })).toBeInTheDocument();
    expect(screen.getByText("Local engine")).toBeInTheDocument();
    expect(screen.getByText("Hook Options")).toBeInTheDocument();
    expect(screen.getByText("Caption Options")).toBeInTheDocument();
    expect(screen.getByText("Caption option 1")).toBeInTheDocument();
    expect(screen.getByText("Hook Driven 60%")).toBeInTheDocument();
    expect(screen.getByText("Identity Bait 30%")).toBeInTheDocument();
    expect(screen.getByText("Visual Contrast 25%")).toBeInTheDocument();
    expect(screen.getByText("Curiosity Gap 20%")).toBeInTheDocument();
  });

  it("shows the provider name for ai-fallback analyses", () => {
    render(
      <ResultView
        result={{
          ...makeResult(),
          engine: {
            mode: "ai-fallback",
            provider: "openrouter-free-model",
          },
        }}
      />
    );

    expect(screen.getByText("AI fallback via Openrouter Free Model")).toBeInTheDocument();
  });

  it("shows a replacement notice when the result query includes replaced=1", () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams("replaced=1") as never);

    render(<ResultView result={makeResult()} />);

    expect(
      screen.getByText(/This analysis replaced an older saved report with the same reel input/i)
    ).toBeInTheDocument();
  });

  it("deletes the active report and returns to history", () => {
    const deleteSpy = vi.spyOn(storage, "deleteResult").mockImplementation(() => undefined);

    render(<ResultView result={makeResult()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete report" }));

    expect(deleteSpy).toHaveBeenCalledWith("result-1");
    expect(push).toHaveBeenCalledWith("/history");
  });

  it("copies remix ideas, captions, CTAs, and prompt-pack content", async () => {
    render(<ResultView result={makeResult()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy ideas" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(
      1,
      Array.from({ length: 10 }, (_, index) => `idea ${index + 1}`).join("\n")
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy captions" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(2, ["1", "2", "3", "4", "5"].join("\n"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy CTAs" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(3, ["1", "2", "3", "4", "5"].join("\n"));

    const promptSection = screen
      .getByText("AI Influencer Prompt Pack")
      .closest("section");
    expect(promptSection).not.toBeNull();

    await act(async () => {
      fireEvent.click(within(promptSection!).getByRole("button", { name: "Copy" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(
      4,
      [
        "Use this to create an original synthetic creator, not to impersonate a real person.",
        "Concept",
        "Style",
        "Premise",
        "Scene 1: Hook.",
        "Hook option 1",
        "Hook option 2",
        "Caption option 1",
        "Caption option 2",
      ].join("\n")
    );
  });

  it("copies the hook formula and scoring logic content", async () => {
    render(<ResultView result={makeResult()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy full report" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Hookprint Viral DNA Report")
    );

    const hookSection = screen.getByRole("heading", { name: "Hook Formula" }).closest("section");
    expect(hookSection).not.toBeNull();

    await act(async () => {
      fireEvent.click(within(hookSection!).getByRole("button", { name: "Copy" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(2, "POV identity hook");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy logic" }));
    });
    expect(writeText).toHaveBeenNthCalledWith(
      3,
      "hookDriven: 60%\nHook summary\n- Factor 1"
    );
  });
});
