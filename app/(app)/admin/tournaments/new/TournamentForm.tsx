"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TournamentForm({ problems }: { problems: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [selectedProblems, setSelectedProblems] = useState<{ problemId: string; maxScore: number }[]>([]);

  const handleAddProblem = () => {
    setSelectedProblems([...selectedProblems, { problemId: problems[0]?.id || "", maxScore: 500 }]);
  };

  const handleRemoveProblem = (index: number) => {
    const newProbs = [...selectedProblems];
    newProbs.splice(index, 1);
    setSelectedProblems(newProbs);
  };

  const handleProblemChange = (index: number, field: string, value: any) => {
    const newProbs = [...selectedProblems];
    newProbs[index] = { ...newProbs[index], [field]: value };
    setSelectedProblems(newProbs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          problems: selectedProblems,
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tournament");
      
      router.push("/admin/tournaments");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
      
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-400">Tournament Title</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2 text-white focus:border-brand-cyan outline-none"
            placeholder="e.g. Weekly Coder's Cup"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-400">Description</label>
        <textarea 
          required 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows={3}
          className="w-full bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2 text-white focus:border-brand-cyan outline-none resize-none"
          placeholder="Tournament rules and details..."
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-400">Start Time (Local)</label>
          <input 
            type="datetime-local" 
            required 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
            className="w-full bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2 text-white focus:border-brand-cyan outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-400">End Time (Local)</label>
          <input 
            type="datetime-local" 
            required 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
            className="w-full bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2 text-white focus:border-brand-cyan outline-none"
          />
        </div>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Problems</h3>
          <button type="button" onClick={handleAddProblem} className="flex items-center gap-1 text-sm font-bold text-brand-cyan hover:text-brand-cyan-light transition-colors">
            <Plus className="w-4 h-4" /> Add Problem
          </button>
        </div>
        
        {selectedProblems.length === 0 && (
          <div className="text-sm text-slate-500 py-4 text-center glass rounded-xl border border-dashed border-white/[0.1]">
            No problems added yet. Click "Add Problem" to start building the set.
          </div>
        )}
        
        {selectedProblems.map((sp, idx) => (
          <div key={idx} className="flex items-end gap-3 p-3 bg-dark-900/50 rounded-xl border border-white/[0.04]">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-400">Select Problem</label>
              <select 
                value={sp.problemId} 
                onChange={(e) => handleProblemChange(idx, "problemId", e.target.value)}
                className="w-full bg-dark-900 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-cyan outline-none"
              >
                {problems.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>
                ))}
              </select>
            </div>
            <div className="w-32 space-y-1">
              <label className="text-xs font-medium text-slate-400">Max Score</label>
              <input 
                type="number" 
                value={sp.maxScore} 
                onChange={(e) => handleProblemChange(idx, "maxScore", Number(e.target.value))}
                className="w-full bg-dark-900 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-cyan outline-none"
              />
            </div>
            <button type="button" onClick={() => handleRemoveProblem(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="pt-6">
        <Button type="submit" variant="primary" disabled={loading} className="w-full text-dark-900 font-bold">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Tournament"}
        </Button>
      </div>
    </form>
  );
}
