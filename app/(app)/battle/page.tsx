"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Swords,
  Zap,
  X,
  Shield,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_USER, MOCK_PROBLEMS } from "@/lib/mock-data";
import { getRankFromRating, cn } from "@/lib/utils";

const RANK_RANGES = [
  { label: "±50", range: 50 },
  { label: "±100", range: 100 },
  { label: "±200", range: 200 },
  { label: "Any", range: 9999 },
];

const DIFFICULTIES = ["Any", "Easy", "Medium", "Hard"] as const;

export default function BattlePage() {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ratingRange, setRatingRange] = useState(100);
  const [difficulty, setDifficulty] = useState<string>("Any");
  const [dots, setDots] = useState(1);

  const rank = getRankFromRating(MOCK_USER.rating);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searching) {
      timer = setInterval(() => {
        setElapsed((e) => e + 1);
        setDots((d) => (d % 3) + 1);
      }, 1000);

      // Simulate match found after 5-8 seconds
      const matchTimer = setTimeout(
        () => {
          router.push("/battle/live-demo");
        },
        5000 + Math.random() * 3000
      );

      return () => {
        clearInterval(timer);
        clearTimeout(matchTimer);
      };
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [searching, router]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0
      ? `${m}:${String(sec).padStart(2, "0")}`
      : `${sec}s`;
  };

  const ONLINE_COUNT = 847 + Math.floor(Math.random() * 20);

  return (
    <div className="page-transition min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">
            <span className="text-gradient">1v1</span> Battle Arena
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping-slow" />
            {ONLINE_COUNT} coders online
          </div>
        </div>

        {/* Player card */}
        <div className="glass rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-black text-white shadow-glow-purple">
                {MOCK_USER.name.charAt(0)}
              </div>
              <div>
                <div className="text-base font-bold text-white">{MOCK_USER.name}</div>
                <div className="text-sm text-slate-500">@{MOCK_USER.username}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">{MOCK_USER.rating}</div>
              <div className={cn("text-sm font-semibold", rank.class)}>{rank.rank}</div>
            </div>
          </div>
        </div>

        {!searching ? (
          <>
            {/* Match settings */}
            <div className="glass rounded-2xl border border-white/[0.06] p-6 space-y-5">
              <h2 className="font-bold text-slate-200 text-sm">Match Settings</h2>

              {/* Rating range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400 font-medium">Rating Range</label>
                  <span className="text-xs text-brand-cyan">
                    {MOCK_USER.rating - ratingRange} – {MOCK_USER.rating + ratingRange}
                  </span>
                </div>
                <div className="flex gap-2">
                  {RANK_RANGES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setRatingRange(r.range)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                        ratingRange === r.range
                          ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
                          : "border-white/[0.06] text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400 font-medium">Problem Difficulty</label>
                </div>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                        difficulty === d
                          ? d === "Easy"
                            ? "bg-green-400/10 text-green-400 border-green-400/30"
                            : d === "Medium"
                            ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                            : d === "Hard"
                            ? "bg-red-400/10 text-red-400 border-red-400/30"
                            : "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
                          : "border-white/[0.06] text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Avg Wait", value: "< 30s", icon: Clock },
                { label: "Opponents", value: "2,341", icon: Users },
                { label: "Your Wins", value: `${MOCK_USER.wins}`, icon: Star },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="glass rounded-xl p-4 border border-white/[0.06] text-center">
                    <Icon className="w-4 h-4 text-slate-500 mx-auto mb-2" />
                    <div className="text-base font-bold text-white">{item.value}</div>
                    <div className="text-xs text-slate-600">{item.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Find match button */}
            <Button
              fullWidth
              size="lg"
              onClick={() => setSearching(true)}
              className="text-white text-base py-4 rounded-2xl"
            >
              <Swords className="w-5 h-5" />
              Find Match
            </Button>
          </>
        ) : (
          /* Searching state */
          <div className="glass rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-10 text-center space-y-6">
            {/* Animated radar */}
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-brand-cyan/20 animate-ping-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-brand-cyan/30 animate-ping-slow [animation-delay:0.3s]" />
              <div className="absolute inset-4 rounded-full border-2 border-brand-cyan/40 animate-ping-slow [animation-delay:0.6s]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow">
                  <Zap className="w-7 h-7 text-white" fill="white" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-xl font-bold text-white mb-1">
                Finding opponent{".".repeat(dots)}
              </div>
              <div className="text-sm text-slate-500">
                Matching within ±{ratingRange} rating
                {difficulty !== "Any" && ` · ${difficulty} problems`}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              Searching for {formatElapsed(elapsed)}
            </div>

            {/* Searching opponent card */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-base font-bold text-white">
                  {MOCK_USER.name.charAt(0)}
                </div>
                <div className="text-xs text-slate-400">{MOCK_USER.username}</div>
                <div className="text-xs font-bold text-brand-cyan">{MOCK_USER.rating}</div>
              </div>

              <div className="text-2xl font-black text-gradient">VS</div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center animate-pulse2">
                  <span className="text-xl">?</span>
                </div>
                <div className="text-xs text-slate-600">Searching...</div>
                <div className="text-xs font-bold text-slate-600">
                  ~{MOCK_USER.rating - ratingRange}–{MOCK_USER.rating + ratingRange}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setSearching(false)}
              className="mx-auto"
            >
              <X className="w-4 h-4" />
              Cancel Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
