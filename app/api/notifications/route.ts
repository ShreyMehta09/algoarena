import dbConnect from "@/lib/mongodb";
import { Notification } from "@/lib/models";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect;
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const formatted = notifications.map((n: any) => ({
      _id: n._id.toString(),
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
    }));

    return NextResponse.json(
      { notifications: formatted },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    await dbConnect;
    await Notification.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
