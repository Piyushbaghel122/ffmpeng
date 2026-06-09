import { useState } from "react";
import type { Reel } from "../types";
import { toggleLikeApi } from "../services/reel.service";

interface ReelCardProps {
  reel: Reel;
  userId: string;
}

export function ReelCard({ reel, userId }: ReelCardProps) {
  const [liked, setLiked] = useState(reel.likes.includes(userId));
  const [likesCount, setLikesCount] = useState(reel.likes.length);

  async function handleLike() {
    const response = await toggleLikeApi(reel._id, userId);
    setLiked(response.liked);
    setLikesCount(response.likesCount);
  }

  return (
    <article className="reel-card">
      <video
        controls
        playsInline
        poster={reel.thumbnailUrl}
        preload="metadata"
        src={reel.videoUrl}
      />
      <div className="reel-content">
        <p>{reel.caption || "Untitled reel"}</p>
        <div className="reel-actions">
          <button
            aria-pressed={liked}
            className={liked ? "like-button liked" : "like-button"}
            onClick={() => void handleLike()}
            type="button"
          >
            {liked ? "Liked" : "Like"} · {likesCount}
          </button>
          <span>{reel.views} views</span>
          <span>{reel.storage ?? "cloud"}</span>
        </div>
      </div>
    </article>
  );
}
