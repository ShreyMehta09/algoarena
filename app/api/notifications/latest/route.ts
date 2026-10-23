import dbConnect from "@/lib/mongodb";
import { Notification } from "@/lib/models";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect;
    const latest = await Notification.findOne().sort({ createdAt: -1 }).lean();
    if (!latest) {
      return NextResponse.json(null, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }
    return NextResponse.json(
      {
        _id: latest._id.toString(),
        title: latest.title,
        message: latest.message,
        createdAt: latest.createdAt,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching latest notification:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
