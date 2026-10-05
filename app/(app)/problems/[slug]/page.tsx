import dbConnect from "@/lib/mongodb";
import { Problem } from "@/lib/models";
import { notFound } from "next/navigation";
import ProblemClient from "./ProblemClient";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  await dbConnect;
  const problem = await Problem.findOne({ slug }).lean();
  
  if (!problem) {
    notFound();
  }

  // Serialize object IDs
  const serializedProblem = {
    id: problem._id.toString(),
    title: problem.title,
    slug: problem.slug,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: problem.tags,
    examples: problem.examples.map((ex: any) => ({
      input: ex.input,
      output: ex.output,
      explanation: ex.explanation,
    })),
    constraints: problem.constraints.split("\n"),
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
  };

  return <ProblemClient problem={serializedProblem} />;
}
