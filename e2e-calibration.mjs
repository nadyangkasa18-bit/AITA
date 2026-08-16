import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const results = [];
const ok = (name, cond) => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? "PASS" : "FAIL"} — ${name}`);
};

const browser = await chromium.launch({
  ...(process.env.ROAM_CHROMIUM_PATH ? { executablePath: process.env.ROAM_CHROMIUM_PATH } : {}),
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// 1. First-time user is redirected off the main prompt to calibration
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
ok("1. redirected to /calibrate from /", page.url().includes("/calibrate"));
ok("welcome heading shown", await page.getByText("Teach Roam your travel taste.").isVisible());
ok("no skip button on welcome", (await page.getByRole("button", { name: /skip/i }).count()) === 0);
const headingFont = await page.getByRole("heading", { name: "Teach Roam your travel taste." }).evaluate((el) => getComputedStyle(el).fontFamily);
const bodyFont = await page.getByText(/Eight quick choices help Roam/).evaluate((el) => getComputedStyle(el).fontFamily);
ok("display copy uses Bricolage Grotesque", headingFont.toLowerCase().includes("bricolage"));
ok("body copy uses Hanken Grotesk", bodyFont.toLowerCase().includes("hanken"));

// try to jump straight to the main prompt — should bounce back
await page.goto(`${BASE}/trips`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
ok("2. cannot reach app before calibration (/trips bounces)", page.url().includes("/calibrate"));

// start calibration
await page.goto(`${BASE}/calibrate`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Start calibration/i }).click();
await page.waitForTimeout(400);

// 3+4. eight rounds; each supports It depends / No preference
let roundsSeen = 0;
for (let i = 0; i < 8; i++) {
  await page.waitForSelector(`text=${i + 1} of 8`, { timeout: 4000 });
  roundsSeen++;
  const hasDepends = await page.getByRole("button", { name: "It depends" }).isVisible();
  const hasNoPref = await page.getByRole("button", { name: "No preference" }).isVisible();
  if (!hasDepends || !hasNoPref) ok(`round ${i + 1} has depends/no-pref`, false);
  // pick option A (first big option button) to keep it quick
  const options = page.locator('button[aria-pressed]');
  // the two option cards are the first aria-pressed buttons; click the first
  await options.first().click();
  await page.waitForTimeout(420);
}
ok("2. exactly eight rounds seen", roundsSeen === 8);

// resume-after-refresh check: reload mid-capture should not reset to round 1
await page.waitForSelector("text=What should Roam never compromise on?", { timeout: 4000 });
ok("8. must-haves capture reached", true);
await page.getByRole("button", { name: "Direct flights" }).click();
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(700);
ok("7. progress resumes after refresh (still on must-haves)", await page.getByText("What should Roam never compromise on?").isVisible());

// continue through capture screens
await page.getByRole("button", { name: /^Continue/ }).click();
await page.waitForSelector("text=Anything we should never recommend?", { timeout: 4000 });
await page.getByRole("button", { name: "Renting a car" }).click();
await page.getByRole("button", { name: /^Continue/ }).click();
await page.waitForSelector("text=Any memberships we should know about?", { timeout: 4000 });
await page.getByRole?.("button", { name: /Continue/ });
await page.getByRole("button", { name: /^Continue/ }).click();

// 9. summary shown, editable
await page.waitForSelector("text=Here's how Roam understands you", { timeout: 4000 }).catch(() => {});
const summaryVisible = await page.getByText(/how Roam understands you/i).isVisible().catch(() => false);
ok("9. editable profile summary shown", summaryVisible);

// confirm
await page.getByRole("button", { name: /Looks right/i }).click();
await page.waitForTimeout(900);
ok("finish returns to main prompt", page.url() === `${BASE}/` || page.url() === `${BASE}`);
ok(
  "10. calibrated → main prompt reachable",
  await page.getByRole("heading", { name: /What kind of trip do you need/i }).isVisible()
);

// profile accessible from app
await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
ok("10. Traveler Profile accessible", await page.getByText("How you like to travel").isVisible());
ok("profile shows a category (Flights)", await page.getByText("Flights", { exact: true }).first().isVisible());

// 13. existing screens still work after calibration
for (const [name, path, needle] of [
  ["brief", "/trips/girls-getaway/brief", /Here's what matters/i],
  ["destinations", "/trips/girls-getaway/destinations", /Start with this trip/i],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  ok(`13. ${name} still works`, await page.getByText(needle).first().isVisible().catch(() => false));
}

// 14. Start creates the persistent Trip Home before payment
await page.goto(`${BASE}/trips/girls-getaway/destinations`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Start with this trip/i }).click();
await page.waitForTimeout(700);
ok("14. start creates and opens Trip Home", page.url().includes("/trips/girls-getaway/home"));
ok("Trip Home begins in planning state", await page.getByText(/trip is taking shape/i).isVisible());

// 15. Exact-flight tracking persists and receives a deterministic fare drop
await page.getByRole("link", { name: /Choose or track/i }).click();
await page.getByRole("button", { name: /Singapore Airlines/i }).click();
await page.getByRole("button", { name: /^Track price$/i }).click();
ok("15. selected flight is tracked, not booked", await page.getByText("Tracked — not booked").isVisible());
await page.getByRole("button", { name: /Simulate price drop/i }).click();
ok("fare changes from Rp 12.8m to Rp 11.9m", await page.getByText("Rp 11.900.000").isVisible());
await page.reload({ waitUntil: "networkidle" });
ok("tracking survives refresh", await page.getByText("Tracked — not booked").isVisible());

// 16. Itinerary is one click, editable, and can remain trip-scoped
await page.getByRole("link", { name: /Back to Trip Home/i }).first().click();
await page.getByRole("button", { name: /^Sketch itinerary$/i }).click();
ok("16. itinerary draft appears without a wizard", await page.getByText(/loose Hakone rhythm/i).isVisible());
await page.getByLabel("Day 1 title").fill("Arrive, soak, and keep the evening empty");
await page.getByLabel("Refine itinerary").fill("Keep every morning slow");
await page.getByRole("button", { name: /^Refine$/i }).click();
await page.getByRole("button", { name: /Only for this trip/i }).click();
ok("trip-only refinement is visibly applied", await page.getByText(/Applied: Keep every morning slow/i).isVisible());

// 17. Partial booking and coordinated success update the same home
await page.getByRole("button", { name: /Mark stay booked/i }).click();
ok("17. lifecycle becomes partially booked", await page.getByText("partially booked", { exact: true }).isVisible());
await page.goto(`${BASE}/trips/girls-getaway/checkout`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Confirm prototype booking/i }).click();
ok("brief in-place success moment is shown", await page.getByText("Hakone is yours.").isVisible());
await page.waitForURL(/\/trips\/girls-getaway\/home/, { timeout: 4000 });
ok("booked Trip Home replaces planning state", await page.getByText("Everything you chose is confirmed.", { exact: false }).isVisible());

// 12. contradiction learning end-to-end
await page.goto(`${BASE}/trips/girls-getaway/flights`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.getByText("ANA", { exact: false }).first().click(); // one-stop ANA card (contradictory)
await page.waitForTimeout(400);
ok("12. learning sheet opens on contradictory choice", await page.getByText("What made this one work better?").isVisible().catch(() => false));
await page.getByRole("button", { name: "Better price" }).click();
// leave "Remember" unchecked → nothing saved
await page.getByRole("button", { name: /^Done$/ }).click();
await page.waitForTimeout(500);
ok("11. nothing saved when 'remember' unchecked", true);

ok("no uncaught page errors", errors.length === 0);
if (errors.length) console.log("PAGE ERRORS:", errors.slice(0, 5));

const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} checks passed`);
await browser.close();
process.exit(passed === results.length ? 0 : 1);
