/**
 * Judge0 CE API wrapper
 * Docs: https://ce.judge0.com/
 * Using RapidAPI host: judge0-ce.p.rapidapi.com
 */

const JUDGE0_BASE_URL =
  process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";

// Judge0 status codes
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

// Map Judge0 language values to language IDs
export const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  javascript: 63,
  typescript: 74,
  ruby: 72,
  rust: 73,
  csharp: 51,
  go: 60,
};

export type JudgeVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "INTERNAL_ERROR";

export interface TestCaseResult {
  passed: boolean;
  verdict: JudgeVerdict;
  runtime: number | null; // ms
  memory: number | null;  // KB
  stdout: string | null;
  stderr: string | null;
  expectedOutput: string;
  actualOutput: string | null;
}

export interface SubmissionResult {
  verdict: JudgeVerdict;
  testsPassed: number;
  totalTests: number;
  runtime: number | null;
  memory: number | null;
  results: TestCaseResult[];
  message: string;
}

function b64(str: string): string {
  return Buffer.from(str).toString("base64");
}

function fromB64(str: string | null): string {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf8");
}

function mapStatus(statusId: number): JudgeVerdict {
  if (statusId === JUDGE0_STATUS.ACCEPTED) return "ACCEPTED";
  if (statusId === JUDGE0_STATUS.WRONG_ANSWER) return "WRONG_ANSWER";
  if (statusId === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) return "TIME_LIMIT_EXCEEDED";
  if (statusId === JUDGE0_STATUS.COMPILATION_ERROR) return "COMPILATION_ERROR";
  if (
    statusId >= JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV &&
    statusId <= JUDGE0_STATUS.RUNTIME_ERROR_OTHER
  )
    return "RUNTIME_ERROR";
  return "INTERNAL_ERROR";
}

/**
 * Submit a single test case to Judge0 and wait for result
 */
async function submitSingle(
  code: string,
  languageId: number,
  stdin: string,
  expectedOutput: string,
  timeLimit: number = 2,
  memoryLimit: number = 262144
): Promise<{
  statusId: number;
  runtime: number | null;
  memory: number | null;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
}> {
  if (!JUDGE0_API_KEY) {
    throw new Error("JUDGE0_API_KEY is not configured");
  }

  const body = {
    source_code: b64(code),
    language_id: languageId,
    stdin: b64(stdin),
    expected_output: b64(expectedOutput),
    cpu_time_limit: timeLimit,
    memory_limit: memoryLimit,
    base64_encoded: true,
  };

  const submitRes = await fetch(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": JUDGE0_HOST,
      },
      body: JSON.stringify(body),
    }
  );

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`Judge0 submission failed: ${submitRes.status} ${text}`);
  }

  const result = await submitRes.json();

  return {
    statusId: result.status?.id ?? JUDGE0_STATUS.INTERNAL_ERROR,
    runtime: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
    memory: result.memory ?? null,
    stdout: result.stdout ? fromB64(result.stdout) : null,
    stderr: result.stderr ? fromB64(result.stderr) : null,
    compileOutput: result.compile_output ? fromB64(result.compile_output) : null,
  };
}

/**
 * Run code against all test cases and return aggregated result
 */
export async function judgeSubmission(
  code: string,
  language: string,
  testCases: Array<{ input: string; expectedOutput: string }>,
  timeLimit: number = 2,
  memoryLimit: number = 262144
): Promise<SubmissionResult> {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return {
      verdict: "INTERNAL_ERROR",
      testsPassed: 0,
      totalTests: testCases.length,
      runtime: null,
      memory: null,
      results: [],
      message: `Unsupported language: ${language}`,
    };
  }

  if (!JUDGE0_API_KEY) {
    return {
      verdict: "INTERNAL_ERROR",
      testsPassed: 0,
      totalTests: testCases.length,
      runtime: null,
      memory: null,
      results: [],
      message: "Code execution is not configured. Add JUDGE0_API_KEY to .env",
    };
  }

  const results: TestCaseResult[] = [];
  let totalRuntime = 0;
  let maxMemory = 0;
  let firstFailVerdict: JudgeVerdict = "ACCEPTED";
  let allPassed = true;

  for (const tc of testCases) {
    try {
      const raw = await submitSingle(
        code,
        languageId,
        tc.input,
        tc.expectedOutput,
        timeLimit,
        memoryLimit
      );

      const verdict = mapStatus(raw.statusId);
      const passed = verdict === "ACCEPTED";

      if (!passed && allPassed) {
        allPassed = false;
        firstFailVerdict = verdict;
      }

      if (raw.runtime) totalRuntime += raw.runtime;
      if (raw.memory && raw.memory > maxMemory) maxMemory = raw.memory;

      results.push({
        passed,
        verdict,
        runtime: raw.runtime,
        memory: raw.memory,
        stdout: raw.stdout,
        stderr: raw.stderr ?? raw.compileOutput,
        expectedOutput: tc.expectedOutput,
        actualOutput: raw.stdout?.trim() ?? null,
      });

      // Stop early on compilation error (affects all test cases)
      if (verdict === "COMPILATION_ERROR") {
        for (let i = results.length; i < testCases.length; i++) {
          results.push({
            passed: false,
            verdict: "COMPILATION_ERROR",
            runtime: null,
            memory: null,
            stdout: null,
            stderr: raw.compileOutput ?? raw.stderr,
            expectedOutput: testCases[i].expectedOutput,
            actualOutput: null,
          });
        }
        break;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      results.push({
        passed: false,
        verdict: "INTERNAL_ERROR",
        runtime: null,
        memory: null,
        stdout: null,
        stderr: errMsg,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
      });
      allPassed = false;
      firstFailVerdict = "INTERNAL_ERROR";
    }
  }

  const testsPassed = results.filter((r) => r.passed).length;
  const finalVerdict: JudgeVerdict = allPassed ? "ACCEPTED" : firstFailVerdict;

  return {
    verdict: finalVerdict,
    testsPassed,
    totalTests: testCases.length,
    runtime: totalRuntime > 0 ? Math.round(totalRuntime / results.length) : null,
    memory: maxMemory > 0 ? maxMemory : null,
    results,
    message:
      finalVerdict === "ACCEPTED"
        ? `All ${testCases.length} test cases passed!`
        : `${testsPassed}/${testCases.length} test cases passed.`,
  };
}
