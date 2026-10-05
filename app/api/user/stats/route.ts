import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { User, Battle, Submission } from "@/lib/models";
import { getOrSyncUser } from "@/lib/sync-user";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect;

  try {
    const user = await getOrSyncUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch last 10 finished battles
    const battles = await Battle.find({
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: "FINISHED",
    })
      .sort({ endedAt: -1 })
      .limit(10)
      .populate("problemId", "title difficulty")
      .lean();

    // Fetch opponent profiles for each battle
    const opponentIds = battles.map((b) =>
      b.player1Id === userId ? b.player2Id : b.player1Id
    );
    const opponents = await User.find(
      { clerkId: { $in: opponentIds } },
      "clerkId username name rating"
    ).lean();
    const opponentMap = new Map(opponents.map((o) => [o.clerkId, o]));

    // Fetch user submissions for these battles
    const battleIds = battles.map((b) => b._id);
    const submissions = await Submission.find({
      userId,
      battleId: { $in: battleIds },
    })
      .sort({ createdAt: 1 })
      .lean();
    const subMap = new Map(submissions.map((s) => [s.battleId?.toString(), s]));

    const recentBattles = battles.map((b) => {
      const opponentClerkId =
        b.player1Id === userId ? b.player2Id : b.player1Id;
      const opponent = opponentMap.get(opponentClerkId);
      const result = b.winnerId === userId ? "WIN" : b.winnerId ? "LOSS" : "DRAW";
      const sub = subMap.get(b._id.toString());
      const problem = b.problemId as any;

      const startedAt = b.startedAt ? new Date(b.startedAt) : null;
      const endedAt = b.endedAt ? new Date(b.endedAt) : null;
      const durationMs =
        startedAt && endedAt ? endedAt.getTime() - startedAt.getTime() : null;
      const durationMin = durationMs ? Math.floor(durationMs / 60000) : 0;
      const durationSec = durationMs ? Math.floor((durationMs % 60000) / 1000) : 0;

      return {
        id: b._id.toString(),
        result,
        opponent: opponent
          ? {
              id: opponent._id.toString(),
              username: opponent.username,
              name: opponent.name,
              rating: opponent.rating,
            }
          : null,
        problem: {
          title: problem?.title ?? "Unknown",
          difficulty: problem?.difficulty ?? "EASY",
        },
        ratingChange: sub?.score ?? 0,
        runtime: sub?.runtime ?? null,
        duration: durationMs
          ? `${durationMin}:${String(durationSec).padStart(2, "0")}`
          : null,
        date: b.endedAt,
      };
    });

    // Rating history
    const allBattles = await Battle.find({
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: "FINISHED",
    })
      .sort({ endedAt: 1 })
      .lean();

    const allBattleIds = allBattles.map((b) => b._id);
    const allSubs = await Submission.find(
      { userId, battleId: { $in: allBattleIds } },
      "battleId score"
    ).lean();
    const allSubMap = new Map(allSubs.map((s) => [s.battleId?.toString(), s]));

    let runningRating = 1200;
    const ratingHistory: Array<{ date: string; rating: number }> = [];
    for (const b of allBattles) {
      const sub = allSubMap.get(b._id.toString());
      const delta = sub?.score ?? 0;
      runningRating += delta;
      if (b.endedAt) {
        ratingHistory.push({
          date: new Date(b.endedAt).toLocaleDateString("en-US", { month: "short" }),
          rating: runningRating,
        });
      }
    }

    // Deduplicate by month
    const monthMap = new Map<string, number>();
    for (const entry of ratingHistory) {
      monthMap.set(entry.date, entry.rating);
    }
    const ratingHistoryDeduped = Array.from(monthMap.entries()).map(([date, rating]) => ({
      date,
      rating,
    }));

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        clerkId: user.clerkId,
        name: user.name,
        username: user.username,
        email: user.email,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        image: user.image,
        createdAt: user.createdAt,
      },
      recentBattles,
      ratingHistory: ratingHistoryDeduped,
      stats: {
        winRate:
          user.wins + user.losses > 0
            ? Math.round((user.wins / (user.wins + user.losses)) * 100)
            : 0,
        totalBattles: user.wins + user.losses,
      },
    });
  } catch (err) {
    console.error("[User Stats] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
