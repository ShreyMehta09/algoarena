import dbConnect from "@/lib/mongodb";
import { Tournament } from "@/lib/models";
import Link from "next/link";
import { Plus, ArrowLeft, Calendar } from "lucide-react";

export default async function AdminTournamentsPage() {
  await dbConnect;
  const tournaments = await Tournament.find().sort({ startTime: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 rounded-lg glass border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-white">Manage Tournaments</h1>
        </div>
        <Link
          href="/admin/tournaments/new"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Tournament
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {tournaments.map((t: any) => {
            const now = new Date();
            const start = new Date(t.startTime);
            const end = new Date(t.endTime);
            let status = "UPCOMING";
            if (now >= start && now <= end) status = "ONGOING";
            if (now > end) status = "PAST";

            return (
              <div key={t._id.toString()} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {t.title}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      status === 'ONGOING' ? 'bg-brand-cyan/20 text-brand-cyan' :
                      status === 'PAST' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-brand-purple/20 text-brand-purple-light'
                    }`}>
                      {status}
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {start.toLocaleDateString()} {start.toLocaleTimeString()}
                    </span>
                    <span>•</span>
                    <span>{t.problems.length} Problems</span>
                  </div>
                </div>
              </div>
            );
          })}
          {tournaments.length === 0 && (
            <div className="p-8 text-center text-slate-500">No tournaments found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
