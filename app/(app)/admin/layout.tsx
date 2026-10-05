import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import { getOrSyncUser } from "@/lib/sync-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await dbConnect;
  const user = await getOrSyncUser(userId);

  if (!user || (user.role !== "ADMIN" && user.role !== "PROBLEM_SETTER")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-black text-white">Access Denied</h1>
        <p className="text-slate-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="glass rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-brand-cyan font-bold flex items-center gap-2">
            Admin Panel
          </h2>
          <p className="text-xs text-slate-400">Manage platform resources</p>
        </div>
      </div>
      
      {children}
    </div>
  );
}
