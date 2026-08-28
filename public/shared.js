// Shared by the browser (app.js) and the server (analyze.js).
// Keep this file free of Node- and DOM-specific APIs.

// The fixed emotion set. Order here is the order the model is asked to score.
// `tampo` has no English equivalent and is the reason this app exists — keep it.
export const EMOTIONS = {
  galit:       { label: "Galit",      hint: "angry",         color: "#ff4d4d" },
  tampo:       { label: "Tampo",      hint: "sulking",       color: "#a970ff" },
  lungkot:     { label: "Lungkot",    hint: "sad",           color: "#4d8dff" },
  selos:       { label: "Selos",      hint: "jealous",       color: "#3ecf8e" },
  pagod:       { label: "Pagod",      hint: "tired",         color: "#8b8598" },
  masaya:      { label: "Masaya",     hint: "happy",         color: "#ffc44d" },
  "okay lang": { label: "Okay lang",  hint: "actually fine", color: "#2dd4bf" },
};

export const EMOTION_KEYS = Object.keys(EMOTIONS);

/**
 * Sort emotions high-to-low and convert to whole percentages.
 * Tolerates any scale (0-1 or 0-100) and un-normalized sums.
 * @param {{emotion: string, probability: number}[]} emotions
 * @returns {{emotion: string, pct: number}[]}
 */
export function toBars(emotions) {
  const total = emotions.reduce((s, e) => s + Math.max(0, e.probability), 0) || 1;
  return emotions
    .map((e) => ({
      emotion: e.emotion,
      pct: Math.round((Math.max(0, e.probability) / total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);
}
