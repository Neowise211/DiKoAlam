# Di Ko Alam

Upload a chat screenshot. Get probability bars for what she's actually feeling,
plus what she means and what to say back.

Named for what you say when she won't tell you what's wrong but expects you to
work it out anyway.

## Run

```bash
npm run dev
```

Open <http://localhost:3000>. No `npm install` — zero dependencies. Node 22+.

Without a key it serves mock results, so a fresh clone demos immediately. For
the real thing: `cp .env.example .env`, paste the DeepSeek key, restart.

```bash
npm test
```

## Deploy

Vercel, zero-config — no `vercel.json`, no build step.

1. Import the repo on Vercel.
2. Add `DEEPSEEK_API_KEY` to project environment variables.
3. Deploy.

`public/` is served statically at `/`; `api/analyze.js` becomes a serverless
function at `/api/analyze`. `dev.js` mounts that same handler for localhost, so
there is one code path, not two.

## Layout

```
public/                 static frontend
  index.html            markup
  styles.css            all styling
  app.js                upload, render, history
  shared.js             emotion list + toBars — imported by browser AND server
api/
  analyze.js            request handler (Vercel function)
src/
  analyze.js            the only file that knows DeepSeek exists
test/
  deepseek.test.js
dev.js                  local server, not deployed
.cursor/
  rules/                project, frontend, backend conventions
  skills/poteto-mode/   hackathon shipping doctrine
```

## How it works

```
screenshot → deepseek-v4-flash-vision-exp → transcript → deepseek-v4-pro → JSON
             (extract, verbatim Taglish)                 (score + verdict)
```

Two calls because **only `deepseek-v4-flash-vision-exp` accepts images** — the
text models reject them. Extraction is easy enough for a flash model; the
Taglish nuance gets the pro model.

DeepSeek's `response_format` has no `json_schema`, only `json_object` — so the
shape is requested in the prompt and enforced by `normalize()` in
`src/analyze.js`. That is the function with tests, because valid JSON in the
wrong shape is the expected failure, not malformed JSON.

See [HANDOFF.md](./HANDOFF.md) for the frontend/backend split and the contract.
