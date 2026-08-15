"use client";

import { useState, useEffect, use } from "react";
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
} from "lucide-react";
import { MOCK_PROBLEM_DETAIL, LANGUAGES, STARTER_CODE } from "@/lib/mock-data";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime, getRankFromRating } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-dark-900">
      <Loader2 className="w-6 h-6 text-brand-cyan animate-spin" />
    </div>
  ),
});

const OPPONENT = {
  name: "PyMaster",
  username: "pymaster",
  rating: 1712,
};

const BATTLE_DURATION = 20 * 60; // 20 minutes

export default function LiveBattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const problem = MOCK_PROBLEM_DETAIL;

  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODE["python"]);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<
    "idle" | "running" | "accepted" | "wrong"
  >("idle");
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Opponent progress simulation
  const [opponentProgress, setOpponentProgress] = useState(0); // 0-100
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);

  const opponentRank = getRankFromRating(OPPONENT.rating);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Opponent progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setOpponentProgress((p) => {
        const next = p + Math.random() * 2;
        if (next >= 100 && !opponentSubmitted) {
          setOpponentSubmitted(true);
        }
        return Math.min(next, 100);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [opponentSubmitted]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResult("running");
    await new Promise((r) => setTimeout(r, 2500));
    setSubmitResult("accepted");
    setSubmitting(false);
  };

  const urgentTime = timeLeft < 300; // < 5 min
  const currentLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className="page-transition flex flex-col h-[calc(100vh-80px)] gap-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Battle top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 glass border-b border-white/[0.06] flex-shrink-0">
        {/* Player */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-sm font-bold text-white">
            A
          </div>
          <div>
            <div className="text-sm font-bold text-white">alexchen</div>
            <div className="text-xs text-brand-cyan">1647 Elo</div>
          </div>
        </div>

        {/* Timer (center) */}
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
            <div className="text-sm font-bold text-white">{OPPONENT.username}</div>
            <div className={cn("text-xs", opponentRank.class)}>
              {OPPONENT.rating} Elo
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-dark-600 border border-white/[0.06] flex items-center justify-center text-sm font-bold text-slate-300">
            P
          </div>
        </div>
      </div>

      {/* Opponent status bar */}
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-2 bg-dark-800/40 border-b border-white/[0.04] flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Wifi className="w-3 h-3 text-green-400" />
          Opponent online
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">PyMaster's progress</span>
            <span className={cn("font-medium", opponentSubmitted ? "text-red-400" : "text-slate-400")}>
              {opponentSubmitted ? "Submitted!" : `${Math.floor(opponentProgress)}%`}
            </span>
          </div>
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${opponentProgress}%`,
                background: opponentSubmitted
                  ? "linear-gradient(90deg, #ef4444, #f87171)"
                  : "linear-gradient(90deg, #7c3aed, #9f67ff)",
              }}
            />
          </div>
        </div>
        {opponentSubmitted && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold animate-fade-in">
            <Swords className="w-3 h-3" />
            Opponent submitted!
          </div>
        )}
      </div>

      {/* Main split */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-white/[0.06] overflow-hidden">
        {/* Left: Problem */}
        <div className="overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="text-xs text-slate-500">
              {problem.tags.slice(0, 2).join(", ")}
            </span>
          </div>

          <h2 className="text-base font-bold text-white">{problem.title}</h2>

          <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </div>

          {problem.examples.map((ex, i) => (
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
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Constraints</h3>
            <ul className="space-y-1">
              {problem.constraints.map((c, i) => (
                <li key={i} className="text-xs text-slate-500 font-mono flex items-start gap-2">
                  <span className="text-brand-cyan">•</span>
                  {c}
                </li>
              ))}
            </ul>
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

            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={submitting}
              className="text-white"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </Button>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
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

          {/* Result */}
          {submitResult !== "idle" && (
            <div
              className={cn(
                "px-4 py-3 border-t transition-all flex-shrink-0",
                submitResult === "accepted"
                  ? "border-green-400/30 bg-green-400/5"
                  : submitResult === "wrong"
                  ? "border-red-400/30 bg-red-400/5"
                  : "border-brand-cyan/20 bg-brand-cyan/5"
              )}
            >
              {submitResult === "running" && (
                <div className="flex items-center gap-2 text-brand-cyan text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Judging submission...
                </div>
              )}
              {submitResult === "accepted" && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-400/15 border border-green-400/25 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-400">
                      🎉 You Win! All test cases passed.
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      +18 Elo · Runtime 52ms · Memory 14.2MB
                    </div>
                  </div>
                </div>
              )}
              {submitResult === "wrong" && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <XCircle className="w-3.5 h-3.5" />
                  Wrong Answer — 2/3 test cases passed
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
