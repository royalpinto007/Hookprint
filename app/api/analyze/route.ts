import { NextResponse } from "next/server";

import { analyzeReel } from "@/lib/analyzeReel";
import { tryHostedProvider } from "@/lib/hostedAnalysis";
import { validateAnalyzeInput } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, errors } = validateAnalyzeInput(body);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors[0],
          issues: errors,
        },
        { status: 400 }
      );
    }

    let aiResult = null;
    try {
      aiResult = await tryHostedProvider(input);
    } catch {
      aiResult = null;
    }

    if (aiResult) {
      return NextResponse.json(aiResult);
    }

    return NextResponse.json(analyzeReel(input));
  } catch {
    return NextResponse.json({ error: "Unable to analyze this reel." }, { status: 400 });
  }
}
