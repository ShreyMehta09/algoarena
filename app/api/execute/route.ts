import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Problem, Submission } from "@/lib/models";
import { judgeSubmission } from "@/lib/judge0";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, language, problemId, battleId } = body;

    if (!code || !language || !problemId) {
      return NextResponse.json(
        { error: "code, language, and problemId are required" },
        { status: 400 }
      );
    }

    await dbConnect;

    // Fetch problem and test cases from DB
    const problem = await Problem.findById(problemId, "testCases timeLimit memoryLimit").lean();

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const testCases = problem.testCases ?? [];

    if (testCases.length === 0) {
      return NextResponse.json({ error: "No test cases available" }, { status: 500 });
    }

    // Run through Judge0
    const result = await judgeSubmission(
      code,
      language,
      testCases.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      problem.timeLimit / 1000, // convert ms → seconds for Judge0
      problem.memoryLimit * 1024 // convert MB → KB for Judge0
    );

    // Store submission record
    await Submission.create({
      userId,
      problemId: problem._id,
      battleId: battleId ?? null,
      code,
      language,
      status: result.verdict,
      runtime: result.runtime,
      memory: result.memory,
      score: 0, // Battle socket handler sets actual Elo delta
    });

    return NextResponse.json({
      verdict: result.verdict,
      testsPassed: result.testsPassed,
      totalTests: result.totalTests,
      runtime: result.runtime,
      memory: result.memory,
      message: result.message,
      results: result.results.map((r) => ({
        passed: r.passed,
        verdict: r.verdict,
        runtime: r.runtime,
        // Don't expose exact test inputs/expected outputs to client
      })),
    });
  } catch (err) {
    console.error("[Execute] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
