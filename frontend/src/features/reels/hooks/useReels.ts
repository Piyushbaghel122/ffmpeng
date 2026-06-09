import { useCallback, useEffect, useState } from "react";
import { getReelsApi } from "../services/reel.service";
import type { Reel } from "../types";
import { getErrorMessage } from "../../../shared/lib/api";

export function useReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshReels = useCallback(async () => {
    setError(null);
    try {
      setReels(await getReelsApi());
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshReels();
  }, [refreshReels]);

  return { reels, loading, error, refreshReels };
}
