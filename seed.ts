import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function seed() {
  const dbConnect = (await import("./lib/mongodb")).default;
  const { Problem } = await import("./lib/models");
  
  await dbConnect;
  
  // Wipe out existing problems
  await Problem.deleteMany({});
  console.log("Deleted existing problems.");

  await Problem.create({
    title: "A+B Problem",
    slug: "a-plus-b",
    description: "Read two integers A and B from standard input and output their sum.\n\nInput format:\nA single line containing two space-separated integers A and B.\n\nOutput format:\nPrint the sum of A and B on a single line.",
    difficulty: "EASY",
    tags: ["Math", "Basic"],
    examples: [
      {
        input: "1 2",
        output: "3",
        explanation: "1 + 2 = 3"
      }
    ],
    constraints: "-10^9 <= A, B <= 10^9",
    testCases: [
      { input: "1 2", expectedOutput: "3", isHidden: false },
      { input: "100 200", expectedOutput: "300", isHidden: false },
      { input: "-5 5", expectedOutput: "0", isHidden: true },
      { input: "123456789 987654321", expectedOutput: "1111111110", isHidden: true }
    ],
    timeLimit: 2000,
    memoryLimit: 256
  });

  await Problem.create({
    title: "Reverse a String",
    slug: "reverse-string",
    description: "Read a single word from standard input and print it in reverse.\n\nInput format:\nA single string without spaces.\n\nOutput format:\nThe reversed string.",
    difficulty: "EASY",
    tags: ["String", "Basic"],
    examples: [
      {
        input: "hello",
        output: "olleh",
        explanation: "The reverse of 'hello' is 'olleh'"
      }
    ],
    constraints: "1 <= length of string <= 1000",
    testCases: [
      { input: "hello", expectedOutput: "olleh", isHidden: false },
      { input: "algoarena", expectedOutput: "aneraogla", isHidden: false },
      { input: "a", expectedOutput: "a", isHidden: true },
      { input: "racecar", expectedOutput: "racecar", isHidden: true }
    ],
    timeLimit: 2000,
    memoryLimit: 256
  });

  console.log("Successfully seeded CP-style problems!");
  process.exit(0);
}

seed().catch(console.error);
