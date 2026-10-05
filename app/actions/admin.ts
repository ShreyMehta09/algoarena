"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import { User, Problem } from "@/lib/models";
import { getOrSyncUser } from "@/lib/sync-user";

async function verifyAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect;
  const user = await getOrSyncUser(userId);
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createProblem(formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as string;
  const tagsStr = formData.get("tags") as string;
  const examplesStr = formData.get("examples") as string;
  const constraints = formData.get("constraints") as string;
  const testCasesStr = formData.get("testCases") as string;
  const timeLimit = parseInt((formData.get("timeLimit") as string) || "2000");
  const memoryLimit = parseInt((formData.get("memoryLimit") as string) || "256");

  try {
    const tags = JSON.parse(tagsStr);
    const examples = JSON.parse(examplesStr);
    const testCases = JSON.parse(testCasesStr);

    await dbConnect;
    await Problem.create({
      title,
      slug,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      timeLimit,
      memoryLimit,
    });

    revalidatePath("/admin/problems");
    revalidatePath("/problems");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to create problem" };
  }
}

export async function updateProblem(id: string, formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as string;
  const tagsStr = formData.get("tags") as string;
  const examplesStr = formData.get("examples") as string;
  const constraints = formData.get("constraints") as string;
  const testCasesStr = formData.get("testCases") as string;
  const timeLimit = parseInt((formData.get("timeLimit") as string) || "2000");
  const memoryLimit = parseInt((formData.get("memoryLimit") as string) || "256");

  try {
    const tags = JSON.parse(tagsStr);
    const examples = JSON.parse(examplesStr);
    const testCases = JSON.parse(testCasesStr);

    await dbConnect;
    await Problem.findByIdAndUpdate(id, {
      title,
      slug,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      timeLimit,
      memoryLimit,
    });

    revalidatePath("/admin/problems");
    revalidatePath(`/problems/${slug}`);
    revalidatePath("/problems");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to update problem" };
  }
}
