import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const PROBLEMS = [
  // --- PRACTICE PROBLEMS (EASY) ---
  {
    title: "Maximum Element", slug: "maximum-element", difficulty: "EASY", tags: ["Array"], isArena: false,
    description: "Given an array of integers, output the maximum element.\n\nInput format:\nFirst line contains N, number of elements.\nSecond line contains N space-separated integers.\n\nOutput format:\nA single integer, the maximum element.",
    examples: [{ input: "5\n1 4 2 9 3", output: "9" }],
    constraints: "1 <= N <= 1000\n-10^9 <= arr[i] <= 10^9",
    testCases: [
      { input: "5\n1 4 2 9 3", expectedOutput: "9", isHidden: false },
      { input: "3\n-1 -5 -3", expectedOutput: "-1", isHidden: true }
    ]
  },
  {
    title: "Palindrome Check", slug: "palindrome-check", difficulty: "EASY", tags: ["String"], isArena: false,
    description: "Given a string, check if it's a palindrome.\n\nInput format:\nA single string (no spaces).\n\nOutput format:\nPrint 'YES' or 'NO'.",
    examples: [{ input: "racecar", output: "YES" }],
    constraints: "1 <= length <= 1000",
    testCases: [
      { input: "racecar", expectedOutput: "YES", isHidden: false },
      { input: "hello", expectedOutput: "NO", isHidden: false },
      { input: "a", expectedOutput: "YES", isHidden: true }
    ]
  },
  {
    title: "Factorial", slug: "factorial", difficulty: "EASY", tags: ["Math"], isArena: false,
    description: "Calculate the factorial of N.\n\nInput format:\nA single integer N.\n\nOutput format:\nN!",
    examples: [{ input: "5", output: "120" }],
    constraints: "0 <= N <= 15",
    testCases: [
      { input: "5", expectedOutput: "120", isHidden: false },
      { input: "0", expectedOutput: "1", isHidden: true },
      { input: "10", expectedOutput: "3628800", isHidden: true }
    ]
  },
  {
    title: "Fibonacci Sequence", slug: "fibonacci", difficulty: "EASY", tags: ["Math"], isArena: false,
    description: "Print the Nth Fibonacci number (0-indexed where F(0)=0, F(1)=1).\n\nInput format:\nA single integer N.\n\nOutput format:\nF(N)",
    examples: [{ input: "5", output: "5" }],
    constraints: "0 <= N <= 40",
    testCases: [
      { input: "5", expectedOutput: "5", isHidden: false },
      { input: "0", expectedOutput: "0", isHidden: true },
      { input: "10", expectedOutput: "55", isHidden: true }
    ]
  },
  {
    title: "Sum of Digits", slug: "sum-of-digits", difficulty: "EASY", tags: ["Math"], isArena: false,
    description: "Calculate the sum of digits of a given number.\n\nInput format:\nA single integer N.\n\nOutput format:\nSum of its digits.",
    examples: [{ input: "123", output: "6" }],
    constraints: "0 <= N <= 10^9",
    testCases: [
      { input: "123", expectedOutput: "6", isHidden: false },
      { input: "999", expectedOutput: "27", isHidden: true }
    ]
  },
  {
    title: "Check Prime", slug: "check-prime", difficulty: "MEDIUM", tags: ["Math"], isArena: false,
    description: "Check if a number is prime.\n\nInput format:\nA single integer N.\n\nOutput format:\n'YES' or 'NO'.",
    examples: [{ input: "7", output: "YES" }],
    constraints: "1 <= N <= 10^9",
    testCases: [
      { input: "7", expectedOutput: "YES", isHidden: false },
      { input: "10", expectedOutput: "NO", isHidden: false },
      { input: "1", expectedOutput: "NO", isHidden: true }
    ]
  },
  {
    title: "Count Vowels", slug: "count-vowels", difficulty: "EASY", tags: ["String"], isArena: false,
    description: "Count the number of vowels in a string.\n\nInput format:\nA single string.\n\nOutput format:\nInteger count.",
    examples: [{ input: "algoarena", output: "5" }],
    constraints: "1 <= length <= 1000",
    testCases: [
      { input: "algoarena", expectedOutput: "5", isHidden: false },
      { input: "rhythm", expectedOutput: "0", isHidden: true }
    ]
  },
  {
    title: "Matrix Trace", slug: "matrix-trace", difficulty: "MEDIUM", tags: ["Array"], isArena: false,
    description: "Calculate the trace of an NxN matrix.\n\nInput format:\nN, followed by N lines of N integers.\n\nOutput format:\nThe trace (sum of main diagonal).",
    examples: [{ input: "2\n1 2\n3 4", output: "5" }],
    constraints: "1 <= N <= 100",
    testCases: [
      { input: "2\n1 2\n3 4", expectedOutput: "5", isHidden: false },
      { input: "3\n1 0 0\n0 1 0\n0 0 1", expectedOutput: "3", isHidden: true }
    ]
  },
  {
    title: "Sort Array", slug: "sort-array", difficulty: "EASY", tags: ["Sorting"], isArena: false,
    description: "Sort an array of integers in ascending order.\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nN space-separated integers.",
    examples: [{ input: "4\n3 1 4 2", output: "1 2 3 4" }],
    constraints: "1 <= N <= 1000",
    testCases: [
      { input: "4\n3 1 4 2", expectedOutput: "1 2 3 4", isHidden: false }
    ]
  },
  {
    title: "Unique Elements", slug: "unique-elements", difficulty: "MEDIUM", tags: ["Hash Table"], isArena: false,
    description: "Count unique elements in an array.\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nCount of unique elements.",
    examples: [{ input: "5\n1 2 2 3 1", output: "3" }],
    constraints: "1 <= N <= 1000",
    testCases: [
      { input: "5\n1 2 2 3 1", expectedOutput: "3", isHidden: false }
    ]
  },

  // --- ARENA PROBLEMS (MEDIUM/HARD) ---
  {
    title: "Two Sum (CP)", slug: "arena-two-sum", difficulty: "MEDIUM", tags: ["Array"], isArena: true,
    description: "Given an array and a target, find if there are two numbers that add up to target.\n\nInput format:\nN and target, followed by N integers.\n\nOutput format:\n'YES' or 'NO'.",
    examples: [{ input: "4 9\n2 7 11 15", output: "YES" }],
    constraints: "2 <= N <= 1000\n-10^9 <= target <= 10^9",
    testCases: [
      { input: "4 9\n2 7 11 15", expectedOutput: "YES", isHidden: false },
      { input: "3 6\n3 2 4", expectedOutput: "YES", isHidden: true },
      { input: "2 10\n1 2", expectedOutput: "NO", isHidden: true }
    ]
  },
  {
    title: "Anagram Check", slug: "arena-anagram", difficulty: "MEDIUM", tags: ["String"], isArena: true,
    description: "Check if two strings are anagrams of each other.\n\nInput format:\nTwo space-separated strings.\n\nOutput format:\n'YES' or 'NO'.",
    examples: [{ input: "listen silent", output: "YES" }],
    constraints: "1 <= length <= 1000",
    testCases: [
      { input: "listen silent", expectedOutput: "YES", isHidden: false },
      { input: "hello world", expectedOutput: "NO", isHidden: true }
    ]
  },
  {
    title: "Missing Number", slug: "arena-missing", difficulty: "EASY", tags: ["Math"], isArena: true,
    description: "Given an array of N-1 numbers in the range [1, N], find the missing number.\n\nInput format:\nN, followed by N-1 integers.\n\nOutput format:\nThe missing integer.",
    examples: [{ input: "5\n1 2 4 5", output: "3" }],
    constraints: "2 <= N <= 10000",
    testCases: [
      { input: "5\n1 2 4 5", expectedOutput: "3", isHidden: false },
      { input: "3\n1 3", expectedOutput: "2", isHidden: true }
    ]
  },
  {
    title: "Valid Parentheses", slug: "arena-valid-parens", difficulty: "MEDIUM", tags: ["Stack"], isArena: true,
    description: "Given a string of '(', ')', '{', '}', '[' and ']', determine if it's valid.\n\nInput format:\nA single string.\n\nOutput format:\n'YES' or 'NO'.",
    examples: [{ input: "()[]{}", output: "YES" }],
    constraints: "1 <= length <= 1000",
    testCases: [
      { input: "()[]{}", expectedOutput: "YES", isHidden: false },
      { input: "(]", expectedOutput: "NO", isHidden: true },
      { input: "([)]", expectedOutput: "NO", isHidden: true }
    ]
  },
  {
    title: "Majority Element", slug: "arena-majority", difficulty: "MEDIUM", tags: ["Array"], isArena: true,
    description: "Find the majority element that appears more than N/2 times.\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nThe majority element.",
    examples: [{ input: "3\n3 2 3", output: "3" }],
    constraints: "1 <= N <= 1000 (N is odd)\nMajority element always exists.",
    testCases: [
      { input: "3\n3 2 3", expectedOutput: "3", isHidden: false },
      { input: "7\n2 2 1 1 1 2 2", expectedOutput: "2", isHidden: true }
    ]
  },
  {
    title: "Single Number", slug: "arena-single-num", difficulty: "MEDIUM", tags: ["Bit Manipulation"], isArena: true,
    description: "Every element appears twice except for one. Find it.\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nThe single element.",
    examples: [{ input: "3\n2 2 1", output: "1" }],
    constraints: "1 <= N <= 1000 (N is odd)",
    testCases: [
      { input: "3\n2 2 1", expectedOutput: "1", isHidden: false },
      { input: "5\n4 1 2 1 2", expectedOutput: "4", isHidden: true }
    ]
  },
  {
    title: "Move Zeros", slug: "arena-move-zeros", difficulty: "EASY", tags: ["Two Pointers"], isArena: true,
    description: "Move all zeros to the end while maintaining the order of non-zero elements.\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nN space-separated integers.",
    examples: [{ input: "5\n0 1 0 3 12", output: "1 3 12 0 0" }],
    constraints: "1 <= N <= 1000",
    testCases: [
      { input: "5\n0 1 0 3 12", expectedOutput: "1 3 12 0 0", isHidden: false }
    ]
  },
  {
    title: "Find Peak Element", slug: "arena-peak", difficulty: "HARD", tags: ["Binary Search"], isArena: true,
    description: "Find a peak element (element strictly greater than neighbors). Return its 0-based index. If multiple, return any.\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nA valid index.",
    examples: [{ input: "4\n1 2 3 1", output: "2" }],
    constraints: "1 <= N <= 1000",
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "2", isHidden: false },
      { input: "1\n5", expectedOutput: "0", isHidden: true }
    ]
  },
  {
    title: "Rotate Array", slug: "arena-rotate", difficulty: "MEDIUM", tags: ["Array"], isArena: true,
    description: "Rotate array to the right by K steps.\n\nInput format:\nN and K, followed by N integers.\n\nOutput format:\nN space-separated integers.",
    examples: [{ input: "7 3\n1 2 3 4 5 6 7", output: "5 6 7 1 2 3 4" }],
    constraints: "1 <= N <= 1000\n0 <= K <= 10^5",
    testCases: [
      { input: "7 3\n1 2 3 4 5 6 7", expectedOutput: "5 6 7 1 2 3 4", isHidden: false }
    ]
  },
  {
    title: "Max Subarray Sum", slug: "arena-kadane", difficulty: "HARD", tags: ["Dynamic Programming"], isArena: true,
    description: "Find the maximum subarray sum (Kadane's Algorithm).\n\nInput format:\nN, followed by N integers.\n\nOutput format:\nThe maximum sum.",
    examples: [{ input: "5\n-2 1 -3 4 -1", output: "4" }],
    constraints: "1 <= N <= 1000",
    testCases: [
      { input: "5\n-2 1 -3 4 -1", expectedOutput: "4", isHidden: false },
      { input: "4\n-1 -2 -3 -4", expectedOutput: "-1", isHidden: true }
    ]
  }
];

async function seed() {
  const dbConnect = (await import("./lib/mongodb")).default;
  const { Problem } = await import("./lib/models");
  
  await dbConnect;
  
  // Wipe out existing problems? Or just insert new ones?
  // We'll insert ignoring duplicates
  let count = 0;
  for (const p of PROBLEMS) {
    try {
      await Problem.findOneAndUpdate(
        { slug: p.slug },
        { ...p, timeLimit: 2000, memoryLimit: 256 },
        { upsert: true, new: true }
      );
      count++;
    } catch (err: any) {
      console.error(`Failed to insert ${p.title}:`, err.message);
    }
  }

  console.log(`Successfully seeded ${count} new problems!`);
  process.exit(0);
}

seed().catch(console.error);
