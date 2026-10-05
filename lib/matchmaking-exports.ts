// Re-export matchmaking functions alongside Redis availability check
export {
  enqueuePlayer,
  dequeuePlayer,
  findMatch,
  atomicMatch,
  inMemoryQueue,
} from "./matchmaking";

export { isRedisAvailable } from "./redis";
