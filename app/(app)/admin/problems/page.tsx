import dbConnect from "@/lib/mongodb";
import { Problem } from "@/lib/models";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/badge";

export default async function AdminProblemsPage() {
  await dbConnect;
  const problems = await Problem.find({}, "title slug difficulty createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Manage Problems</h1>
        <Link
          href="/admin/problems/new"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Problem
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {problems.map((problem) => (
            <div
              key={problem._id.toString()}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <h3 className="font-bold text-white text-lg">{problem.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  <span className="text-xs text-slate-500">{problem.slug}</span>
                </div>
              </div>
              <Link
                href={`/admin/problems/${problem._id}/edit`}
                className="p-2 glass rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          ))}
          {problems.length === 0 && (
            <div className="p-8 text-center text-slate-500">No problems found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
