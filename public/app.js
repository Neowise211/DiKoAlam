// PERSON A OWNS THIS FILE.
// The only thing it knows about the backend is POST /api/analyze.
// No API keys here — the key is server-side only.

import { EMOTIONS, toBars } from "./shared.js";

const $ = (id) => document.getElementById(id);
const els = {
  drop: $("drop"),
  file: $("file"),
  shotWrap: $("shot-wrap"),
  shot: $("shot"),
  shotCaption: $("shot-caption"),
  sourcePill: $("source-pill"),
  status: $("status"),
  bars: $("bars"),
  readingNote: $("reading-note"),
  verdict: $("verdict"),
  historyPanel: $("history-panel"),
  history: $("history"),
  clearHistory: $("clear-history"),
};

const LOADING = [
  "Binabasa ang chat…",
  "Sinusukat ang tampo…",
  "Hinahanap ang totoong ibig sabihin…",
];

// Seeded so the page reads as a working product on first paint instead of an
// empty upload box. Replaced the moment a real screenshot comes back.
const SAMPLE = {
  emotions: [
    { emotion: "tampo", probability: 0.44 },
    { emotion: "galit", probability: 0.21 },
    { emotion: "lungkot", probability: 0.14 },
    { emotion: "pagod", probability: 0.11 },
    { emotion: "selos", probability: 0.06 },
    { emotion: "okay lang", probability: 0.03 },
    { emotion: "masaya", probability: 0.01 },
  ],
  ibig_sabihin: "Hindi siya okay — gusto niya lang na ikaw ang mag-effort mag-usap muna.",
  gawin_mo: "Tawagan mo siya, wag i-text. Sabihin mo sorry sa hindi pag-reply kanina.",
};

// --- upload -----------------------------------------------------------------

els.drop.addEventListener("click", () => els.file.click());
els.drop.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); els.file.click(); }
});
els.drop.addEventListener("dragover", (e) => { e.preventDefault(); els.drop.classList.add("over"); });
els.drop.addEventListener("dragleave", () => els.drop.classList.remove("over"));
els.drop.addEventListener("drop", (e) => {
  e.preventDefault();
  els.drop.classList.remove("over");
  if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
});
els.file.addEventListener("change", (e) => e.target.files[0] && handle(e.target.files[0]));

function readAsDataUrl(f) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Could not read that file."));
    r.readAsDataURL(f);
  });
}

async function handle(f) {
  let dataUrl;
  try {
    dataUrl = await readAsDataUrl(f);
  } catch (err) {
    return showError(err.message);
  }

  els.shot.src = dataUrl;
  els.shotWrap.hidden = false;
  els.shotCaption.textContent = f.name;
  els.sourcePill.textContent = "Iyong chat";

  let i = 0;
  els.status.className = "status";
  els.status.textContent = LOADING[0];
  const spin = setInterval(() => {
    els.status.textContent = LOADING[++i % LOADING.length];
  }, 2200);

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: dataUrl.split(",")[1], mimeType: f.type || "image/png" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);

    clearInterval(spin);
    els.status.textContent = "";
    render(data, { sample: false, mock: Boolean(data.mock) });
    remember(data);
  } catch (err) {
    clearInterval(spin);
    showError(err.message);
  }
}

function showError(msg) {
  els.status.className = "status";
  els.status.innerHTML = "";
  const box = document.createElement("div");
  box.className = "err";
  box.textContent = msg;
  els.status.appendChild(box);
}

// --- render -----------------------------------------------------------------

function render(result, { sample = false, mock = false } = {}) {
  const bars = toBars(result.emotions);

  els.readingNote.textContent = sample
    ? "sample reading"
    : mock
      ? "mock data"
      : `top: ${EMOTIONS[bars[0].emotion]?.label ?? bars[0].emotion}`;

  els.bars.innerHTML = "";
  bars.forEach(({ emotion, pct }, i) => {
    const meta = EMOTIONS[emotion] ?? { label: emotion, hint: "", color: "#8b8598" };

    const row = document.createElement("div");
    row.className = "row" + (i === 0 ? " top" : "") + (pct === 0 ? " faded" : "");

    const top = document.createElement("div");
    top.className = "rowtop";

    const left = document.createElement("span");
    const name = document.createElement("b");
    name.textContent = meta.label;
    const hint = document.createElement("em");
    hint.textContent = meta.hint;
    left.append(name, hint);

    const value = document.createElement("i");
    value.textContent = `${pct}%`;
    top.append(left, value);

    const track = document.createElement("div");
    track.className = "track";
    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.background = meta.color;
    track.appendChild(fill);

    row.append(top, track);
    els.bars.appendChild(row);
    requestAnimationFrame(() => { fill.style.width = `${pct}%`; });
  });

  els.verdict.innerHTML = "";
  for (const [heading, body] of [
    ["Ibig sabihin", result.ibig_sabihin],
    ["Gawin mo", result.gawin_mo],
  ]) {
    const card = document.createElement("div");
    card.className = "card";
    const h = document.createElement("h3");
    h.textContent = heading;
    const p = document.createElement("p");
    p.textContent = body;
    card.append(h, p);
    els.verdict.appendChild(card);
  }
}

// --- history (localStorage, last 5) -----------------------------------------

const KEY = "dikoalam.reads";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function remember(result) {
  const [top] = toBars(result.emotions);
  const reads = [{ at: Date.now(), emotion: top.emotion, pct: top.pct }, ...loadHistory()].slice(0, 5);
  try {
    localStorage.setItem(KEY, JSON.stringify(reads));
  } catch {
    /* private mode — history is a nicety, not the product */
  }
  renderHistory();
}

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function renderHistory() {
  const reads = loadHistory();
  els.historyPanel.hidden = reads.length === 0;
  els.history.innerHTML = "";

  for (const read of reads) {
    const meta = EMOTIONS[read.emotion] ?? { label: read.emotion, color: "#8b8598" };
    const li = document.createElement("li");

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = meta.color;

    const when = document.createElement("span");
    when.className = "when";
    when.textContent = timeAgo(read.at);

    const what = document.createElement("span");
    what.className = "what";
    what.textContent = meta.label;

    const pct = document.createElement("span");
    pct.className = "pct";
    pct.textContent = `${read.pct}%`;

    li.append(dot, when, what, pct);
    els.history.appendChild(li);
  }
}

els.clearHistory.addEventListener("click", () => {
  localStorage.removeItem(KEY);
  renderHistory();
});

// --- first paint ------------------------------------------------------------

render(SAMPLE, { sample: true });
renderHistory();
