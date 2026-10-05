import dbConnect from "@/lib/mongodb";
import { Problem } from "@/lib/models";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TournamentForm from "./TournamentForm";

export default async function NewTournamentPage() {
  await dbConnect;
  // Fetch all problems so the admin can select them
  const problems = await Problem.find({}, "title difficulty").lean();
  
  // Serialize for client
  const serializedProblems = problems.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    difficulty: p.difficulty,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/tournaments" 
          className="p-2 rounded-lg glass border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black text-white">Create Tournament</h1>
      </div>
      
      <div className="glass rounded-2xl border border-white/[0.06] p-6">
        <TournamentForm problems={serializedProblems} />
      </div>
    </div>
  );
}
