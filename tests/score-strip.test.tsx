import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreStrip } from "@/components/result/score-strip";

const scores = {
  hookDriven: 60,
  identityBait: 30,
  visualContrast: 25,
  curiosityGap: 20,
} as const;

describe("ScoreStrip", () => {
  it("renders all score labels and values", () => {
    render(<ScoreStrip scores={scores} />);

    expect(screen.getByText("Hook Driven 60%")).toBeInTheDocument();
    expect(screen.getByText("Identity Bait 30%")).toBeInTheDocument();
    expect(screen.getByText("Visual Contrast 25%")).toBeInTheDocument();
    expect(screen.getByText("Curiosity Gap 20%")).toBeInTheDocument();
  });

  it("uses bordered chips in full mode", () => {
    render(<ScoreStrip scores={scores} />);

    expect(screen.getByText("Hook Driven 60%")).toHaveClass("border");
  });

  it("uses lighter chips in share mode", () => {
    render(<ScoreStrip scores={scores} variant="share" />);

    expect(screen.getByText("Hook Driven 60%")).not.toHaveClass("border");
    expect(screen.getByText("Hook Driven 60%")).toHaveClass("bg-white/80");
  });
});
