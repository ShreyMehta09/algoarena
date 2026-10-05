import dbConnect from "@/lib/mongodb";
import { Tournament, TournamentParticipant } from "@/lib/models";
import Link from "next/link";
import { Calendar, Clock, Trophy } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function TournamentsPage() {
  await dbConnect;
  const tournaments = await Tournament.find().sort({ startTime: 1 }).lean();
  
  const { userId } = await auth();
  
  // Find which ones the user joined if logged in
  let joinedIds = new Set<string>();
  if (userId) {
    const participants = await TournamentParticipant.find({ userId }).lean();
    participants.forEach((p: any) => joinedIds.add(p.tournamentId.toString()));
  }

  const upcoming: any[] = [];
  const ongoing: any[] = [];
  const past: any[] = [];
  
  const now = new Date();
  
  tournaments.forEach((t: any) => {
    const start = new Date(t.startTime);
    const end = new Date(t.endTime);
    if (now < start) upcoming.push(t);
    else if (now >= start && now <= end) ongoing.push(t);
    else past.push(t);
  });

  const renderTournamentCard = (t: any, status: "UPCOMING" | "ONGOING" | "PAST") => {
    const start = new Date(t.startTime);
    const hasJoined = joinedIds.has(t._id.toString());
    
    return (
      <Link href={`/tournaments/${t._id}`} key={t._id.toString()} className="block">
        <div className="glass p-6 rounded-2xl border border-white/[0.06] hover:border-brand-purple/30 transition-all hover:-translate-y-1 relative overflow-hidden group">
          {hasJoined && (
            <div className="absolute top-0 right-0 bg-brand-cyan text-dark-900 text-[10px] font-black px-3 py-1 rounded-bl-lg z-10">
              JOINED
            </div>
          )}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-brand-purple-light transition-colors">{t.title}</h3>
            <Trophy className={`w-6 h-6 ${status === 'ONGOING' ? 'text-brand-cyan' : 'text-slate-500'}`} />
          </div>
          <p className="text-sm text-slate-400 mb-6 line-clamp-2">{t.description}</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {start.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {start.toLocaleTimeString()}
            </div>
            <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.04]">
              {t.problems.length} Problems
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            AlgoArena <span className="text-brand-purple-light">Tournaments</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Compete against others in real-time problem sets. Tournaments feature dynamic point decay and global leaderboards.
          </p>
        </div>

        {ongoing.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-cyan flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-cyan animate-pulse" />
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {ongoing.map(t => renderTournamentCard(t, "ONGOING"))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Upcoming Tournaments</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcoming.map(t => renderTournamentCard(t, "UPCOMING"))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-500">Past Tournaments</h2>
            <div className="grid md:grid-cols-2 gap-6 opacity-75">
              {past.map(t => renderTournamentCard(t, "PAST"))}
            </div>
          </div>
        )}
        
        {tournaments.length === 0 && (
          <div className="text-center p-12 glass rounded-3xl border border-white/[0.06]">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-slate-400">Check back later for new competitive events!</p>
          </div>
        )}
      </div>
    </div>
  );
}
