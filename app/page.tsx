"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap,
  Swords,
  Trophy,
  Code2,
  Shield,
  BarChart3,
  ArrowRight,
  Play,
  Users,
  Clock,
  ChevronRight,
  Star,
  Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon: Swords,
    title: "1v1 Real-Time Battles",
    description:
      "Get matched with an opponent of similar skill and solve the same problem. First to pass all test cases wins.",
    color: "cyan",
  },
  {
    icon: Code2,
    title: "Monaco Code Editor",
    description:
      "Industry-grade editor with syntax highlighting, IntelliSense, and support for 8+ programming languages.",
    color: "purple",
  },
  {
    icon: Shield,
    title: "Sandboxed Execution",
    description:
      "Every submission runs in an isolated Docker container with strict time and memory limits.",
    color: "cyan",
  },
  {
    icon: Trophy,
    title: "Elo Rating System",
    description:
      "Fair skill-based matchmaking using the Elo algorithm. Your rating reflects your true competitive strength.",
    color: "purple",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Detailed stats on your win rate, favorite languages, speed trends, and problem-solving patterns.",
    color: "cyan",
  },
  {
    icon: Globe,
    title: "Live Leaderboards",
    description:
      "Global and regional rankings. Climb the ladder and earn rank titles from Bronze to Master.",
    color: "purple",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up in seconds. Your journey begins at 1200 Elo.",
  },
  {
    num: "02",
    title: "Find a match",
    desc: "Click 'Battle' and our queue matches you with a same-skill opponent in seconds.",
  },
  {
    num: "03",
    title: "Code and win",
    desc: "Solve the shared problem faster and more accurately to claim the win and gain Elo.",
  },
];

const STATS = [
  { label: "Active Coders", value: 12847, suffix: "+" },
  { label: "Battles Fought", value: 94321, suffix: "+" },
  { label: "Problems Available", value: 500, suffix: "+" },
  { label: "Languages Supported", value: 8, suffix: "" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const step = target / 60;
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= target) {
          clearInterval(timer);
          return target;
        }
        return Math.floor(prev + step);
      });
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-purple">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Algo</span>
              <span className="text-gradient">Arena</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/problems" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Problems
            </Link>
            <Link href="/leaderboard" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Leaderboard
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm px-4 py-2 rounded-xl text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl animate-pulse2" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/8 rounded-full blur-3xl animate-pulse2 [animation-delay:1s]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-cyan/20 text-xs text-brand-cyan font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping-slow" />
            847 battles happening right now
          </div>

          <div className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Trusted by 12k+ competitive programmers
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-slide-up">
            Code.{" "}
            <span className="text-gradient">Battle.</span>
            <br />
            Climb.
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up [animation-delay:0.1s]">
            Fast 1v1 coding battles with skill-based matchmaking. Solve problems under pressure, validate each shot, and climb the ladder.
            code, watch it execute, and beat your opponent to the top of the
            leaderboard.
          </p>

          <div className="mb-8 flex items-center justify-center gap-3 text-sm text-slate-300 animate-slide-up [animation-delay:0.15s]">
            <span className="rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5">
              Free to start
            </span>
            <span className="rounded-full border border-brand-purple/30 bg-brand-purple/10 px-3 py-1.5">
              Ranked matches
            </span>
            <span className="rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1.5">
              Live scoreboard
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:0.2s]">
            <Link
              href="/register"
              className="btn-primary group flex items-center gap-2 px-8 py-4 rounded-2xl text-base text-white"
            >
              <Play className="w-4 h-4" fill="white" />
              Start Battling Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/problems"
              className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-2xl text-base"
            >
              Browse Problems
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Hero preview */}
          <div className="mt-20 relative animate-fade-in [animation-delay:0.4s]">
            <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden shadow-glass mx-auto max-w-4xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-dark-800/50">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 text-center text-xs text-slate-500 font-mono">
                  algoarena.io/battle/live
                </div>
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping-slow" />
                  LIVE
                </div>
              </div>
              {/* Battle preview content */}
              <div className="grid grid-cols-2 divide-x divide-white/[0.06] min-h-[260px]">
                {/* Left: Problem */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-medium text-xs px-2 py-0.5 rounded-full font-medium">Medium</span>
                    <span className="text-slate-400 text-xs">Sliding Window</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">
                    Longest Substring Without Repeating Characters
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Given a string <code className="text-brand-cyan">s</code>,
                    find the length of the longest substring without repeating
                    characters.
                  </p>
                  <div className="mt-4 p-3 rounded-lg bg-dark-800/60 border border-white/[0.04]">
                    <p className="text-xs font-mono text-slate-500 mb-1">Example:</p>
                    <p className="text-xs font-mono text-brand-cyan">Input: s = &quot;abcabcbb&quot;</p>
                    <p className="text-xs font-mono text-green-400">Output: 3</p>
                  </div>
                </div>
                {/* Right: Code editor preview */}
                <div className="p-5 bg-dark-900/60 font-mono">
                  <div className="text-xs text-slate-500 mb-2">Python 3</div>
                  <pre
                    className="text-xs leading-relaxed overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html: `<span style="color:#c084fc">class</span> <span style="color:#67e8f9">Solution</span>:\n  <span style="color:#c084fc">def</span> <span style="color:#67e8f9">lengthOf</span>(s):\n    seen = {}\n    left = result = <span style="color:#fb923c">0</span>\n    <span style="color:#c084fc">for</span> right, ch <span style="color:#c084fc">in</span> enumerate(s):\n      <span style="color:#c084fc">if</span> ch <span style="color:#c084fc">in</span> seen:\n        left = seen[ch] + <span style="color:#fb923c">1</span>\n      seen[ch] = right\n      result = max(result, right - left + <span style="color:#fb923c">1</span>)\n    <span style="color:#c084fc">return</span> result`,
                    }}
                  />
                </div>
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06] bg-dark-800/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    2 players
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-cyan">
                    <Clock className="w-3 h-3" />
                    14:32 remaining
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  8/10 tests passing
                </div>
              </div>
            </div>
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-brand opacity-5 rounded-2xl blur-2xl -z-10 scale-110" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-gradient mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">
            Everything you need to{" "}
            <span className="text-gradient">level up</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A complete competitive programming ecosystem built for serious developers.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass glass-hover rounded-2xl p-6 transition-all duration-300 group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${
                    feature.color === "cyan"
                      ? "bg-brand-cyan/10 border border-brand-cyan/20"
                      : "bg-brand-purple/10 border border-brand-purple/20"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      feature.color === "cyan" ? "text-brand-cyan" : "text-brand-purple-light"
                    }`}
                  />
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-dark-900/40 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              How it <span className="text-gradient">works</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-brand text-white text-xl font-black mb-5 shadow-glow-purple">
                  {step.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+3rem)] right-0 h-px bg-gradient-to-r from-brand-purple/40 to-transparent" />
                )}
                <h3 className="text-base font-bold text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 max-w-3xl mx-auto px-6 text-center">
        <div className="relative glass rounded-3xl p-12 border border-white/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand opacity-5" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400" fill="#FBBF24" />
              ))}
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to <span className="text-gradient">battle?</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Join thousands of competitive programmers. Free forever, no credit card required.
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base text-white"
            >
              <Zap className="w-4 h-4" />
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="text-sm font-bold">
              <span className="text-white">Algo</span>
              <span className="text-gradient">Arena</span>
            </span>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 AlgoArena. Built with Next.js, Socket.IO, and Judge0.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

