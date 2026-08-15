"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "easy" | "medium" | "hard" | "accepted" | "wrong" | "pending" | "default";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variantClass = {
    easy: "badge-easy",
    medium: "badge-medium",
    hard: "badge-hard",
    accepted: "badge-accepted",
    wrong: "badge-wrong",
    pending: "badge-pending",
    default: "bg-slate-700/50 text-slate-300 border border-slate-600/30",
  }[variant];

  const sizeClass = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        variantClass,
        sizeClass,
        className
      )}
    >
      {children}
    </span>
  );
}

// Difficulty badge helper
export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const v = difficulty.toLowerCase() as "easy" | "medium" | "hard";
  return (
    <Badge variant={v}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </Badge>
  );
}
