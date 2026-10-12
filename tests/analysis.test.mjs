// Tests für die Monatsanalyse (Fahrplan Sitzung 24).
// Ausführen: node --test tests/
// Ein künstlicher September 2026 mit bewusst eingebauten Mustern. Jeder
// erwartete Befund wird mit den exakten Zahlen geprüft, die das Muster ergibt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const KA = require("../analysis.js");

import { buildSeptember } from "./fixture-september.mjs";
const pad = n => String(n).padStart(2, "0");
const ds = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const scoreFor = st => s => { const h = st.history[s]; return h ? h.rDone / h.rTotal : null; };
const TODAY = "2026-10-12";

test("September: mindestens fünf Befunde, alle mit korrekten Zahlen (DE)", () => {
  const st = buildSeptember();
  const r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: TODAY, scoreFor: scoreFor(st) });
  assert.equal(r.enough, true);
  assert.equal(r.daysWithData, 30);
  assert.equal(r.complete, true);
  const texts = r.findings.map(f => f.text);
  for (const t of texts) console.log("  ·", t);
  assert.ok(r.findings.length >= 5, "mindestens 5 Befunde, waren " + r.findings.length);

  // Werktage im September 2026: 22, davon Lesen an 21. Wochenendtage: 8, davon 1.
  assert.ok(texts.includes("„Lesen“ klappt unter der Woche fast immer (21 von 22 Tagen), am Wochenende selten (1 von 8 Tagen)."), "Lesen Woche/Wochenende");
  // Sport: 5 Dienstage nie, übrige 25 Tage immer
  assert.ok(texts.includes("„Sport“ fällt vor allem dienstags aus: erledigt an 0 von 5 Dienstagen, an den übrigen Tagen an 25 von 25."), "Sport dienstags");
  assert.ok(texts.includes("„Zähne putzen“ sitzt: erledigt an 30 von 30 Tagen."), "Zähne stark");
  assert.ok(texts.includes("„Meditieren“ bleibt oft liegen: nur an 6 von 30 Tagen erledigt."), "Meditieren schwach");
  // Verschoben: 3×2 donnerstags + 1 montags = 7
  assert.ok(texts.includes("Donnerstags verschiebst du die meisten Aufgaben: 6 von 7 Verschiebungen im September."), "Donnerstag");
  assert.ok(texts.includes("Tagesaufgaben erledigst du zuverlässig: 60 von 60 am geplanten Tag."), "Aufgaben");
  // Wochen mit Sonntag im September und vorbei: 6., 13., 20., 27. -> 4 Wochen
  assert.ok(texts.includes("Wochenziel „Gym“ in jeder Woche geschafft (4 von 4)."), "Gym");
  assert.ok(texts.includes("Wochenziel „Lernen“ hast du in keiner der 4 Wochen erreicht – im Schnitt 40 % des Ziels."), "Lernen");
  // Abschnitte korrekt einsortiert
  assert.ok(r.good.every(f => f.kind === "good") && r.bad.every(f => f.kind === "bad"));
  assert.ok(r.good.length <= 5 && r.bad.length <= 5);
  // keine Routine doppelt erwähnt
  const ids = r.findings.map(f => f.id).filter(i => i.startsWith("routine-")).map(i => i.split(":")[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("Englische Texte", () => {
  const st = buildSeptember();
  const r = KA.analyzeMonth(st, 2026, 8, { lang: "en", today: TODAY, scoreFor: scoreFor(st) });
  const texts = r.findings.map(f => f.text);
  assert.ok(texts.includes("“Lesen” works almost every time on weekdays (21 of 22 days) but rarely on weekends (1 of 8 days)."));
  assert.ok(texts.includes("You postpone the most tasks on Thursdays: 6 of 7 postponements in September."));
  assert.ok(texts.every(t => !/[äöüß„]|Tagen|von \d/.test(t.replace(/“[^”]*”/g, ""))), "kein Deutsch in EN-Texten");
});

test("Zu wenig Daten: keine Befunde, Zähler stimmt", () => {
  const st = buildSeptember();
  for (const k of Object.keys(st.history)) if (k > "2026-09-05") { delete st.history[k]; delete st.log[k]; }
  const r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: TODAY, scoreFor: scoreFor(st) });
  assert.equal(r.daysWithData, 5);
  assert.equal(r.enough, false);
  assert.equal(r.findings.length, 0);
});

test("Heute und Zukunft zählen nicht mit (laufender Monat)", () => {
  const st = buildSeptember();
  const r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: "2026-09-15", scoreFor: scoreFor(st) });
  assert.equal(r.daysWithData, 14);
  assert.equal(r.complete, false);
});

test("Alte Tage ohne Tagesplan: nur eindeutige werden genutzt", () => {
  const st = buildSeptember();
  // Tagesplan überall entfernen -> Rekonstruktion aus aktuellen Routinen + Score-Verlauf
  for (const k of Object.keys(st.log)) delete st.log[k].plan;
  let r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: TODAY, scoreFor: scoreFor(st) });
  assert.ok(r.findings.some(f => f.id === "routine-strong:zahn"), "eindeutig rekonstruierbar");
  // Eine fünfte Routine kam erst später dazu -> Plan nicht mehr eindeutig -> keine Routinen-Befunde
  st.routines.push({ id: "neu", name: "Neu", done: false });
  r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: TODAY, scoreFor: scoreFor(st) });
  assert.ok(!r.findings.some(f => f.id.startsWith("routine-")), "unsichere Tage werden nicht geschätzt");
  assert.ok(r.findings.some(f => f.id === "postpone-dow"), "Score-/Verschiebe-Befunde bleiben");
});

test("Robust gegen kaputte oder leere Daten", () => {
  for (const st of [null, undefined, {}, "x", { log: "kaputt", history: 5 }, { log: { "2026-09-01": null }, history: { "2026-09-01": { rTotal: "a" } } }]) {
    const r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: TODAY });
    assert.equal(r.findings.length, 0);
  }
  assert.equal(KA.firstDataMonth({}), null);
  assert.deepEqual(KA.firstDataMonth(buildSeptember()), { y: 2026, m: 8 });
});

test("Vergleich mit dem Vormonat", () => {
  const st = buildSeptember();
  // August: 10 Tage mit niedrigem Score
  for (let d = 1; d <= 10; d++) st.history[ds(2026, 7, d)] = { rDone: 1, rTotal: 4, tDone: 0, tTotal: 0 };
  const r = KA.analyzeMonth(st, 2026, 8, { lang: "de", today: TODAY, scoreFor: scoreFor(st) });
  const f = r.findings.find(x => x.id === "vs-prev");
  assert.ok(f, "Vormonats-Befund vorhanden");
  assert.equal(f.kind, "good");
  assert.match(f.text, /^Gegenüber August: \+\d+ Punkte im Schnitt \(Ø \d+ statt 25\)\.$/);
});

test("Häufigkeitswörter passen zu den Zahlen", () => {
  const o = KA._internal.often;
  assert.equal(o("de", 5, 5), "jedes Mal");
  assert.equal(o("de", 0, 5), "nie");
  assert.equal(o("de", 9, 10), "fast immer");
  assert.equal(o("de", 1, 3), "etwa jedes dritte Mal");
  assert.equal(o("en", 1, 2), "about every other time");
});
