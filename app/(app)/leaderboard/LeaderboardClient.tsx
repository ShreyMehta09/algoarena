"use client";

import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  Crown,
  Medal,
  Award,
  Flame,
  Search,
} from "lucide-react";
import { getRankFromRating, calculateWinRate, cn } from "@/lib/utils";

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: <Crown className="w-5 h-5 text-yellow-400" />,
  2: <Medal className="w-5 h-5 text-slate-400" />,
  3: <Award className="w-5 h-5 text-amber-600" />,
};

const FILTERS = ["Global", "This Week", "This Month"];

type LeaderboardUser = {
  rank: number;
  id: string;
  name: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  isCurrentUser: boolean;
};

export default function LeaderboardClient({ initialData }: { initialData: LeaderboardUser[] }) {
  const [activeFilter, setActiveFilter] = useState("Global");
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Top competitive coders by Elo rating
          </p>
        </div>
        <div className="flex gap-1 glass rounded-xl border border-white/[0.06] p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeFilter === f
                  ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4">
        {/* 2nd */}
        {top3[1] && (
          <div className="glass rounded-2xl border border-white/[0.06] p-5 text-center mt-6 order-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-xl font-black text-white mx-auto mb-3">
              {top3[1].name.charAt(0).toUpperCase()}
            </div>
            <div className="text-slate-300 font-bold text-sm truncate">{top3[1].name}</div>
            <div className="text-slate-500 text-xs mb-2">@{top3[1].username}</div>
            <div className="text-2xl font-black text-white">{top3[1].rating}</div>
            <div className="text-xs text-slate-500 mt-0.5">Elo</div>
            <div className="mt-3 w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/30 flex items-center justify-center mx-auto">
              <span className="text-slate-400 font-black text-sm">2</span>
            </div>
          </div>
        )}

        {/* 1st */}
        {top3[0] && (
          <div className="relative glass rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-center order-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 shadow-glow">
              {top3[0].name.charAt(0).toUpperCase()}
            </div>
            <div className="text-white font-bold truncate">{top3[0].name}</div>
            <div className="text-slate-500 text-xs mb-2">@{top3[0].username}</div>
            <div className="text-3xl font-black text-gradient">{top3[0].rating}</div>
            <div className="text-xs text-slate-500 mt-0.5">Elo</div>
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-yellow-400">
              <Flame className="w-3 h-3" />
              {top3[0].streak} win streak
            </div>
          </div>
        )}

        {/* 3rd */}
        {top3[2] && (
          <div className="glass rounded-2xl border border-white/[0.06] p-5 text-center mt-10 order-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl font-black text-white mx-auto mb-3">
              {top3[2].name.charAt(0).toUpperCase()}
            </div>
            <div className="text-slate-300 font-bold text-sm truncate">{top3[2].name}</div>
            <div className="text-slate-500 text-xs mb-2">@{top3[2].username}</div>
            <div className="text-2xl font-black text-white">{top3[2].rating}</div>
            <div className="text-xs text-slate-500 mt-0.5">Elo</div>
            <div className="mt-3 w-8 h-8 rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center mx-auto">
              <span className="text-amber-600 font-black text-sm">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 glass rounded-xl border border-white/[0.06] bg-transparent text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-cyan/30 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
        />
      </div>

      {/* Full table */}
      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.04] text-xs text-slate-500 font-medium uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2 text-right">Elo</div>
          <div className="col-span-2 text-right">W/L</div>
          <div className="col-span-2 text-right">Win Rate</div>
          <div className="col-span-1 text-right">Streak</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((player) => {
            const rankInfo = getRankFromRating(player.rating);
            const isCurrentUser = player.isCurrentUser;

            return (
              <div
                key={player.username}
                className={cn(
                  "grid grid-cols-12 items-center px-5 py-3.5 transition-colors",
                  isCurrentUser
                    ? "bg-brand-cyan/5 border-l-2 border-brand-cyan"
                    : "hover:bg-white/[0.02]"
                )}
              >
                {/* Rank */}
                <div className="col-span-1">
                  {RANK_ICONS[player.rank] || (
                    <span className="text-sm font-bold text-slate-500">
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Player */}
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0",
                      isCurrentUser
                        ? "bg-gradient-brand"
                        : "bg-dark-600 border border-white/[0.06]"
                    )}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className={cn(
                      "text-sm font-semibold truncate",
                      isCurrentUser ? "text-brand-cyan" : "text-slate-200"
                    )}>
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs text-brand-cyan/60">(you)</span>
                      )}
                    </div>
                    {rankInfo.rank !== "Unranked" ? (
                      <div className={cn("text-xs", rankInfo.class)}>
                        {rankInfo.rank}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">Unranked</div>
                    )}
                  </div>
                </div>

                {/* Elo */}
                <div className="col-span-2 text-right">
                  <span className="text-sm font-black text-white">{player.rating}</span>
                </div>

                {/* W/L */}
                <div className="col-span-2 text-right">
                  <span className="text-xs text-green-400">{player.wins}W</span>
                  <span className="text-xs text-slate-600 mx-1">/</span>
                  <span className="text-xs text-red-400">{player.losses}L</span>
                </div>

                {/* Win rate */}
                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: `${player.winRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {player.winRate}%
                    </span>
                  </div>
                </div>

                {/* Streak */}
                <div className="col-span-1 text-right">
                  {player.streak > 0 ? (
                    <div className="flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs font-bold text-orange-400">
                        {player.streak}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-700">–</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
