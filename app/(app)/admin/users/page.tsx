import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminUsersPage() {
  await dbConnect;
  const users = await User.find().sort({ createdAt: -1 }).lean();

  async function toggleAdminRole(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const currentRole = formData.get("currentRole") as string;
    
    await dbConnect;
    const { User } = await import("@/lib/models");
    await User.findByIdAndUpdate(userId, {
      role: currentRole === "ADMIN" ? "USER" : "ADMIN"
    });
    revalidatePath("/admin/users");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Manage Users</h1>
      
      <div className="glass rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-dark-800/40 border-b border-white/[0.06] text-xs uppercase">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {users.map((u: any) => (
              <tr key={u._id.toString()} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">{u.username}</div>
                  <div className="text-xs text-slate-500">{u.clerkId}</div>
                </td>
                <td className="px-4 py-3 text-brand-cyan">{u.rating}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {u.role || "USER"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleAdminRole}>
                    <input type="hidden" name="userId" value={u._id.toString()} />
                    <input type="hidden" name="currentRole" value={u.role || "USER"} />
                    <button type="submit" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      {u.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
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
