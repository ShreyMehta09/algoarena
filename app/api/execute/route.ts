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
        battleId: battleId || undefined,
        tournamentId: tournamentId || undefined,
        code,
        language,
        status: result.verdict,
        runtime: result.runtime,
        memory: result.memory,
        score: 0,
      });

      // ── Tournament Scoring ──────────────────────────────────────────
      if (tournamentId) {
        try {
          const tournament = await Tournament.findById(tournamentId);
          if (!tournament) {
            console.warn("[Tournament] Tournament not found:", tournamentId);
          } else {
            const participant = await TournamentParticipant.findOne({ tournamentId, userId });
            if (!participant) {
              console.warn("[Tournament] Participant not found for user:", userId);
            } else {
              const now = new Date();
              const start = new Date(tournament.startTime);
              const end = new Date(tournament.endTime);

              // Only score if tournament is currently ongoing
              if (now >= start && now <= end) {
                const probIdStr = problem._id.toString();
                const probConfig = tournament.problems.find(
                  (tp: any) => tp.problemId.toString() === probIdStr
                );

                if (probConfig) {
                  const maxScore = probConfig.maxScore;
                  // Safely get existing score data or create defaults
                  const existingScores = participant.problemScores || {};
                  const pScore = existingScores[probIdStr]
                    ? { ...existingScores[probIdStr] }
                    : { score: 0, attempts: 0, solved: false, solvedAt: undefined };

                  if (!pScore.solved) {
                    if (result.verdict === "ACCEPTED") {
                      // Time decay: linear from 100% → 30% over tournament duration
                      const totalDuration = end.getTime() - start.getTime();
                      const elapsed = now.getTime() - start.getTime();
                      const timeFraction = Math.min(1, Math.max(0, elapsed / totalDuration));
                      const baseScore = maxScore * (1 - timeFraction * 0.7);

                      // Penalty: 10% of maxScore per wrong attempt
                      const penalty = pScore.attempts * (maxScore * 0.10);
                      const finalScore = Math.max(
                        Math.floor(maxScore * 0.1), // minimum 10% of max
                        Math.floor(baseScore - penalty)
                      );

                      pScore.solved = true;
                      pScore.score = finalScore;
                      pScore.solvedAt = now;

                      // Recalculate totalScore from scratch to avoid accumulation bugs
                      existingScores[probIdStr] = pScore;
                      let newTotal = 0;
                      for (const key of Object.keys(existingScores)) {
                        if (existingScores[key]?.solved) {
                          newTotal += existingScores[key].score || 0;
                        }
                      }

                      participant.problemScores = existingScores;
                      participant.totalScore = newTotal;
                      participant.markModified("problemScores");
                      await participant.save();
                    } else if (result.verdict !== "COMPILATION_ERROR") {
                      // Increment attempts for wrong answers (not compile errors)
                      pScore.attempts = (pScore.attempts || 0) + 1;
                      existingScores[probIdStr] = pScore;
                      participant.problemScores = existingScores;
                      participant.totalPenalty += 1;
                      participant.markModified("problemScores");
                      await participant.save();
                    }
                  }
                }
              }
            }
          }
        } catch (tournamentErr) {
          console.error("[Tournament Scoring] Error:", tournamentErr);
          // Don't fail the entire request if tournament scoring fails
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
