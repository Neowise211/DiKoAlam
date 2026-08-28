# Di Ko Alam — handoff

A **product feature page**, not a utility. It lands already populated with a
sample reading, in card sections, and deploys to Vercel.

## Run it

```bash
git clone https://github.com/Neowise211/DiKoAlam.git && cd DiKoAlam
npm run dev
```

Open <http://localhost:3000>. No `npm install` — zero dependencies. Node 22+.

No key means mock results (1.2s fake latency), so the frontend is never blocked
on the backend. Real thing: `cp .env.example .env`, paste the key, restart.

## Deploy

Vercel, zero-config. Import the repo, add `DEEPSEEK_API_KEY` to project env
vars, deploy. `public/` is served at `/`, `api/analyze.js` becomes the function.

**Do not add a build step, a framework, or `vercel.json`** — zero-config only
works because none of those exist.

## Who owns what

| Path | Owner | |
|---|---|---|
| `public/index.html` | **A** | markup only |
| `public/styles.css` | **A** | all styling, no JS reads it |
| `public/app.js` | **A** | upload, render, history |
| `src/analyze.js` | **B** | the only file that knows DeepSeek exists |
| `test/deepseek.test.js` | **B** | `npm test` |
| `public/shared.js` | **both** | emotion list + `toBars`. Agree before editing. |
| `api/analyze.js`, `dev.js` | nobody | done |

`api/analyze.js` is the one request handler. Vercel deploys it as a function;
`dev.js` mounts the same export for localhost. One code path, two hosts.

## The contract

The only thing connecting the two halves.

```
POST /api/analyze
  → { "image": "<base64, no data: prefix>", "mimeType": "image/png" }

200 ← { "emotions": [ { "emotion": "tampo", "probability": 0.44 }, ... ],
        "ibig_sabihin": "...",
        "gawin_mo": "..." }

4xx/5xx ← { "error": "human-readable, shown to the user verbatim" }
```

`emotions` always contains all 7 keys from `public/shared.js`, zero-filled. The
backend does **not** sort — `toBars()` sorts and converts to percent in the
browser.

## Page structure — this is the demo script

Sections in order. Keep the order.

| Section | Notes |
|---|---|
| hero | "Sabi niya okay lang. ~~Okay lang.~~" |
| `Ang chat` | drop zone + screenshot preview; `Halimbawa` pill flips to `Iyong chat` |
| `Ang nararamdaman niya` | 7 bars, top one highlighted, zeroes faded |
| verdict | `Ibig sabihin` / `Gawin mo` cards |
| `Recent reads` | last 5, localStorage, hidden until there is one |
| footer | disclaimer |

**It lands populated.** `app.js` renders `SAMPLE` on first paint so the page
looks alive before anyone uploads. The `Halimbawa` pill and the "sample reading"
note keep that honest — don't remove them and pass the sample off as real.

## Cursor setup

`.cursor/` is committed, so both machines get it on clone. Nothing to install.

**Rules** (`.cursor/rules/*.mdc`) load automatically:

| File | When it applies |
|---|---|
| `project.mdc` | always — architecture, ownership, contract, hard rules |
| `frontend.mdc` | editing `public/**` |
| `backend.mdc` | editing `src/**`, `api/**`, `test/**`, `dev.js` |

The split matters: A's agent never loads DeepSeek details, B's never loads CSS
conventions.

**Skill** (`.cursor/skills/poteto-mode/SKILL.md`) — hackathon shipping doctrine:
build only what the demo touches, hardcode over configure, mock what you don't
control, keep a green demo at every commit. Cursor offers it when it detects
time pressure, or type `/poteto-mode`.

## What we confirmed about the DeepSeek API

Checked against the live docs, not from memory:

- `POST https://api.deepseek.com/chat/completions`, `Authorization: Bearer <key>`.
  OpenAI-compatible.
- **Only `deepseek-v4-flash-vision-exp` accepts images.** `deepseek-v4-pro` and
  `deepseek-v4-flash` are text-only — sending an image to them fails. This is
  why extraction and analysis are two calls.
- Images go in as an `image_url` content part holding a base64 data URL.
- `response_format` supports `"text"` and `"json_object"` **only** — no
  `json_schema`. So the shape is requested in the prompt and enforced by
  `normalize()`. That is why `normalize()` has tests: valid JSON in the wrong
  shape is the expected failure mode, not malformed JSON.

## Escape hatches, in the order you'll need them

1. **Vision model can't read Messenger screenshots** → have `extract()` return a
   hardcoded transcript and demo the analysis half. Fix the prompt after.
2. **Too slow** → collapse to one call (delete step 2, have the vision model
   emit the JSON directly), drop `max_tokens` to 800.
3. **Behind at minute 45** → the page already looks complete with `SAMPLE`.
   Worst case you demo the sample reading and the upload flow separately.

## Notes

- `.env` is gitignored. Don't commit the key — the repo is public.
- Adding a file to `public/`? Add its name to the `PUBLIC` allowlist in `dev.js`
  or it 404s locally. It's an allowlist on purpose: `dev.js` ends up on
  hackathon wifi one directory below a `.env`.
- `npm test` covers `normalize()` and `toBars()` — the two places where a bug
  renders a perfectly nice chart that happens to be wrong.
