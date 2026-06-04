import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HistoryPage from "@/app/history/page";
import * as storage from "@/lib/storage";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

import { AnalyzeForm } from "@/components/analyze/analyze-form";

function makeApiResult(id: string) {
  return {
    id,
    createdAt: "2026-06-04T00:00:00.000Z",
    input: {
      transcript: "POV: creator test transcript",
      niche: "Creator education",
      audience: "Indie founders",
      caption: "",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "",
      video: null,
    },
    hookFormula: "Hook",
    sceneStructure: [
      {
        title: "Hook",
        summary: "Open with a sharp creator pain point.",
        pacing: "Quick-cut beat, likely 1-2 seconds",
        evidence: "Built from transcript segment 1-1.",
      },
    ],
    captionStyle: {
      tone: "Conversational",
      structure: "Short",
      emojiDensity: "Low",
      proofStyle: "Opinion",
    },
    visualPattern: "Visual",
    audioTempoNotes: "Audio",
    whyItWorked: ["Why 1", "Why 2", "Why 3"],
    remixIdeas: Array.from({ length: 10 }, (_, index) => `idea ${index + 1}`),
    captionVariants: ["1", "2", "3", "4", "5"],
    ctaVariants: ["1", "2", "3", "4", "5"],
    promptPack: {
      disclaimer: "Use this to create an original synthetic creator, not to impersonate a real person.",
      characterConcept: "Concept",
      visualStyle: "Style",
      contentPremise: "Premise",
      storyboard: ["Scene 1: Hook."],
      hookOptions: ["Hook 1", "Hook 2", "Hook 3"],
      captionOptions: ["Caption 1", "Caption 2", "Caption 3"],
    },
    viralDnaCard: {
      headline: "Headline",
      subheadline: "Subheadline",
      scoreSummary: "Summary",
      bestRemixAngle: "Angle",
      highlights: ["Highlight 1", "Highlight 2", "Highlight 3"],
    },
    scores: {
      hookDriven: 60,
      identityBait: 20,
      visualContrast: 30,
      curiosityGap: 15,
    },
    scoreDetails: [
      {
        label: "hookDriven",
        score: 60,
        summary: "Hook summary",
        factors: ["Factor 1"],
      },
      {
        label: "identityBait",
        score: 20,
        summary: "Identity summary",
        factors: ["Factor 2"],
      },
      {
        label: "visualContrast",
        score: 30,
        summary: "Visual summary",
        factors: ["Factor 3"],
      },
      {
        label: "curiosityGap",
        score: 15,
        summary: "Curiosity summary",
        factors: ["Factor 4"],
      },
    ],
    engine: {
      mode: "local",
      provider: "deterministic-local-engine",
    },
  };
}

