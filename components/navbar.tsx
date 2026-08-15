"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Zap,
  LayoutDashboard,
  Code2,
  Swords,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";
import { getRankFromRating } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/problems", label: "Practice", icon: Code2 },
  { href: "/battle", label: "Arena", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const rank = getRankFromRating(MOCK_USER.rating);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-purple group-hover:shadow-glow transition-all duration-300">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Algo</span>
              <span className="text-gradient">Arena</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan" />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/[0.06] hover:border-brand-cyan/20 transition-all cursor-pointer group">
              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                {MOCK_USER.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200 leading-none">
                  {MOCK_USER.username}
                </span>
                <span className={cn("text-xs leading-none mt-0.5", rank.class)}>
                  {rank.rank} · {MOCK_USER.rating}
                </span>
              </div>
            </div>

            <button className="flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:border-brand-cyan/30 hover:text-brand-cyan">
              Pro
            </button>

            <Link
              href="/login"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-dark-900/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-brand-cyan/10 text-brand-cyan"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white">
                {MOCK_USER.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{MOCK_USER.name}</p>
                <p className={cn("text-xs", rank.class)}>{rank.rank} · {MOCK_USER.rating}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
