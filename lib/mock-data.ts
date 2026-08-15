// Mock data for demo purposes
// In production this would come from the DB via Prisma

export const MOCK_USER = {
  id: "user-1",
  name: "Alex Chen",
  username: "alexchen",
  email: "alex@algoarena.io",
  rating: 1647,
  wins: 42,
  losses: 18,
  image: null,
  createdAt: new Date("2026-01-15"),
};

export const MOCK_PROBLEMS = [
  {
    id: "prob-1",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    solvedCount: 12483,
    acceptanceRate: 78,
    status: "ACCEPTED",
  },
  {
    id: "prob-2",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "MEDIUM",
    tags: ["String", "Sliding Window", "Hash Table"],
    solvedCount: 8921,
    acceptanceRate: 52,
    status: "ATTEMPTED",
  },
  {
    id: "prob-3",
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "HARD",
    tags: ["Array", "Binary Search", "Divide & Conquer"],
    solvedCount: 3241,
    acceptanceRate: 34,
    status: null,
  },
  {
    id: "prob-4",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "EASY",
    tags: ["String", "Stack"],
    solvedCount: 15732,
    acceptanceRate: 82,
    status: "ACCEPTED",
  },
  {
    id: "prob-5",
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "MEDIUM",
    tags: ["Array", "Sorting"],
    solvedCount: 7654,
    acceptanceRate: 48,
    status: null,
  },
  {
    id: "prob-6",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "HARD",
    tags: ["Array", "Two Pointers", "Stack", "Dynamic Programming"],
    solvedCount: 2198,
    acceptanceRate: 28,
    status: null,
  },
  {
    id: "prob-7",
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "EASY",
    tags: ["Array", "Dynamic Programming", "Divide & Conquer"],
    solvedCount: 11209,
    acceptanceRate: 71,
    status: "ACCEPTED",
  },
  {
    id: "prob-8",
    title: "LRU Cache",
    slug: "lru-cache",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "Linked List", "Design"],
    solvedCount: 5432,
    acceptanceRate: 41,
    status: null,
  },
  {
    id: "prob-9",
    title: "Word Ladder",
    slug: "word-ladder",
    difficulty: "HARD",
    tags: ["BFS", "Hash Table", "String"],
    solvedCount: 1876,
    acceptanceRate: 22,
    status: null,
  },
  {
    id: "prob-10",
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "EASY",
    tags: ["Dynamic Programming", "Math"],
    solvedCount: 18904,
    acceptanceRate: 88,
    status: "ACCEPTED",
  },
];

