import { describe, expect, it } from "vitest";

import { normalizeAnalyzeInput, validateAnalyzeInput } from "@/lib/validation";

describe("validation", () => {
  it("normalizes string fields and strips unknown shapes", () => {
    const input = normalizeAnalyzeInput({
      transcript: "  hello world  ",
      niche: "  SaaS  ",
      audience: "  founders ",
      video: {
        name: " clip.mp4 ",
        type: " video/mp4 ",
        size: 42,
      },
    });

    expect(input.transcript).toBe("hello world");
    expect(input.niche).toBe("SaaS");
    expect(input.audience).toBe("founders");
    expect(input.video?.name).toBe("clip.mp4");
    expect(input.video?.type).toBe("video/mp4");
  });

  it("returns errors for missing required fields", () => {
    const result = validateAnalyzeInput({});

    expect(result.errors).toContain("Transcript or notes are required.");
    expect(result.errors).toContain("Niche is required.");
    expect(result.errors).toContain("Audience is required.");
  });

  it("rejects oversized fields", () => {
    const result = validateAnalyzeInput({
      transcript: "x".repeat(12001),
      niche: "niche",
      audience: "audience",
    });

    expect(result.errors).toContain("Transcript or notes must be 12000 characters or fewer.");
  });
});
