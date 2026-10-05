import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(rating: number): string {
  return rating.toLocaleString();
}

export function getRankFromRating(rating: number): {
  rank: string;
  color: string;
  class: string;
} {
  if (rating <= 1000)
    return { rank: "Unranked", color: "", class: "text-slate-500" };
  if (rating < 1200)
    return { rank: "Bronze", color: "#cd7f32", class: "rank-bronze" };
  if (rating < 1500)
    return { rank: "Silver", color: "#c0c0c0", class: "rank-silver" };
  if (rating < 1800)
    return { rank: "Gold", color: "#ffd700", class: "rank-gold" };
  if (rating < 2100)
    return { rank: "Platinum", color: "#00d4ff", class: "rank-platinum" };
  if (rating < 2400)
    return { rank: "Diamond", color: "#9f67ff", class: "rank-diamond" };
  return { rank: "Master", color: "#ff6b35", class: "rank-master" };
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return "#4ade80";
    case "MEDIUM":
      return "#fbbf24";
    case "HARD":
      return "#f87171";
    default:
      return "#94a3b8";
  }
}

export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return "badge-easy";
    case "MEDIUM":
      return "badge-medium";
    case "HARD":
      return "badge-hard";
    default:
      return "";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
      return "badge-accepted";
    case "WRONG_ANSWER":
    case "RUNTIME_ERROR":
    case "COMPILATION_ERROR":
      return "badge-wrong";
    default:
      return "badge-pending";
  }
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((s) => s.charAt(0) + s.slice(1).toLowerCase())
    .join(" ");
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
