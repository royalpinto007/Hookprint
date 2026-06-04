import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

import AnalyzePage from "@/app/analyze/page";

describe("AnalyzePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockReset();
  });

  it("renders the analyzer route shell through AnalyzeForm", () => {
    render(<AnalyzePage />);

    expect(screen.getByText("Hookprint Analyzer")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upload a reel or paste the notes" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Paste transcript or notes here. Local transcription can be added later.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze" })).toBeInTheDocument();
  });
});
