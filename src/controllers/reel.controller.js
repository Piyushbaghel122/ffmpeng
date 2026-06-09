import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { Reel } from "../models/reel.model.js";
import { reelQueue } from "../queues/reel.queue.js";

function isObjectId(value) {
  return mongoose.isValidObjectId(value);
}

export async function uploadReel(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: "Video is required" });
    }

    if (!isObjectId(request.body.userId)) {
      await fs.rm(request.file.path, { force: true });
      return response.status(400).json({ message: "Valid userId is required" });
    }

    const reel = await Reel.create({
      user: request.body.userId,
      caption: request.body.caption,
    });

    try {
      const job = await reelQueue.add(
        "process-reel",
        { reelId: reel.id, inputPath: request.file.path },
        { jobId: reel.id }
      );

      return response.status(202).json({
        message: "Reel queued for processing",
        reel,
        jobId: job.id,
      });
    } catch (error) {
      await Promise.all([
        Reel.findByIdAndDelete(reel.id),
        fs.rm(request.file.path, { force: true }),
      ]);
      throw error;
    }
  } catch (error) {
    if (request.file?.path) {
      await fs.rm(request.file.path, { force: true });
    }
    next(error);
  }
}

export async function listReels(_request, response, next) {
  try {
    const reels = await Reel.find({ status: "ready" })
      .sort({ createdAt: -1 })
      .lean();
    response.json(reels);
  } catch (error) {
    next(error);
  }
}

export async function getReel(request, response, next) {
  try {
    if (!isObjectId(request.params.id)) {
      return response.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await Reel.findById(request.params.id).lean();
    if (!reel) {
      return response.status(404).json({ message: "Reel not found" });
    }

    response.json(reel);
  } catch (error) {
    next(error);
  }
}

export async function toggleLike(request, response, next) {
  try {
    const { id } = request.params;
    const { userId } = request.body;
    if (!isObjectId(id) || !isObjectId(userId)) {
      return response.status(400).json({ message: "Invalid reel or user id" });
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      return response.status(404).json({ message: "Reel not found" });
    }

    const index = reel.likes.findIndex((like) => like.equals(userId));
    if (index >= 0) {
      reel.likes.splice(index, 1);
    } else {
      reel.likes.push(userId);
    }
    await reel.save();

    response.json({ liked: index < 0, likesCount: reel.likes.length });
  } catch (error) {
    next(error);
  }
}

export async function addView(request, response, next) {
  try {
    if (!isObjectId(request.params.id)) {
      return response.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await Reel.findByIdAndUpdate(
      request.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!reel) {
      return response.status(404).json({ message: "Reel not found" });
    }

    response.json({ views: reel.views });
  } catch (error) {
    next(error);
  }
}

export async function deleteReel(request, response, next) {
  try {
    if (!isObjectId(request.params.id)) {
      return response.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await Reel.findByIdAndDelete(request.params.id);
    if (!reel) {
      return response.status(404).json({ message: "Reel not found" });
    }

    await fs.rm(path.resolve("media", "reels", reel.id), {
      recursive: true,
      force: true,
    });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
