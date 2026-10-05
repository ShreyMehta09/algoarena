import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ / blocking commands; set to null for ioredis v5+
    enableOfflineQueue: false,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy(times) {
      // Exponential backoff capped at 30 s, stop after 5 retries
      if (times > 5) return null; // stop retrying
      return Math.min(times * 500, 5000);
    },
  });

  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Redis] Connection error:", err.message);
    }
  });

  client.on("connect", () => {
    console.log("[Redis] Connected to", REDIS_URL);
  });

  return client;
}

// Singleton to avoid multiple connections in dev (hot-reload)
const redis = globalThis.__redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__redis = redis;
}

export default redis;

/** Check if Redis is reachable */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    // connect() is idempotent when lazyConnect:true
    await redis.connect().catch(() => {});
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}
