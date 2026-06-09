import mongoose from "mongoose";
import { reelQueue } from "../queues/reel.queue.js";

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

export async function getHealth(_request, response) {
  const health = {
    ok: false,
    api: "up",
    mongodb: mongoose.connection.readyState === 1 ? "up" : "down",
    redis: "down",
  };

  try {
    const redis = await withTimeout(
      reelQueue.client,
      1500,
      "Redis connection timed out"
    );
    health.redis =
      (await withTimeout(redis.ping(), 1500, "Redis ping timed out")) === "PONG"
        ? "up"
        : "down";
  } catch {
    health.redis = "down";
  }

  health.ok = health.mongodb === "up" && health.redis === "up";
  response.status(health.ok ? 200 : 503).json(health);
}

export async function getQueueStats(_request, response, next) {
  try {
    const counts = await withTimeout(
      reelQueue.getJobCounts(
        "active",
        "completed",
        "delayed",
        "failed",
        "paused",
        "prioritized",
        "waiting",
        "waiting-children"
      ),
      2000,
      "Redis queue timed out"
    );

    response.json({
      queue: reelQueue.name,
      counts,
      dashboardUrl: "/admin/queues",
    });
  } catch (error) {
    if (error.message === "Redis queue timed out") {
      return response.status(503).json({
        message: "Redis queue is unavailable",
        queue: reelQueue.name,
      });
    }
    next(error);
  }
}
