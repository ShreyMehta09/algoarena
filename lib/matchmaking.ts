import redis from "./redis";

const QUEUE_KEY = "matchmaking:queue";
const QUEUE_META_PREFIX = "matchmaking:meta:";

export interface QueueEntry {
  userId: string;
  username: string;
  rating: number;
  ratingRange: number;
  difficulty: string;
  joinedAt: number;
}

/**
 * Add a player to the matchmaking queue.
 * Uses a sorted set scored by Elo rating for O(log N) range lookups.
 */
export async function enqueuePlayer(entry: QueueEntry): Promise<void> {
  const { userId, rating } = entry;

  // Store full metadata in a hash
  await redis.set(
    `${QUEUE_META_PREFIX}${userId}`,
    JSON.stringify(entry),
    "EX",
    120 // expire after 2 minutes if client disconnects without cleanup
  );

  // Add to sorted set by rating
  await redis.zadd(QUEUE_KEY, rating, userId);
}

/**
 * Remove a player from the matchmaking queue.
 */
export async function dequeuePlayer(userId: string): Promise<void> {
  await Promise.all([
    redis.zrem(QUEUE_KEY, userId),
    redis.del(`${QUEUE_META_PREFIX}${userId}`),
  ]);
}

/**
 * Find a suitable match for the given player.
 * Returns the matched player's metadata or null if no match found.
 */
export async function findMatch(
  userId: string,
  rating: number,
  ratingRange: number,
  difficulty: string
): Promise<QueueEntry | null> {
  const minScore = rating - ratingRange;
  const maxScore = rating + ratingRange;

  // Get candidates within rating range
  const candidates = await redis.zrangebyscore(QUEUE_KEY, minScore, maxScore);

  for (const candidateId of candidates) {
    if (candidateId === userId) continue;

    const metaRaw = await redis.get(`${QUEUE_META_PREFIX}${candidateId}`);
    if (!metaRaw) {
      // Stale entry, clean up
      await redis.zrem(QUEUE_KEY, candidateId);
      continue;
    }

    const meta: QueueEntry = JSON.parse(metaRaw);

    // Check difficulty compatibility (Any matches Any)
    const difficultyOk =
      difficulty === "Any" ||
      meta.difficulty === "Any" ||
      difficulty === meta.difficulty;

    if (difficultyOk) {
      return meta;
    }
  }

  return null;
}

/**
 * Atomically match two players: remove both from queue and return their metadata.
 */
export async function atomicMatch(
  player1Id: string,
  player2: QueueEntry
): Promise<{ player1Meta: QueueEntry; player2Meta: QueueEntry } | null> {
  const player1MetaRaw = await redis.get(`${QUEUE_META_PREFIX}${player1Id}`);
  if (!player1MetaRaw) return null;

  const player1Meta: QueueEntry = JSON.parse(player1MetaRaw);

  // Remove both from queue
  await Promise.all([
    dequeuePlayer(player1Id),
    dequeuePlayer(player2.userId),
  ]);

  return { player1Meta, player2Meta: player2 };
}

/**
 * In-memory fallback queue (used when Redis is unavailable)
 */
const memQueue = new Map<string, QueueEntry>();

export const inMemoryQueue = {
  enqueue(entry: QueueEntry) {
    memQueue.set(entry.userId, entry);
  },
  dequeue(userId: string) {
    memQueue.delete(userId);
  },
  findMatch(userId: string, rating: number, ratingRange: number, difficulty: string): QueueEntry | null {
    for (const [id, entry] of memQueue) {
      if (id === userId) continue;
      const ratingOk = Math.abs(entry.rating - rating) <= ratingRange;
      const diffOk = difficulty === "Any" || entry.difficulty === "Any" || difficulty === entry.difficulty;
      if (ratingOk && diffOk) return entry;
    }
    return null;
  },
};
