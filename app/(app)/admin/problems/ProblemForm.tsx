"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProblem, updateProblem } from "@/app/actions/admin";

export default function ProblemForm({ problem }: { problem?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = problem 
      ? await updateProblem(problem.id, formData)
      : await createProblem(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/admin/problems");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass rounded-2xl p-6 border border-white/[0.06]">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Title</label>
          <input 
            name="title" 
            defaultValue={problem?.title} 
            required 
            className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Slug</label>
          <input 
            name="slug" 
            defaultValue={problem?.slug} 
            required 
            className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
        <select 
          name="difficulty" 
          defaultValue={problem?.difficulty || "EASY"}
          className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Description (Markdown)</label>
        <textarea 
          name="description" 
          defaultValue={problem?.description} 
          required 
          rows={5}
          className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white font-mono text-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tags (JSON Array)</label>
          <textarea 
            name="tags" 
            defaultValue={problem?.tags || '["Array", "Hash Table"]'} 
            required 
            rows={3}
            className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Constraints (Text)</label>
          <textarea 
            name="constraints" 
            defaultValue={problem?.constraints} 
            required 
            rows={3}
            className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Examples (JSON Array)</label>
        <textarea 
          name="examples" 
          defaultValue={problem?.examples || '[{"input": "nums = [2,7]", "output": "[0,1]"}]'} 
          required 
          rows={5}
          className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Test Cases (JSON Array for Judge0)</label>
        <textarea 
          name="testCases" 
          defaultValue={problem?.testCases || '[{"input": "2 7\\n9", "expectedOutput": "0 1"}]'} 
          required 
          rows={5}
          className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white font-mono text-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Time Limit (ms)</label>
          <input 
            name="timeLimit" 
            type="number"
            defaultValue={problem?.timeLimit || 2000} 
            required 
            className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Memory Limit (MB)</label>
          <input 
            name="memoryLimit" 
            type="number"
            defaultValue={problem?.memoryLimit || 256} 
            required 
            className="w-full bg-dark-800 border border-white/[0.06] rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn-primary w-full py-3 rounded-xl font-bold mt-4"
      >
        {loading ? "Saving..." : problem ? "Update Problem" : "Create Problem"}
      </button>
    </form>
  );
}
