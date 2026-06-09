export type ReelStatus = "queued" | "processing" | "ready" | "failed";

export interface Reel {
  _id: string;
  caption: string;
  status: ReelStatus;
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  storage?: "local";
  processingError?: string;
  views: number;
  likes: string[];
  createdAt: string;
}

export interface UploadReelInput {
  video: File;
  caption: string;
  userId: string;
}

export interface UploadReelResponse {
  message: string;
  reel: Reel;
  jobId: string;
}
