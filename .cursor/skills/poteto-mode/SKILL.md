---
name: poteto-mode
description: Hackathon shipping doctrine — build only what the demo touches, hardcode over configure, mock what you do not control, and keep a working demo at every commit. Use when there is a countdown (hackathon, demo in an hour, "we present at 3pm"), when scope is growing faster than the clock, when deciding whether to add a dependency or abstraction under time pressure, or when the user says "poteto", "poteto mode", "potato mode", "just make it work", or "we're demoing this".
icon: rocket
color: yellow
---

# Poteto Mode

Runs on a potato. Ships before the clock does.

The deliverable is **a demo that works**, not a codebase. Every minute spent on
something the demo will not touch is a minute stolen from something it will.

Not the same as writing bad code. Poteto code is small, obvious, and honest
about its shortcuts. It is code you can explain in one sentence while someone
watches your screen.

## The clock rule

Before any change, answer: **does the demo path go through this?**

- **Yes** → build the smallest version that survives one run-through.
- **No** → do not build it. Say so in one line and move on.

There is no third answer. "It'll only take a minute" is how the hour disappears.

## The ladder

Stop at the first rung that gets you to a working demo:

1. **Fake it.** Hardcoded return value, canned JSON, `setTimeout`. If the demo
   never exercises the real path, the real path does not need to exist yet.
2. **Hardcode it.** A constant beats a parameter. A parameter beats a config
   file. A config file beats a settings UI. Nobody is changing this today.
3. **Copy it.** Duplicated ten lines ship now. The shared abstraction ships
   never. Deduplicate on the third copy, not the second.
4. **Use what is installed.** A new dependency must save more than 15 minutes,
   counting install, docs, and the failure mode where it does not work offline.
5. **Only then:** write the real thing, minimally.

## Rules

- **Always keep a green demo.** Never leave the repo in a state where the demo
  is broken. Land a working version first, improve it second. If you are 20
  minutes from the deadline with a half-finished rewrite, revert it.
- **Mock the thing you do not control, immediately.** External API, other
  person's half, hardware that has not arrived — stub it in the first five
  minutes so nobody is blocked waiting. A stub that returns plausible data is
  worth more than a real integration that lands at minute 55.
- **Cut scope, never cut the working path.** Behind schedule means dropping a
  feature whole, not shipping three features that each half-work.
- **Timebox every unknown.** Pick the number out loud ("10 minutes on this
  CORS error"), and when it is up, take the escape hatch. Write the escape
  hatch down *before* you start.
- **Ugly is fine. Broken is not.** Inconsistent spacing, a magic number, a
  function named `doThing` — all fine. A crash on the happy path is not.
- **Commit whenever it works.** Not when it is clean. `git commit -m "works"`
  is a valid message at minute 40.
- **Demo on the demo machine.** "Works on my laptop" is not a state you can
  present from. Run the real thing on the real device before you need to.

## Do not potato

These stay real even at minute 59, because the failure is not recoverable by
apologising:

- **Secrets.** No key in client code, no key in the repo, `.gitignore` before
  the first commit. A leaked key outlives the hackathon.
- **Anything destructive.** No unguarded delete, drop, or overwrite of
  something you cannot regenerate.
- **The happy path.** It gets tested. Once, manually, end to end, on the real
  device. Everything else can be untested.

## Output

Ship the code, then at most three lines: what you faked, what you cut, and what
the escape hatch is if it breaks on stage. Mark deliberate shortcuts inline so
they are findable after the demo:

```js
// poteto: hardcoded transcript so the analysis half can be demoed.
// Real extraction is in extract(); swap back once vision works.
```

If the explanation is longer than the code, delete the explanation.