describe("AnalyzeForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockReset();
    vi.restoreAllMocks();
  });

  function fillRequiredFields() {
    fireEvent.change(
      screen.getByPlaceholderText("Paste transcript or notes here. Local transcription can be added later."),
      {
        target: { value: "POV: creator test transcript" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Fitness coaches"), {
      target: { value: "Creator education" },
    });
    fireEvent.change(screen.getByPlaceholderText("Beginner creators"), {
      target: { value: "Indie founders" },
    });
  }

  it("fills the example payload into the form", () => {
    render(<AnalyzeForm />);

    fireEvent.click(screen.getByRole("button", { name: "Use example" }));

    expect(screen.getByDisplayValue("Wellness creators")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Burned-out founders")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/POV: you're a wellness creator and nobody tells you this\./)
    ).toBeInTheDocument();
  });

  it("shows a validation error if submit is attempted without required content", async () => {
    const { container } = render(<AnalyzeForm />);

    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByText(/Transcript or notes are required\./)).toBeInTheDocument();
  });

  it("restores a saved draft from localStorage", () => {
    window.localStorage.setItem(
      "hookprint-analyze-draft",
      JSON.stringify({
        transcript: "Restored transcript",
        niche: "Restored niche",
        audience: "Restored audience",
      })
    );

    render(<AnalyzeForm />);

    expect(screen.getByText(/A saved analysis draft was restored from local storage\./)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Restored transcript")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Restored niche")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Restored audience")).toBeInTheDocument();
  });

  it("restores uploaded video draft metadata without reviving the transient preview URL", () => {
    window.localStorage.setItem(
      "hookprint-analyze-draft",
      JSON.stringify({
        transcript: "Restored transcript",
        niche: "Restored niche",
        audience: "Restored audience",
        video: {
          name: "restored-reel.mp4",
          size: 3145728,
          type: "video/mp4",
          durationSeconds: 8.2,
          previewUrl: "blob:old-preview-should-not-return",
        },
      })
    );

    const { container } = render(<AnalyzeForm />);

    expect(screen.getByText("restored-reel.mp4")).toBeInTheDocument();
    expect(screen.getByText("3.00 MB")).toBeInTheDocument();
    expect(screen.getByText("8.2s")).toBeInTheDocument();
    expect(container.querySelector('video[src="blob:old-preview-should-not-return"]')).toBeNull();
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("shows local video preview metadata after a file is selected", async () => {
    const createObjectUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:hookprint-preview");
    const originalCreateElement = document.createElement.bind(document);
    let metadataVideo: HTMLVideoElement | null = null;

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "video") {
        metadataVideo = element as HTMLVideoElement;
        Object.defineProperty(metadataVideo, "duration", {
          configurable: true,
          value: 12.4,
        });
      }
      return element;
    });

    const { container } = render(<AnalyzeForm />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();

    const file = new File(["video-bytes"], "creator-hook.mp4", { type: "video/mp4" });

    fireEvent.change(fileInput!, {
      target: {
        files: [file],
      },
    });

    const videoElement = metadataVideo as
      | (HTMLVideoElement & { onloadedmetadata: ((event: Event) => void) | null })
      | null;
    if (videoElement?.onloadedmetadata) {
      await act(async () => {
        videoElement.onloadedmetadata?.(new Event("loadedmetadata"));
      });
    }

    expect(createObjectUrl).toHaveBeenCalledWith(file);
    expect(await screen.findByText("creator-hook.mp4")).toBeInTheDocument();
    expect(screen.getByText("0.00 MB")).toBeInTheDocument();
    expect(screen.getByText("12.4s")).toBeInTheDocument();
    expect(container.querySelector('video[src="blob:hookprint-preview"]')).not.toBeNull();

    await waitFor(() => {
      const savedDraft = JSON.parse(window.localStorage.getItem("hookprint-analyze-draft") ?? "{}");
      expect(savedDraft.video).toMatchObject({
        name: "creator-hook.mp4",
        type: "video/mp4",
        durationSeconds: 12.4,
        previewUrl: null,
      });
    });
  });

  it("routes to the result page with replacement feedback when saveResult replaces an existing report", async () => {
    vi.spyOn(storage, "saveResult").mockReturnValue({
      replaced: true,
      replacedId: "older",
    });
    vi.spyOn(storage, "clearAnalyzeDraft").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => makeApiResult("fresh-result"),
      })
    );

    render(<AnalyzeForm />);

    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/result/fresh-result?replaced=1");
    });
  });

  it("shows the loading state while the analysis request is in flight", async () => {
    let resolveFetch: ((value: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined;
    vi.spyOn(storage, "saveResult").mockReturnValue({
      replaced: false,
      replacedId: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    render(<AnalyzeForm />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    expect(screen.getByRole("button", { name: "Analyzing reel..." })).toBeDisabled();

    resolveFetch?.({
      ok: true,
      json: async () => makeApiResult("result-loading"),
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/result/result-loading");
    });
  });

  it("shows the server error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Hosted provider rate-limited. Falling back is unavailable right now.",
        }),
      })
    );

    render(<AnalyzeForm />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    expect(
      await screen.findByText("Hosted provider rate-limited. Falling back is unavailable right now.")
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Analyze" })).toBeEnabled();
  });

  it("saves a successful analysis to localStorage, clears the draft, and exposes it on history", async () => {
    window.localStorage.setItem(
      "hookprint-analyze-draft",
      JSON.stringify({
        transcript: "Draft transcript",
        niche: "Draft niche",
        audience: "Draft audience",
      })
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => makeApiResult("persisted-result"),
      })
    );

    render(<AnalyzeForm />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/result/persisted-result");
    });

    expect(window.localStorage.getItem("hookprint-analyze-draft")).toBeNull();

    const savedHistory = JSON.parse(window.localStorage.getItem("hookprint-history") ?? "[]");
    expect(savedHistory).toHaveLength(1);
    expect(savedHistory[0].id).toBe("persisted-result");
    expect(savedHistory[0].promptPack.hookOptions).toHaveLength(3);

    render(<HistoryPage />);

    expect(await screen.findByText("Creator education")).toBeInTheDocument();
    expect(screen.getByText("Indie founders")).toBeInTheDocument();
  });
});
