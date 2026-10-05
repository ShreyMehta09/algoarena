import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://shreymehta2023_db_user:dQg3cF62gYSyMkif@cluster0.g0jbq3l.mongodb.net";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const opts = {
    dbName: "algoarena",
    bufferCommands: false,
  };

  return mongoose.connect(MONGODB_URI, opts);
}

// Singleton: reuse existing connection promise in dev (hot-reload)
const dbConnect = globalThis.__mongooseConn ?? connectDB();

if (process.env.NODE_ENV !== "production") {
  globalThis.__mongooseConn = dbConnect;
}

export default dbConnect;
