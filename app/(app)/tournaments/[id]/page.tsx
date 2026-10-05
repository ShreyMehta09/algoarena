import dbConnect from "@/lib/mongodb";
import { Tournament, TournamentParticipant, Problem } from "@/lib/models";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle, Play } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function TournamentDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  await dbConnect;
  const tournament = await Tournament.findById(id).lean();
  if (!tournament) redirect("/tournaments");

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const participant = await TournamentParticipant.findOne({ tournamentId: id, userId }).lean();
  const hasJoined = !!participant;

  const now = new Date();
  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);
  
  let status = "UPCOMING";
  if (now >= start && now <= end) status = "ONGOING";
  else if (now > end) status = "PAST";

  // Fetch populated problems if joined and (ongoing or past)
  let problemsData: any[] = [];
  if (hasJoined && status !== "UPCOMING") {
    // Collect problem IDs
    const problemIds = tournament.problems.map((p: any) => p.problemId);
    const dbProblems = await Problem.find({ _id: { $in: problemIds } }, "title difficulty slug").lean();
    
    // Merge with maxScore from tournament
    problemsData = tournament.problems.map((p: any) => {
      const dbP = dbProblems.find((dp: any) => dp._id.toString() === p.problemId.toString());
      return {
        ...dbP,
        maxScore: p.maxScore,
        scoreData: participant?.problemScores?.[p.problemId.toString()] || { score: 0, attempts: 0, solved: false }
      };
    });
  }

  async function joinTournament() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    await dbConnect;
    try {
      await TournamentParticipant.create({
        tournamentId: id,
        userId,
        totalScore: 0,
        totalPenalty: 0,
        problemScores: {}
      });
      revalidatePath(`/tournaments/${id}`);
    } catch (e) {
      // maybe already joined
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link 
          href="/tournaments" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tournaments
        </Link>
        
        <div className="glass p-8 rounded-3xl border border-white/[0.06] relative overflow-hidden">
          {status === 'ONGOING' && (
            <div className="absolute top-0 right-0 bg-brand-cyan text-dark-900 text-xs font-black px-4 py-2 rounded-bl-xl shadow-[0_0_20px_rgba(45,212,191,0.5)]">
              LIVE NOW
            </div>
          )}
          {status === 'PAST' && (
            <div className="absolute top-0 right-0 bg-slate-500/20 text-slate-400 text-xs font-black px-4 py-2 rounded-bl-xl border-b border-l border-white/[0.06]">
              ENDED
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{tournament.title}</h1>
          <p className="text-slate-400 text-lg mb-8">{tournament.description}</p>
          
          <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-dark-900/50 border border-white/[0.04] mb-8">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Start Time</p>
              <p className="text-white font-bold">{start.toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06] hidden md:block" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">End Time</p>
              <p className="text-white font-bold">{end.toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06] hidden md:block" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Problems</p>
              <p className="text-white font-bold">{tournament.problems.length}</p>
            </div>
          </div>
          
          {!hasJoined && status !== 'PAST' ? (
            <form action={joinTournament}>
              <button type="submit" className="w-full md:w-auto btn-primary px-8 py-3 rounded-xl font-bold text-lg shadow-glow">
                Join Tournament
              </button>
            </form>
          ) : !hasJoined && status === 'PAST' ? (
            <div className="text-slate-400 italic">This tournament has ended. You did not participate.</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-bold text-sm flex items-center gap-2">
                You have joined this tournament!
              </div>
              <Link 
                href={`/tournaments/${id}/leaderboard`} 
                className="px-4 py-2 glass rounded-lg text-sm font-bold text-white hover:bg-white/[0.04] transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          )}
        </div>

        {/* Problem List */}
        {hasJoined && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Problems</h2>
            
            {status === "UPCOMING" ? (
              <div className="p-8 text-center glass rounded-2xl border border-white/[0.06]">
                <Clock className="w-12 h-12 text-brand-purple mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">Problems Locked</h3>
                <p className="text-slate-400">The problems will be revealed when the tournament starts.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {problemsData.map((p, idx) => (
                  <Link 
                    href={`/tournaments/${id}/problem/${p.slug}`} 
                    key={p._id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 glass rounded-2xl border border-white/[0.06] hover:border-brand-cyan/30 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-brand-purple-light font-black text-lg">{(idx + 1).toString().padStart(2, '0')}</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors">{p.title}</h3>
                        {p.scoreData.solved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400">SOLVED</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 ml-9">
                        <span>Max Points: {p.maxScore}</span>
                        {p.scoreData.attempts > 0 && <span>Attempts: {p.scoreData.attempts}</span>}
                        {p.scoreData.solved && <span className="text-green-400 font-bold">Earned: {p.scoreData.score} pts</span>}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center justify-end md:ml-9">
                      <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center group-hover:bg-brand-cyan group-hover:text-dark-900 transition-colors">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
