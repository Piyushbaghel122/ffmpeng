import fs from "node:fs/promises";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";
import { env } from "../config/env.js";

if (env.ffmpegPath) {
  ffmpeg.setFfmpegPath(env.ffmpegPath);
}

const localMediaRoot = path.resolve("media", "reels");

function runFfmpeg(inputPath, configure) {
  return new Promise((resolve, reject) => {
    const command = configure(ffmpeg(inputPath));
    command.on("end", resolve).on("error", reject).run();
  });
}

export async function processVideo(inputPath, outputDirectory, onProgress) {
  await fs.mkdir(outputDirectory, { recursive: true });

  const compressedPath = path.join(outputDirectory, "reel.mp4");
  const thumbnailPath = path.join(outputDirectory, "thumbnail.jpg");

  await runFfmpeg(inputPath, (command) =>
    command
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-crf 28",
        "-preset medium",
        "-movflags +faststart",
        "-pix_fmt yuv420p",
      ])
      .on("progress", ({ percent }) => {
        if (Number.isFinite(percent)) {
          onProgress(Math.min(75, Math.round(percent * 0.75)));
        }
      })
      .output(compressedPath)
  );

  onProgress(80);

  await runFfmpeg(compressedPath, (command) =>
    command
      .seekInput(1)
      .frames(1)
      .outputOptions(["-q:v 2"])
      .output(thumbnailPath)
  );

  onProgress(85);
  return { compressedPath, thumbnailPath };
}

export async function uploadProcessedMedia(
  reelId,
  compressedPath,
  thumbnailPath
) {
  const reelDirectory = path.join(localMediaRoot, reelId);
  await fs.rm(reelDirectory, { recursive: true, force: true });
  await fs.mkdir(reelDirectory, { recursive: true });
  await Promise.all([
    fs.copyFile(compressedPath, path.join(reelDirectory, "reel.mp4")),
    fs.copyFile(thumbnailPath, path.join(reelDirectory, "thumbnail.jpg")),
  ]);

  return {
    storage: "local",
    video: { url: `/api/media/reels/${reelId}/reel.mp4` },
    thumbnail: { url: `/api/media/reels/${reelId}/thumbnail.jpg` },
  };
}
