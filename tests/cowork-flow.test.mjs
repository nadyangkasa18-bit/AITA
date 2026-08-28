import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("cowork workspace keeps the requested decision model", () => {
  const workspace = read("src/components/cowork-workspace.tsx");
  for (const phrase of [
    "Tell us what you know about this trip.",
    "What AITA ruled out",
    "Best fit for this trip",
    "Trip readiness",
    "Continue planning in OtterWay",
    "Added to this trip",
  ]) assert.ok(workspace.includes(phrase), `missing ${phrase}`);
});

test("working folder exposes Plan, Map and Trip Brain", () => {
  const folder = read("src/components/working-folder.tsx");
  assert.ok(folder.includes("Trip Brain"));
  assert.ok(folder.includes("Illustrative map · prototype travel times"));
  assert.ok(folder.includes("Flexible placeholder"));
});

test("AI import is review-first and truthful", () => {
  const modal = read("src/components/connect-ai-modal.tsx");
  assert.ok(modal.includes("Bring your travel context with you"));
  assert.ok(modal.includes("Review before anything changes"));
  assert.ok(modal.includes("does not read your ChatGPT, Claude, or Gemini memory"));
  assert.ok(modal.includes("Add selected items"));
  assert.ok(modal.includes("Add for this trip only"));
});

test("guest home supports flexible trip foundations", () => {
  const home = read("src/components/home-experience.tsx");
  assert.ok(home.includes("Help me choose"));
  assert.ok(home.includes("Dates are flexible"));
  assert.ok(home.includes("Not sure yet"));
  assert.ok(home.includes("No account required"));
});
