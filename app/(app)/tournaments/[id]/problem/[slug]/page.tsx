import dbConnect from "@/lib/mongodb";
import { Problem, Tournament, TournamentParticipant } from "@/lib/models";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ProblemClient from "@/app/(app)/problems/[slug]/ProblemClient";

export default async function TournamentProblemPage(props: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await props.params;
  
  await dbConnect;
  
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tournament = await Tournament.findById(id).lean();
  if (!tournament) notFound();

  const participant = await TournamentParticipant.findOne({ tournamentId: id, userId }).lean();
  if (!participant) redirect(`/tournaments/${id}`);

  const now = new Date();
  if (now < new Date(tournament.startTime)) {
    redirect(`/tournaments/${id}`);
  }

  const problem = await Problem.findOne({ slug }).lean();
  
  if (!problem) {
    notFound();
  }

  // Verify the problem is actually part of this tournament
  const isPart = tournament.problems.some((p: any) => p.problemId.toString() === problem._id.toString());
  if (!isPart) {
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
    examples: problem.examples,
    constraints: problem.constraints.split("\n"),
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
  };

  return <ProblemClient problem={serializedProblem} tournamentId={id} />;
}
