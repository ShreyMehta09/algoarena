import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seed a demo environment with a starter account and a few practice problems.
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a default demo user that mirrors the onboarding flow in the app.
  const hashedPassword = await bcrypt.hash("Demo1234!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@algoarena.io" },
    update: {},
    create: {
      name: "Alex Chen",
      email: "demo@algoarena.io",
      username: "alexchen",
      password: hashedPassword,
      rating: 1647,
      wins: 42,
      losses: 18,
    },
  });

  console.log(`✅ Created user: ${user.username}`);

  // Create problems
  const problems = [
    {
      title: "Two Sum",
      slug: "two-sum",
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.`,
      difficulty: "EASY",
      tags: JSON.stringify(["Array", "Hash Table"]),
      examples: JSON.stringify([
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
      ]),
      constraints: "2 <= nums.length <= 10^4",
      testCases: JSON.stringify([
        { input: "[2,7,11,15]\n9", expected: "[0,1]" },
        { input: "[3,2,4]\n6", expected: "[1,2]" },
      ]),
      timeLimit: 2000,
      memoryLimit: 256,
    },
    {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
      difficulty: "MEDIUM",
      tags: JSON.stringify(["String", "Sliding Window", "Hash Table"]),
      examples: JSON.stringify([
        { input: 's = "abcabcbb"', output: "3" },
      ]),
      constraints: "0 <= s.length <= 5 * 10^4",
      testCases: JSON.stringify([
        { input: '"abcabcbb"', expected: "3" },
        { input: '"bbbbb"', expected: "1" },
      ]),
      timeLimit: 2000,
      memoryLimit: 256,
    },
    {
      title: "Trapping Rain Water",
      slug: "trapping-rain-water",
      description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
      difficulty: "HARD",
      tags: JSON.stringify(["Array", "Two Pointers", "Stack", "Dynamic Programming"]),
      examples: JSON.stringify([
        { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      ]),
      constraints: "n == height.length, 1 <= n <= 2 * 10^4",
      testCases: JSON.stringify([
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6" },
      ]),
      timeLimit: 2000,
      memoryLimit: 256,
    },
  ];

  for (const p of problems) {
    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    console.log(`✅ Created problem: ${p.title}`);
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
