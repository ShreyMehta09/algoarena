"use client";

import {
  TrendingUp,
  TrendingDown,
  Swords,
  Code2,
  Trophy,
  Zap,
  Target,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getRankFromRating,
  calculateWinRate,
  timeAgo,
  formatRating,
  cn,
} from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/badge";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "cyan",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: "cyan" | "purple" | "green" | "yellow";
}) {
  const colorMap = {
    cyan: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
    purple: "text-brand-purple-light bg-brand-purple/10 border-brand-purple/20",
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };
  return (
    <div className="glass rounded-2xl p-5 border border-white/[0.06] glass-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            colorMap[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/[0.06] text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="text-brand-cyan font-bold">{payload[0].value} Elo</p>
      </div>
    );
  }
  return null;
}

export default function DashboardClient({ user, recentBattles, difficultyBreakdown, ratingHistory }: any) {
  const rank = getRankFromRating(user.rating);
  const winRate = calculateWinRate(user.wins, user.losses);
  const totalSolved = difficultyBreakdown.reduce((acc: number, curr: any) => acc + curr.solved, 0);

  return (
    <div className="space-y-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back,{" "}
            <span className="text-gradient">{(user.name || user.username).split(" ")[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your competitive coding dashboard
          </p>
        </div>
        <Link
          href="/battle"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white"
        >
          <Swords className="w-4 h-4" />
          Find Battle
        </Link>
      </div>

      {/* Elo Hero Card */}
      <div className="relative glass rounded-2xl p-6 border border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-cyan/5" />
        <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            {rank.rank !== "Unranked" && (
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-xs font-bold uppercase tracking-wider", rank.class)}>
                  {rank.rank}
                </span>
                <span className="text-slate-600 text-xs">Rank</span>
              </div>
            )}
            <div className="text-6xl font-black text-white mb-2">
              {formatRating(user.rating)}
            </div>
            <div className="text-slate-400 text-sm">Elo Rating</div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-slate-500 text-sm">
                Play ranked battles to climb the leaderboard!
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
              Rating History (2026)
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={ratingHistory}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={["dataMin - 100", "dataMax + 100"]} hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  dot={{ fill: "#00D4FF", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#00D4FF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Wins"
          value={user.wins}
          sub={`${user.losses} losses`}
          icon={Trophy}
          color="cyan"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          sub="All-time"
          icon={Target}
          color="green"
        />
        <StatCard
          label="Battles Fought"
          value={user.wins + user.losses}
          sub="Total games"
          icon={Swords}
          color="purple"
        />
        <StatCard
          label="Current Streak"
          value="W0"
          sub="Last battles"
          icon={Zap}
          color="yellow"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Battles */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
            <h2 className="font-bold text-slate-200">Recent Battles</h2>
            <Link href="/battle" className="text-xs text-brand-cyan hover:text-brand-cyan/80 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentBattles.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No battles fought yet. Start one now!</div>
            ) : recentBattles.map((battle: any) => (
              <div key={battle.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    battle.result === "WIN"
                      ? "bg-green-400/10 text-green-400 border border-green-400/20"
                      : "bg-red-400/10 text-red-400 border border-red-400/20"
                  )}
                >
                  {battle.result === "WIN" ? "W" : "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      vs {battle.opponent.name}
                    </span>
                    <DifficultyBadge difficulty={battle.problem.difficulty} />
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {battle.problem.title} · {timeAgo(battle.date)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={cn(
                      "text-sm font-bold",
                      battle.ratingChange > 0 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {battle.ratingChange > 0 ? "+" : ""}
                    {battle.ratingChange}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {battle.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Problem breakdown */}
          <div className="glass rounded-2xl border border-white/[0.06] p-5">
            <h2 className="font-bold text-slate-200 mb-5">Problem Progress</h2>
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-32 h-32">
                <PieChart width={128} height={128}>
                  <Pie
                    data={difficultyBreakdown}
                    cx={60}
                    cy={60}
                    innerRadius={40}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="solved"
                    stroke="none"
                  >
                    {difficultyBreakdown.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-black text-white">{totalSolved}</span>
                  <span className="text-xs text-slate-500">solved</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {difficultyBreakdown.map((item: any) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{item.name}</span>
                      <span className="text-slate-500">{item.solved}/{item.total}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.solved / item.total) * 100}%`,
                          background: item.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-2xl border border-white/[0.06] p-5">
            <h2 className="font-bold text-slate-200 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/battle"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Swords className="w-4 h-4" />
                Find 1v1 Match
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
              <Link
                href="/problems"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl btn-ghost text-sm"
              >
                <Code2 className="w-4 h-4" />
                Practice Solo
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl btn-ghost text-sm"
              >
                <Trophy className="w-4 h-4" />
                View Leaderboard
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
