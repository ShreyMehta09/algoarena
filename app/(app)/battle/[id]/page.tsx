"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import {
  Clock,
  Send,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  Swords,
  Trophy,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime, getRankFromRating } from "@/lib/utils";
import { useBattleSocket, type BattleEvent } from "@/lib/hooks/useBattleSocket";
import { LANGUAGES, STARTER_CODE } from "@/lib/mock-data";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-dark-900">
      <Loader2 className="w-6 h-6 text-brand-cyan animate-spin" />
    </div>
  ),
});

interface BattleProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
}

interface BattleData {
  id: string;
  status: string;
  player1: { id: string; username: string; name: string; rating: number };
  player2: { id: string; username: string; name: string; rating: number };
  problem: BattleProblem;
  timeRemaining: number;
}

type SubmitState = "idle" | "running" | "accepted" | "wrong" | "tle" | "re" | "ce" | "error";

export default function LiveBattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: battleId } = use(params);
  const router = useRouter();
  const { user: clerkUser } = useUser();

  const userId = clerkUser?.id || "";
  const username = clerkUser?.username || clerkUser?.firstName || "Player";

  // Battle state from DB
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Editor state
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODE["python"] || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitResult, setSubmitResult] = useState<{
    testsPassed: number;
    totalTests: number;
    runtime: number | null;
    memory: number | null;
    message: string;
    eloChange?: number;
    newRating?: number;
    results?: any[];
  } | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Timer — starts from server value
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  // Opponent state
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  // Battle end
  const [battleEnded, setBattleEnded] = useState(false);
  const [firstFinisher, setFirstFinisher] = useState<string | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<{
    winnerId: string;
    winnerUsername: string;
    eloChanges: Record<string, { delta: number; newRating: number }>;
  } | null>(null);

  // Code update throttle
  const codeUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const lastLinesCount = useRef(0);

  // Load battle data
  useEffect(() => {
    async function loadBattle() {
      try {
        const res = await fetch(`/api/battle?id=${battleId}`);
        if (!res.ok) {
          setLoadError("Battle not found or you are not a participant.");
          return;
        }
        const data = await res.json();
        setBattle(data.battle);
        setTimeLeft(data.battle.timeRemaining);
      } catch {
        setLoadError("Failed to load battle.");
      }
    }
    loadBattle();
  }, [battleId]);

  // Socket event handler
  const handleBattleEvent = useCallback(
    (event: BattleEvent) => {
      switch (event.type) {
        case "started":
          setTimeLeft(event.timeLeft);
          break;
        case "opponent:joined":
          setOpponentConnected(true);
          break;
        case "battle:timer":
          setTimeLeft(event.timeLeft);
          break;
        case "opponent:progress":
          setOpponentProgress(event.progress);
          break;
        case "opponent:submitted":
          setOpponentSubmitted(true);
          break;
        case "battle:winner":
          setBattleEnded(true);
          setWinnerInfo(event);
          break;
        case "battle:first_finish":
          setFirstFinisher(event.winnerId);
          if (event.winnerId !== userId) {
            setOpponentSubmitted(true);
          }
          break;
        case "battle:timeout":
          setBattleEnded(true);
          break;
        case "battle:opponent_left":
          setOpponentConnected(false);
          break;
        case "submit:result":
          // Wrong answer / TLE from server
          if (event.verdict !== "ACCEPTED") {
            setSubmitState(event.verdict.toLowerCase() as SubmitState);
            setSubmitting(false);
          }
          break;
      }
    },
    []
  );

  const { connected, emitCodeUpdate, emitSubmitResult } = useBattleSocket({
    battleId,
    userId,
    username,
    onEvent: handleBattleEvent,
  });

  // Local timer countdown (synced from server every 10s)
  useEffect(() => {
    if (battleEnded || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [battleEnded, timeLeft]);

  // Emit code updates throttled (every 3s)
  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCode(newCode);

    // Calculate progress heuristically
    const lines = newCode.split("\n").length;
    lastLinesCount.current = lines;

    if (codeUpdateTimer.current) clearTimeout(codeUpdateTimer.current);
    codeUpdateTimer.current = setTimeout(() => {
      const progress = Math.min(95, lines * 5); // rough estimate
      emitCodeUpdate(progress, lines);
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!battle || !userId || submitting) return;

    setSubmitting(true);
    setSubmitState("running");
    setSubmitResult(null);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: battle.problem.id,
          battleId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitState("error");
        setSubmitting(false);
        return;
      }

      const verdict = data.verdict as string;

      setSubmitResult({
        testsPassed: data.testsPassed,
        totalTests: data.totalTests,
        runtime: data.runtime,
        memory: data.memory,
        message: data.message,
        results: data.results,
      });

      if (verdict === "ACCEPTED") {
        setSubmitState("accepted");
        // Notify socket server — it will update Elo and broadcast winner
        emitSubmitResult({
          verdict,
          runtime: data.runtime,
          memory: data.memory,
          testsPassed: data.testsPassed,
          totalTests: data.totalTests,
        });
      } else {
        const stateMap: Record<string, SubmitState> = {
          WRONG_ANSWER: "wrong",
          TIME_LIMIT_EXCEEDED: "tle",
          RUNTIME_ERROR: "re",
          COMPILATION_ERROR: "ce",
          INTERNAL_ERROR: "error",
        };
        setSubmitState(stateMap[verdict] || "wrong");
        // Notify socket about the failed attempt
        emitSubmitResult({
          verdict,
          runtime: data.runtime,
          memory: data.memory,
          testsPassed: data.testsPassed,
          totalTests: data.totalTests,
        });
      }
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async () => {
    if (!battle || !userId || submitting) return;

    setSubmitting(true);
    setSubmitState("running");
    setSubmitResult(null);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: battle.problem.id,
          battleId,
          isRun: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitState("error");
        setSubmitting(false);
        return;
      }

      const verdict = data.verdict as string;

      setSubmitResult({
        testsPassed: data.testsPassed,
        totalTests: data.totalTests,
        runtime: data.runtime,
        memory: data.memory,
        message: data.message,
        results: data.results,
      });

      if (verdict === "ACCEPTED") {
        setSubmitState("accepted");
      } else {
        const stateMap: Record<string, SubmitState> = {
          WRONG_ANSWER: "wrong",
          TIME_LIMIT_EXCEEDED: "tle",
          RUNTIME_ERROR: "re",
          COMPILATION_ERROR: "ce",
          INTERNAL_ERROR: "error",
        };
        setSubmitState(stateMap[verdict] || "wrong");
      }
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  };

  const currentLang = LANGUAGES.find((l) => l.value === language);
  const urgentTime = timeLeft < 300;
  const problem = battle?.problem;
  const isPlayer1 = userId === battle?.player1.id;
  const myPlayer = isPlayer1 ? battle?.player1 : battle?.player2;
  const opponent = isPlayer1 ? battle?.player2 : battle?.player1;
  const opponentRank = getRankFromRating(opponent?.rating ?? 1200);
  const myEloChange = winnerInfo && userId ? winnerInfo.eloChanges[userId] : null;
  const iWon = winnerInfo?.winnerId === userId;

  if (loadError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center space-y-4 border border-red-400/20">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-slate-300">{loadError}</p>
          <Button onClick={() => router.push("/battle")} variant="ghost">
            Back to Arena
          </Button>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
      </div>
    );
  }

  // Battle ended overlay
  if (battleEnded && winnerInfo) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center space-y-6 border border-white/[0.08] max-w-md w-full animate-fade-in">
          <div className="text-5xl">{iWon ? "🏆" : "💔"}</div>
          <div>
            <h1 className={cn("text-3xl font-black mb-2", iWon ? "text-green-400" : "text-red-400")}>
              {iWon ? "Victory!" : "Defeated"}
            </h1>
            <p className="text-slate-400 text-sm">
              {iWon
                ? `You beat ${winnerInfo.winnerUsername === username ? opponent?.username : winnerInfo.winnerUsername}!`
                : `${winnerInfo.winnerUsername} solved it first.`}
            </p>
          </div>
          {myEloChange && (
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg",
              myEloChange.delta > 0 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
            )}>
              {myEloChange.delta > 0 ? "+" : ""}{myEloChange.delta} Elo → {myEloChange.newRating}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/battle")} className="text-white">
              <Swords className="w-4 h-4" />
              Play Again
            </Button>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition flex flex-col h-[calc(100vh-80px)] gap-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Battle top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 glass border-b border-white/[0.06] flex-shrink-0">
        {/* My player */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-sm font-bold text-white">
            {(myPlayer?.username || myPlayer?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{myPlayer?.username || myPlayer?.name}</div>
            <div className="text-xs text-brand-cyan">{myPlayer?.rating} Elo</div>
          </div>
        </div>

        {/* Timer */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-black transition-colors",
            urgentTime
              ? "text-red-400 bg-red-400/10 border border-red-400/20 animate-pulse2"
              : "text-white bg-dark-700/50 border border-white/[0.06]"
          )}
        >
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-white">{opponent?.username || opponent?.name}</div>
            <div className={cn("text-xs", opponentRank.class)}>{opponent?.rating} Elo</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-dark-600 border border-white/[0.06] flex items-center justify-center text-sm font-bold text-slate-300">
            {(opponent?.username || opponent?.name || "?").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Opponent status bar */}
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-2 bg-dark-800/40 border-b border-white/[0.04] flex-shrink-0">
        <div className="flex items-center gap-2 text-xs">
          {connected ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-slate-500" />
          )}
          <span className={connected ? "text-slate-500" : "text-slate-600"}>
            {opponentConnected ? "Opponent online" : "Waiting for opponent..."}
          </span>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">{opponent?.username}&apos;s progress</span>
            <span className={cn("font-medium", opponentSubmitted ? "text-orange-400" : "text-slate-400")}>
              {opponentSubmitted ? "Submitted!" : `${Math.floor(opponentProgress)}%`}
            </span>
          </div>
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${opponentProgress}%`,
                background: opponentSubmitted
                  ? "linear-gradient(90deg, #f97316, #fb923c)"
                  : "linear-gradient(90deg, #7c3aed, #9f67ff)",
              }}
            />
          </div>
        </div>
        {opponentSubmitted && !firstFinisher && (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold animate-fade-in">
            <Swords className="w-3 h-3" />
            Opponent is submitting...
          </div>
        )}
        {firstFinisher === opponent?.id && (
          <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold animate-fade-in">
            <Trophy className="w-3 h-3" />
            Opponent solved it! You still have time.
          </div>
        )}
      </div>

      {/* Main split */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-white/[0.06] overflow-hidden">
        {/* Left: Problem */}
        <div className="overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={problem?.difficulty || "MEDIUM"} />
            <span className="text-xs text-slate-500">
              {problem?.tags?.slice(0, 2).join(", ")}
            </span>
          </div>

          <h2 className="text-base font-bold text-white">{problem?.title}</h2>

          <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
            {problem?.description}
          </div>

          {problem?.examples?.map((ex, i) => (
            <div key={i} className="rounded-xl bg-dark-800/60 border border-white/[0.04] overflow-hidden">
              <div className="px-4 py-2 border-b border-white/[0.04]">
                <span className="text-xs text-slate-500 font-medium">Example {i + 1}</span>
              </div>
              <div className="p-4 space-y-1 font-mono text-xs">
                <div>
                  <span className="text-slate-500">Input: </span>
                  <span className="text-brand-cyan">{ex.input}</span>
                </div>
                <div>
                  <span className="text-slate-500">Output: </span>
                  <span className="text-green-400">{ex.output}</span>
                </div>
                {ex.explanation && (
                  <div className="text-slate-600 mt-1 text-[11px]">{ex.explanation}</div>
                )}
              </div>
            </div>
          ))}

          {problem?.constraints && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Constraints</h3>
              <div className="text-xs text-slate-500 font-mono leading-relaxed">{problem.constraints}</div>
            </div>
          )}

          <div className="flex gap-4 text-xs text-slate-600 pt-2 border-t border-white/[0.04]">
            <span>Time limit: {(problem?.timeLimit ?? 2000) / 1000}s</span>
            <span>Memory: {problem?.memoryLimit ?? 256}MB</span>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-dark-800/40 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-white/[0.06] hover:border-brand-cyan/20 text-slate-300 transition-all"
              >
                {currentLang?.name}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showLangMenu && (
                <div className="absolute top-full left-0 mt-1 w-40 glass rounded-xl border border-white/[0.06] shadow-glass py-1 z-10">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setLanguage(lang.value);
                        setCode(STARTER_CODE[lang.value] || STARTER_CODE["python"]);
                        setShowLangMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors",
                        language === lang.value
                          ? "text-brand-cyan bg-brand-cyan/5"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRun}
                loading={submitting}
                disabled={submitting || battleEnded}
                className="text-slate-300 hover:text-white"
              >
                Run Code
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting || battleEnded || firstFinisher === userId}
                className="text-white"
              >
                <Send className="w-3.5 h-3.5" />
                {firstFinisher === userId ? "Solved" : "Submit"}
              </Button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                scrollbar: {
                  verticalScrollbarSize: 4,
                  horizontalScrollbarSize: 4,
                },
              }}
            />
          </div>

          {/* Result panel */}
          {submitState !== "idle" && (
            <div
              className={cn(
                "px-4 py-3 border-t transition-all flex-shrink-0",
                submitState === "accepted"
                  ? "border-green-400/30 bg-green-400/5"
                  : submitState === "running"
                  ? "border-brand-cyan/20 bg-brand-cyan/5"
                  : "border-red-400/30 bg-red-400/5"
              )}
            >
              {submitState === "running" && (
                <div className="flex items-center gap-2 text-brand-cyan text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Judging your submission via Judge0...
                </div>
              )}
              {submitState === "accepted" && submitResult && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-400/15 border border-green-400/25 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-400">
                      🎉 All {submitResult.totalTests} test cases passed!
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {submitResult.runtime != null && `Runtime ${submitResult.runtime}ms`}
                      {submitResult.memory != null && ` · Memory ${Math.round(submitResult.memory / 1024)}MB`}
                    </div>
                  </div>
                </div>
              )}
              {(submitState === "wrong" || submitState === "tle" || submitState === "re" || submitState === "ce") && submitResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {submitState === "wrong" && "Wrong Answer"}
                      {submitState === "tle" && "Time Limit Exceeded"}
                      {submitState === "re" && "Runtime Error"}
                      {submitState === "ce" && "Compilation Error"}
                    </span>
                    <span className="text-slate-500">
                      — {submitResult.testsPassed}/{submitResult.totalTests} tests passed
                    </span>
                  </div>
                  {submitResult.results?.filter((r: any) => !r.passed).map((r: any, idx: number) => (
                    <div key={idx} className="bg-black/40 rounded-lg p-3 text-xs font-mono overflow-auto border border-red-400/10 max-h-32">
                      {r.stderr && (
                        <div className="text-red-400 whitespace-pre-wrap">{r.stderr}</div>
                      )}
                      {!r.stderr && r.expectedOutput && (
                        <>
                          <div className="text-slate-500">Expected:</div>
                          <div className="text-green-400 mb-2">{r.expectedOutput}</div>
                          <div className="text-slate-500">Actual:</div>
                          <div className="text-red-400">{r.actualOutput || "No output"}</div>
                        </>
                      )}
                    </div>
                  )).slice(0, 1)}
                </div>
              )}
              {submitState === "error" && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Execution error. Please try again.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
