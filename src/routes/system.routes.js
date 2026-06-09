import { Router } from "express";
import {
  getHealth,
  getQueueStats,
} from "../controllers/system.controller.js";

export const systemRouter = Router();

systemRouter.get("/health", getHealth);
systemRouter.get("/queue", getQueueStats);
