import dbConnect from "@/lib/mongodb";
import { Tournament, TournamentParticipant, User } from "@/lib/models";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal } from "lucide-react";

export default async function TournamentLeaderboardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  await dbConnect;
  const tournament = await Tournament.findById(id).lean();
  if (!tournament) notFound();

  // Fetch all participants
  const participants = await TournamentParticipant.find({ tournamentId: id }).lean();
  
  // Sort: highest score first, then fewer penalties (attempts) win tiebreakers
  participants.sort((a: any, b: any) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return (a.totalPenalty || 0) - (b.totalPenalty || 0);
  });

  // Fetch users for these participants
  const userIds = participants.map((p: any) => p.userId);
  const users = await User.find({ clerkId: { $in: userIds } }, "clerkId username image rating").lean();
  const userMap = new Map(users.map((u: any) => [u.clerkId, u]));

  // Pre-serialize everything to plain objects
  const serializedParticipants = participants.map((p: any) => ({
    id: p._id.toString(),
    userId: p.userId,
    totalScore: p.totalScore || 0,
    totalPenalty: p.totalPenalty || 0,
  }));

  const serializedUserMap: Record<string, { username: string; image?: string; rating: number }> = {};
  for (const [key, val] of userMap.entries()) {
    serializedUserMap[key] = {
      username: (val as any).username,
      image: (val as any).image,
      rating: (val as any).rating,
    };
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href={`/tournaments/${id}`} 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tournament
        </Link>

        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-brand-purple mx-auto" />
          <h1 className="text-4xl font-black text-white">Leaderboard</h1>
          <p className="text-xl text-brand-cyan">{tournament.title}</p>
        </div>

        <div className="glass rounded-3xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-dark-800/50 border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16 text-center">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Player</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Penalties</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {serializedParticipants.map((p, idx) => {
                const u = serializedUserMap[p.userId];
                
                let rankVisual = <span className="font-bold text-slate-400">{idx + 1}</span>;
                if (idx === 0) rankVisual = <Medal className="w-6 h-6 text-yellow-400 mx-auto" />;
                else if (idx === 1) rankVisual = <Medal className="w-6 h-6 text-slate-300 mx-auto" />;
                else if (idx === 2) rankVisual = <Medal className="w-6 h-6 text-amber-600 mx-auto" />;

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-center">
                      {rankVisual}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u?.image ? (
                          <img src={u.image} alt={u.username} className="w-8 h-8 rounded-full border border-white/[0.06]" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                            {u?.username?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <span className="font-bold text-white text-lg">{u?.username || "Unknown Player"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-500">{p.totalPenalty}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-brand-cyan text-xl">{p.totalScore}</span>
                    </td>
                  </tr>
                );
              })}
              {serializedParticipants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No one has joined this tournament yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
