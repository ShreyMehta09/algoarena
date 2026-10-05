import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import { getOrSyncUser } from "@/lib/sync-user";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect;

  const user = await getOrSyncUser(userId);

  if (!user) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      rating: user.rating,
      role: user.role,
      wins: user.wins,
      losses: user.losses,
    },
  });
}
