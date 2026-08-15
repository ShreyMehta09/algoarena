import { NextRequest, NextResponse } from "next/server";

// Simulated code execution endpoint
// In production this would call Judge0 API or a custom Docker runner

const SIMULATED_RESULTS: Record<string, { status: string; runtime: number; memory: number }> = {
  correct: { status: "ACCEPTED", runtime: 52, memory: 14200 },
  wrong: { status: "WRONG_ANSWER", runtime: 0, memory: 0 },
  tle: { status: "TIME_LIMIT_EXCEEDED", runtime: 2001, memory: 0 },
  re: { status: "RUNTIME_ERROR", runtime: 0, memory: 0 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, problemId, mode } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Simulate execution delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    // Simple heuristic: if code is longer than 50 chars and not empty, pass it
    const isLikelyCorrect =
      code.length > 50 &&
      !code.includes("pass") &&
      !code.includes("return 0") &&
      !code.includes("TODO");

    const result = isLikelyCorrect
      ? SIMULATED_RESULTS.correct
      : SIMULATED_RESULTS.wrong;

    return NextResponse.json({
      status: result.status,
      runtime: result.runtime,
      memory: result.memory,
      testsPassed: isLikelyCorrect ? 10 : Math.floor(Math.random() * 7),
      totalTests: 10,
      message:
        result.status === "ACCEPTED"
          ? "All test cases passed!"
          : "Some test cases failed.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
