import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the public entry copy and primary route links", () => {
    render(<HomePage />);

    expect(screen.getByText("Hookprint")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Decode viral reels into remixable creative DNA.",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start analyzing/i })).toHaveAttribute(
      "href",
      "/analyze"
    );
    expect(screen.getByRole("link", { name: "Open history" })).toHaveAttribute(
      "href",
      "/history"
    );
  });

  it("renders the three key feature cards", () => {
    render(<HomePage />);

    expect(screen.getByText("Deterministic local engine")).toBeInTheDocument();
    expect(screen.getByText("Creator-first outputs")).toBeInTheDocument();
    expect(screen.getByText("Visual result system")).toBeInTheDocument();
  });
});
