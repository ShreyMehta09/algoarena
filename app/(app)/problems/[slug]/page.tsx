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
} from "lucide-react";
import { MOCK_PROBLEM_DETAIL, LANGUAGES, STARTER_CODE } from "@/lib/mock-data";
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

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const problem = MOCK_PROBLEM_DETAIL;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODE["python"]);
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [runResult, setRunResult] = useState<ResultStatus>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || STARTER_CODE["python"]);
    setShowLangMenu(false);
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult("running");
    await new Promise((r) => setTimeout(r, 1800));
    setRunResult("wrong"); // simulate partial pass for demo
    setRunning(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setRunResult("running");
    await new Promise((r) => setTimeout(r, 2500));
    setRunResult("accepted");
    setSubmitting(false);
  };

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
                  {problem.tags.map((tag) => (
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
                  {problem.examples.map((ex, i) => (
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
                    {problem.constraints.map((c, i) => (
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
                  <p className="text-xs font-semibold text-yellow-400 mb-2">Hint 1</p>
                  <p className="text-xs text-slate-400">
                    Think about using a sliding window approach. Maintain a window that has no repeating characters.
                  </p>
                </div>
                <div className="rounded-xl bg-yellow-400/5 border border-yellow-400/15 p-4">
                  <p className="text-xs font-semibold text-yellow-400 mb-2">Hint 2</p>
                  <p className="text-xs text-slate-400">
                    Use a hash map to store the last seen index of each character. When you see a repeat, move the left pointer.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-2">
                {MOCK_SUBMISSIONS.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04]">
                    {sub.status === "ACCEPTED" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={cn("text-xs font-medium", sub.status === "ACCEPTED" ? "text-green-400" : "text-red-400")}>
                        {sub.status.replace("_", " ")}
                      </div>
                      <div className="text-xs text-slate-600">{sub.lang} · {sub.time}</div>
                    </div>
                    {sub.runtime && (
                      <div className="text-right text-xs">
                        <div className="text-slate-400">{sub.runtime}ms</div>
                        <div className="text-slate-600">{(sub.memory! / 1024).toFixed(1)}MB</div>
                      </div>
                    )}
                  </div>
                ))}
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
                      Runtime: <span className="text-slate-300">52ms</span> · Memory: <span className="text-slate-300">14.2 MB</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">Beats 87.3% of solutions</div>
                  </div>
                </div>
              )}
              {runResult === "wrong" && (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-red-400">Wrong Answer</div>
                    <div className="text-xs text-slate-500 mt-1">2/3 test cases passed</div>
                    <div className="mt-2 p-2 rounded-lg bg-dark-800/60 font-mono text-xs space-y-1">
                      <div><span className="text-slate-500">Input: </span><span className="text-brand-cyan">&quot;abcabcbb&quot;</span></div>
                      <div><span className="text-slate-500">Expected: </span><span className="text-green-400">3</span></div>
                      <div><span className="text-slate-500">Got: </span><span className="text-red-400">0</span></div>
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
