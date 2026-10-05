"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export default function GlobalNotifier() {
  const [notification, setNotification] = useState<any>(null);
  const [closed, setClosed] = useState<string[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/notifications/latest");
        const data = await res.json();
        if (data && !closed.includes(data._id)) {
          setNotification(data);
        }
      } catch (err) {}
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 15000);
    return () => clearInterval(interval);
  }, [closed]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-brand-purple/20 backdrop-blur-xl border border-brand-purple/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] rounded-2xl p-4 max-w-sm relative">
        <button 
          onClick={() => {
            setClosed([...closed, notification._id]);
            setNotification(null);
          }}
          className="absolute top-3 right-3 text-brand-purple hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="bg-brand-purple/20 p-2 rounded-lg text-brand-purple-light">
            <Bell className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h4 className="text-sm font-bold text-white">{notification.title}</h4>
            <p className="text-xs text-slate-300 mt-1">{notification.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
