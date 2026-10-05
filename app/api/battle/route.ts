import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Battle, User, Submission } from "@/lib/models";

// GET /api/battle?id=xxx  — get battle state
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const battleId = searchParams.get("id");

  if (!battleId) {
    return NextResponse.json({ error: "Battle ID required" }, { status: 400 });
  }

  await dbConnect;

  const battle = await Battle.findById(battleId).populate("problemId").lean();

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  // Security: only participants can view battle details
  const isParticipant =
    battle.player1Id === userId || battle.player2Id === userId;

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch player profiles
  const [p1, p2] = await Promise.all([
    User.findOne({ clerkId: battle.player1Id }, "clerkId username name rating image").lean(),
    User.findOne({ clerkId: battle.player2Id }, "clerkId username name rating image").lean(),
  ]);

  const problem = battle.problemId as any;

  return NextResponse.json({
    battle: {
      ...battle,
      _id: battle._id.toString(),
      problemId: problem._id.toString(),
      player1: p1,
      player2: p2,
      problem: {
        id: problem._id.toString(),
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        tags: problem.tags,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
      },
      timeRemaining: battle.startedAt
        ? Math.max(
            0,
            20 * 60 - Math.floor((Date.now() - new Date(battle.startedAt).getTime()) / 1000)
          )
        : 20 * 60,
    },
  });
}

// DELETE /api/battle — leave matchmaking queue (fallback; handled by socket)
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
