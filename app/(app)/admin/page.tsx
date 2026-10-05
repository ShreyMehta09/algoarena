import Link from "next/link";
import { Users, FileCode2, Bell, Trophy, ShieldAlert } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getOrSyncUser } from "@/lib/sync-user";
import dbConnect from "@/lib/mongodb";
import { redirect } from "next/navigation";

export default async function AdminOverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await dbConnect;
  const user = await getOrSyncUser(userId);
  if (!user) redirect("/");

  const isAdmin = user.role === "ADMIN";

  const adminLinks = [
    ...(isAdmin ? [{
      title: "Manage Users",
      description: "View, ban, or modify user roles.",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    }] : []),
    {
      title: "Practice Problems",
      description: "Add, edit, or remove practice problems.",
      icon: FileCode2,
      href: "/admin/problems",
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20"
    },
    {
      title: "Arena Matchmaking",
      description: "Manage problems used for 1v1 battles.",
      icon: Trophy,
      href: "/admin/problems?type=arena",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20"
    },
    {
      title: "Tournaments",
      description: "Create and manage competitive tournaments.",
      icon: Trophy, // Reusing trophy or another icon like Swords
      href: "/admin/tournaments",
      color: "text-brand-cyan",
      bg: "bg-brand-cyan/10",
      border: "border-brand-cyan/20"
    },
    ...(isAdmin ? [{
      title: "System Notifications",
      description: "Send global announcements to all online users.",
      icon: Bell,
      href: "/admin/notifications",
      color: "text-brand-purple-light",
      bg: "bg-brand-purple/15",
      border: "border-brand-purple/30"
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group block">
            <div className={`glass rounded-2xl p-5 border ${link.border} hover:bg-white/[0.04] transition-all`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg}`}>
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{link.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-red-500">Danger Zone</h4>
          <p className="text-xs text-slate-400 mt-1">Actions performed in the admin panel are irreversible and affect the live production database.</p>
        </div>
      </div>
    </div>
  );
}
