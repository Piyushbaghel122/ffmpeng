import type { Reel } from "../types";
import { ReelCard } from "./ReelCard";

interface ReelFeedProps {
  reels: Reel[];
  userId: string;
  loading: boolean;
  error: string | null;
}

export function ReelFeed({
  reels,
  userId,
  loading,
  error,
}: ReelFeedProps) {
  if (loading) {
    return <p className="empty-state">Loading reels...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (reels.length === 0) {
    return (
      <div className="empty-state">
        <strong>No ready reels yet.</strong>
        <span>Upload one and the worker will bring it here.</span>
      </div>
    );
  }

  return (
    <div className="reel-grid">
      {reels.map((reel) => (
        <ReelCard key={reel._id} reel={reel} userId={userId} />
      ))}
    </div>
  );
}
