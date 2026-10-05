import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { getOrSyncUser } from "@/lib/sync-user";
import { Tournament } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect;
    const user = await getOrSyncUser(userId);
    if (!user || (user.role !== "ADMIN" && user.role !== "PROBLEM_SETTER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    
    // Validate
    if (!data.title || !data.startTime || !data.endTime || !data.problems || data.problems.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const t = await Tournament.create({
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      problems: data.problems.map((p: any) => ({
        problemId: p.problemId,
        maxScore: Number(p.maxScore) || 500
      })),
      creatorId: userId
    });

    return NextResponse.json(t);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
