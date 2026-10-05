import dbConnect from "@/lib/mongodb";
import { Problem } from "@/lib/models";
import ProblemForm from "../../ProblemForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProblemPage({ params }: { params: { id: string } }) {
  await dbConnect;
  const problem = await Problem.findById(params.id).lean();

  if (!problem) {
    notFound();
  }

  // Serialize for client component
  const serialized = {
    id: problem._id.toString(),
    title: problem.title,
    slug: problem.slug,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: JSON.stringify(problem.tags),
    examples: JSON.stringify(problem.examples),
    constraints: problem.constraints,
    testCases: JSON.stringify(problem.testCases),
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/problems" className="p-2 glass rounded-lg hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-black text-white">Edit Problem: {problem.title}</h1>
      </div>

      <ProblemForm problem={serialized} />
    </div>
  );
}
