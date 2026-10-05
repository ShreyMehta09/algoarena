"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Swords,
  Zap,
  X,
  Clock,
  Users,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRankFromRating, cn } from "@/lib/utils";
import {
  useMatchmakingSocket,
  type MatchmakingEvent,
} from "@/lib/hooks/useBattleSocket";

const RANK_RANGES = [
  { label: "±50", range: 50 },
  { label: "±100", range: 100 },
  { label: "±200", range: 200 },
  { label: "Any", range: 9999 },
];

const DIFFICULTIES = ["Any", "Easy", "Medium", "Hard"] as const;

export default function BattlePage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [profile, setProfile] = useState<{ username: string; rating: number; wins: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ratingRange, setRatingRange] = useState(100);
  const [difficulty, setDifficulty] = useState<string>("Any");
  const [dots, setDots] = useState(1);
  const [opponent, setOpponent] = useState<{ username: string; rating: number } | null>(null);
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    if (!clerkUser) return;
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setProfile({ username: data.user.username, rating: data.user.rating, wins: data.user.wins });
      })
      .catch(() => {});
  }, [clerkUser]);

  const userId = clerkUser?.id;
  const username = profile?.username || clerkUser?.username || clerkUser?.firstName || "Player";
  const rating = profile?.rating ?? 1200;
  const wins = profile?.wins ?? 0;
  const rank = getRankFromRating(rating);

  const handleSocketEvent = useCallback(
    (event: MatchmakingEvent) => {
      if (event.type === "match:found") {
        setMatchFound(true);
        setOpponent(event.opponent);
        // Brief delay to show "Match Found!" before redirect
        setTimeout(() => {
          router.push(`/battle/${event.battleId}`);
        }, 1500);
      }
    },
    [router]
  );

  const { connected, joinQueue, leaveQueue } = useMatchmakingSocket({
    onEvent: handleSocketEvent,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searching) {
      timer = setInterval(() => {
        setElapsed((e) => e + 1);
        setDots((d) => (d % 3) + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [searching]);

  const startSearch = () => {
    if (!userId) return;
    setSearching(true);
    setMatchFound(false);
    setOpponent(null);
    joinQueue({
      userId,
      username,
      rating,
      ratingRange,
      difficulty,
    });
  };

  const cancelSearch = () => {
    setSearching(false);
    setMatchFound(false);
    leaveQueue();
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${sec}s`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-transition min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">
            <span className="text-gradient">1v1</span> Battle Arena
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className={cn("w-2 h-2 rounded-full", connected ? "bg-green-400 animate-ping-slow" : "bg-slate-600")} />
            {connected ? "Connected to matchmaking" : "Connecting..."}
          </div>
        </div>

        {/* Player card */}
        <div className="glass rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-black text-white shadow-glow-purple">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-bold text-white">{clerkUser?.firstName || username}</div>
                <div className="text-sm text-slate-500">@{username}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">{rating}</div>
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
                    {rating - ratingRange} – {rating + ratingRange}
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
                { label: "Avg Wait", value: "<30s", icon: Clock },
                { label: "Online Now", value: "—", icon: Users },
                { label: "Your Wins", value: `${wins}`, icon: Star },
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

            {/* Connection warning */}
            {!connected && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-xs text-yellow-400">
                <WifiOff className="w-4 h-4" />
                Socket server not reachable. Make sure you started with <code className="font-mono">npm run dev</code>.
              </div>
            )}

            {/* Find match button */}
            <Button
              fullWidth
              size="lg"
              onClick={startSearch}
              disabled={!connected}
              className="text-white text-base py-4 rounded-2xl"
            >
              <Swords className="w-5 h-5" />
              Find Match
            </Button>
          </>
        ) : matchFound ? (
          /* Match found state */
          <div className="glass rounded-2xl border border-green-400/30 bg-green-400/5 p-10 text-center space-y-4 animate-fade-in">
            <div className="text-4xl">⚔️</div>
            <div className="text-xl font-black text-green-400">Match Found!</div>
            <div className="text-sm text-slate-400">
              vs <span className="text-white font-bold">{opponent?.username}</span>{" "}
              <span className="text-slate-500">({opponent?.rating} Elo)</span>
            </div>
            <div className="text-xs text-slate-500">Redirecting to battle room...</div>
          </div>
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
                Finding your match{".".repeat(dots)}
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

            {/* Player vs ? */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-base font-bold text-white">
                  {username.charAt(0)}
                </div>
                <div className="text-xs text-slate-400">{username}</div>
                <div className="text-xs font-bold text-brand-cyan">{rating}</div>
              </div>

              <div className="text-2xl font-black text-gradient">VS</div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center animate-pulse2">
                  <span className="text-xl">?</span>
                </div>
                <div className="text-xs text-slate-600">Searching...</div>
                <div className="text-xs font-bold text-slate-600">
                  ~{rating - ratingRange}–{rating + ratingRange}
                </div>
              </div>
            </div>

            <Button variant="ghost" onClick={cancelSearch} className="mx-auto">
              <X className="w-4 h-4" />
              Cancel Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
