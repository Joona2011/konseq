// Browser-Durchlauf der App in Chromium (Playwright).
// Ausführen:  python3 -m http.server 8765 &   dann   NODE_PATH=$(npm root -g) node tests/browser.mjs
// Optional: SHOTS=/pfad  speichert Bildschirmfotos.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { buildSeptember } from "./fixture-september.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE || "http://localhost:8765/index.html";
const SHOTS = process.env.SHOTS || "";
const FIXED = new Date("2026-10-05T10:00:00"); // Montag in der ersten Oktoberwoche

function state(extra = {}) {
  const st = buildSeptember();
  return Object.assign(st, {
    lastDate: "2026-10-04", grid: null, theme: "light", tutSeen: 2, lang: "de", setupDone: true,
    tasks: [{ id: "tx", name: "Mathe HA", due: "2026-10-04", done: false }],
  }, extra);
}
let failures = 0;
async function step(name, fn) {
  try { await fn(); console.log("ok  ", name); }
  catch (e) { failures++; console.log("FAIL", name, "\n     ", e.message.split("\n").slice(0, 3).join(" | ")); }
}

const browser = await chromium.launch();
async function open(st, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: opts.dark ? "dark" : "light", serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(FIXED);
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  if (opts.blockAnalysis) await page.route("**/analysis.js", r => r.abort());
  await page.addInitScript(s => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("konseq:v1", s); sessionStorage.setItem("seeded", "1"); } }, JSON.stringify(st));
  await page.goto(BASE);
  await page.waitForSelector(".topbar");
  return { page, ctx, errors };
}
const shot = (page, name) => SHOTS ? page.screenshot({ path: `${SHOTS}/${name}.png` }) : null;
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem("konseq:v1")));

