import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import HistoryPage from "@/app/history/page";
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

describe("HistoryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the empty state when no saved reports exist", () => {
    render(<HistoryPage />);

    expect(screen.getByText(/No saved analyses yet\./)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it("clears all saved reports and returns to the empty state", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("one"), makeResult("two")]));

    render(<HistoryPage />);

    expect(screen.getByText(/2 saved reports\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.getByText(/No saved analyses yet\./)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it("filters saved reports by search query and can clear the filter", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("alpha"), makeResult("beta")]));

    render(<HistoryPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search saved reports" }), {
      target: { value: "beta" },
    });

    expect(screen.getByText("History niche beta")).toBeInTheDocument();
    expect(screen.queryByText("History niche alpha")).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 2 reports shown/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByText("History niche alpha")).toBeInTheDocument();
    expect(screen.getByText("History niche beta")).toBeInTheDocument();
    expect(screen.getByText(/2 reports available/i)).toBeInTheDocument();
  });

  it("shows a no-match state when the search returns nothing", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("alpha"), makeResult("beta")]));

    render(<HistoryPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search saved reports" }), {
      target: { value: "missing" },
    });

    expect(screen.getByText(/No saved reports match/i)).toBeInTheDocument();
    expect(screen.queryByText("History niche alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("History niche beta")).not.toBeInTheDocument();
  });

  it("changes the rendered order when the sort control switches to oldest first", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("older"), makeResult("newer")]));

    render(<HistoryPage />);

    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
      "Find a saved report",
      "History audience newer",
      "History audience older",
    ]);

    fireEvent.change(screen.getByRole("combobox", { name: "Sort saved reports" }), {
      target: { value: "oldest" },
    });

    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
      "Find a saved report",
      "History audience older",
      "History audience newer",
    ]);
  });

  it("shows engine badges and filters saved reports by engine mode", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("local"), makeResult("fallback")]));

    render(<HistoryPage />);

    expect(screen.getAllByText("Local engine").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("AI fallback").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Openrouter Free Model")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Filter saved reports by engine" }), {
      target: { value: "ai-fallback" },
    });

    expect(screen.getByText("History niche fallback")).toBeInTheDocument();
    expect(screen.queryByText("History niche local")).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 2 reports shown/i)).toBeInTheDocument();
  });

  it("shows a compact summary block with the top signal and best remix angle", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("local")]));

    render(<HistoryPage />);

    expect(screen.getByText("Hook Driven 60%")).toBeInTheDocument();
    expect(screen.getByText("Best remix")).toBeInTheDocument();
    expect(screen.getByText("Angle local")).toBeInTheDocument();
  });

  it("opens saved reports through the result route", () => {
    window.localStorage.setItem("hookprint-history", JSON.stringify([makeResult("alpha")]));

    render(<HistoryPage />);

    expect(screen.getByRole("link", { name: "Open result" })).toHaveAttribute(
      "href",
      "/result/alpha"
    );
  });

  it("deletes a single saved report card", () => {
    window.localStorage.setItem(
      "hookprint-history",
      JSON.stringify([makeResult("alpha"), makeResult("beta")])
    );

    render(<HistoryPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]!);

    expect(screen.queryByText("History niche alpha")).not.toBeInTheDocument();
    expect(screen.getByText("History niche beta")).toBeInTheDocument();

    const savedHistory = JSON.parse(window.localStorage.getItem("hookprint-history") ?? "[]");
    expect(savedHistory).toHaveLength(1);
    expect(savedHistory[0].id).toBe("beta");
  });

  it("filters saved reports by dominant signal", () => {
    window.localStorage.setItem(
      "hookprint-history",
      JSON.stringify([makeResult("local"), makeResult("curious")])
    );

    render(<HistoryPage />);

    fireEvent.change(screen.getByRole("combobox", { name: "Filter saved reports by dominant signal" }), {
      target: { value: "curiosityGap" },
    });

    expect(screen.getByText("History niche curious")).toBeInTheDocument();
    expect(screen.queryByText("History niche local")).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 2 reports shown/i)).toBeInTheDocument();
  });

  it("applies combined presets for common engine and signal combinations", () => {
    const fallbackCurious = {
      ...makeResult("fallback"),
      input: {
        ...makeResult("fallback").input,
        niche: "History niche fallback-curious",
      },
      scores: {
        hookDriven: 25,
        identityBait: 30,
        visualContrast: 20,
        curiosityGap: 80,
      },
    };

    window.localStorage.setItem(
      "hookprint-history",
      JSON.stringify([makeResult("local"), makeResult("curious"), fallbackCurious])
    );

    render(<HistoryPage />);

    fireEvent.click(screen.getByRole("button", { name: "AI + Curiosity" }));

    expect(screen.getByText("History niche fallback-curious")).toBeInTheDocument();
    expect(screen.queryByText("History niche local")).not.toBeInTheDocument();
    expect(screen.queryByText("History niche curious")).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 3 reports shown/i)).toBeInTheDocument();
  });
});
