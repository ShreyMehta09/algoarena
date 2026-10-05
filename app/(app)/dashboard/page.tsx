import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MOCK_RATING_HISTORY } from "@/lib/mock-data";
import dbConnect from "@/lib/mongodb";
import { User, Battle, Problem, Submission } from "@/lib/models";
import { getOrSyncUser } from "@/lib/sync-user";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await dbConnect;

  const user = await getOrSyncUser(userId);

  if (!user) {
    // User could not be created/synced
    redirect("/sign-in");
  }

  // Get recent battles
  const recentBattlesRaw = await Battle.find({
    $or: [{ player1Id: userId }, { player2Id: userId }],
    status: "FINISHED",
  })
    .sort({ endedAt: -1 })
    .limit(5)
    .populate("problemId", "title difficulty")
    .lean();

  // Get opponent profiles
  const opponentIds = recentBattlesRaw.map((b) =>
    b.player1Id === userId ? b.player2Id : b.player1Id
  );
  const opponents = await User.find(
    { clerkId: { $in: opponentIds } },
    "clerkId username name rating"
  ).lean();
  const opponentMap = new Map(opponents.map((o) => [o.clerkId, o]));

  const recentBattles = recentBattlesRaw.map((b) => {
    const isPlayer1 = b.player1Id === userId;
    const opponentClerkId = isPlayer1 ? b.player2Id : b.player1Id;
    const opponent = opponentMap.get(opponentClerkId);
    const result = b.winnerId === userId ? "WIN" : b.winnerId ? "LOSS" : "DRAW";
    const problem = b.problemId as any;

    let duration = "0:00";
    if (b.startedAt && b.endedAt) {
      const diffMs = new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime();
      const m = Math.floor(diffMs / 60000);
      const s = Math.floor((diffMs % 60000) / 1000);
      duration = `${m}:${s.toString().padStart(2, "0")}`;
    }

    return {
      id: b._id.toString(),
      opponent: {
        name: opponent?.name || opponent?.username || "Unknown",
        username: opponent?.username || "unknown",
        rating: opponent?.rating ?? 1200,
      },
      problem: {
        title: problem?.title ?? "Unknown Problem",
        difficulty: problem?.difficulty ?? "EASY",
      },
      result,
      duration,
      ratingChange: result === "WIN" ? 15 : -15,
      date: b.endedAt || b.createdAt,
    };
  });

  // Calculate difficulty breakdown
  const [totalEasy, totalMedium, totalHard] = await Promise.all([
    Problem.countDocuments({ difficulty: "EASY" }),
    Problem.countDocuments({ difficulty: "MEDIUM" }),
    Problem.countDocuments({ difficulty: "HARD" }),
  ]);

  // Solved problems by difficulty
  const solvedAgg = await Submission.aggregate([
    { $match: { userId, status: "ACCEPTED" } },
    { $group: { _id: "$problemId" } },
    {
      $lookup: {
        from: "problems",
        localField: "_id",
        foreignField: "_id",
        as: "problem",
      },
    },
    { $unwind: "$problem" },
    { $group: { _id: "$problem.difficulty", count: { $sum: 1 } } },
  ]);

  const solvedMap = new Map(solvedAgg.map((a) => [a._id, a.count]));

  const difficultyBreakdown = [
    { name: "Easy", solved: solvedMap.get("EASY") ?? 0, total: totalEasy || 1, color: "#4ade80" },
    { name: "Medium", solved: solvedMap.get("MEDIUM") ?? 0, total: totalMedium || 1, color: "#fbbf24" },
    { name: "Hard", solved: solvedMap.get("HARD") ?? 0, total: totalHard || 1, color: "#f87171" },
  ];

  return (
    <DashboardClient
      user={{
        name: user.name,
        username: user.username,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
      }}
      recentBattles={recentBattles}
      difficultyBreakdown={difficultyBreakdown}
      ratingHistory={MOCK_RATING_HISTORY}
    />
  );
}
