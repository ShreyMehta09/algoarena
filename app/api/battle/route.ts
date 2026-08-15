import { NextRequest, NextResponse } from "next/server";

// Battle matchmaking API scaffold
// In production: uses Redis queue + Socket.IO for real-time matching

const activeBattles = new Map<string, {
  id: string;
  player1: string;
  player2: string;
  problemId: string;
  status: string;
  startedAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ratingRange = 100, difficulty = "Any" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Simulate matchmaking — in production this would:
    // 1. Add user to Redis sorted set (by rating)
    // 2. Check for opponents within ratingRange
    // 3. If found: create battle, emit via Socket.IO
    // 4. If not: keep polling

    const battleId = `battle-${Date.now()}`;
    const mockBattle = {
      id: battleId,
      player1: userId,
      player2: "opponent-mock",
      problemId: "prob-2",
      status: "ACTIVE",
      startedAt: new Date(),
    };

    activeBattles.set(battleId, mockBattle);

    return NextResponse.json({
      success: true,
      battle: mockBattle,
      redirectTo: `/battle/${battleId}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Matchmaking failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const battleId = searchParams.get("id");

  if (!battleId) {
    return NextResponse.json({ error: "Battle ID required" }, { status: 400 });
  }

  const battle = activeBattles.get(battleId);
  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  return NextResponse.json({ battle });
}
