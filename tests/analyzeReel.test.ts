import { describe, expect, it } from "vitest";

import { analyzeReel } from "@/lib/analyzeReel";

describe("analyzeReel", () => {
  it("detects known hook and contrast patterns", () => {
    const result = analyzeReel({
      transcript:
        "POV: you're a finance creator. I tried this before and after format. Wait until the last chart.",
      niche: "Finance",
      audience: "Beginner investors",
      caption: "Nobody tells you this",
      visualNotes: "before and after cuts, chart overlays",
      audioNotes: "fast voiceover with beat drop",
      remixGoal: "more saves",
      video: null,
    });

    expect(result.hookFormula).toContain("POV identity hook");
    expect(result.hookFormula).toContain("Before/after transformation");
    expect(result.hookFormula).toContain("Delayed payoff curiosity");
    expect(result.remixIdeas).toHaveLength(10);
    expect(result.captionVariants).toHaveLength(5);
    expect(result.ctaVariants).toHaveLength(5);
  });

  it("splits scene structure using transcript markers", () => {
    const result = analyzeReel({
      transcript:
        "Scene 1: Hook the viewer. Then explain the mistake. Finally reveal the fix.",
      niche: "Design",
      audience: "Freelancers",
      caption: "",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "",
      video: null,
    });

    expect(result.sceneStructure.length).toBeGreaterThan(1);
    expect(result.whyItWorked.some((item) => item.includes("scene marker"))).toBe(true);
  });

  it("penalizes overlong transcript pacing while using caption density for curiosity cues", () => {
    const result = analyzeReel({
      transcript: `POV: you're a creator ${"word ".repeat(180)}`.trim(),
      niche: "Creator education",
      audience: "Operators",
      caption: "Save this now\n#creators #growth 🚀",
      visualNotes: "",
      audioNotes: "pause before reveal",
      remixGoal: "more shares",
      video: null,
    });

    expect(result.scores.hookDriven).toBeLessThan(60);
    expect(result.scores.curiosityGap).toBeGreaterThan(10);
    expect(
      result.scoreDetails
        .find((detail) => detail.label === "hookDriven")
        ?.factors.some((factor) => factor.includes("pacing penalty"))
    ).toBe(true);
  });

  it("splits sparse transcripts on inline pivots when line breaks are missing", () => {
    const result = analyzeReel({
      transcript:
        "Hook the viewer fast then explain the mistake because the audience needs context finally reveal the fix and ask them to save it.",
      niche: "Marketing",
      audience: "Consultants",
      caption: "",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "",
      video: null,
    });

    expect(result.sceneStructure.length).toBeGreaterThan(1);
  });

  it("classifies caption style from line breaks, emojis, hashtags, and proof cues", () => {
    const result = analyzeReel({
      transcript: "I tried a cleaner reel structure and the retention jumped.",
      niche: "SaaS marketing",
      audience: "Solo operators",
      caption: "3 fixes I wish I knew earlier\nClient results went up 42%\nSave this for later 🚀🔥 #saas #growth",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "more saves",
      video: null,
    });

    expect(result.captionStyle.tone).toBe("Conversational with creator authority");
    expect(result.captionStyle.structure).toBe("Stacked short lines with scan-friendly spacing");
    expect(result.captionStyle.emojiDensity).toBe("Light-to-medium emoji use");
    expect(result.captionStyle.proofStyle).toBe("Strong performance proof and receipts");
  });

  it("detects educational captions separately from confessional captions", () => {
    const result = analyzeReel({
      transcript: "Here is the hook formula.",
      niche: "Creator education",
      audience: "Freelancers",
      caption: "How to structure a better reel in 3 steps",
      visualNotes: "",
      audioNotes: "",
      remixGoal: "",
      video: null,
    });

    expect(result.captionStyle.tone).toBe("Educational and tactical");
    expect(result.captionStyle.proofStyle).toBe("Opinion plus pattern recognition");
  });
});
