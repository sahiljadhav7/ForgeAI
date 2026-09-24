// Headless driver for the app. Visits each route, prints landmarks, page errors
// and failed responses as JSON, and saves one screenshot per route.
//
// node drive.mjs [--base http://localhost:3100] [--size 1440x900]
//                [--reduced-motion] [--out .] /route [/route ...]
import { chromium } from "playwright-core";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args.splice(i, 2)[1];
};
const flag = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && args.splice(i, 1).length > 0;
};

const base = opt("--base", "http://localhost:3100");
const [width, height] = opt("--size", "1440x900").split("x").map(Number);
const out = opt("--out", ".");
const reducedMotion = flag("--reduced-motion") ? "reduce" : "no-preference";
const routes = args.length ? args : ["/"];

// The installed playwright-core may expect a different Chromium build than
// the one cached on this machine, so point at the cached binary directly.
const cache = join(homedir(), ".cache/ms-playwright");
const build = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const executablePath = join(cache, build, "chrome-linux64/chrome");

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
const page = await context.newPage();

for (const route of routes) {
  const errors = [];
  const failed = [];
  const onError = (e) => errors.push(e.message);
  const onResponse = (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url().slice(0, 120)}`);
  page.on("pageerror", onError);
  page.on("response", onResponse);

  const res = await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const landmarks = await page.evaluate(() => ({
    mains: document.querySelectorAll("main").length,
    nestedMains: document.querySelectorAll("main main").length,
    headers: document.querySelectorAll("header").length,
    mainTop: document.querySelector("main")?.getBoundingClientRect().top ?? null,
  }));
  const file = join(out, `shot${route.replace(/\W+/g, "_")}_${width}x${height}.png`);
  await page.screenshot({ path: file });

  console.log(JSON.stringify({ route, finalUrl: page.url(), status: res?.status(), ...landmarks, errors, failed, screenshot: file }));
  page.off("pageerror", onError);
  page.off("response", onResponse);
}

await browser.close();
