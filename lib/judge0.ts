/**
 * Code Execution API Wrapper (Switched to Piston API for free, keyless, reliable execution)
 * Docs: https://github.com/engineer-man/piston
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

// Map frontend languages to Piston API runtimes
const PISTON_RUNTIMES: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  ruby: { language: "ruby", version: "3.0.1" },
  rust: { language: "rust", version: "1.68.2" },
  csharp: { language: "csharp", version: "6.12.0" },
  go: { language: "go", version: "1.16.2" },
};

/**
 * Submit a single test case to Piston API
 */
async function submitSingle(
  code: string,
  language: string,
  version: string,
  stdin: string,
  timeLimit: number = 2
): Promise<{
  verdict: JudgeVerdict;
  stdout: string | null;
  stderr: string | null;
}> {
  const body = {
    language,
    version,
    files: [{ content: code }],
    stdin,
    compile_timeout: 10000,
    run_timeout: Math.max(timeLimit * 1000, 3000), // ms
  };

  const submitRes = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    throw new Error(`Piston API failed: ${submitRes.status}`);
  }

  const result = await submitRes.json();

  if (result.compile && result.compile.code !== 0) {
    return {
      verdict: "COMPILATION_ERROR",
      stdout: null,
      stderr: result.compile.output,
    };
  }

  if (result.run.code !== 0) {
    // If it hit timeout or killed
    if (result.run.signal === "SIGKILL" || result.run.signal === "SIGTERM") {
      return {
        verdict: "TIME_LIMIT_EXCEEDED",
        stdout: result.run.stdout,
        stderr: result.run.stderr,
      };
    }
    return {
      verdict: "RUNTIME_ERROR",
      stdout: result.run.stdout,
      stderr: result.run.stderr || result.run.output,
    };
  }

  return {
    verdict: "ACCEPTED",
    stdout: result.run.stdout,
    stderr: result.run.stderr,
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
  memoryLimit: number = 262144 // unused by piston currently
): Promise<SubmissionResult> {
  const runtime = PISTON_RUNTIMES[language];
  if (!runtime) {
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
  let firstFailVerdict: JudgeVerdict = "ACCEPTED";
  let allPassed = true;

  for (const tc of testCases) {
    try {
      const raw = await submitSingle(
        code,
        runtime.language,
        runtime.version,
        tc.input,
        timeLimit
      );

      // Verify output if execution succeeded
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

      results.push({
        passed,
        verdict,
        runtime: null, // Piston does not provide precise per-test runtime metrics
        memory: null,
        stdout: raw.stdout,
        stderr: raw.stderr,
        expectedOutput: tc.expectedOutput,
        actualOutput: raw.stdout?.trim() ?? null,
      });

      // Stop early on compilation error
      if (verdict === "COMPILATION_ERROR") {
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
    runtime: null,
    memory: null,
    results,
    message:
      finalVerdict === "ACCEPTED"
        ? `All ${testCases.length} test cases passed!`
        : `${testsPassed}/${testCases.length} test cases passed.`,
  };
}