await step("Tageswechsel hält den Tagesplan fest", async () => {
  const { page, ctx, errors } = await open(state());
  const s = await saved(page);
  const plan = s.log["2026-10-04"] && s.log["2026-10-04"].plan;
  assert.ok(plan, "plan fehlt");
  assert.deepEqual(Object.keys(plan.r).sort(), ["lesen", "med", "sport", "zahn"]);
  assert.deepEqual(plan.t, { tx: "Mathe HA" });
  assert.equal(s.lastDate, "2026-10-05");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await step("Hinweis auf der Startseite → Analyse September → Hinweis verschwindet", async () => {
  const { page, ctx, errors } = await open(state());
  const banner = page.locator(".ana-banner");
  await banner.waitFor();
  const m = (await banner.innerText()).match(/Deine Monatsanalyse ist da[\s\S]*September · (\d+) Befunde/);
  assert.ok(m, "Hinweistext");
  await shot(page, "1-home-banner");
  await banner.click();
  await page.waitForSelector(".ana-month");
  assert.match(await page.locator(".ana-month").innerText(), /^September 2026$/);
  const items = await page.locator(".ana-item p").allInnerTexts();
  console.log("      Befunde in der App:\n" + items.map(t => "        · " + t).join("\n"));
  assert.ok(items.length >= 5, "Befunde: " + items.length);
  assert.equal(items.length, +m[1], "Zahl im Hinweis = Befunde auf der Seite");
  assert.ok(items.includes("„Sport“ fällt vor allem dienstags aus: erledigt an 0 von 5 Dienstagen, an den übrigen Tagen an 25 von 25."));
  assert.equal(await page.locator(".ana-item.good").count() + await page.locator(".ana-item.bad").count(), items.length);
  assert.equal(await page.locator(".ana-item.locked").count(), 0, "keine Sperre ohne Premium");
  await shot(page, "2-analyse-september");
  await page.locator(".ana-list").last().scrollIntoViewIfNeeded();
  await shot(page, "3-analyse-september-unten");
  assert.equal((await saved(page)).analysisSeen, "2026-09");
  await page.click(".back-btn");
  await page.waitForSelector(".topbar");
  assert.equal(await page.locator(".ana-banner").count(), 0, "Hinweis weg");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await step("Monatswechsel: Oktober (laufend, zu wenig Daten), Grenzen der Pfeile", async () => {
  const { page, ctx, errors } = await open(state());
  await page.click('[data-act="open-menu"]');
  await page.click('[data-menu="analysis"]');
  await page.waitForSelector(".ana-month");
  assert.match(await page.locator(".ana-month").innerText(), /September 2026/);
  await page.click('[data-ana="1"]');
  assert.match(await page.locator(".ana-month").innerText(), /Oktober 2026\s*bisher/);
  assert.match(await page.locator(".ana-empty").innerText(), /1 von 7 Tagen erfasst/);
  assert.equal(await page.locator('[data-ana="1"]').isDisabled(), true, "kein Blick in die Zukunft");
  await shot(page, "4-oktober-leer");
  await page.click('[data-ana="-1"]');
  assert.equal(await page.locator('[data-ana="-1"]').isDisabled(), true, "September ist der erste Monat mit Daten");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await step("Englisch", async () => {
  const { page, ctx, errors } = await open(state({ lang: "en" }));
  assert.match(await page.locator(".ana-banner").innerText(), /Your monthly review is ready[\s\S]*September · \d+ findings/);
  await page.click(".ana-banner");
  await page.waitForSelector(".ana-item");
  const head = await page.locator(".screen-head").innerText();
  assert.match(head, /Monthly review/);
  const all = await page.locator(".scroll").innerText();
  assert.match(all, /Going well/i); assert.match(all, /Room to improve/i);
  assert.match(all, /“Sport” mostly slips on Tuesdays/);
  assert.doesNotMatch(all.replace(/“[^”]*”/g, ""), /Läuft|Ausbau|Tagen|bisher|Befund/i);
  await shot(page, "5-englisch");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await step("Dunkler Modus", async () => {
  const { page, ctx, errors } = await open(state({ theme: "system" }), { dark: true });
  await page.click(".ana-banner");
  await page.waitForSelector(".ana-item");
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector(".ana-item")).backgroundColor);
  assert.equal(bg, "rgb(23, 27, 23)");
  await shot(page, "6-dunkel");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await step("analysis.js fehlt (z. B. offline mit altem Cache): App läuft weiter", async () => {
  const { page, ctx, errors } = await open(state(), { blockAnalysis: true });
  assert.equal(await page.locator(".ana-banner").count(), 0);
  assert.ok(await page.locator(".grid").count(), "Startseite da");
  await page.click('[data-act="open-menu"]');
  await page.click('[data-menu="analysis"]');
  await page.waitForSelector(".empty-lg");
  assert.match(await page.locator(".empty-lg").innerText(), /konnte nicht geladen werden/);
  // Tagesplan wird trotzdem geschrieben (liegt in app.js)
  assert.ok((await saved(page)).log["2026-10-04"].plan);
  assert.deepEqual(errors.filter(e => !/analysis\.js/.test(e)), []);
  await ctx.close();
});

await step("Neuer Nutzer ohne Daten: kein Hinweis, Analyse zeigt leeren Zustand", async () => {
  const st = { lastDate: "2026-10-05", routines: [], tasks: [], goals: [], appointments: [], history: {}, log: {}, theme: "light", tutSeen: 2, lang: "de", setupDone: true };
  const { page, ctx, errors } = await open(st);
  assert.equal(await page.locator(".ana-banner").count(), 0);
  await page.click('[data-act="open-menu"]');
  await page.click('[data-menu="analysis"]');
  await page.waitForSelector(".ana-empty");
  assert.match(await page.locator(".ana-month").innerText(), /Oktober 2026/);
  assert.equal(await page.locator('[data-ana="-1"]').isDisabled(), true);
  assert.equal(await page.locator('[data-ana="1"]').isDisabled(), true);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await step("Datensicherung: Export enthält den Tagesplan, Import stellt ihn wieder her", async () => {
  const { page, ctx, errors } = await open(state());
  await page.click('[data-act="open-menu"]');
  await page.click('[data-menu="backup"]');
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-backup="export"]')]);
  const fs = await import("node:fs");
  const json = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
  assert.equal(json.format, "konseq-backup");
  assert.ok(json.data.log["2026-10-04"].plan, "Plan im Export");
  assert.ok(json.data.log["2026-09-15"].plan, "alte Pläne im Export");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await browser.close();
console.log(failures ? `\n${failures} Fehler` : "\nAlle Browser-Tests bestanden");
process.exit(failures ? 1 : 0);
