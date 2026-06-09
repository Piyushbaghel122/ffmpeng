import { useState, type FormEvent } from "react";
import type { Reel, UploadReelInput } from "../types";

interface UploadReelFormProps {
  userId: string;
  uploading: boolean;
  uploadProgress: number;
  reel: Reel | null;
  error: string | null;
  onUpload: (input: UploadReelInput) => Promise<void>;
  onClose: () => void;
}

export function UploadReelForm({
  userId,
  uploading,
  uploadProgress,
  reel,
  error,
  onUpload,
  onClose,
}: UploadReelFormProps) {
  const [caption, setCaption] = useState("");
  const [video, setVideo] = useState<File | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!video) return;
    await onUpload({ video, caption, userId });
  }

  const visibleProgress = reel?.progress ?? uploadProgress;
  const status = reel?.status ?? (uploading ? "uploading" : "idle");

  return (
    <div
      className="upload-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="upload-dialog-title"
        aria-modal="true"
        className="upload-modal"
        role="dialog"
      >
        <header className="upload-modal-header">
          <div>
            <h2 id="upload-dialog-title">Upload videos</h2>
            <span className={`status-pill status-${status}`}>{status}</span>
          </div>
          <button
            aria-label="Close upload dialog"
            className="modal-close-button"
            disabled={uploading}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        <form className="upload-modal-form" onSubmit={onSubmit}>
          <label className="upload-drop-zone">
            <input
              accept="video/*"
              type="file"
              onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
              required
            />
            <span className="upload-circle">
              <span className="upload-arrow">↑</span>
              <span className="upload-line" />
            </span>
            <strong>
              {video?.name ?? "Drag and drop video files to upload"}
            </strong>
            <small>Your videos will be private until processing finishes.</small>
            <span className="select-files-button">Select files</span>
          </label>

          {video ? (
            <div className="upload-details">
              <label>
                Caption
                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Tell people what this reel is about..."
                  maxLength={2200}
                />
              </label>

              <div className="progress-row">
                <span>{reel ? "Processing" : "Upload"}</span>
                <strong>{visibleProgress}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${visibleProgress}%` }}
                />
              </div>

              {error ? <p className="error-message">{error}</p> : null}

              <button
                className="primary-button"
                disabled={
                  uploading ||
                  reel?.status === "processing" ||
                  reel?.status === "queued"
                }
                type="submit"
              >
                {uploading ? "Uploading..." : "Upload video"}
              </button>
            </div>
          ) : null}
        </form>

        <footer className="upload-modal-footer">
          By uploading, you confirm that you own this video and have permission
          to publish it.
        </footer>
      </section>
    </div>
  );
}
