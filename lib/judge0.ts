/**
 * Code Execution API Wrapper (onlinecompiler.io)
 */

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

const COMPILER_MAP: Record<string, string> = {
  python: "python-3.14",
  java: "openjdk-25",
  cpp: "g++-15",
  c: "gcc-15",
  javascript: "typescript-deno", // Deno supports JS
  typescript: "typescript-deno",
  ruby: "ruby-4.0",
  rust: "rust-1.93",
  csharp: "dotnet-csharp-9",
  go: "go-1.26",
};

async function submitSingle(
  code: string,
  compiler: string,
  stdin: string,
  language: string
): Promise<{
  verdict: JudgeVerdict;
  stdout: string | null;
  stderr: string | null;
  runtime: number | null;
  memory: number | null;
}> {
  const apiKey = process.env.ONLINECOMPILER_API_KEY;
  if (!apiKey) {
    throw new Error("ONLINECOMPILER_API_KEY is not configured");
  }

  const body = {
    compiler,
    code,
    input: stdin,
  };

  const res = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": apiKey, // As per our tests, it expects just the key or it works this way
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Execution API failed: ${res.status}`);
  }

  const result = await res.json();

  if (result.error && result.error.includes("Invalid or inactive API key")) {
      throw new Error("Invalid API Key");
  }

  const runtimeMs = result.time ? parseFloat(result.time) * 1000 : null;
  const memoryKb = result.memory ? parseInt(result.memory, 10) : null;

  if (result.exit_code !== 0) {
    return {
      verdict: "RUNTIME_ERROR",
      stdout: result.output || null,
      stderr: result.error || null,
      runtime: runtimeMs,
      memory: memoryKb,
    };
  }

  return {
    verdict: "ACCEPTED",
    stdout: result.output || null,
    stderr: result.error || null,
    runtime: runtimeMs,
    memory: memoryKb,
  };
}

export async function judgeSubmission(
  code: string,
  language: string,
  testCases: Array<{ input: string; expectedOutput: string }>,
  timeLimit: number = 2,
  memoryLimit: number = 262144
): Promise<SubmissionResult> {
  const compiler = COMPILER_MAP[language];
  if (!compiler) {
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

  const results: TestCaseResult[] = [];
  let totalRuntime = 0;
  let maxMemory = 0;
  let firstFailVerdict: JudgeVerdict = "ACCEPTED";
  let allPassed = true;

  for (const tc of testCases) {
    try {
      const raw = await submitSingle(code, compiler, tc.input, language);

      let verdict = raw.verdict;
      const actualOutput = raw.stdout?.trim() ?? "";
      const expectedOutput = tc.expectedOutput.trim();

      if (verdict === "ACCEPTED") {
        if (actualOutput !== expectedOutput) {
          verdict = "WRONG_ANSWER";
        }
      }

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
        stderr: raw.stderr,
        expectedOutput: tc.expectedOutput,
        actualOutput: raw.stdout?.trim() ?? null,
      });

      // Stop on compilation/syntax error
      if (verdict === "COMPILATION_ERROR" || (verdict === "RUNTIME_ERROR" && raw.stderr?.toLowerCase().includes("syntax"))) {
        for (let i = results.length; i < testCases.length; i++) {
          results.push({
            passed: false,
            verdict: "COMPILATION_ERROR",
            runtime: null,
            memory: null,
            stdout: null,
            stderr: raw.stderr,
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
