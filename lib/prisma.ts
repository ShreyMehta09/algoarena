import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  let url: string;
  if (rawUrl.startsWith("file:")) {
    // Adapter needs absolute path with forward slashes on Windows
    const filePart = rawUrl.replace(/^file:/, "");
    const absolute = path.resolve(process.cwd(), filePart).replace(/\\/g, "/");
    url = `file:${absolute}`;
  } else {
    url = rawUrl;
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
