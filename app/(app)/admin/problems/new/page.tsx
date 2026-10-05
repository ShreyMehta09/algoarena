import ProblemForm from "../ProblemForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProblemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/problems" className="p-2 glass rounded-lg hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-black text-white">Create New Problem</h1>
      </div>

      <ProblemForm />
    </div>
  );
}
