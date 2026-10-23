"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, X, Check } from "lucide-react";

const STORAGE_CLOSED = "algoarena_closed_toasts";
const STORAGE_READ = "algoarena_read_notifications";

export default function GlobalNotifier() {
  const [notification, setNotification] = useState<any>(null);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/latest", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (!data || !data._id) {
        setNotification(null);
        return;
      }

      // Read closed and read IDs from localStorage
      let closed: string[] = [];
      let read: string[] = [];
      try {
        closed = JSON.parse(localStorage.getItem(STORAGE_CLOSED) || "[]");
        read = JSON.parse(localStorage.getItem(STORAGE_READ) || "[]");
      } catch {}

      if (closed.includes(data._id) || read.includes(data._id)) {
        setNotification(null);
        return;
      }

      // Check if notification is recent (within 48 hours)
      const createdAt = new Date(data.createdAt).getTime();
      const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
      if (ageHours > 48) {
        return;
      }

      setNotification(data);
    } catch {
      // Ignore network errors
    }
  }, []);

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 15000);

    const handleSync = () => {
      fetchLatest();
    };

    window.addEventListener("algoarena:notification-updated", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("algoarena:notification-updated", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [fetchLatest]);

  const handleDismiss = () => {
    if (!notification) return;
    try {
      const closed = JSON.parse(localStorage.getItem(STORAGE_CLOSED) || "[]");
      if (!closed.includes(notification._id)) {
        closed.push(notification._id);
        localStorage.setItem(STORAGE_CLOSED, JSON.stringify(closed));
      }
    } catch {}
    setNotification(null);
  };

  const handleMarkReadAndClose = () => {
    if (!notification) return;
    try {
      const read = JSON.parse(localStorage.getItem(STORAGE_READ) || "[]");
      if (!read.includes(notification._id)) {
        read.push(notification._id);
        localStorage.setItem(STORAGE_READ, JSON.stringify(read));
        window.dispatchEvent(new Event("algoarena:notification-updated"));
      }
    } catch {}
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-dark-900/95 backdrop-blur-xl border border-brand-purple/40 shadow-[0_8px_32px_rgba(168,85,247,0.25)] rounded-2xl p-4 max-w-sm relative group">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-brand-purple/20 p-2.5 rounded-xl text-brand-purple-light border border-brand-purple/30 shrink-0">
            <Bell className="w-5 h-5" />
          </div>

          <div className="pr-6 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple-light bg-brand-purple/15 px-1.5 py-0.5 rounded border border-brand-purple/30">
                Announcement
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1.5">{notification.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notification.message}</p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleMarkReadAndClose}
                className="text-[11px] font-medium text-brand-cyan hover:text-brand-cyan/80 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as read</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
