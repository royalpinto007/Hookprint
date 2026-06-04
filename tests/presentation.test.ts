import { describe, expect, it } from "vitest";

import { formatProviderName, formatScoreLabel, getTopSignal } from "@/lib/presentation";

describe("presentation helpers", () => {
  it("formats provider names into readable title case", () => {
    expect(formatProviderName("openrouter-free-model")).toBe("Openrouter Free Model");
    expect(formatProviderName("  hugging_face  ")).toBe("Hugging Face");
  });

  it("formats score labels from camelCase into readable labels", () => {
    expect(formatScoreLabel("hookDriven")).toBe("Hook Driven");
    expect(formatScoreLabel("identityBait")).toBe("Identity Bait");
    expect(formatScoreLabel("visualContrast")).toBe("Visual Contrast");
    expect(formatScoreLabel("curiosityGap")).toBe("Curiosity Gap");
  });

  it("returns the dominant score signal and value", () => {
    expect(
      getTopSignal({
        hookDriven: 48,
        identityBait: 22,
        visualContrast: 30,
        curiosityGap: 71,
      })
    ).toEqual(["curiosityGap", 71]);
  });

  it("keeps the earliest key when dominant scores are tied", () => {
    expect(
      getTopSignal({
        hookDriven: 60,
        identityBait: 60,
        visualContrast: 40,
        curiosityGap: 20,
      })
    ).toEqual(["hookDriven", 60]);
  });
});
