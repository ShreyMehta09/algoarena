import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Problem, Submission } from "@/lib/models";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  await dbConnect;

  const filter: Record<string, unknown> = {};

  if (difficulty && difficulty !== "All") {
    filter.difficulty = difficulty.toUpperCase();
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [problems, total] = await Promise.all([
    Problem.find(filter, "title slug difficulty tags createdAt")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Problem.countDocuments(filter),
  ]);

  // Count accepted submissions per problem
  const problemIds = problems.map((p) => p._id);
  const submissionCounts = await Submission.aggregate([
    { $match: { problemId: { $in: problemIds }, status: "ACCEPTED" } },
    { $group: { _id: "$problemId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(submissionCounts.map((s) => [s._id.toString(), s.count]));

  const formatted = problems.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    tags: p.tags,
    solvedCount: countMap.get(p._id.toString()) ?? 0,
  }));

  return NextResponse.json({ problems: formatted, total, page, limit });
}
