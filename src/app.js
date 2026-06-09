import cors from "cors";
import express from "express";
import path from "node:path";
import { bullBoardAdapter } from "./config/bull-board.js";
import { authRouter } from "./routes/auth.routes.js";
import { reelRouter } from "./routes/reel.routes.js";
import { systemRouter } from "./routes/system.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve("public")));
app.use("/api/media", express.static(path.resolve("media")));

app.use("/admin/queues", bullBoardAdapter.getRouter());
app.use("/api/system", systemRouter);
app.use("/api/auth", authRouter);
app.use("/api/reels", reelRouter);

app.get("/health", (_request, response) => {
  response.redirect("/api/system/health");
});

app.use((error, _request, response, _next) => {
  console.error(error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({ message: "Video exceeds 250 MB" });
  }

  response.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
});
