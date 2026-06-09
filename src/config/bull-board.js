import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { reelQueue } from "../queues/reel.queue.js";

export const bullBoardAdapter = new ExpressAdapter();
bullBoardAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(reelQueue)],
  serverAdapter: bullBoardAdapter,
});
