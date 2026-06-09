import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { ReelFeed } from "../components/ReelFeed";
import { UploadReelForm } from "../components/UploadReelForm";
import { useReels } from "../hooks/useReels";
import { useUploadReel } from "../hooks/useUploadReel";

export function ReelsPage() {
  const { user, handleLogout } = useAuth();
  const { reels, loading, error, refreshReels } = useReels();
  const upload = useUploadReel(refreshReels);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  if (!user) return null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark small">F</span>
          <div>
            <strong>Frameflow</strong>
            <small>Reels processing studio</small>
          </div>
        </div>
        <div className="user-menu">
          <a href="/admin/queues" target="_blank" rel="noreferrer">
            Queue
          </a>
          <div className="create-menu">
            <button
              aria-expanded={createMenuOpen}
              className="create-button"
              onClick={() => setCreateMenuOpen((open) => !open)}
              type="button"
            >
              <span>＋</span> Create
            </button>
            {createMenuOpen ? (
              <div className="create-dropdown">
                <button
                  onClick={() => {
                    setCreateMenuOpen(false);
                    setUploadModalOpen(true);
                  }}
                  type="button"
                >
                  <span className="menu-upload-icon">↑</span>
                  <span>
                    <strong>Upload videos</strong>
                    <small>Process a new reel</small>
                  </span>
                </button>
              </div>
            ) : null}
          </div>
          <span>@{user.username}</span>
          <button onClick={handleLogout} type="button">
            Sign out
          </button>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">Background processing, visible progress</p>
        <h1>Turn raw clips into ready-to-watch reels.</h1>
      </section>

      <section className="workspace">
        <section className="feed-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Library</p>
              <h2>Ready reels</h2>
            </div>
            <button
              className="secondary-button"
              onClick={() => void refreshReels()}
              type="button"
            >
              Refresh
            </button>
          </div>
          <ReelFeed
            reels={reels}
            userId={user.id}
            loading={loading}
            error={error}
          />
        </section>
      </section>

      {uploadModalOpen ? (
        <UploadReelForm
          userId={user.id}
          uploading={upload.uploading}
          uploadProgress={upload.uploadProgress}
          reel={upload.reel}
          error={upload.error}
          onUpload={upload.handleUpload}
          onClose={() => setUploadModalOpen(false)}
        />
      ) : null}
    </main>
  );
}
