import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { connectDatabase } from "../config/db.js";
import { createRedisConnection } from "../config/redis.js";
import { Reel } from "../models/reel.model.js";
import { REEL_QUEUE_NAME } from "../queues/constants.js";
import {
  processVideo,
  uploadProcessedMedia,
} from "../services/media.service.js";

await connectDatabase();

function getProcessingErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown reel processing error";
  }
}

const worker = new Worker(
  REEL_QUEUE_NAME,
  async (job) => {
    const { reelId, inputPath } = job.data;
    const outputDirectory = path.resolve("processed", reelId);

    await fs.rm(outputDirectory, { recursive: true, force: true });
    await Reel.findByIdAndUpdate(reelId, {
      status: "processing",
      progress: 1,
      $unset: { processingError: 1 },
    });

    const updateProgress = async (progress) => {
      await Promise.all([
        job.updateProgress(progress),
        Reel.findByIdAndUpdate(reelId, { progress }),
      ]);
    };

    try {
      const { compressedPath, thumbnailPath } = await processVideo(
        inputPath,
        outputDirectory,
        updateProgress
      );
      const { storage, video, thumbnail } = await uploadProcessedMedia(
        reelId,
        compressedPath,
        thumbnailPath
      );

      await Reel.findByIdAndUpdate(reelId, {
        status: "ready",
        progress: 100,
        videoUrl: video.url,
        thumbnailUrl: thumbnail.url,
        videoFileId: video.fileId,
        thumbnailFileId: thumbnail.fileId,
        storage,
        $unset: { processingError: 1 },
      });

      await Promise.allSettled([
        fs.rm(inputPath, { force: true }),
        fs.rm(outputDirectory, { recursive: true, force: true }),
      ]);

      return { videoUrl: video.url, thumbnailUrl: thumbnail.url };
    } catch (error) {
      const message = getProcessingErrorMessage(error);
      const attempts = job.opts.attempts ?? 1;
      const isFinalAttempt = job.attemptsMade + 1 >= attempts;

      await Reel.findByIdAndUpdate(reelId, {
        status: isFinalAttempt ? "failed" : "queued",
        processingError: message,
      });

      if (isFinalAttempt) {
        await Promise.allSettled([
          fs.rm(inputPath, { force: true }),
          fs.rm(outputDirectory, { recursive: true, force: true }),
        ]);
      }

      throw new Error(message);
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`Reel job ${job.id} completed`);
});

worker.on("failed", async (job, error) => {
  console.error(`Reel job ${job?.id} failed:`, error);
});

worker.on("error", (error) => {
  console.error(`Worker connection error: ${error.message}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, closing worker`);
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log("Reel processing worker started");
