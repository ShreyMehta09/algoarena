import { judgeSubmission } from "./lib/judge0";
judgeSubmission("print(1)", "python", [{input: "", expectedOutput: "1"}]).then(console.log).catch(console.error);
