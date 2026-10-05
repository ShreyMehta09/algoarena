import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    primary_email_address_id: string;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string;
  };
};

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    // In dev without a webhook secret, accept all requests
    const body = await req.json() as ClerkUserEvent;
    await handleEvent(body);
    return NextResponse.json({ success: true });
  }

  // Verify the webhook signature
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkUserEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  await handleEvent(evt);
  return NextResponse.json({ success: true });
}

async function handleEvent(evt: ClerkUserEvent) {
  const { type, data } = evt;
  await dbConnect;

  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address;

  if (!primaryEmail) return;

  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined;
  const username =
    data.username ||
    primaryEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

  if (type === "user.created") {
    // Ensure username uniqueness
    let finalUsername = username;
    let attempt = 0;
    while (await User.exists({ username: finalUsername })) {
      attempt++;
      finalUsername = `${username}${attempt}`;
    }

    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        clerkId: data.id,
        email: primaryEmail,
        name,
        username: finalUsername,
        image: data.image_url,
        rating: 1200,
        wins: 0,
        losses: 0,
        role: "USER",
      },
      { upsert: true, returnDocument: 'after' }
    );
  } else if (type === "user.updated") {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: primaryEmail,
        name,
        image: data.image_url,
      }
    );
  } else if (type === "user.deleted") {
    await User.deleteOne({ clerkId: data.id });
  }
}
