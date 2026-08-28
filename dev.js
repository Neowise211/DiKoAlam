// Local dev server. Serves public/ and mounts the SAME handler Vercel runs, so
// there is no second code path to keep in sync and no `vercel` CLI to install.
//
//   npm run dev    (or: npm start)
//
// Not deployed. Vercel serves public/ statically and turns api/analyze.js into
// a function on its own — this file exists only so localhost works.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

import handler from "./api/analyze.js";
import { EMOTION_KEYS } from "./public/shared.js";

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(import.meta.dirname, "public");
const MAX_BODY = 12 * 1024 * 1024; // screenshots base64-inflate ~33%

// Allowlist, not a denylist. This ends up on hackathon wifi next to a .env.
// Add a filename here when you add a file to public/.
const PUBLIC = new Set(["index.html", "app.js", "shared.js", "styles.css", "logo.png"]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("That screenshot is too large. Crop it or take a new one."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// Give the Vercel handler the res.status().json() shape it expects.
function shim(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    const payload = JSON.stringify(body);
    res.writeHead(res.statusCode || 200, {
      "content-type": "application/json; charset=utf-8",
      "content-length": Buffer.byteLength(payload),
    });
    res.end(payload);
  };
  return res;
}

async function serveStatic(req, res) {
  const urlPath = new URL(req.url, "http://localhost").pathname;
  const rel = urlPath === "/" ? "index.html" : decodeURIComponent(urlPath).slice(1);

  if (!PUBLIC.has(rel)) return res.writeHead(404).end("Not found");

  try {
    const file = await readFile(join(PUBLIC_DIR, rel));
    res.writeHead(200, { "content-type": MIME[extname(rel)] || "application/octet-stream" });
    res.end(file);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

createServer(async (req, res) => {
  if (req.url === "/api/analyze") {
    try {
      req.body = JSON.parse(await readBody(req));
    } catch (err) {
      return shim(res).status(400).json({ error: err.message || "Malformed request body." });
    }
    return handler(req, shim(res));
  }
  if (req.method === "GET") return serveStatic(req, res);
  res.writeHead(405).end("Method not allowed");
}).listen(PORT, () => {
  console.log(`\n  Di Ko Alam  ->  http://localhost:${PORT}`);
  console.log(`  emotions:   ${EMOTION_KEYS.join(", ")}`);
  console.log(
    process.env.DEEPSEEK_API_KEY
      ? "  mode:       LIVE (DeepSeek)\n"
      : "  mode:       MOCK (no DEEPSEEK_API_KEY — serving canned results)\n",
  );
});
