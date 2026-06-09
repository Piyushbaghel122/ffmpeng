import { Router } from "express";
import {
  addView,
  deleteReel,
  getReel,
  listReels,
  toggleLike,
  uploadReel,
} from "../controllers/reel.controller.js";
import { uploadVideo } from "../middleware/upload.js";

export const reelRouter = Router();

reelRouter.post("/upload", uploadVideo.single("video"), uploadReel);
reelRouter.get("/", listReels);
reelRouter.get("/:id", getReel);
reelRouter.post("/:id/like", toggleLike);
reelRouter.post("/:id/view", addView);
reelRouter.delete("/:id", deleteReel);
