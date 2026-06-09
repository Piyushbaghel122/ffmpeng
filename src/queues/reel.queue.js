import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";
import { REEL_QUEUE_NAME } from "./constants.js";

export const reelQueue = new Queue(REEL_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

let redisWarningShown = false;
reelQueue.on("error", (error) => {
  if (!redisWarningShown) {
    console.warn(`Redis queue unavailable: ${error.message}`);
    redisWarningShown = true;
  }
});
