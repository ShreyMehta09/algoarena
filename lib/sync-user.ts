import { currentUser } from "@clerk/nextjs/server";
import { User } from "./models";
import dbConnect from "./mongodb";

export async function getOrSyncUser(clerkId: string) {
  await dbConnect;

  let user = await User.findOne({ clerkId });
  if (user) return user;

  // Not found in MongoDB, fetch from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined;
  const baseUsername = clerkUser.username || primaryEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") || "user";

  let finalUsername = baseUsername;
  let attempt = 0;
  while (await User.exists({ username: finalUsername })) {
    attempt++;
    finalUsername = `${baseUsername}${attempt}`;
  }

  // BUG FIX: Use $setOnInsert for defaults so existing fields (like role)
  // are never overwritten on a race-condition re-insert.
  user = await User.findOneAndUpdate(
    { clerkId },
    {
      $setOnInsert: {
        clerkId,
        email: primaryEmail,
        name,
        username: finalUsername,
        image: clerkUser.imageUrl,
        rating: 1200,
        wins: 0,
        losses: 0,
        role: "USER",
        isBanned: false,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return user;
}
