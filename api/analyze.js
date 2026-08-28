// Vercel serverless function. Deployed at POST /api/analyze.
// Thin on purpose — all the DeepSeek logic lives in src/analyze.js.
// dev.js wraps this exact handler for local runs, so there is one code path.

import { run } from "../src/analyze.js";

// No key configured => mock mode, so the frontend is never blocked on the
// backend and a fresh clone demos out of the box.
const MOCK = !process.env.DEEPSEEK_API_KEY;

export const MOCK_RESULT = {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  // Vercel parses JSON bodies for us; dev.js passes an already-parsed object.
  const { image, mimeType } = req.body || {};
  if (typeof image !== "string" || !image) {
    return res.status(400).json({ error: "No image in the request." });
  }

  if (MOCK) {
    await new Promise((r) => setTimeout(r, 1200)); // exercise the loading state
    return res.status(200).json({ ...MOCK_RESULT, mock: true });
  }

  try {
    return res.status(200).json(await run(image, mimeType || "image/png"));
  } catch (err) {
    console.error("[analyze]", err);
    return res.status(502).json({ error: err.message || "Analysis failed." });
  }
}
