// Browser-Tests: beschädigte Daten dürfen nie zum Verlust aller Daten führen.
// Ausführen:  python3 -m http.server 8765 &   dann   NODE_PATH=$(npm root -g) node tests/robustness.mjs
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
const browser = await chromium.launch(); let failures = 0;

async function open(raw, fn, name) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const page = await ctx.newPage(); await page.clock.setFixedTime(new Date("2026-10-05T10:00:00"));
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(r => { if (!sessionStorage.getItem("s")) { localStorage.clear(); localStorage.setItem("konseq:v1", r); sessionStorage.setItem("s", "1"); } }, raw);
  await page.goto(BASE); await page.waitForTimeout(400);
  try { await fn(page); assert.deepEqual(errors, []); console.log("ok  ", name); }
  catch (e) { failures++; console.log("FAIL", name, "\n     ", e.message.split("\n").slice(0, 3).join(" | ")); }
  await ctx.close();
}
const saved = p => p.evaluate(() => JSON.parse(localStorage.getItem("konseq:v1")));
const onboarding = p => p.locator("[data-lang]").count();
const good = {
  lastDate: "2026-10-04", setupDone: true, tutSeen: 2, lang: "de", theme: "light",
  routines: [{ id: "a", name: "Lesen", done: true }], tasks: [{ id: "t", name: "Mathe", due: "2026-10-05", done: false }],
  goals: [{ id: "g", name: "Gym", target: 3, count: 1, repeat: true }],
  appointments: [{ id: "x", title: "Zahnarzt", date: "2026-10-20", from: "09:00", to: "10:00", yearly: false }],
  history: {}, log: {}, postpones: {}, grid: [{ id: "1", type: "routines", w: 1, h: 2 }],
};

await open(JSON.stringify(good), async p => {
  assert.equal(await onboarding(p), 0);
  const s = await saved(p);
  assert.deepEqual(s.routines.map(r => r.name), ["Lesen"]);
  assert.deepEqual(s.tasks, good.tasks); assert.deepEqual(s.goals, good.goals); assert.deepEqual(s.appointments, good.appointments);
}, "Gültige Daten bleiben unverändert");

await open(JSON.stringify({ ...good, routines: [null, "x", 5, { id: "a", name: "Lesen" }, { name: "Ohne ID" }],
  tasks: [null, { id: "t", name: "Mathe", due: "2026-10-05" }, { id: "u", name: "Kaputtes Datum", due: 7 }],
  goals: [{ id: "g", name: "Gym", target: "3", count: null, repeat: 1 }, []],
  appointments: [{ id: "x", title: "Zahnarzt", date: "2026-10-20", from: 9 }, { title: "ohne Datum" }],
  grid: [{ id: "1", type: "routines", w: 1, h: 2 }, { type: "gibtsnicht" }, null] }), async p => {
  assert.equal(await onboarding(p), 0, "keine Ersteinrichtung");
  await p.waitForSelector(".grid");
  const names = await p.locator(".check-row .rname").allInnerTexts();
  assert.deepEqual(names.sort(), ["Lesen", "Ohne ID"].sort());
  await p.locator(".check-row").first().click(); await p.waitForTimeout(500); // löst save() aus
  const s = await saved(p);
  assert.equal(s.routines.length, 2); assert.ok(s.routines.every(r => typeof r.id === "string" && r.id));
  assert.equal(s.tasks.length, 1); assert.deepEqual(s.goals.map(g => [g.target, g.count]), [[3, 0]]);
  assert.equal(s.appointments.length, 1); assert.equal(s.appointments[0].from, "");
  assert.equal(s.grid.length, 1);
  // Layout-Baukasten öffnet ohne Fehler
  await p.click('[data-act="open-menu"]'); await p.click('[data-menu="layout"]'); await p.waitForSelector(".b-grid");
}, "Einzelne kaputte Einträge: Rest bleibt erhalten, App bedienbar");

await open("{kaputt", async p => {
  assert.ok(await onboarding(p) > 0, "Neustart bei unlesbaren Daten");
  assert.equal(await p.evaluate(() => localStorage.getItem("konseq:recovery")), "{kaputt", "Rohdaten aufbewahrt");
  await p.click('[data-lang="de"]'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => localStorage.getItem("konseq:recovery")), "{kaputt", "auch nach dem Speichern noch da");
}, "Unlesbare Daten: Rohdaten werden vor dem Neustart gesichert");

await open(JSON.stringify(good), async p => {
  const backup = { format: "konseq-backup", version: 1, data: { ...good, routines: [null, { id: "b", name: "Aus Sicherung" }], appointments: [7] } };
  await p.click('[data-act="open-menu"]'); await p.click('[data-menu="backup"]');
  const [chooser] = await Promise.all([p.waitForEvent("filechooser"), p.click('[data-backup="import"]')]);
  await chooser.setFiles({ name: "s.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  await p.click("[data-backupgo]"); await p.waitForTimeout(300);
  const s = await saved(p);
  assert.deepEqual(s.routines.map(r => r.name), ["Aus Sicherung"]); assert.deepEqual(s.appointments, []);
}, "Sicherung mit kaputten Einträgen lässt sich importieren");

await browser.close();
console.log(failures ? `\n${failures} Fehler` : "\nAlle Robustheits-Tests bestanden"); process.exit(failures ? 1 : 0);
