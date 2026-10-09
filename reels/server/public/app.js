const $ = (id) => document.getElementById(id);

const els = {
  source: $("source"),
  markdown: $("markdown"),
  theme: $("theme"),
  maxSeconds: $("maxSeconds"),
  generate: $("generate"),
  poster: $("poster"),
  empty: $("empty"),
  summary: $("summary"),
  summaryTitle: $("summaryTitle"),
  summaryMeta: $("summaryMeta"),
  sceneChips: $("sceneChips"),
  warnings: $("warnings"),
  progressWrap: $("progressWrap"),
  progressLabel: $("progressLabel"),
  progressPercent: $("progressPercent"),
  progressBar: $("progressBar"),
  error: $("error"),
  result: $("result"),
};

const api = async (url, body) => {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

const payload = () => ({
  markdown: els.markdown.value,
  theme: els.theme.value,
  maxSeconds: Number(els.maxSeconds.value),
});

const showError = (message) => {
  els.error.textContent = message;
  els.error.classList.remove("hidden");
};

const clearError = () => els.error.classList.add("hidden");

const setBusy = (busy) => {
  els.generate.disabled = busy;
  els.poster.disabled = busy;
};

const setProgress = (percent, label) => {
  els.progressWrap.classList.remove("hidden");
  els.progressLabel.textContent = label;
  els.progressPercent.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;
};

const describeScenes = (data) => {
  els.summaryTitle.textContent = data.title;
  els.summaryMeta.textContent =
    `${data.durationSeconds}s · ${data.scenes.length} scenes · ` +
    `${data.captionWords} caption words · ${data.category}`;

  els.sceneChips.innerHTML = "";
  for (const scene of data.scenes) {
    const chip = document.createElement("div");
    chip.className = "chip";

    const kind = document.createElement("span");
    kind.className = "kind";
    kind.textContent = scene.type;

    const label = document.createElement("b");
    label.textContent = scene.label || "—";

    const dur = document.createElement("span");
    dur.className = "dur";
    dur.textContent = `${scene.seconds}s`;

    chip.append(kind, label, dur);
    els.sceneChips.append(chip);
  }

  els.summary.classList.remove("hidden");
  els.empty.classList.add("hidden");
};

const showGlyphWarning = (removed) => {
  if (!removed || removed.length === 0) {
    els.warnings.classList.add("hidden");
    return;
  }

  const list = removed.map((item) => `${item.char} (${item.code})`).join(", ");
  els.warnings.textContent =
    `Replaced ${list} with spaces. Those glyphs are outside the reel's font ` +
    `subset and crash the browser renderer.`;
  els.warnings.classList.remove("hidden");
};

const refreshSummary = async () => {
  if (!els.markdown.value.trim()) {
    els.summary.classList.add("hidden");
    els.empty.classList.remove("hidden");
    return;
  }

  try {
    const data = await api("/api/inspect", payload());
    describeScenes(data);
    showGlyphWarning(data.removedGlyphs);
    clearError();
  } catch (error) {
    showError(error.message);
  }
};

const pollJob = async (jobId) => {
  for (;;) {
    const job = await api(`/api/jobs/${jobId}`);

    if (job.status === "running" || job.status === "queued") {
      setProgress(job.percent, job.label);
    }

    if (job.status === "done") return job;
    if (job.status === "failed") throw new Error(job.error || "Render failed");

    await new Promise((resolve) => setTimeout(resolve, 800));
  }
};

const showVideo = (job) => {
  els.result.innerHTML = "";

  const video = document.createElement("video");
  video.src = job.fileUrl;
  video.controls = true;
  video.playsInline = true;
  video.loop = true;

  const link = document.createElement("a");
  link.className = "download";
  link.href = job.fileUrl;
  link.download = "reel.mp4";
  link.textContent = "Download MP4";

  els.result.append(video, link);
  els.result.classList.remove("hidden");
};

const showPoster = (job) => {
  els.result.innerHTML = "";

  const img = document.createElement("img");
  img.src = job.fileUrl;
  img.alt = "Reel preview frame";

  const note = document.createElement("p");
  note.className = "hint";
  note.textContent = `Preview frame at ${job.meta?.seconds ?? "?"}s`;

  els.result.append(img, note);
  els.result.classList.remove("hidden");
};

const run = async (endpoint, kind) => {
  clearError();

  if (!els.markdown.value.trim()) {
    showError("Paste some Markdown first (or load a post from the dropdown).");
    return;
  }

  setBusy(true);
  els.result.classList.add("hidden");
  setProgress(0, kind === "video" ? "Starting render\u2026" : "Rendering frame\u2026");

  try {
    const { jobId } = await api(endpoint, payload());
    const job = await pollJob(jobId);
    setProgress(100, "Done");
    if (kind === "video") showVideo(job);
    else showPoster(job);
    await refreshSummary();
  } catch (error) {
    showError(error.message);
    els.progressWrap.classList.add("hidden");
  } finally {
    setBusy(false);
  }
};

const boot = async () => {
  try {
    const meta = await api("/api/meta");
    els.theme.innerHTML = "";
    for (const theme of meta.themes) {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      if (theme === meta.defaultTheme) option.selected = true;
      els.theme.append(option);
    }
    els.maxSeconds.value = String(meta.defaultMaxSeconds);

    const { posts } = await api("/api/posts");
    for (const slug of posts) {
      const option = document.createElement("option");
      option.value = slug;
      option.textContent = slug;
      els.source.append(option);
    }

    // Deep link: /?slug=some-post pre-loads that article.
    const wanted = new URLSearchParams(location.search).get("slug");
    if (wanted && posts.includes(wanted)) {
      els.source.value = wanted;
      els.source.dispatchEvent(new Event("change"));
    }
  } catch (error) {
    showError(`Could not load the studio settings: ${error.message}`);
  }
};

/* --------------------------------------------------------------- wiring */

els.generate.addEventListener("click", () => run("/api/render", "video"));
els.poster.addEventListener("click", () => run("/api/still", "still"));

els.source.addEventListener("change", async () => {
  const slug = els.source.value;
  if (!slug) return;

  try {
    const data = await api(`/api/posts/${encodeURIComponent(slug)}`);
    els.markdown.value = data.markdown;
    await refreshSummary();
  } catch (error) {
    showError(error.message);
  }
});

let inspectTimer = null;
els.markdown.addEventListener("input", () => {
  clearTimeout(inspectTimer);
  inspectTimer = setTimeout(refreshSummary, 700);
});

for (const control of [els.theme, els.maxSeconds]) {
  control.addEventListener("change", refreshSummary);
}

boot();
