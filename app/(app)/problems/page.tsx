import dbConnect from "@/lib/mongodb";
import { Problem } from "@/lib/models";
import ProblemsClient from "./ProblemsClient";

export default async function ProblemsPage() {
  await dbConnect;
  
  const problemsRaw = await Problem.find().select("title slug difficulty tags").lean();
  
  const problems = problemsRaw.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    tags: p.tags,
    solvedCount: 0, // Mock for now, would need Submission aggregation
    acceptanceRate: 100, // Mock
    status: null as "ACCEPTED" | "ATTEMPTED" | null,
  }));

  return <ProblemsClient initialProblems={problems} />;
}
