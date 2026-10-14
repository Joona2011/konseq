// Gemeinsamer Testmonat für Unit- und Browser-Tests (siehe analysis.test.mjs)
const pad = n => String(n).padStart(2, "0");
const ds = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const dow = s => { const w = new Date(s + "T00:00:00").getDay(); return w === 0 ? 7 : w; };

// ---- Testmonat: September 2026 (1. = Dienstag, 30 Tage) ----
// Lesen:      werktags immer außer 1 Tag, am Wochenende nur 1 von 8
// Zähne:      jeden Tag
// Sport:      jeden Tag außer dienstags (5 Dienstage)
// Meditieren: nur an 6 Tagen
// Aufgaben:   2 pro Tag fällig, alle erledigt
// Verschoben: donnerstags 2× an 3 Donnerstagen + 1× an einem Montag
// Ziele:      Gym 3/Woche immer erreicht, Lernen 5/Woche nie (immer 2)
export function buildSeptember() {
  const st = { routines: [], tasks: [], goals: [], history: {}, log: {}, postpones: {} };
  const R = { lesen: "Lesen", zahn: "Zähne putzen", sport: "Sport", med: "Meditieren" };
  st.routines = Object.entries(R).map(([id, name]) => ({ id, name, done: false }));
  const medDays = new Set([3, 9, 14, 18, 24, 27]);
  let weekendLesenDone = 0;
  const postThu = new Set([3, 10, 17]); // Donnerstage
  // Ziele über Wochen: Zählerstand bis zum Wochenende aufbauen
  for (let d = 1; d <= 30; d++) {
    const s = ds(2026, 8, d), w = dow(s);
    const done = {};
    // Lesen
    if (w <= 5) { if (d !== 22) done.lesen = true; }
    else if (weekendLesenDone < 1 && d === 13) { done.lesen = true; weekendLesenDone++; }
    done.zahn = true;
    if (w !== 2) done.sport = true;
    if (medDays.has(d)) done.med = true;
    const r = {}; for (const id of Object.keys(done)) r[id] = { name: R[id] };
    // Wochenziele: Gym erreicht 3 bis Freitag, Lernen bleibt bei 2
    const gymCount = Math.min(3, w >= 2 ? Math.min(3, w - 1) : 0);
    const lernCount = Math.min(2, w >= 3 ? 2 : w >= 2 ? 1 : 0);
    const g = {};
    const plan = {
      r: Object.fromEntries(Object.entries(R)),
      t: { ["t" + d + "a"]: "Aufgabe A", ["t" + d + "b"]: "Aufgabe B" },
      g: { gym: ["Gym", 3, gymCount], lern: ["Lernen", 5, lernCount] },
    };
    if (gymCount === 3 && w === 4) g.gym = { name: "Gym", target: 3, add: 1, done: true };
    st.log[s] = { r, t: {}, g, plan };
    let pp = 0;
    if (w === 4 && postThu.has(d)) pp = 2;
    if (d === 7) pp = 1; // Montag
    if (pp) st.postpones[s] = pp;
    const rDone = Object.keys(done).length;
    st.history[s] = { rDone, rTotal: 4, tDone: 2 + 0.5 * pp, tTotal: 2 + pp, gPace: 1, gCount: 2 };
  }
  return st;
}
