import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function seed() {
  const dbConnect = (await import("./lib/mongodb")).default;
  const { Problem } = await import("./lib/models");
  
  await dbConnect;
  
  const count = await Problem.countDocuments();
  if (count > 0) {
    console.log("Problems already exist. Seeding skipped.");
    process.exit(0);
  }

  await Problem.create({
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]", isHidden: false },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]", isHidden: false },
      { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]", isHidden: true }
    ],
    timeLimit: 2000,
    memoryLimit: 256
  });

  console.log("Successfully seeded 'Two Sum' problem!");
  process.exit(0);
}

seed().catch(console.error);
