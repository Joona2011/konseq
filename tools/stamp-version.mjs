#!/usr/bin/env node
/* Setzt bei jedem Deploy eine neue Versionskennung in app.js, sw.js und
   version.json — synchron. Dadurch muss niemand mehr von Hand eine
   Versionsnummer hochzählen.

   Als Build-Befehl in Cloudflare Pages / Netlify eintragen:
       node tools/stamp-version.mjs
   Build-Ausgabeverzeichnis: das Projekt-Stammverzeichnis ("/" bzw. ".").

   Version = erste 12 Zeichen des Commit-Hashes (von Cloudflare/Netlify
   bereitgestellt), sonst Zeitstempel YYYYMMDDHHMMSS. */
import fs from "fs";

const root = new URL("../", import.meta.url).pathname; // Projekt-Stamm (tools/ -> ..)
const sha = process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_SHA || "";
const version = sha ? sha.slice(0, 12) : new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

function patch(file, re, repl) {
  const p = root + file;
  let s = fs.readFileSync(p, "utf8");
  if (!re.test(s)) throw new Error("Muster nicht gefunden in " + file);
  fs.writeFileSync(p, s.replace(re, repl));
}

patch("app.js", /const APP_VERSION="[^"]*";/, `const APP_VERSION="${version}";`);
patch("sw.js", /const CACHE = "konseq-[^"]*";/, `const CACHE = "konseq-${version}";`);
fs.writeFileSync(root + "version.json", JSON.stringify({ version }, null, 2) + "\n");

console.log("Version gestempelt:", version);
