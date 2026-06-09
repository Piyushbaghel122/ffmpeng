const form = document.querySelector("#upload-form");
const videoInput = document.querySelector("#video");
const fileName = document.querySelector("#file-name");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const uploadProgress = document.querySelector("#upload-progress");
const jobProgress = document.querySelector("#job-progress");
const jobProgressLabel = document.querySelector("#job-progress-label");
const jobProgressValue = document.querySelector("#job-progress-value");
const statusBadge = document.querySelector("#status-badge");
const reelId = document.querySelector("#reel-id");
const views = document.querySelector("#views");
const result = document.querySelector("#result");
const resultVideo = document.querySelector("#result-video");
const videoLink = document.querySelector("#video-link");
const jobError = document.querySelector("#job-error");
const queueCounts = document.querySelector("#queue-counts");

let pollTimer;

videoInput.addEventListener("change", () => {
  fileName.textContent =
    videoInput.files[0]?.name ?? "Choose an MP4, MOV, or other video";
});

function setStatus(reel) {
  const progress = reel.progress ?? 0;
  statusBadge.textContent = reel.status;
  statusBadge.className = `badge ${reel.status}`;
  reelId.textContent = reel._id;
  views.textContent = reel.views ?? 0;
  jobProgress.style.width = `${progress}%`;
  jobProgressValue.textContent = `${progress}%`;
  jobProgressLabel.textContent =
    reel.status === "queued" ? "Waiting for worker" : "Processing status";
  jobError.textContent = reel.processingError ?? "";

  if (reel.status === "ready") {
    clearInterval(pollTimer);
    jobProgressLabel.textContent = "Processing complete";
    result.classList.remove("hidden");
    resultVideo.poster = reel.thumbnailUrl;
    resultVideo.src = reel.videoUrl;
    videoLink.href = reel.videoUrl;
  }

  if (reel.status === "failed") {
    clearInterval(pollTimer);
    jobProgressLabel.textContent = "Processing failed";
  }
}

async function fetchReel(id) {
  const response = await fetch(`/api/reels/${id}`);
  if (!response.ok) {
    throw new Error("Could not load reel status");
  }
  setStatus(await response.json());
}

function startPolling(id) {
  clearInterval(pollTimer);
  fetchReel(id).catch((error) => {
    jobError.textContent = error.message;
  });
  pollTimer = setInterval(() => {
    fetchReel(id).catch((error) => {
      jobError.textContent = error.message;
    });
  }, 2000);
}

function upload(formData) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/reels/upload");
    request.responseType = "json";

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        uploadProgress.style.width = `${Math.round(
          (event.loaded / event.total) * 100
        )}%`;
      }
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.response);
      } else {
        reject(
          new Error(request.response?.message ?? "The upload request failed")
        );
      }
    });
    request.addEventListener("error", () => reject(new Error("Network error")));
    request.send(formData);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  formMessage.textContent = "Uploading video...";
  formMessage.classList.remove("error");
  uploadProgress.style.width = "0";
  result.classList.add("hidden");
  jobError.textContent = "";

  try {
    const payload = await upload(new FormData(form));
    formMessage.textContent = "Upload complete. BullMQ job created.";
    setStatus(payload.reel);
    startPolling(payload.reel._id);
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
  }
});

async function refreshQueueStats() {
  try {
    const response = await fetch("/api/system/queue");
    if (!response.ok) {
      throw new Error();
    }
    const { counts } = await response.json();
    const visible = ["waiting", "active", "completed", "failed", "delayed"];
    queueCounts.replaceChildren(
      ...visible.map((name) => {
        const item = document.createElement("span");
        item.textContent = `${name}: ${counts[name] ?? 0}`;
        return item;
      })
    );
  } catch {
    queueCounts.innerHTML = "<span>Redis unavailable</span>";
  }
}

refreshQueueStats();
setInterval(refreshQueueStats, 3000);
