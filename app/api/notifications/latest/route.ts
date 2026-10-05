import dbConnect from "@/lib/mongodb";
import { Notification } from "@/lib/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect;
    const latest = await Notification.findOne().sort({ createdAt: -1 }).lean();
    return NextResponse.json(latest || null);
  } catch (error) {
    return NextResponse.json(null);
  }
}
