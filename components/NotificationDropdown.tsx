"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CheckCheck,
  X,
  Megaphone,
  Clock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  userRole?: string;
}

const STORAGE_KEY = "algoarena_read_notifications";

export default function NotificationDropdown({ userRole }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // LocalStorage error fallback
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling every 20 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 20000);

    const handleFocus = () => {
      fetchNotifications();
    };

    const handleCustomUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setReadIds(JSON.parse(stored));
        }
      } catch {}
      fetchNotifications();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("algoarena:notification-updated", handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("algoarena:notification-updated", handleCustomUpdate);
    };
  }, [fetchNotifications]);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mark all currently fetched notifications as read
  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n._id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("algoarena:notification-updated"));
    } catch {}
  };

  // Mark an individual notification as read
  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("algoarena:notification-updated"));
      } catch {}
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n._id)).length;
  const isAdmin = userRole === "ADMIN" || userRole === "PROBLEM_SETTER";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={cn(
          "relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 outline-none",
          isOpen
            ? "bg-white/10 text-brand-cyan ring-1 ring-brand-cyan/40 shadow-[0_0_12px_rgba(0,212,255,0.2)]"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5 active:scale-95"
        )}
      >
        <Bell className="w-4 h-4" />

        {/* Unread indicator */}
        {unreadCount > 0 && (
          <>
            {unreadCount <= 9 ? (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-cyan border-2 border-dark-950" />
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-bold bg-brand-cyan text-dark-950 rounded-full border border-dark-950 shadow-sm leading-tight">
                9+
              </span>
            )}
          </>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-md z-50 animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
          <div className="bg-dark-900/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden shadow-brand-cyan/5">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-cyan/15 text-brand-cyan rounded-full border border-brand-cyan/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-brand-cyan transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04]">
              {loading && notifications.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-start animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.05] shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-3/4 rounded bg-white/[0.06]" />
                        <div className="h-3 w-full rounded bg-white/[0.04]" />
                        <div className="h-2.5 w-1/3 rounded bg-white/[0.03]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 px-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 mb-3">
                    <BellOff className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">No notifications</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                    You're all caught up! Platform announcements and system notices will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = !readIds.includes(n._id);
                  return (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={cn(
                        "p-4 transition-colors cursor-pointer group flex items-start gap-3 relative",
                        isUnread
                          ? "bg-brand-cyan/[0.03] hover:bg-brand-cyan/[0.07]"
                          : "hover:bg-white/[0.03]"
                      )}
                    >
                      {/* Left icon badge */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border transition-all",
                          isUnread
                            ? "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30 shadow-[0_0_10px_rgba(0,212,255,0.15)]"
                            : "bg-white/[0.04] text-slate-400 border-white/[0.06]"
                        )}
                      >
                        <Megaphone className="w-4 h-4" />
                      </div>

                      {/* Notification text details */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4
                            className={cn(
                              "text-xs font-semibold truncate transition-colors",
                              isUnread ? "text-white group-hover:text-brand-cyan" : "text-slate-300"
                            )}
                          >
                            {n.title}
                          </h4>
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed break-words line-clamp-3">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500 font-medium">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{timeAgo(n.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {isAdmin ? (
              <div className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 transition-all group"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Send Broadcast Notification</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.01] text-center">
                <span className="text-[10px] text-slate-500">
                  AlgoArena Broadcast & Announcements
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
