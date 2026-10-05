import { auth } from "@clerk/nextjs/server";
import LeaderboardClient from "./LeaderboardClient";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  const { userId } = await auth();

  await dbConnect;

  // Fetch top 100 users ordered by rating descending
  const users = await User.find(
    {},
    "clerkId name username rating wins losses"
  )
    .sort({ rating: -1 })
    .limit(100)
    .lean();

  // Calculate ranks and extra fields
  const leaderboardData = users.map((user, index) => {
    const total = user.wins + user.losses;
    const winRate = total === 0 ? 0 : Math.round((user.wins / total) * 100);

    return {
      rank: index + 1,
      id: user._id.toString(),
      clerkId: user.clerkId,
      name: user.name || user.username,
      username: user.username,
      rating: user.rating,
      wins: user.wins,
      losses: user.losses,
      winRate,
      streak: 0, // Not implemented yet
      isCurrentUser: userId ? user.clerkId === userId : false,
    };
  });

  return <LeaderboardClient initialData={leaderboardData} />;
}
