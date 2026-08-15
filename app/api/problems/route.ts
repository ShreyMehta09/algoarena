import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROBLEMS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  let problems = [...MOCK_PROBLEMS];

  if (difficulty && difficulty !== "All") {
    problems = problems.filter(
      (p) => p.difficulty.toUpperCase() === difficulty.toUpperCase()
    );
  }

  if (tag && tag !== "All") {
    problems = problems.filter((p) => p.tags.includes(tag));
  }

  if (search) {
    const q = search.toLowerCase();
    problems = problems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    problems,
    total: problems.length,
  });
}
