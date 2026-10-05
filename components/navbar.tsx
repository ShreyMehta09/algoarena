"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Zap,
  LayoutDashboard,
  Code2,
  Swords,
  Trophy,
  LogOut,
  Menu,
  X,
  Bell,
  Loader2,
} from "lucide-react";
import { cn, getRankFromRating } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/problems", label: "Practice", icon: Code2 },
  { href: "/battle", label: "Arena", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ rating: number; username: string } | null>(null);

  // Fetch extra profile data (rating, username) from MongoDB via API
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUserProfile({ rating: data.user.rating, username: data.user.username });
      })
      .catch(() => {});
  }, [user]);

  const rating = userProfile?.rating ?? 1200;
  const rank = getRankFromRating(rating);
  const displayName = userProfile?.username || user?.username || user?.firstName || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

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
            {!isLoaded ? (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/[0.06] hover:border-brand-cyan/20 transition-all cursor-pointer group">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                    {initial}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200 leading-none">
                    {displayName}
                  </span>
                  <span className={cn("text-xs leading-none mt-0.5", rank.class)}>
                    {rank.rank} · {rating}
                  </span>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          {user && (
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white">
                      {initial}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-200">{displayName}</p>
                    <p className={cn("text-xs", rank.class)}>{rank.rank} · {rating}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
