import { api } from "../../../shared/lib/api";
import type {
  Reel,
  UploadReelInput,
  UploadReelResponse,
} from "../types";

export async function getReelsApi() {
  const response = await api.get<Reel[]>("/reels");
  return response.data;
}

export async function getReelApi(reelId: string) {
  const response = await api.get<Reel>(`/reels/${reelId}`);
  return response.data;
}

export async function uploadReelApi(
  input: UploadReelInput,
  onProgress: (progress: number) => void
) {
  const formData = new FormData();
  formData.append("video", input.video);
  formData.append("caption", input.caption);
  formData.append("userId", input.userId);

  const response = await api.post<UploadReelResponse>(
    "/reels/upload",
    formData,
    {
      onUploadProgress(event) {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    }
  );

  return response.data;
}

export async function toggleLikeApi(reelId: string, userId: string) {
  const response = await api.post<{ liked: boolean; likesCount: number }>(
    `/reels/${reelId}/like`,
    { userId }
  );

  return response.data;
}
