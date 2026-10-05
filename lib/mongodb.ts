import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const opts = {
    dbName: "algoarena",
    bufferCommands: false,
  };

  return mongoose.connect(MONGODB_URI as string, opts);
}

// Lazy connection: only initialize when `await dbConnect` is called.
const dbConnect = {
  then(resolve: any, reject: any) {
    if (!globalThis.__mongooseConn) {
      globalThis.__mongooseConn = connectDB();
    }
    return globalThis.__mongooseConn.then(resolve, reject);
  }
};

export default dbConnect;
