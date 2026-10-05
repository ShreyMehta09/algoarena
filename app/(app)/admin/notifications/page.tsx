import dbConnect from "@/lib/mongodb";
import { Notification } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { Bell, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminNotificationsPage() {
  await dbConnect;
  const history = await Notification.find().sort({ createdAt: -1 }).limit(10).lean();

  async function sendNotification(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const message = formData.get("message") as string;
    
    if (!title || !message) return;

    await dbConnect;
    const { Notification } = await import("@/lib/models");
    await Notification.create({ title, message });
    revalidatePath("/admin/notifications");
    // Also revalidate client layout if we fetch notifications there, but typically it polls or we can revalidate layout
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="p-2 rounded-lg glass border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-purple" />
          System Notifications
        </h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5 border border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-300 mb-4">Send Broadcast</h2>
          <form action={sendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
              <input 
                name="title" 
                type="text" 
                required
                className="w-full bg-dark-900 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-cyan outline-none"
                placeholder="e.g. Server Maintenance"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
              <textarea 
                name="message" 
                rows={4}
                required
                className="w-full bg-dark-900 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-cyan outline-none resize-none"
                placeholder="Message to display to all users..."
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-brand-cyan text-dark-900 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-brand-cyan/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Broadcast Now
            </button>
          </form>
        </div>

        <div className="glass rounded-xl p-5 border border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-300 mb-4">Recent Broadcasts</h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No recent notifications</div>
            ) : (
              history.map((n: any) => (
                <div key={n._id.toString()} className="bg-dark-900/50 rounded-lg p-3 border border-white/[0.04]">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm font-bold text-slate-200">{n.title}</div>
                    <div className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs text-slate-400">{n.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
