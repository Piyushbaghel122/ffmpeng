import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../../shared/lib/api";
import {
  getReelApi,
  uploadReelApi,
} from "../services/reel.service";
import type { Reel, UploadReelInput } from "../types";

const POLL_INTERVAL_MS = 1500;

export function useUploadReel(onReady: () => Promise<void>) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reel, setReel] = useState<Reel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<number | null>(null);

  function stopPolling() {
    if (pollTimer.current !== null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  async function pollReel(reelId: string) {
    try {
      const nextReel = await getReelApi(reelId);
      setReel(nextReel);

      if (nextReel.status === "ready") {
        stopPolling();
        await onReady();
      } else if (nextReel.status === "failed") {
        stopPolling();
        setError(nextReel.processingError ?? "Video processing failed");
      }
    } catch (caughtError) {
      stopPolling();
      setError(getErrorMessage(caughtError));
    }
  }

  async function handleUpload(input: UploadReelInput) {
    stopPolling();
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setReel(null);

    try {
      const response = await uploadReelApi(input, setUploadProgress);
      setReel(response.reel);
      await pollReel(response.reel._id);
      pollTimer.current = window.setInterval(() => {
        void pollReel(response.reel._id);
      }, POLL_INTERVAL_MS);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setUploading(false);
    }
  }

  return { uploading, uploadProgress, reel, error, handleUpload };
}
