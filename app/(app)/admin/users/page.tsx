import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import { Shield, ShieldAlert, ShieldCheck, Ban, ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrSyncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await dbConnect;
  const user = await getOrSyncUser(userId);
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const users = await User.find().sort({ createdAt: -1 }).lean();

  async function updateRole(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const newRole = formData.get("role") as string;
    
    await dbConnect;
    const { User } = await import("@/lib/models");
    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath("/admin/users");
  }

  async function toggleBan(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const isBanned = formData.get("isBanned") === "true";
    
    await dbConnect;
    const { User } = await import("@/lib/models");
    await User.findByIdAndUpdate(userId, { isBanned: !isBanned });
    revalidatePath("/admin/users");
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
        <h1 className="text-xl font-bold text-white">Manage Users</h1>
      </div>
      
      <div className="glass rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-dark-800/40 border-b border-white/[0.06] text-xs uppercase">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {users.map((u: any) => (
              <tr key={u._id.toString()} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    {u.username}
                    {u.isBanned && <Ban className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <div className="text-xs text-slate-500">{u.clerkId}</div>
                </td>
                <td className="px-4 py-3 text-brand-cyan">{u.rating}</td>
                <td className="px-4 py-3">
                  {u.isBanned ? (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">BANNED</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400">ACTIVE</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <form action={updateRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u._id.toString()} />
                    <select 
                      key={u.role}
                      name="role" 
                      defaultValue={u.role || "USER"}
                      className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border border-transparent focus:border-brand-cyan transition-colors cursor-pointer ${
                        u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                        u.role === 'PROBLEM_SETTER' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      <option value="USER" className="bg-dark-900 text-slate-400">USER</option>
                      <option value="PROBLEM_SETTER" className="bg-dark-900 text-yellow-400">PROBLEM SETTER</option>
                      <option value="ADMIN" className="bg-dark-900 text-red-400">ADMIN</option>
                    </select>
                    <button type="submit" className="text-[10px] uppercase font-bold text-slate-400 hover:text-white px-2 py-1 bg-white/[0.04] rounded hover:bg-white/[0.08] transition-colors">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleBan}>
                    <input type="hidden" name="userId" value={u._id.toString()} />
                    <input type="hidden" name="isBanned" value={u.isBanned ? "true" : "false"} />
                    <button 
                      type="submit" 
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        u.isBanned 
                          ? 'border-green-500/20 text-green-400 hover:bg-green-500/10' 
                          : 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
