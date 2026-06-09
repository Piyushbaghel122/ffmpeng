import IORedis from "ioredis";
import { env } from "./env.js";

export function createRedisConnection() {
  return new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
