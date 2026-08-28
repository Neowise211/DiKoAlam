// ============================================================================
// PERSON B OWNS THIS FILE. Nothing else imports DeepSeek.
//
// Contract you must satisfy — server.js calls exactly this:
//
//   run(base64, mimeType) -> {
//     emotions:     [{ emotion: <one of EMOTION_KEYS>, probability: number }],
//     ibig_sabihin: string,
//     gawin_mo:     string,
//   }
//
// Throw an Error with a human-readable message on failure. server.js turns it
// into { error: "<message>" } and the frontend shows it verbatim.
// ============================================================================

import { EMOTION_KEYS } from "../public/shared.js";

const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const API_KEY = process.env.DEEPSEEK_API_KEY;

// Only deepseek-v4-flash-vision-exp accepts image input. The text models do not.
const VISION_MODEL = process.env.DEEPSEEK_VISION_MODEL || "deepseek-v4-flash-vision-exp";
const REASON_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

// ---------------------------------------------------------------------------
// One thin wrapper around the OpenAI-compatible endpoint. Both steps use it.
//
// v4-pro and v4-flash-vision-exp are reasoning models: max_tokens is spent on
// message.reasoning_content FIRST, and only the leftover budget writes
// message.content. Too low a budget yields finish_reason "length" with an
// empty content — that used to surface as a generic "empty response" error.
// Give each step enough headroom and call out the specific failure so it's
// not confused with a real outage.
// ---------------------------------------------------------------------------

async function chat({ model, content, json = false, maxTokens = 1500 }) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      ...(json ? { response_format: { type: "json_object" } } : {}),
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message || `DeepSeek returned HTTP ${res.status}`);
  }
  const choice = data?.choices?.[0];
  const text = choice?.message?.content;
  if (!text) {
    if (choice?.finish_reason === "length") {
      throw new Error("DeepSeek ran out of tokens thinking and never answered — try again.");
    }
    throw new Error("DeepSeek returned an empty response.");
  }
  return text;
}

// ---------------------------------------------------------------------------
// Step 1 — extraction. Vision model reads the screenshot into a transcript.
// ---------------------------------------------------------------------------

const EXTRACT_PROMPT = `Transcribe this chat screenshot. Output the LAST 5 exchanges only.

One message per line, in this exact format:
HER: <message>
HIM: <message>

Rules:
- "HER" is the person whose messages are on the LEFT (received). "HIM" is the
  phone owner, on the RIGHT (sent).
- Transcribe verbatim. Keep Taglish, typos, punctuation, emoji, and "hahaha"
  exactly as written — they are the signal.
- Include timestamps in brackets if visible, e.g. HER [2:14 AM]: ok.
- If a message is only a sticker, image, or reaction, write it as
  HER: <sticker: crying cat> or similar.
- Output nothing except those lines.`;

export async function extract(base64, mimeType) {
  return chat({
    model: VISION_MODEL,
    content: [
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
      { type: "text", text: EXTRACT_PROMPT },
    ],
    maxTokens: 1200,
  });
}

// ---------------------------------------------------------------------------
// Step 2 — analysis. Reasoning model scores the transcript.
// ---------------------------------------------------------------------------

const ANALYZE_PROMPT = (transcript) => `You read Filipino couples' chats for a
living. Below are the last 5 exchanges of a conversation. Score what HER
messages actually mean.

Read tone, punctuation, message length, reply gaps and silence — not just the
literal words. "Ok." and "Ok!" are different messages. A one-word reply after a
long one is a signal. "Wala, okay lang" is almost never okay lang.

How to tell the close ones apart:
- galit vs tampo: galit is direct — accusations, caps, exclamation points,
  confrontation. tampo is withdrawal — short cold replies, going quiet,
  refusing to explain why, "bahala ka".
- lungkot vs pagod: lungkot responds to something that happened between you
  two. pagod is about everything else draining her — work, family, sleep —
  and she says so, or the flatness reads generic rather than aimed at you.
- selos shows up as questions about who she was with, mentions of another
  person unprompted, or comparing herself to someone.
- okay lang is a real state, not just the literal words "okay lang" — score it
  high only when the messages actually read unbothered (fast replies, normal
  length, no hedging), never just because she typed the phrase.

Reply with JSON only, exactly this shape:
{
  "emotions": [${EMOTION_KEYS.map((k) => `{"emotion": "${k}", "probability": <0..1>}`).join(",\n    ")}],
  "ibig_sabihin": "<what she actually means, one sentence, casual Taglish>",
  "gawin_mo": "<what he should say or do next, one sentence, casual Taglish, specific>"
}

Score every emotion in the list, including ones at 0. Probabilities sum to ~1.

TRANSCRIPT:
${transcript}`;

export async function analyze(transcript) {
  const text = await chat({
    model: REASON_MODEL,
    content: ANALYZE_PROMPT(transcript),
    json: true,
    maxTokens: 3000,
  });
  return normalize(text);
}

// ---------------------------------------------------------------------------
// The seam server.js calls.
// ponytail: two calls because the vision model is flash-tier and experimental,
// while the nuance lives in step 2. If flash-vision scores well enough on its
// own, delete step 2 and halve the latency.
// ---------------------------------------------------------------------------

export async function run(base64, mimeType) {
  if (!API_KEY) throw new Error("DEEPSEEK_API_KEY is not set on the server.");
  const transcript = await extract(base64, mimeType);
  if (!transcript.trim()) throw new Error("Couldn't read any messages in that screenshot.");
  return analyze(transcript);
}

// ---------------------------------------------------------------------------
// normalize() — the only real logic in this file, so it's the only thing tested.
// response_format json_object guarantees valid JSON, NOT the right shape. The
// model can rename keys, drop emotions, use 0-100, or invent an emotion.
// ---------------------------------------------------------------------------

export function normalize(raw) {
  let obj;
  try {
    obj = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new Error("DeepSeek did not return valid JSON.");
  }
  if (!obj || typeof obj !== "object") throw new Error("DeepSeek returned an unexpected shape.");

  const scores = new Map(EMOTION_KEYS.map((k) => [k, 0]));
  for (const item of Array.isArray(obj.emotions) ? obj.emotions : []) {
    const key = String(item?.emotion ?? "").trim().toLowerCase();
    const value = Number(item?.probability);
    // Unknown emotion names are dropped, not guessed at.
    if (scores.has(key) && Number.isFinite(value)) {
      scores.set(key, Math.max(0, value));
    }
  }

  const emotions = EMOTION_KEYS.map((emotion) => ({ emotion, probability: scores.get(emotion) }));
  if (emotions.every((e) => e.probability === 0)) {
    throw new Error("DeepSeek scored every emotion at zero — try another screenshot.");
  }

  const ibig_sabihin = String(obj.ibig_sabihin ?? "").trim();
  const gawin_mo = String(obj.gawin_mo ?? "").trim();
  if (!ibig_sabihin || !gawin_mo) throw new Error("DeepSeek left the verdict blank.");

  return { emotions, ibig_sabihin, gawin_mo };
}
