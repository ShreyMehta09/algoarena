"use client";

import { useState, use } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  Send,
  ChevronDown,
  Clock,
  MemoryStick,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  Lightbulb,
  BarChart2,
  AlertCircle
} from "lucide-react";
import { LANGUAGES, STARTER_CODE } from "@/lib/mock-data";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Monaco must be dynamic (client-only)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-dark-900">
      <Loader2 className="w-6 h-6 text-brand-cyan animate-spin" />
    </div>
  ),
});

type TabKey = "description" | "hints" | "submissions";
type ResultStatus = "idle" | "running" | "accepted" | "wrong" | "error";

const MOCK_SUBMISSIONS = [
  { id: 1, status: "ACCEPTED", lang: "Python 3", runtime: 52, memory: 14200, time: "2h ago" },
  { id: 2, status: "WRONG_ANSWER", lang: "Python 3", runtime: null, memory: null, time: "3h ago" },
];

export default function ProblemClient({ problem }: { problem: any }) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODE["python"]);
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [runResult, setRunResult] = useState<ResultStatus>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [runData, setRunData] = useState<any>(null);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || STARTER_CODE["python"]);
    setShowLangMenu(false);
  };

  const executeCode = async (isRun: boolean) => {
    try {
      if (isRun) setRunning(true);
      else setSubmitting(true);
      
      setRunResult("running");
      setRunData(null);

      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
          isRun,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setRunResult("error");
        setRunData({ error: data.error || "Execution failed" });
        return;
      }

      setRunData(data);
      if (data.verdict === "ACCEPTED") {
        setRunResult("accepted");
      } else if (data.verdict === "COMPILATION_ERROR" || data.verdict === "RUNTIME_ERROR") {
        setRunResult("error");
      } else {
        setRunResult("wrong");
      }
    } catch (err: any) {
      setRunResult("error");
      setRunData({ error: err.message });
    } finally {
      if (isRun) setRunning(false);
      else setSubmitting(false);
    }
  };

  const handleRun = () => executeCode(true);
  const handleSubmit = () => executeCode(false);

  const currentLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className="page-transition">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {problem.timeLimit}ms
          <span className="text-slate-700">·</span>
          <MemoryStick className="w-3.5 h-3.5" />
          {problem.memoryLimit}MB
        </div>
      </div>

      {/* Split layout */}
      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        {/* Left: Problem */}
        <div className="glass rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {[
              { key: "description" as TabKey, label: "Description", icon: BookOpen },
              { key: "hints" as TabKey, label: "Hints", icon: Lightbulb },
              { key: "submissions" as TabKey, label: "Submissions", icon: BarChart2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all border-b-2",
                  activeTab === key
                    ? "border-brand-cyan text-brand-cyan"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === "description" && (
              <>
                <div className="flex gap-2 flex-wrap">
                  {problem.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  {problem.examples.map((ex: any, i: number) => (
                    <div key={i} className="rounded-xl bg-dark-800/60 border border-white/[0.04] overflow-hidden">
                      <div className="px-4 py-2 border-b border-white/[0.04]">
                        <span className="text-xs text-slate-500 font-medium">
                          Example {i + 1}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5 font-mono text-xs">
                        <div>
                          <span className="text-slate-500">Input: </span>
                          <span className="text-brand-cyan">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Output: </span>
                          <span className="text-green-400">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-slate-500 leading-relaxed">
                            <span className="text-slate-600">Explanation: </span>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Constraints</h3>
                  <ul className="space-y-1">
                    {problem.constraints.map((c: string, i: number) => (
                      <li key={i} className="text-xs text-slate-500 font-mono flex items-start gap-2">
                        <span className="text-brand-cyan mt-0.5">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeTab === "hints" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-yellow-400/5 border border-yellow-400/15 p-4">
                   <p className="text-xs font-semibold text-yellow-400 mb-2">Hint</p>
                   <p className="text-xs text-slate-400">
                     Read the problem description carefully. Since this is a CP-style problem, make sure you use standard input and output correctly.
                   </p>
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-dark-800/50 border border-white/[0.04] text-xs text-slate-400 text-center">
                   Submission history is not available right now.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor + Results */}
        <div className="flex flex-col gap-3">
          {/* Editor */}
          <div className="flex-1 glass rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-dark-800/40">
              {/* Language selector */}
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
                        onClick={() => handleLanguageChange(lang.value)}
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
                  loading={running}
                >
                  <Play className="w-3.5 h-3.5" />
                  Run
                </Button>
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
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 monaco-editor-container">
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
                  glowingBrackets: true,
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
          </div>

          {/* Result panel */}
          {runResult !== "idle" && (
            <div className={cn(
              "glass rounded-xl border p-4 transition-all",
              runResult === "accepted" ? "border-green-400/30 bg-green-400/5" :
              runResult === "wrong" ? "border-red-400/30 bg-red-400/5" :
              runResult === "running" ? "border-brand-cyan/30 bg-brand-cyan/5" :
              "border-white/[0.06]"
            )}>
              {runResult === "running" && (
                <div className="flex items-center gap-2 text-brand-cyan text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing code...
                </div>
              )}
              {runResult === "accepted" && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-green-400">Accepted</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Runtime: <span className="text-slate-300">{runData?.runtime ?? "N/A"}ms</span> · Memory: <span className="text-slate-300">{runData?.memory ? (runData.memory / 1024).toFixed(1) : "N/A"} MB</span>
                    </div>
                  </div>
                </div>
              )}
              {runResult === "wrong" && (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-red-400">{runData?.verdict?.replace("_", " ")}</div>
                    <div className="text-xs text-slate-500 mt-1">{runData?.testsPassed}/{runData?.totalTests} test cases passed</div>
                    
                    {runData?.results?.find((r: any) => !r.passed) && (
                      <div className="mt-2 p-2 rounded-lg bg-dark-800/60 font-mono text-xs space-y-1 overflow-x-auto">
                        <div><span className="text-slate-500">Input: </span><span className="text-brand-cyan">{runData.results.find((r: any) => !r.passed).expectedOutput ? runData.results.find((r: any) => !r.passed).expectedOutput : "Hidden"}</span></div>
                        <div><span className="text-slate-500">Output: </span><span className="text-red-400">{runData.results.find((r: any) => !r.passed).actualOutput || '""'}</span></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {runResult === "error" && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-red-500">{runData?.verdict || "Error"}</div>
                    <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 font-mono text-xs whitespace-pre-wrap overflow-x-auto text-red-400">
                      {runData?.results?.[0]?.stderr || runData?.error || "Execution failed"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
