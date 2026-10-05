import mongoose, { Schema, Document, Model } from "mongoose";

// ─── User ───────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  clerkId: string;          // Clerk user ID (primary external key)
  name?: string;
  email: string;
  username: string;
  image?: string;
  rating: number;
  role: string;
  wins: number;
  losses: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId:  { type: String, required: true, unique: true },
    name:     { type: String },
    email:    { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    image:    { type: String },
    rating:   { type: Number, default: 1200 },
    role:     { type: String, default: "USER" },
    wins:     { type: Number, default: 0 },
    losses:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Problem ─────────────────────────────────────────────────────────────────

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface IExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  examples: IExample[];
  constraints: string;
  testCases: ITestCase[];
  timeLimit: number;
  memoryLimit: number;
  createdAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty:  { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true },
    tags:        [{ type: String }],
    examples:    [{ input: String, output: String, explanation: String }],
    constraints: { type: String, default: "" },
    testCases:   [{ input: String, expectedOutput: String, isHidden: Boolean }],
    timeLimit:   { type: Number, default: 2000 },
    memoryLimit: { type: Number, default: 256 },
  },
  { timestamps: true }
);

// ─── Battle ──────────────────────────────────────────────────────────────────

export interface IBattle extends Document {
  player1Id: string;   // clerkId
  player2Id: string;   // clerkId
  problemId: mongoose.Types.ObjectId;
  status: "WAITING" | "ACTIVE" | "FINISHED";
  winnerId?: string;   // clerkId
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

const BattleSchema = new Schema<IBattle>(
  {
    player1Id: { type: String, required: true },
    player2Id: { type: String, required: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    status:    { type: String, enum: ["WAITING", "ACTIVE", "FINISHED"], default: "WAITING" },
    winnerId:  { type: String },
    startedAt: { type: Date },
    endedAt:   { type: Date },
  },
  { timestamps: true }
);

// ─── Submission ───────────────────────────────────────────────────────────────

export interface ISubmission extends Document {
  userId: string;   // clerkId
  problemId: mongoose.Types.ObjectId;
  battleId?: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: string;
  runtime?: number;
  memory?: number;
  score: number;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId:    { type: String, required: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    battleId:  { type: Schema.Types.ObjectId, ref: "Battle" },
    code:      { type: String, default: "" },
    language:  { type: String, default: "unknown" },
    status:    { type: String, required: true },
    runtime:   { type: Number },
    memory:    { type: Number },
    score:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Model helpers (avoids "Cannot overwrite model" error in hot-reload) ─────

function getModel<T extends Document>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const User = getModel<IUser>("User", UserSchema);
export const Problem = getModel<IProblem>("Problem", ProblemSchema);
export const Battle = getModel<IBattle>("Battle", BattleSchema);
export const Submission = getModel<ISubmission>("Submission", SubmissionSchema);
