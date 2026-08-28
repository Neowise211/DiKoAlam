// node analyze.test.js   (or: npm test)
// Covers the two functions that can be silently wrong: a bad sort or a bad
// coercion still renders a pretty chart, it just lies.

import assert from "node:assert/strict";

import { normalize } from "../src/analyze.js";
import { EMOTION_KEYS, toBars } from "../public/shared.js";

const p = (r, k) => r.emotions.find((e) => e.emotion === k).probability;
let n = 0;
const test = (name, fn) => { fn(); n++; console.log(`  ok  ${name}`); };

// --- toBars ----------------------------------------------------------------

test("toBars sorts descending", () => {
  const out = toBars([
    { emotion: "masaya", probability: 0.1 },
    { emotion: "tampo", probability: 0.6 },
    { emotion: "galit", probability: 0.3 },
  ]);
  assert.deepEqual(out.map((b) => b.emotion), ["tampo", "galit", "masaya"]);
  assert.equal(out[0].pct, 60);
});

test("toBars normalizes any scale to 100", () => {
  const out = toBars([
    { emotion: "galit", probability: 80 },
    { emotion: "pagod", probability: 20 },
  ]);
  assert.equal(out[0].pct, 80);
  assert.equal(out.reduce((s, b) => s + b.pct, 0), 100);
});

test("toBars survives an all-zero set without dividing by zero", () => {
  const out = toBars([{ emotion: "galit", probability: 0 }]);
  assert.equal(out[0].pct, 0);
});

// --- normalize -------------------------------------------------------------

const GOOD = JSON.stringify({
  emotions: [
    { emotion: "tampo", probability: 0.7 },
    { emotion: "galit", probability: 0.3 },
  ],
  ibig_sabihin: "Hindi siya okay.",
  gawin_mo: "Tawagan mo siya.",
});

test("normalize returns every emotion, zero-filling the missing ones", () => {
  const r = normalize(GOOD);
  assert.equal(r.emotions.length, EMOTION_KEYS.length);
  assert.equal(p(r, "tampo"), 0.7);
  assert.equal(p(r, "lungkot"), 0);
});

test("normalize keeps emotion order stable regardless of model order", () => {
  const shuffled = JSON.stringify({
    emotions: [
      { emotion: "masaya", probability: 0.2 },
      { emotion: "galit", probability: 0.8 },
    ],
    ibig_sabihin: "x",
    gawin_mo: "y",
  });
  assert.deepEqual(normalize(shuffled).emotions.map((e) => e.emotion), EMOTION_KEYS);
});

test("normalize drops emotions it does not recognize", () => {
  const invented = JSON.stringify({
    emotions: [
      { emotion: "inggit", probability: 0.9 },
      { emotion: "galit", probability: 0.1 },
    ],
    ibig_sabihin: "x",
    gawin_mo: "y",
  });
  const r = normalize(invented);
  assert.equal(r.emotions.length, EMOTION_KEYS.length);
  assert.ok(!r.emotions.some((e) => e.emotion === "inggit"));
});

test("normalize accepts case and whitespace drift in emotion names", () => {
  const messy = JSON.stringify({
    emotions: [{ emotion: " Tampo ", probability: 0.5 }],
    ibig_sabihin: "x",
    gawin_mo: "y",
  });
  assert.equal(p(normalize(messy), "tampo"), 0.5);
});

test("normalize clamps negatives and ignores non-numbers", () => {
  const junk = JSON.stringify({
    emotions: [
      { emotion: "galit", probability: -3 },
      { emotion: "tampo", probability: "high" },
      { emotion: "pagod", probability: 0.5 },
    ],
    ibig_sabihin: "x",
    gawin_mo: "y",
  });
  const r = normalize(junk);
  assert.equal(p(r, "galit"), 0);
  assert.equal(p(r, "tampo"), 0);
  assert.equal(p(r, "pagod"), 0.5);
});

test("normalize rejects invalid JSON", () => {
  assert.throws(() => normalize("not json"), /valid JSON/);
});

test("normalize rejects a blank verdict", () => {
  const blank = JSON.stringify({ emotions: [{ emotion: "galit", probability: 1 }], ibig_sabihin: "", gawin_mo: "" });
  assert.throws(() => normalize(blank), /blank/);
});

test("normalize rejects an all-zero score", () => {
  const zero = JSON.stringify({ emotions: [], ibig_sabihin: "x", gawin_mo: "y" });
  assert.throws(() => normalize(zero), /zero/);
});

// --- the two together, which is how they actually run ----------------------

test("normalize output feeds toBars and sums to 100", () => {
  const bars = toBars(normalize(GOOD).emotions);
  assert.equal(bars[0].emotion, "tampo");
  assert.equal(bars.reduce((s, b) => s + b.pct, 0), 100);
});

console.log(`\n${n} passed\n`);
