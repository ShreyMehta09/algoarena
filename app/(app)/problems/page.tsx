"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  Code2,
} from "lucide-react";
import { MOCK_PROBLEMS } from "@/lib/mock-data";
import { DifficultyBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TAGS = [
  "All",
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Stack",
  "Binary Search",
  "Sliding Window",
  "BFS",
  "Sorting",
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = useMemo(() => {
    return MOCK_PROBLEMS.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchDiff =
        difficulty === "All" ||
        p.difficulty.toUpperCase() === difficulty.toUpperCase();
      const matchTag =
        activeTag === "All" || p.tags.includes(activeTag);
      return matchSearch && matchDiff && matchTag;
    });
  }, [search, difficulty, activeTag]);

  const counts = {
    easy: MOCK_PROBLEMS.filter((p) => p.difficulty === "EASY").length,
    medium: MOCK_PROBLEMS.filter((p) => p.difficulty === "MEDIUM").length,
    hard: MOCK_PROBLEMS.filter((p) => p.difficulty === "HARD").length,
    solved: MOCK_PROBLEMS.filter((p) => p.status === "ACCEPTED").length,
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Problem Set</h1>
        <p className="text-slate-500 text-sm mt-1">
          {MOCK_PROBLEMS.length} problems · {counts.solved} solved
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Easy", count: counts.easy, color: "text-green-400" },
          { label: "Medium", count: counts.medium, color: "text-yellow-400" },
          { label: "Hard", count: counts.hard, color: "text-red-400" },
          { label: "Solved", count: counts.solved, color: "text-brand-cyan" },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className={cn("text-xl font-black", item.color)}>{item.count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 glass rounded-xl border border-white/[0.06] bg-transparent text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-cyan/30 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
          />
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1 glass rounded-xl border border-white/[0.06] p-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                difficulty === d
                  ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Tag chips */}
      <div className="flex gap-2 flex-wrap">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              activeTag === tag
                ? "bg-brand-purple/15 text-brand-purple-light border-brand-purple/30"
                : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/10"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.04] text-xs text-slate-500 font-medium uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Tags</div>
          <div className="col-span-1 text-right">Acc.</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Code2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No problems match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((problem, i) => (
              <div
                key={problem.id}
                className="grid grid-cols-12 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="col-span-1">
                  {problem.status === "ACCEPTED" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : problem.status === "ATTEMPTED" ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-700" />
                  )}
                </div>
                <div className="col-span-5">
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="text-sm font-medium text-slate-200 hover:text-brand-cyan transition-colors group-hover:text-brand-cyan/90"
                  >
                    {problem.title}
                  </Link>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {problem.solvedCount.toLocaleString()} solved
                  </div>
                </div>
                <div className="col-span-2">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                <div className="col-span-2 flex gap-1 flex-wrap">
                  {problem.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 rounded bg-dark-700/60 text-slate-500 border border-white/[0.04]"
                    >
                      {tag}
                    </span>
                  ))}
                  {problem.tags.length > 2 && (
                    <span className="text-xs text-slate-600">
                      +{problem.tags.length - 2}
                    </span>
                  )}
                </div>
                <div className="col-span-1 text-right">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      problem.acceptanceRate >= 70
                        ? "text-green-400"
                        : problem.acceptanceRate >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    )}
                  >
                    {problem.acceptanceRate}%
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 text-center">
        Showing {filtered.length} of {MOCK_PROBLEMS.length} problems
      </p>
    </div>
  );
}