export const MOCK_PROBLEM_DETAIL = {
  id: "prob-2",
  title: "Longest Substring Without Repeating Characters",
  slug: "longest-substring-without-repeating-characters",
  difficulty: "MEDIUM",
  tags: ["String", "Sliding Window", "Hash Table"],
  description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

A **substring** is a contiguous non-empty sequence of characters within a string.`,
  examples: [
    {
      input: 's = "abcabcbb"',
      output: "3",
      explanation:
        'The answer is "abc", with the length of 3.',
    },
    {
      input: 's = "bbbbb"',
      output: "1",
      explanation:
        'The answer is "b", with the length of 1.',
    },
    {
      input: 's = "pwwkew"',
      output: "3",
      explanation:
        'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.',
    },
  ],
  constraints: [
    "0 <= s.length <= 5 * 10⁴",
    "s consists of English letters, digits, symbols and spaces.",
  ],
  timeLimit: 2000,
  memoryLimit: 256,
};

export const MOCK_RECENT_BATTLES = [
  {
    id: "battle-1",
    opponent: { name: "JavaKing", username: "javaking", rating: 1589 },
    problem: { title: "Two Sum", difficulty: "EASY" },
    result: "WIN",
    duration: "4:32",
    ratingChange: +18,
    date: new Date(Date.now() - 3600000),
  },
  {
    id: "battle-2",
    opponent: { name: "PyMaster", username: "pymaster", rating: 1712 },
    problem: { title: "Binary Search Tree Validation", difficulty: "MEDIUM" },
    result: "LOSS",
    duration: "9:14",
    ratingChange: -22,
    date: new Date(Date.now() - 7200000),
  },
  {
    id: "battle-3",
    opponent: { name: "CodeNinja", username: "codeninja", rating: 1623 },
    problem: { title: "Climbing Stairs", difficulty: "EASY" },
    result: "WIN",
    duration: "2:51",
    ratingChange: +15,
    date: new Date(Date.now() - 86400000),
  },
  {
    id: "battle-4",
    opponent: { name: "AlgoWizard", username: "algowizard", rating: 1801 },
    problem: { title: "Merge Intervals", difficulty: "MEDIUM" },
    result: "LOSS",
    duration: "14:07",
    ratingChange: -26,
    date: new Date(Date.now() - 172800000),
  },
  {
    id: "battle-5",
    opponent: { name: "ByteForce", username: "byteforce", rating: 1598 },
    problem: { title: "Valid Parentheses", difficulty: "EASY" },
    result: "WIN",
    duration: "3:19",
    ratingChange: +16,
    date: new Date(Date.now() - 259200000),
  },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: "TuringMachine", username: "turingmachine", rating: 2387, wins: 124, losses: 12, winRate: 91, streak: 8 },
  { rank: 2, name: "BinaryBeast", username: "binarybeast", rating: 2241, wins: 98, losses: 19, winRate: 84, streak: 5 },
  { rank: 3, name: "RecursiveRex", username: "recursiverex", rating: 2189, wins: 87, losses: 24, winRate: 78, streak: 3 },
  { rank: 4, name: "O(1) Oracle", username: "o1oracle", rating: 2102, wins: 76, losses: 28, winRate: 73, streak: 0 },
  { rank: 5, name: "AlgoWizard", username: "algowizard", rating: 1978, wins: 65, losses: 31, winRate: 68, streak: 2 },
  { rank: 6, name: "PyMaster", username: "pymaster", rating: 1891, wins: 58, losses: 34, winRate: 63, streak: 1 },
  { rank: 7, name: "StackSmash", username: "stacksmash", rating: 1834, wins: 54, losses: 38, winRate: 59, streak: 0 },
  { rank: 8, name: "HashHero", username: "hashhero", rating: 1762, wins: 49, losses: 41, winRate: 54, streak: 4 },
  { rank: 9, name: "GraphGuru", username: "graphguru", rating: 1701, wins: 45, losses: 43, winRate: 51, streak: 0 },
  { rank: 10, name: "Alex Chen", username: "alexchen", rating: 1647, wins: 42, losses: 18, winRate: 70, streak: 2, isCurrentUser: true },
  { rank: 11, name: "CodeNinja", username: "codeninja", rating: 1623, wins: 38, losses: 44, winRate: 46, streak: 0 },
  { rank: 12, name: "JavaKing", username: "javaking", rating: 1589, wins: 35, losses: 47, winRate: 43, streak: 1 },
  { rank: 13, name: "ByteForce", username: "byteforce", rating: 1567, wins: 32, losses: 49, winRate: 40, streak: 0 },
  { rank: 14, name: "NullPointer", username: "nullpointer", rating: 1534, wins: 29, losses: 51, winRate: 36, streak: 0 },
  { rank: 15, name: "SegFault", username: "segfault", rating: 1498, wins: 26, losses: 54, winRate: 32, streak: 3 },
];

export const MOCK_RATING_HISTORY = [
  { date: "Jan", rating: 1200 },
  { date: "Feb", rating: 1285 },
  { date: "Mar", rating: 1342 },
  { date: "Apr", rating: 1298 },
  { date: "May", rating: 1415 },
  { date: "Jun", rating: 1489 },
  { date: "Jul", rating: 1521 },
  { date: "Aug", rating: 1647 },
];

export const MOCK_DIFF_BREAKDOWN = [
  { name: "Easy", solved: 24, total: 30, color: "#4ade80" },
  { name: "Medium", solved: 14, total: 45, color: "#fbbf24" },
  { name: "Hard", solved: 4, total: 25, color: "#f87171" },
];

export const LANGUAGES = [
  { id: 71, name: "Python 3", value: "python" },
  { id: 62, name: "Java", value: "java" },
  { id: 54, name: "C++", value: "cpp" },
  { id: 63, name: "JavaScript", value: "javascript" },
  { id: 74, name: "TypeScript", value: "typescript" },
  { id: 72, name: "Ruby", value: "ruby" },
  { id: 73, name: "Rust", value: "rust" },
  { id: 51, name: "C#", value: "csharp" },
];

export const STARTER_CODE: Record<string, string> = {
  python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Your solution here
        pass
`,
  java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your solution here
        return 0;
    }
}
`,
  cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your solution here
        return 0;
    }
};
`,
  javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Your solution here
};
`,
  typescript: `function lengthOfLongestSubstring(s: string): number {
    // Your solution here
    return 0;
};
`,
};
