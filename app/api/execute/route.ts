import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Problem, Submission, Tournament, TournamentParticipant } from "@/lib/models";
import { judgeSubmission } from "@/lib/judge0";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, language, problemId, battleId, tournamentId, isRun } = body;

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

    const allTestCases = problem.testCases ?? [];
    const testCases = isRun ? allTestCases.filter(tc => !tc.isHidden) : allTestCases;

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

    // Store submission record only if it's a real submission
    if (!isRun) {
      await Submission.create({
        userId,
        problemId: problem._id,
        battleId: battleId ?? null,
        tournamentId: tournamentId ?? null,
        code,
        language,
        status: result.verdict,
        runtime: result.runtime,
        memory: result.memory,
        score: 0, // Battle socket handler sets actual Elo delta
      });

      // Tournament Logic
      if (tournamentId) {
        const t = await Tournament.findById(tournamentId);
        const p = await TournamentParticipant.findOne({ tournamentId, userId });
        
        if (t && p) {
          const now = new Date();
          const start = new Date(t.startTime);
          const end = new Date(t.endTime);
          
          if (now >= start && now <= end) {
            const probIdStr = problem._id.toString();
            const probSettings = t.problems.find((tp: any) => tp.problemId.toString() === probIdStr);
            
            if (probSettings) {
              const maxScore = probSettings.maxScore;
              let pScore = p.problemScores[probIdStr] || { score: 0, attempts: 0, solved: false };
              
              if (!pScore.solved) {
                if (result.verdict === "ACCEPTED") {
                  // Time decay: assume linear decay over tournament duration, min 30% of maxScore
                  const totalDuration = end.getTime() - start.getTime();
                  const elapsed = now.getTime() - start.getTime();
                  const fraction = Math.min(1, Math.max(0, elapsed / totalDuration));
                  // Decode: Score goes from 100% to 30% over time
                  let baseScore = maxScore * (1 - (fraction * 0.7));
                  
                  // Penalty per wrong attempt: 10% of max score per attempt
                  const penalty = pScore.attempts * (maxScore * 0.10);
                  let finalScore = Math.floor(Math.max(0, baseScore - penalty));
                  
                  pScore.solved = true;
                  pScore.score = finalScore;
                  pScore.solvedAt = now;
                  p.totalScore += finalScore;
                  
                  // Re-save
                  p.problemScores[probIdStr] = pScore;
                  p.markModified("problemScores");
                  await p.save();
                } else {
                  // Increment attempts if not compile error
                  if (result.verdict !== "COMPILATION_ERROR") {
                    pScore.attempts += 1;
                    p.problemScores[probIdStr] = pScore;
                    p.markModified("problemScores");
                    await p.save();
                  }
                }
              }
            }
          }
        }
      }
    }

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
        stdout: isRun ? r.stdout : null,
        stderr: isRun || r.verdict === "COMPILATION_ERROR" ? r.stderr : null,
        actualOutput: isRun ? r.actualOutput : null,
        expectedOutput: isRun ? r.expectedOutput : null,
      })),
    });
  } catch (err) {
    console.error("[Execute] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
