"use strict";
/* ================= KADENCE — Prototyp =================
   Lokal (localStorage), ein Gerät. Der Score misst nur, wie viel du
   von DEINEN eigenen Ansprüchen der letzten 10 Tage erreicht hast. */

/* ---- Datum ---- */
const pad=n=>String(n).padStart(2,"0");
const dstr=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d;};
const todayStr=()=>dstr(today());
function addDays(base,n){const d=new Date(base);d.setDate(d.getDate()+n);d.setHours(0,0,0,0);return d;}
function weekdayMon(d){const w=d.getDay();return w===0?7:w;}
const MONTHS=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DOWS=["Mo","Di","Mi","Do","Fr","Sa","So"];
const DAYNAMES=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
/* ================= Sprache (i18n) =================
   Zentrale Übersetzungsschicht: Alles, was angezeigt wird, läuft durch tr()/tx().
   Deutsch ist die Quellsprache; neue Texte nur in EN ergänzen. */
let LANG="de";
const PREVIEW_BUILD=false; // App-Paket: false -> kein Zurücksetzen-Knopf
const APP_VERSION="20261012144026"; // wird beim Deploy von tools/stamp-version.mjs gesetzt (nicht von Hand ändern)
const MONTHS_SHORT=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const L_DATA={
  de:{months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
      short:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
      dows:["Mo","Di","Mi","Do","Fr","Sa","So"],
      days:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"]},
  en:{months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      short:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      dows:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]}};
function detectLang(){try{return (navigator.language||"de").toLowerCase().startsWith("de")?"de":"en";}catch(e){return "de";}}
function setLang(l){LANG=l==="en"?"en":"de";const d=L_DATA[LANG];
  MONTHS.splice(0,12,...d.months);MONTHS_SHORT.splice(0,12,...d.short);DOWS.splice(0,7,...d.dows);DAYNAMES.splice(0,7,...d.days);
  try{document.documentElement.lang=LANG;document.title=LANG==="en"?"Konseq — Productivity on your own terms":"Konseq — Produktivität nach deinen Ansprüchen";}catch(e){}}
function fmtDM(d){return LANG==="en"?`${MONTHS[d.getMonth()]} ${d.getDate()}`:`${d.getDate()}. ${MONTHS[d.getMonth()]}`;}
const EN={
"Abbrechen":"Cancel","Alles erledigt ✦":"All done ✦",
"Als .ics teilen oder herunterladen — importierbar in jede Kalender-App.":"Share or download as .ics — works with any calendar app.",
"Als erledigt markieren":"Mark as done","Auf morgen verschieben":"Move to tomorrow","Auf morgen verschoben":"Moved to tomorrow",
"Aufgabe":"Task","Aufgaben":"Tasks","Aufgabe gespeichert":"Task saved","Aufgabe hinzufügen":"Add task","Aufgabe verschieben":"Move task","Aufgabe bearbeiten":"Edit task",
"Baustein schon platziert":"Block already placed","Bearbeiten":"Edit","Bearbeiten & Hinzufügen":"Edit & add",
"Bereits vorhanden":"Already added","Beste Woche":"Best week","Bis":"To",
"Bitte Aufgabe eingeben":"Please enter a task","Bitte Titel eingeben":"Please enter a title",
"Code empfangen":"Receive code","Code oder Link einfügen":"Paste a code or link",
"Darstellung":"Appearance","Datei erstellt":"File created","Datum":"Date","Dein Konseq-Score":"Your Konseq score",
"Download blockiert — nutze Teilen/Kopieren":"Download blocked — use share or copy",
"Datensicherung":"Backup & restore","Export & Import als Datei":"Export & import as a file",
"Alle Daten als Datei sichern oder eine Sicherung von einem anderen Gerät laden.":"Back up all data to a file, or restore a backup from another device.",
"Daten exportieren":"Export data","Als Datei auf diesem Gerät speichern":"Save to a file on this device",
"Daten importieren":"Import data","Sicherungsdatei von diesem Gerät wählen":"Choose a backup file from this device",
"Sicherung laden?":"Restore backup?",
"Alle aktuellen Daten werden durch die Sicherung ersetzt. Das lässt sich nicht rückgängig machen.":"All current data will be replaced by the backup. This cannot be undone.",
"Datei nicht lesbar":"File can't be read","Keine gültige Konseq-Sicherung":"Not a valid Konseq backup",
"Sicherung aus neuerer Version — bitte App aktualisieren":"Backup from a newer version — please update the app",
"Import fehlgeschlagen":"Import failed","Sicherung geladen":"Backup restored",
"Füge einen Link oder Code ein — oder wähle eine .ics-Datei aus Google oder Apple Kalender.":"Paste a link or code — or choose an .ics file from Google or Apple Calendar.",
"Datei wählen (.ics)":"Choose a file (.ics)","Keine Termine in der Datei":"No appointments in the file","(ohne Titel)":"(no title)",
"Neue Version verfügbar":"Update available","Neu laden":"Reload",
"Dunkel":"Dark","Dunkler Modus":"Dark mode","Einmalige To-dos":"One-time to-dos","Erledigt ✓":"Done ✓",
"Fertig":"Done","Fokus":"Focus","Folgt dem System":"Following system",
"Fortschritt statt Alles-oder-Nichts":"Progress, not all-or-nothing","Fortschritt über die Woche":"Progress across the week",
"Für jede Kalender-App":"For any calendar app","Füge den erhaltenen Link oder Code ein.":"Paste the link or code you received.",
"Gelöscht":"Deleted",
"Griff halten und ziehen zum Umsortieren. Auf der Startseite: tippen zum Erledigen, halten zum „Auf morgen verschieben“.":"Hold the handle and drag to reorder. On the home screen: tap to complete, hold to move to tomorrow.",
"Griff halten und ziehen zum Umsortieren. Ist die Zielzahl größer als 15, erscheint beim Zählen ein kleines Ziffernfeld statt +1.":"Hold the handle and drag to reorder. If the target is above 15, a small number pad appears instead of +1.",
"Halte den Griff links gedrückt und zieh die Zeile nach oben oder unten, um die Reihenfolge zu ändern. Auf den Namen tippen zum Umbenennen. Max. 20.":"Hold the handle on the left and drag the row up or down to change the order. Tap a name to rename it. Max. 20.",
"Hell":"Light","Heller Modus":"Light mode","Herunterladen":"Download","Heute":"Today","Hinzufügen":"Add","Importieren":"Import",
"In deinen Kalender übernehmen?":"Add them to your calendar?","Jahresvergleich":"Year over year",
"Jährlich wiederholen":"Repeat yearly","Jährlicher Termin gespeichert":"Yearly appointment saved",
"Jährlicher Termin gelöscht (alle Jahre)":"Yearly appointment deleted (all years)","jährlich":"yearly",
"Kalender":"Calendar","Kalender & Ereignisse":"Calendar & events","Kalender öffnen":"Open calendar",
"Kalenderdatei":"Calendar file","Kalenderdatei (.ics)":"Calendar file (.ics)",
"Kein gültiger Code/Link":"Not a valid code or link","Keine Aufgaben":"No tasks","Keine Termine":"No appointments",
"Keine Wochenziele":"No weekly goals","Kompakt":"Compact","Kopieren nicht möglich":"Copying isn't possible","Kopiert":"Copied",
"Layout":"Layout","Layout-Baukasten":"Layout builder","Leeren":"Clear","Link kopieren":"Copy link",
"Link oder Code":"Link or code","Link oder Code einfügen":"Paste link or code","Maximal 20 Routinen":"Maximum of 20 routines",
"Mit der Handy-Kamera scannen — öffnet Konseq mit den Terminen.":"Scan with a phone camera — opens Konseq with the appointments.",
"Monat wählen":"Choose month","Monate":"Months","Morgen":"Tomorrow","Name":"Name","Name und Zielzahl nötig":"Name and target required",
"Neue Routine …":"New routine …","Testdaten zurücksetzen":"Reset test data","Nur in der Vorschau · alles neu":"Preview only · start fresh","Testdaten zurücksetzen?":"Reset test data?","Zurücksetzen":"Reset","Alle Routinen, Aufgaben, Wochenziele, Termine und der Score-Verlauf werden gelöscht. Danach wählst du neue Vorlagen. Sprache, Darstellung und Layout bleiben erhalten.":"All routines, tasks, weekly goals, appointments and the score history will be deleted. Then you pick new templates. Language, appearance and layout stay as they are.","Neue Aufgabe …":"New task …","Neues Wochenziel …":"New weekly goal …","Neuer Termin":"New appointment","Neue Tagesaufgabe":"New daily task",
"Neues Wochenziel":"New weekly goal","Wochenziel bearbeiten":"Edit weekly goal","Speichern":"Save",
"Nichts offen":"Nothing open","Noch keine Routinen":"No routines yet","Noch keine Termine vorhanden":"No appointments yet",
"Keine Wochenziele vorhanden":"No weekly goals yet",
"Nächste Termine":"Upcoming","Per Link, Datei oder QR":"Via link, file or QR","Punkte":"points","QR-Code":"QR code",
"Routinen":"Routines","Schließen":"Close","Schule":"School",
"Sende diesen Link. Beim Öffnen fragt Konseq nach, ob die Termine importiert werden sollen.":"Send this link. When it's opened, Konseq asks whether to import the appointments.",
"Sobald ein ganzes Jahr an Daten vorliegt, siehst du hier deinen Fortschritt gegenüber dem Vorjahr.":"Once a full year of data exists, you'll see your progress compared to last year here.",
"Startet jede Woche neu bei 0":"Restarts at 0 every week","Startseite als Baukasten":"Build your home screen",
"System":"System","Tagesaufgaben":"Daily tasks","Teilen per Link":"Share via link","Teilen …":"Share …",
"Termin gespeichert":"Appointment saved","Termine":"Appointments","Termine empfangen":"Receive appointments",
"Termine teilen":"Share appointments","Text kopieren":"Copy text","Tippe links einen Baustein an":"Tap a block on the left",
"Titel":"Title","Tägliche Gewohnheiten":"Daily habits","Verlauf":"History","Verstanden":"Got it","Verwerfen":"Discard",
"Von":"From","Wann":"When","Wie dein Score entsteht":"How your score works","Wie möchtest du übertragen?":"How would you like to share?",
"Wiederholen":"Repeat","Wird erstellt …":"Generating …","Wischen für Monate · Titel tippen zum Springen":"Swipe for months · tap the title to jump",
"Wochen":"Weeks","Wochenziel gespeichert":"Weekly goal saved","Wochenziel hinzufügen":"Add weekly goal","Wochenziele":"Weekly goals",
"Ziele":"Goals","Zielzahl":"Target","Zum Abscannen vor Ort":"To scan in person","Zum Verschieben halten":"Hold to move",
"Ziehen zum Verschieben · Ecke ziehen = größer":"Drag to move · drag the corner to resize",
"dein Schnitt über die letzten Wochen":"your average over recent weeks","einmalig — verfallen nach dem Tag":"one-time — expire after the day",
"kehren jeden Tag zurück":"come back every day","mehrere auswählbar":"select several","von 100":"of 100","vor einem Jahr":"a year ago","jetzt":"now",
"wie viel dazu?":"how much to add?","z. B. 120":"e.g. 120","z. B. 4× ins Gym":"e.g. Gym 4×","z. B. Mathe HA S. 42":"e.g. Math homework p. 42",
"z. B. Zahnarzt":"e.g. Dentist","z. B. für Geburtstage":"e.g. for birthdays","Öffnet Konseq beim Empfänger":"Opens Konseq for the recipient",
"Übernehmen":"Apply","Übersicht":"Overview","Überspringen":"Skip","Los geht’s":"Let’s go","Weiter":"Next",
"Ø 30 Tage":"Ø 30 days","Ø 90 Tage":"Ø 90 days","letzte 7 Tage · deine eigenen Ansprüche":"last 7 days · your own standards",
"besser als im gleichen Zeitraum vor einem Jahr":"better than the same period last year","unter dem Vorjahreszeitraum":"below the same period last year",
".ics-Text anzeigen (Fallback)":"Show .ics text (fallback)","Konseq Termine":"Konseq appointments",
"Zu viele Termine für einen QR-Code — nimm dafür Link oder Datei.":"Too many appointments for one QR code — use a link or file instead.",
"QR-Bibliothek konnte nicht geladen werden (offline?).":"The QR library couldn't load (offline?).",
"Zurück":"Back","Bearbeiten-Menü":"Edit menu",
"Sprache":"Language","Wofür nutzt du Konseq?":"What will you use Konseq for?","Vorlagen hinzufügen":"Add templates",
"Wähle eine oder mehrere Vorlagen. Du kannst alles später ändern.":"Pick one or more templates. You can change everything later.",
"Leer starten":"Start empty","Studium":"University","Beruf":"Work","Sport & Fitness":"Sports & fitness","Gewohnheiten":"Habits",
"Hausaufgaben, Lernen, Klausuren":"Homework, studying, exams","Vorlesungen, Lernphasen, Lesen":"Lectures, study sessions, reading",
"Planung, Fokus, Posteingang":"Planning, focus, inbox","Training, Bewegung, Wasser":"Workouts, movement, water",
"Bessere Routinen aufbauen":"Build better routines","Schule, Studium, Beruf, Sport …":"School, university, work, sports …",
"Vorlagen hinzugefügt":"Templates added","Schon alles vorhanden":"Everything's already there",
"Monatsanalyse":"Monthly review","Was gut läuft und was nicht":"What's working and what isn't",
"Läuft gut":"Going well","Ausbaufähig":"Room to improve","bisher":"so far",
"Ø Score":"Avg score","Tage erfasst":"Days tracked","ggü. Vormonat":"vs last month",
"Vorheriger Monat":"Previous month","Nächster Monat":"Next month","Deine Monatsanalyse ist da":"Your monthly review is ready",
"Hier ist in diesem Monat nichts auffällig.":"Nothing stands out here this month.",
"Alle Befunde entstehen nach festen Regeln direkt auf deinem Gerät, nur aus deinen eigenen Daten.":"All findings are made by fixed rules right on your device, only from your own data.",
"Die Analyse konnte nicht geladen werden. Öffne die App einmal mit Internet.":"The review couldn't be loaded. Open the app once while online.",
"Mit Premium siehst du alle Befunde.":"Premium shows all findings."};
const EN_PAT=[
  [/^(\d+) erledigt$/,"$1 done"],[/^\+(\d+) weitere$/,"+$1 more"],
  [/^Ziel: (\d+)( · wiederholt sich)?$/,(m,a,b)=>"Target: "+a+(b?" · repeats weekly":"")],
  [/^Teilen( \(\d+\))?$/,"Share$1"],
  [/^(\d+) Termine? teilen$/,(m,n)=>`Share ${n} appointment${n==="1"?"":"s"}`],
  [/^(\d+) Termine? empfangen$/,(m,n)=>`${n} appointment${n==="1"?"":"s"} received`],
  [/^(\d+) Termine? importiert$/,(m,n)=>`${n} appointment${n==="1"?"":"s"} imported`],
  [/^Alle auswählen$/,"Select all"],
  [/^(\d+) Befunde?$/,(m,n)=>`${n} finding${n==="1"?"":"s"}`],[/^Keine auswählen$/,"Select none"],
  [/^Vorlage „(.+)“ übernommen$/,"Template “$1” applied"],
  [/^(Wochen|Monate) ·$/,(m,a)=>(a==="Wochen"?"Weeks":"Months")+" ·"]];
// Einzelnen Text übersetzen (Leerraum am Rand bleibt erhalten)
function tx(s){if(LANG!=="en"||s==null)return s;const str=String(s),k=str.trim();if(!k)return str;
  let r=EN[k];
  if(r===undefined){for(const [re,rep] of EN_PAT){if(re.test(k)){r=k.replace(re,rep);break;}}}
  if(r===undefined)return str;
  return str.match(/^\s*/)[0]+r+str.match(/\s*$/)[0];}
// Fertiges HTML übersetzen: Textknoten + sichtbare Attribute
function tr(html){if(LANG!=="en")return html;
  return String(html).replace(/>([^<>]+)</g,(m,t)=>">"+tx(t)+"<")
    .replace(/(placeholder|title|aria-label)="([^"]*)"/g,(m,a,v)=>a+'="'+tx(v)+'"');}

function prettyDate(str){const d=new Date(str+"T00:00:00");const t=todayStr();
  if(str===t)return "Heute";if(str===dstr(addDays(today(),1)))return "Morgen";
  return DOWS[weekdayMon(d)-1]+" "+pad(d.getDate())+"."+pad(d.getMonth()+1)+".";}
const uid=()=>Math.random().toString(36).slice(2,9);

/* ---- Größen-Mapping ---- */
const IT={1:2,2:4,3:6};                 // sichtbare Einträge je Höhe
const HMIN={1:120,2:190,3:262};         // Kachelhöhe (Home)
const BH={1:56,2:92,3:128};             // Kachelhöhe (Baukasten-Vorschau)
const BLINES={1:2,2:3,3:5};             // Andeutungslinien (Baukasten)

const COMP={
  routines:{label:"Routinen",short:"Routinen"},
  tasks:{label:"Tagesaufgaben",short:"Aufgaben"},
  goals:{label:"Wochenziele",short:"Ziele"},
  appts:{label:"Termine",short:"Termine"},
  calendar:{label:"Kalender",short:"Kalender"},
};
const PRESETS={
  fokus:[["routines",2,2],["tasks",2,2],["goals",2,2]],
  schule:[["tasks",2,3],["appts",2,1],["routines",1,2],["goals",1,2],["calendar",2,1]],
  kompakt:[["routines",1,2],["tasks",1,2],["goals",2,1],["appts",1,1],["calendar",1,1]],
};
function defaultGrid(){return [
  {id:uid(),type:"routines",w:1,h:2},{id:uid(),type:"tasks",w:1,h:2},
  {id:uid(),type:"goals",w:2,h:2},{id:uid(),type:"appts",w:2,h:1},{id:uid(),type:"calendar",w:2,h:1}];}

/* ---- State ---- */
const KEY="konseq:v1",LEGACY_KEY="kadence:v2";
let S=load();
function load(){try{const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY);
    if(raw){const st=JSON.parse(raw);const before=st&&st.lastDate;const out=migrate(rollover(st));
      // Nach einem Tageswechsel sofort sichern (Score-Verlauf + Tagesplan), nicht erst bei der
      // nächsten Aktion. Nur auf diesem Erfolgsweg — ein Lesefehler überschreibt nie Daten.
      if(st&&typeof st==="object"&&out===st&&out.lastDate!==before){try{localStorage.setItem(KEY,JSON.stringify(out));}catch(e){}}
      return out;}}catch(e){}return seed();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function migrate(st){if(!st||typeof st!=="object")return seed();
  st.routines=Array.isArray(st.routines)?st.routines:[];
  st.tasks=Array.isArray(st.tasks)?st.tasks:[];
  st.goals=Array.isArray(st.goals)?st.goals:[];
  st.appointments=Array.isArray(st.appointments)?st.appointments:[];
  st.history=(st.history&&typeof st.history==="object")?st.history:{};
  if(!Array.isArray(st.grid)||!st.grid.length)st.grid=defaultGrid();if(!st.theme)st.theme="system";if(!st.postpones)st.postpones={};
  if(!st.log||typeof st.log!=="object")st.log={};
  if(!st.lang)st.lang=detectLang();if(st.setupDone===undefined)st.setupDone=true;if(!st.lastDate)st.lastDate=todayStr();return st;}
function rollover(st){
  if(!st||typeof st!=="object")return st;
  st.routines=st.routines||[];st.tasks=st.tasks||[];st.goals=st.goals||[];st.history=st.history||{};
  const t=todayStr();if(st.lastDate===t)return st;
  if(st.lastDate){st.history=st.history||{};
    if(!st.history[st.lastDate]){
      const rt=st.routines.length,rd=st.routines.filter(r=>r.done).length;
      const due=st.tasks.filter(x=>x.due===st.lastDate);const pp=(st.postpones&&st.postpones[st.lastDate])||0;
      st.history[st.lastDate]={rDone:rd,rTotal:rt,tDone:due.filter(x=>x.done).length+0.5*pp,tTotal:due.length+pp,gPace:goalPaceAvg(st,new Date(st.lastDate+"T00:00:00")),gCount:(st.goals||[]).filter(g=>g.target>0).length};}
    // Tagesplan des abgelaufenen Tages festhalten (Grundlage der Monatsanalyse)
    try{if(!st.log||typeof st.log!=="object")st.log={};
      let lg=st.log[st.lastDate];if(!lg||typeof lg!=="object")lg=st.log[st.lastDate]={r:{},t:{},g:{}};
      if(!lg.plan)lg.plan=planSnapshot(st,st.lastDate);}catch(e){/* Analyse-Daten sind optional, Laden darf nie scheitern */}}
  st.routines.forEach(r=>r.done=false);
  // Neue Woche (Montag): wiederholende Wochenziele starten bei 0, einmalige Wochenziele enden
  if(st.lastDate){const wk=ds=>{const x=new Date(ds+"T00:00:00");return dstr(addDays(x,-(weekdayMon(x)-1)));};
    if(wk(st.lastDate)!==wk(t)){st.goals=(st.goals||[]).filter(g=>g.repeat);st.goals.forEach(g=>g.count=0);}}
  st.lastDate=t;return st;}

/* ---- Tageslog ----
   Hält ab Sitzung 1 pro Tag fest, welche Routine/Aufgabe erledigt und wie viel
   an Wochenzielen geschafft wurde. Schlüssel ist das Datum; vergangene Tage
   bleiben eingefroren. Grundlage für die Monatsanalyse (Phase 8).
   Namen werden mitgespeichert, damit die Analyse auch nach Umbenennen oder
   Löschen eines Eintrags aussagekräftig bleibt. */
function dayLog(){const d=todayStr();S.log=S.log||{};return (S.log[d]=S.log[d]||{r:{},t:{},g:{}});}
function logItemDone(kind,item,on){if(!item)return;const e=dayLog();const bucket=kind==="routine"?e.r:e.t;
  if(on)bucket[item.id]={name:item.name};else delete bucket[item.id];}
function logGoalDelta(g,delta){if(!g||!delta)return;const e=dayLog();
  const rec=e.g[g.id]||(e.g[g.id]={name:g.name,target:g.target,add:0});
  rec.name=g.name;rec.target=g.target;rec.add=(rec.add||0)+delta;rec.done=g.target>0&&g.count>=g.target;
  if(!rec.add&&!rec.done)delete e.g[g.id];}
// Was an einem Tag geplant war: Routinen, fällige Aufgaben, Wochenziele mit Stand.
// Wird beim Tageswechsel für den abgelaufenen Tag gespeichert (log[Tag].plan), damit
// die Monatsanalyse auch Nicht-Erledigtes sicher kennt. Kompakt: {id: Name}.
function planSnapshot(st,ds){const r={},t={},g={};
  (st.routines||[]).forEach(x=>{if(x&&x.id)r[x.id]=String(x.name||"");});
  (st.tasks||[]).forEach(x=>{if(x&&x.id&&x.due===ds)t[x.id]=String(x.name||"");});
  (st.goals||[]).forEach(x=>{if(x&&x.id&&x.target>0)g[x.id]=[String(x.name||""),+x.target||0,+x.count||0];});
  return {r,t,g};}

/* ---- Score ----
   Eine konsequente Woche ergibt 100: alle Routinen täglich, alle Tagesaufgaben
   ohne Aufschieben, alle Wochenziele im Plan/erreicht. Fenster = 7 Tage.
   Aufgeschobene Aufgaben zählen für den betroffenen Tag als nicht erledigt.
   Punkteverteilung je Tag nach Anzahl der Einträge:
   Routinen 30–50 %, Tagesaufgaben 0–30 %, Wochenziele den Rest (20–70 %).
   Fehlt eine Kategorie, teilen sich die übrigen ihre Punkte. */
const SHARE={rMin:.30,rMax:.50,tMax:.30};
function scoreShares(nR,nT,nG){
  if(!(nR>0)&&!(nT>0)&&!(nG>0))return null;
  const tot=(nR||0)+(nT||0)+(nG||0);
  const r=nR>0?Math.min(SHARE.rMax,Math.max(SHARE.rMin,nR/tot)):0;
  const t=nT>0?Math.min(SHARE.tMax,nT/tot):0;
  const g=nG>0?1-r-t:0;
  const sum=r+t+g;return {r:r/sum,t:t/sum,g:g/sum};}
function snapShares(sn){if(!sn)return null;
  const nG=sn.gPace==null?0:(sn.gCount!=null?sn.gCount:Math.max(1,S.goals.filter(g=>g.target>0).length));
  return scoreShares(sn.rTotal||0,sn.tTotal||0,nG);}
function goalPaceAvg(st,dateObj){const goals=st.goals.filter(g=>g.target>0);if(!goals.length)return null;
  const dayIdx=weekdayMon(dateObj);let sum=0;
  goals.forEach(g=>{const e=g.target*(dayIdx/7);sum+=e>0?Math.min(1,g.count/e):1;});return sum/goals.length;}
function todaySnapshot(){const rt=S.routines.length,rd=S.routines.filter(r=>r.done).length;
  const due=S.tasks.filter(x=>x.due===todayStr());const pp=(S.postpones&&S.postpones[todayStr()])||0;
  return {rDone:rd,rTotal:rt,tDone:due.filter(x=>x.done).length+0.5*pp,tTotal:due.length+pp,gPace:goalPaceAvg(S,today()),gCount:S.goals.filter(g=>g.target>0).length};}
function dayScore(sn){const sh=snapShares(sn);if(!sh)return null;
  return sh.r*(sn.rTotal>0?sn.rDone/sn.rTotal:0)+sh.t*(sn.tTotal>0?sn.tDone/sn.tTotal:0)+sh.g*(sn.gPace!=null?sn.gPace:0);}
function computeScore(){const days=[];
  for(let i=6;i>=0;i--){const ds=dstr(addDays(today(),-i));const sn=(i===0)?todaySnapshot():(S.history[ds]||null);days.push({ds,val:dayScore(sn)});}
  const valid=days.filter(d=>d.val!=null);
  const score=valid.length?Math.round(valid.reduce((a,d)=>a+d.val,0)/valid.length*100):null;return {score,days};}

/* ---- Seed ---- */
function seed(){const t=todayStr();const st={lastDate:t,
  routines:[],tasks:[],goals:[],appointments:[],
  history:{},log:{},grid:defaultGrid(),theme:"system",postpones:{},tutSeen:0,lang:detectLang(),setupDone:false};
  return st;}

/* ---- Icons ---- */
const I={
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  chevR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  chevD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  drag:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
  resize:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-8 8M3 21l8-8"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>',
  routine:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-3-6.7"/><path d="M21 4v5h-5"/></svg>',
  task:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  bksp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H8L2 12l6 7h13a1 1 0 001-1V6a1 1 0 00-1-1z"/><path d="M15 9l-4 6M11 9l4 6"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  qr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M20 14v.01M14 20v.01M20 20v.01M17 17v.01"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
  inbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l2-8h12l2 8M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6M4 13h5l1 2h4l1-2h5"/></svg>',
  arrowUp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  arrowDown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
};
const compIcon=t=>t==="routines"?I.routine:t==="tasks"?I.task:t==="goals"?I.target:I.cal;

/* ================= Rendering ================= */
const app=document.getElementById("app");
let route="home";
let heroSlide=0;
function go(r,back){route=r;render(back);}
function render(back){
  let html="";
  if(route==="home")html=viewHome();
  else if(route==="routines")html=viewManageRoutines();
  else if(route==="tasks")html=viewManageTasks();
  else if(route==="goals")html=viewManageGoals();
  else if(route==="termine")html=viewCalendar();
  else if(route==="share")html=viewShare();
  else if(route==="layout")html=viewLayout();
  else if(route==="analysis")html=viewAnalysis();
  app.innerHTML=tr(`<div class="screen ${back?"back":""}">${html}</div>`);
  bind();
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---- HOME ---- */
function viewHome(){
  const d=new Date();
  const grid=`<div class="grid">${S.grid.map(renderHomeTile).join("")}</div>`;
  const slides=[slideRing(),slideOverview(),slideCombined(),slideYoY()];
  const dots=slides.map((_,i)=>`<span class="dot-i ${i===heroSlide?"on":""}" data-slide="${i}"></span>`).join("");
  return `<div class="topbar">
    <div class="date"><span class="day">${DAYNAMES[d.getDay()]}</span><span class="full">${fmtDM(d)}</span></div>
    <button class="icon-btn" data-act="open-menu" aria-label="Bearbeiten">${I.grid}</button></div>
  <div class="scroll">
    ${analysisBanner()}
    <div class="hero-carousel">
      <div class="slides" id="hero-slides">${slides.join("")}</div>
      <div class="dots">${dots}</div>
    </div>
    ${grid}
  </div>`;
}
function slideRing(){
  const {score}=computeScore();
  const ringR=86,circ=2*Math.PI*ringR,pct=score==null?0:score/100,off=circ*(1-pct);
  const col=score==null?"var(--ink-3)":(score>=70?"var(--accent)":score>=45?"var(--ink)":"var(--warn)");
  return `<div class="slide"><div class="ring-wrap" data-act="score-info">
      <svg width="196" height="196" viewBox="0 0 196 196">
        <circle cx="98" cy="98" r="${ringR}" fill="none" stroke="var(--ring-track)" stroke-width="13"/>
        <circle cx="98" cy="98" r="${ringR}" fill="none" stroke="${col}" stroke-width="13" stroke-linecap="round"
          stroke-dasharray="${circ}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .7s var(--ease)"/></svg>
      <div class="ring-center"><div class="score-num" style="color:${col}">${score==null?"–":score}</div><div class="score-of">von 100</div></div></div>
    <div class="hero-label"><div class="t">Dein Konseq-Score</div>
      <button class="s" data-act="score-info">${I.info} letzte 7 Tage · deine eigenen Ansprüche</button></div></div>`;
}
function slideOverview(){
  const s30=avgDays(30),s90=avgDays(90),bw=bestWeek(12);
  const cell=(v,l)=>`<div class="ov-cell"><div class="ov-v">${v==null?"–":Math.round(v*100)}</div><div class="ov-l">${l}</div></div>`;
  return `<div class="slide"><div class="slide-h">Übersicht</div>
    <div class="ov-row">${cell(s30,"Ø 30 Tage")}${cell(s90,"Ø 90 Tage")}${cell(bw,"Beste Woche")}</div>
    <div class="chart-cap">dein Schnitt über die letzten Wochen</div></div>`;
}
function slideCombined(){
  const mk=(period,n)=>{
    const data=period==="wochen"?weeklyAverages(n):monthlyAverages(n);
    const shown=data.filter(x=>x.value!=null);
    const avg=shown.length?Math.round(shown.reduce((a,x)=>a+x.value,0)/shown.length*100):null;
    const bars=data.map(x=>{const h=x.value==null?0:Math.max(6,x.value*100);
      return `<div class="barcol"><div class="bt" title="${x.value==null?"—":Math.round(x.value*100)}"><i style="height:${h}%;background:var(--accent)"></i></div><span class="bl">${x.label}</span></div>`;}).join("");
    return `<div class="combo-block"><div class="combo-h">${period==="wochen"?"Wochen":"Monate"}${avg!=null?` · <span>Ø ${avg}</span>`:""}</div><div class="bars bars-sm" style="width:100%">${bars}</div></div>`;
  };
  return `<div class="slide"><div class="slide-h">Verlauf</div>
    <div class="combo">${mk("wochen",4)}${mk("monate",4)}</div></div>`;
}
function slideYoY(){
  const y=yoy();
  if(y.delta==null||y.cur==null||y.prev==null){
    return `<div class="slide"><div class="slide-h">Jahresvergleich</div>
      <div class="yoy-empty">Sobald ein ganzes Jahr an Daten vorliegt, siehst du hier deinen Fortschritt gegenüber dem Vorjahr.</div></div>`;
  }
  const up=y.delta>=0;
  const cur=Math.round(y.cur*100),prev=Math.round(y.prev*100);
  const lo=Math.min(cur,prev),hi=Math.max(cur,prev);
  const gc=up?"var(--accent)":"var(--warn)",gs=up?"var(--accent-soft)":"var(--warn-soft)";
  return `<div class="slide"><div class="slide-h">Jahresvergleich</div>
    <div class="yoy2">
      <div class="yoy-pill" style="color:${gc};background:${gs}"><span class="yp-ar">${up?I.arrowUp:I.arrowDown}</span>${up?"+":""}${y.delta}<span class="yp-u">Punkte</span></div>
      <div class="gauge">
        <div class="gauge-track"></div>
        <div class="gauge-gain" style="left:${lo}%;width:${hi-lo}%;background:${gc}"></div>
        <div class="gauge-mk prev" style="left:${prev}%"></div>
        <div class="gauge-mk cur" style="left:${cur}%;background:${gc};box-shadow:0 0 0 4px ${gs}"></div>
      </div>
      <div class="yoy-legend">
        <div class="yl"><div class="ylv" style="color:var(--ink-3)">${prev}</div><div class="yll">vor einem Jahr</div></div>
        <div class="yl right"><div class="ylv" style="color:${gc}">${cur}</div><div class="yll">jetzt</div></div>
      </div>
    </div>
    <div class="chart-cap">${up?"besser als im gleichen Zeitraum vor einem Jahr":"unter dem Vorjahreszeitraum"}</div></div>`;
}
function renderHomeTile(e){
  const span=e.w===2?"grid-column:span 2":"grid-column:span 1";const max=IT[e.h];
  if(e.type==="calendar")
    return `<button class="tile-card as-btn" style="${span}" data-act="open-cal"><span class="cal-ic">${I.cal}</span><span>Kalender öffnen</span></button>`;
  const style=`${span};min-height:${HMIN[e.h]}px`;let inner="";
  if(e.type==="routines"){
    const open=S.routines.filter(r=>!r.done),done=S.routines.filter(r=>r.done);
    const rows=open.slice(0,max).map(r=>rowCheck(r,"routine")).join("")||`<div class="col-empty">${S.routines.length?"Alles erledigt ✦":"Noch keine Routinen"}</div>`;
    const more=open.length>max?`<div class="tile-more">+${open.length-max} weitere</div>`:"";
    inner=`<div class="tc-title">Routinen</div>${rows}${more}${done.length?donePeek("rd"+e.id,done,"routine"):""}`;
  }else if(e.type==="tasks"){
    const td=S.tasks.filter(t=>t.due===todayStr()),open=td.filter(t=>!t.done),done=td.filter(t=>t.done);
    const rows=open.slice(0,max).map(t=>rowCheck(t,"task")).join("")||`<div class="col-empty">Nichts offen</div>`;
    const more=open.length>max?`<div class="tile-more">+${open.length-max} weitere</div>`:"";
    inner=`<div class="tc-title">Tagesaufgaben</div>${rows}${more}${done.length?donePeek("td"+e.id,done,"task"):""}`;
  }else if(e.type==="goals"){
    const dayIdx=weekdayMon(today());
    const rows=S.goals.slice(0,max).map(g=>goalRow(g,dayIdx)).join("")||`<div class="col-empty">Keine Wochenziele</div>`;
    const more=S.goals.length>max?`<div class="tile-more">+${S.goals.length-max} weitere</div>`:"";
    inner=`<div class="tc-title">Wochenziele</div>${rows}${more}`;
  }else if(e.type==="appts"){
    const up=upcomingAppts(max);
    const rows=up.map(apptRow).join("")||`<div class="col-empty">Keine Termine</div>`;
    inner=`<div class="tc-title">Nächste Termine</div>${rows}`;
  }
  return `<div class="tile-card" style="${style}">${inner}</div>`;
}
function rowCheck(item,kind){return `<div class="check-row ${item.done?"done":""}" data-check="${kind}" data-id="${item.id}"><div class="dot">${I.check}</div><div class="rname">${esc(item.name)}</div></div>`;}
function donePeek(boxId,items,kind){return `<div class="done-peek" data-peek="${boxId}">${I.chevD}<span>${items.length} erledigt</span></div><div id="${boxId}" style="display:none">${items.map(x=>rowCheck(x,kind)).join("")}</div>`;}
function goalRow(g,dayIdx){const expected=g.target*(dayIdx/7);const ahead=g.count>=expected;
  const fill=Math.min(100,g.target>0?g.count/g.target*100:0);const pace=Math.min(100,g.target>0?expected/g.target*100:0);
  return `<div class="goal" data-goal="${g.id}"><div class="goal-top"><div class="goal-name">${esc(g.name)}</div>
    <div class="goal-count ${ahead?"ahead":"behind"}">${g.count}<span class="tt">/${g.target}</span></div></div>
    <div class="bar"><i class="${ahead?"ahead":"behind"}" style="width:${fill}%"></i></div>
    <div class="pace-tick"><u style="left:${pace}%"></u></div></div>`;}
function mmdd(ds){return ds.slice(5);}
function occursOn(a,ds){return a.date===ds||(a.yearly&&mmdd(a.date)===mmdd(ds));}
function apptsOn(ds){return S.appointments.filter(a=>occursOn(a,ds));}
function nextOccurrence(a){
  if(!a.yearly)return a.date;
  const now=today();const mo=+a.date.slice(5,7)-1,dy=+a.date.slice(8,10);
  let cand=new Date(now.getFullYear(),mo,dy);cand.setHours(0,0,0,0);
  if(cand.getTime()<now.getTime())cand=new Date(now.getFullYear()+1,mo,dy);
  return dstr(cand);}
function apptRow(a){const dd=a._date||a.date;return `<div class="appt"><div class="when"><span class="t">${a.from||"–"}</span><span class="d">${prettyDate(dd)}</span></div>
  <div class="bar-v"></div><div class="info"><div class="ti">${esc(a.title)}${a.yearly?" ·":""}</div><div class="se">${a.yearly?"jährlich":(a.from||"")}${!a.yearly&&a.to?" – "+a.to:""}</div></div></div>`;}
function upcomingAppts(n){const now=today().getTime();
  return S.appointments.map(a=>{const dd=nextOccurrence(a);return {...a,_date:dd,ts:new Date(dd+"T"+(a.from||"00:00")).getTime()};})
    .filter(a=>a.ts>=now).sort((a,b)=>a.ts-b.ts).slice(0,n);}

/* ---- Verwaltungen ---- */
function head(title,sub){return `<div class="screen-head"><button class="back-btn" data-act="home">${I.back}</button>
  <div><h1>${title}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div></div>`;}
const emptyMini=t=>`<div class="empty-lg">${t}</div>`;
function gripEl(){return `<button class="grip" aria-label="Zum Verschieben halten">${I.drag}</button>`;}

function viewManageRoutines(){
  const items=S.routines.map(r=>`<div class="manage-item" data-mid="${r.id}">${gripEl()}
    <input class="mname" data-rename="routine" data-id="${r.id}" value="${esc(r.name)}"/>
    <button class="trash" data-del="routine" data-id="${r.id}">${I.trash}</button></div>`).join("");
  return head("Routinen","kehren jeden Tag zurück")+`<div class="scroll">
    <div class="manage-list" data-reorder="routine">${items||emptyMini("Noch keine Routinen")}</div>
    <div class="add-field"><input type="text" placeholder="Neue Routine …" data-addinput="add-routine"/><button class="add-go" data-add="add-routine">${I.plus}</button></div>
    <div class="hint">Halte den Griff links gedrückt und zieh die Zeile nach oben oder unten, um die Reihenfolge zu ändern. Auf den Namen tippen zum Umbenennen. Max. 20.</div></div>`;
}
function viewManageTasks(){
  const items=S.tasks.map(t=>`<div class="manage-item" data-mid="${t.id}">${gripEl()}
    <div class="mname" data-rename="task" data-id="${t.id}">${esc(t.name)}<small class="mmeta">${prettyDate(t.due)}</small></div>
    <button class="trash" data-del="task" data-id="${t.id}">${I.trash}</button></div>`).join("");
  return head("Tagesaufgaben","einmalig — verfallen nach dem Tag")+`<div class="scroll">
    <div class="manage-list" data-reorder="task">${items||emptyMini("Keine Aufgaben")}</div>
    <button type="button" class="add-field add-btn" data-act="new-task"><span class="add-ph">Neue Aufgabe …</span><span class="add-go">${I.plus}</span></button>
    <div class="hint">Griff halten und ziehen zum Umsortieren. Auf der Startseite: tippen zum Erledigen, halten zum „Auf morgen verschieben“.</div></div>`;
}
function viewManageGoals(){
  const items=S.goals.map(g=>`<div class="manage-item" data-mid="${g.id}">${gripEl()}
    <div class="mname" data-editgoal="${g.id}">${esc(g.name)}<small class="mmeta">Ziel: ${g.target}${g.repeat?" · wiederholt sich":""}</small></div>
    <button class="trash" data-del="goal" data-id="${g.id}">${I.trash}</button></div>`).join("");
  return head("Wochenziele","Fortschritt statt Alles-oder-Nichts")+`<div class="scroll">
    <div class="manage-list" data-reorder="goal">${items||emptyMini("Keine Wochenziele")}</div>
    <button type="button" class="add-field add-btn" data-act="new-goal"><span class="add-ph">Neues Wochenziel …</span><span class="add-go">${I.plus}</span></button>
    <div class="hint">Griff halten und ziehen zum Umsortieren. Ist die Zielzahl größer als 15, erscheint beim Zählen ein kleines Ziffernfeld statt +1.</div></div>`;
}

/* ---- Layout-Baukasten ---- */
function miniFor(key){return PRESETS[key].map(([t,w,h])=>`<i style="grid-column:span ${w}"></i>`).join("");}
function builderTileHTML(e){const span=e.w===2?"grid-column:span 2":"";
  const lines=Array.from({length:BLINES[e.h]}).map(()=>"<i></i>").join("");
  return `<div class="b-tile" style="${span};min-height:${BH[e.h]}px" data-btile="${e.id}">
    <button class="b-remove" data-bremove="${e.id}">${I.x}</button>
    <div class="b-th">${compIcon(e.type)}${COMP[e.type].label}</div>
    <div class="b-lines">${lines}</div>
    <button class="b-handle" data-bhandle="${e.id}">${I.resize}</button></div>`;}
function viewLayout(){
  const rail=Object.keys(COMP).map(type=>{const placed=S.grid.some(e=>e.type===type);
    return `<button class="b-comp ${placed?"placed":""}" data-addcomp="${type}">${compIcon(type)}<span>${COMP[type].short}</span></button>`;}).join("");
  const tiles=S.grid.map(builderTileHTML).join("")||`<div class="empty-lg" style="grid-column:span 2">Tippe links einen Baustein an</div>`;
  const preset=(k,l)=>`<button class="b-preset" data-preset="${k}"><div class="mini">${miniFor(k)}</div><span>${l}</span></button>`;
  return `<div class="screen-head"><button class="back-btn" data-act="home">${I.back}</button>
      <div><h1>Layout-Baukasten</h1><div class="sub">Ziehen zum Verschieben · Ecke ziehen = größer</div></div></div>
    <div class="theme-bar"><span class="tb-label">Darstellung</span>
      <div class="seg seg-sm" id="theme-seg">
        <button data-theme-set="system" class="${S.theme==="system"?"on":""}">System</button>
        <button data-theme-set="light" class="${S.theme==="light"?"on":""}">Hell</button>
        <button data-theme-set="dark" class="${S.theme==="dark"?"on":""}">Dunkel</button>
      </div></div>
    <div class="theme-bar"><span class="tb-label">Sprache</span>
      <div class="seg seg-sm">
        <button data-lang-set="de" class="${LANG==="de"?"on":""}">Deutsch</button>
        <button data-lang-set="en" class="${LANG==="en"?"on":""}">English</button>
      </div></div>
    <div class="builder">
      <div class="b-rail">${rail}</div>
      <div class="b-preview"><div class="b-grid">${tiles}</div></div>
      <div class="b-presets">${preset("fokus","Fokus")}${preset("schule","Schule")}${preset("kompakt","Kompakt")}</div>
    </div>`;
}

/* ================= Sheets ================= */
function openSheet(html,center){closeSheet();
  const scrim=document.createElement("div");scrim.className="scrim"+(center?" center":"");scrim.id="scrim";scrim.innerHTML=tr(html);
  scrim.addEventListener("pointerdown",e=>{if(e.target===scrim)closeSheet();});
  app.appendChild(scrim);bindSheet(scrim);}
function closeSheet(){const s=document.getElementById("scrim");if(s)s.remove();}

function sheetAddMenu(){const item=(act,ic,a,b)=>`<button class="menu-item" data-menu="${act}"><span class="mi-ic">${ic}</span><span class="mi-tx"><span class="a">${a}</span><span class="b">${b}</span></span><span class="chev">${I.chevR}</span></button>`;
  return `<div class="sheet"><div class="grip-bar"></div><h3>Bearbeiten & Hinzufügen</h3><div class="menu-list">
    ${item("routines",I.routine,"Routinen","Tägliche Gewohnheiten")}
    ${item("tasks",I.task,"Tagesaufgaben","Einmalige To-dos")}
    ${item("goals",I.target,"Wochenziele","Fortschritt über die Woche")}
    ${item("termine",I.cal,"Termine","Kalender & Ereignisse")}
    ${item("share",I.share,"Termine teilen","Per Link, Datei oder QR")}
    ${item("receive",I.inbox,"Termine empfangen","Code oder Link einfügen")}
    ${item("templates",I.plus,"Vorlagen hinzufügen","Schule, Studium, Beruf, Sport …")}
    ${item("analysis",I.chart,"Monatsanalyse","Was gut läuft und was nicht")}
    ${item("layout",I.grid,"Layout","Startseite als Baukasten")}
    ${item("backup",I.shield,"Datensicherung","Export & Import als Datei")}</div>
    ${PREVIEW_BUILD?`<button class="menu-item" data-menu="reset" style="margin-top:4px"><span class="mi-ic" style="background:var(--warn-soft);color:var(--warn)">${I.routine}</span><span class="mi-tx"><span class="a" style="color:var(--warn)">Testdaten zurücksetzen</span><span class="b">Nur in der Vorschau · alles neu</span></span></button>`:""}</div>`;}
function sheetScoreInfo(){if(LANG==="en")return `<div class="sheet"><div class="grip-bar"></div><h3>How your score works</h3>
  <p class="sh-sub" style="line-height:1.6;font-size:13.5px;color:var(--ink-2)">Konseq compares you with <b>nobody</b> but yourself. The number shows how much of your own standards you met over the last <b>7 days</b>.</p>
  <div style="font-size:13px;color:var(--ink-2);line-height:1.7;padding:0 4px">
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:var(--accent);font-weight:700">•</span><span><b>Routines:</b> done ÷ planned. Worth <b>30–50 points</b>, depending on how many you have.</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:var(--accent);font-weight:700">•</span><span><b>Daily tasks:</b> done ÷ due, moving one to tomorrow counts only half. Worth <b>0–30 points</b>, depending on how many are due.</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:var(--accent);font-weight:700">•</span><span><b>Weekly goals:</b> your pace — on track (target ÷ 7 per day) counts in full. They get <b>the rest</b>: the more goals compared with routines, the more points.</span></div>
    <div style="display:flex;gap:10px"><span style="color:var(--accent);font-weight:700">•</span><span>A full week of everything done — routines daily, tasks without postponing, goals on track — gives <b>100</b>.</span></div></div>
  ${shareLine()}
  <div class="pop-actions"><button class="btn-primary" data-menu="close">Got it</button></div></div>`;
  return `<div class="sheet"><div class="grip-bar"></div><h3>Wie dein Score entsteht</h3>
  <p class="sh-sub" style="line-height:1.6;font-size:13.5px;color:var(--ink-2)">Konseq vergleicht dich mit <b>niemandem</b> außer dir selbst. Der Wert zeigt, wie viel du von deinen eigenen Ansprüchen der letzten <b>7 Tage</b> erreicht hast.</p>
  <div style="font-size:13px;color:var(--ink-2);line-height:1.7;padding:0 4px">
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:var(--accent);font-weight:700">•</span><span><b>Routinen:</b> erledigt ÷ geplant. Geben je nach Anzahl <b>30–50 Punkte</b>.</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:var(--accent);font-weight:700">•</span><span><b>Tagesaufgaben:</b> erledigt ÷ fällig, auf morgen verschoben zählt nur halb. Geben je nach Anzahl <b>0–30 Punkte</b>.</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:var(--accent);font-weight:700">•</span><span><b>Wochenziele:</b> dein Tempo — im Plan (Ziel ÷ 7 pro Tag) zählt voll. Sie bekommen <b>den Rest</b>: je mehr Ziele im Vergleich zu Routinen, desto mehr Punkte.</span></div>
    <div style="display:flex;gap:10px"><span style="color:var(--accent);font-weight:700">•</span><span>Eine ganze Woche alles erfüllt — Routinen täglich, Aufgaben ohne Aufschieben, Ziele im Plan — ergibt <b>100</b>.</span></div></div>
  ${shareLine()}
  <div class="pop-actions"><button class="btn-primary" data-menu="close">Verstanden</button></div></div>`;}
// Aktuelle Aufteilung der 100 Punkte (heute), gerundet so, dass die Summe 100 bleibt
function shareLine(){const sh=snapShares(todaySnapshot());if(!sh)return "";
  const r=Math.round(sh.r*100),t=Math.round(sh.t*100),g=100-r-t;
  const L=LANG==="en"?["Right now","Routines","Tasks","Goals"]:["Aktuell","Routinen","Aufgaben","Wochenziele"];
  return `<div class="share-line"><b>${L[0]}:</b> ${L[1]} ${r} · ${L[2]} ${t} · ${L[3]} ${g}</div>`;}

let taskDraft={name:"",mode:"heute",date:todayStr()};
function sheetNewTask(){return `<div class="popcard" data-stop><h3>${taskDraft.edit?"Aufgabe bearbeiten":"Neue Tagesaufgabe"}</h3>
  <div class="field"><label>Aufgabe</label><input type="text" id="t-name" placeholder="z. B. Mathe HA S. 42" value="${esc(taskDraft.name)}"/></div>
  <div class="field"><label>Wann</label><div class="seg" id="t-seg">
    <button data-tmode="heute" class="${taskDraft.mode==="heute"?"on":""}">Heute</button>
    <button data-tmode="morgen" class="${taskDraft.mode==="morgen"?"on":""}">Morgen</button>
    <button data-tmode="datum" class="${taskDraft.mode==="datum"?"on":""}">Datum</button></div></div>
  <div class="field" id="t-datewrap" style="${taskDraft.mode==="datum"?"":"display:none"}"><input type="date" id="t-date" value="${taskDraft.date}"/></div>
  <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-save="task">${taskDraft.edit?"Speichern":"Hinzufügen"}</button></div></div>`;}

let goalDraft={id:null,name:"",target:"",repeat:true};
function sheetNewGoal(){return `<div class="popcard" data-stop><h3>${goalDraft.id?"Wochenziel bearbeiten":"Neues Wochenziel"}</h3>
  <div class="field"><label>Name</label><input type="text" id="g-name" placeholder="z. B. 4× ins Gym" value="${esc(goalDraft.name)}"/></div>
  <div class="field"><label>Zielzahl</label><input type="number" id="g-target" inputmode="numeric" placeholder="z. B. 120" value="${goalDraft.target}"/></div>
  <div class="field"><div class="toggle-row"><div class="tl">Wiederholen<small>Startet jede Woche neu bei 0</small></div><button class="switch ${goalDraft.repeat?"on":""}" id="g-rep"></button></div></div>
  <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-save="goal">${goalDraft.id?"Speichern":"Hinzufügen"}</button></div></div>`;}

let apptDraft={title:"",date:todayStr(),from:"",to:"",yearly:false};
function sheetNewAppt(){return `<div class="popcard" data-stop><h3>Neuer Termin</h3>
  <div class="field"><label>Titel</label><input type="text" id="a-title" placeholder="z. B. Zahnarzt" value="${esc(apptDraft.title)}"/></div>
  <div class="field"><label>Datum</label><input type="date" id="a-date" value="${apptDraft.date}"/></div>
  <div class="field" style="display:flex;gap:10px">
    <div style="flex:1"><label>Von</label><button type="button" class="time-btn ${apptDraft.from?"":"empty"}" data-timepick="from"><span class="tb-val">${apptDraft.from||"–:–"}</span>${I.clock}</button><input type="hidden" id="a-from" value="${apptDraft.from}"/></div>
    <div style="flex:1"><label>Bis</label><button type="button" class="time-btn ${apptDraft.to?"":"empty"}" data-timepick="to"><span class="tb-val">${apptDraft.to||"–:–"}</span>${I.clock}</button><input type="hidden" id="a-to" value="${apptDraft.to}"/></div></div>
  <div class="tp-panel" id="tp-panel" style="display:none"></div>
  <div class="field"><div class="toggle-row"><div class="tl">Jährlich wiederholen<small>z. B. für Geburtstage</small></div><button class="switch ${apptDraft.yearly?"on":""}" id="a-yearly"></button></div></div>
  <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-save="appt">Hinzufügen</button></div></div>`;}

/* ---- Zeitwähler im App-Stil (Stunden- und Minutenrad) ---- */
function openTimePanel(scrim,which){
  const panel=scrim.querySelector("#tp-panel"),inp=scrim.querySelector("#a-"+which);
  const btn=scrim.querySelector(`[data-timepick="${which}"]`);
  if(!panel||!inp||!btn)return;
  // Gleicher Knopf erneut getippt -> Panel schließen
  if(panel.style.display!=="none"&&panel.dataset.which===which){panel.style.display="none";btn.classList.remove("active");return;}
  scrim.querySelectorAll("[data-timepick]").forEach(b=>b.classList.toggle("active",b===btn));
  let cur=inp.value;
  if(!cur){const f=scrim.querySelector("#a-from").value;
    if(which==="to"&&f){const p=f.split(":").map(Number);cur=pad(Math.min(23,p[0]+1))+":"+pad(p[1]);}else cur="08:00";}
  const [h0,m0]=cur.split(":").map(Number);const mIdx0=Math.min(11,Math.round(m0/5));
  const hours=Array.from({length:24},(_,i)=>`<div class="wheel-item" data-i="${i}">${pad(i)}</div>`).join("");
  const mins=Array.from({length:12},(_,i)=>`<div class="wheel-item" data-i="${i}">${pad(i*5)}</div>`).join("");
  panel.dataset.which=which;
  panel.innerHTML=tr(`<div class="tp-wheels">
      <div class="wheel" id="tp-h"><div class="wheel-pad"></div>${hours}<div class="wheel-pad"></div></div>
      <div class="tp-colon">:</div>
      <div class="wheel" id="tp-m"><div class="wheel-pad"></div>${mins}<div class="wheel-pad"></div></div>
      <div class="wheel-band"></div></div>
    <div class="tp-actions"><button type="button" class="btn-ghost" data-tp="clear">Leeren</button><button type="button" class="btn-primary" data-tp="ok">Übernehmen</button></div>`);
  panel.style.display="block";
  const wh=panel.querySelector("#tp-h"),wm=panel.querySelector("#tp-m");
  const mark=w=>{const i=Math.round(w.scrollTop/40);w.querySelectorAll(".wheel-item").forEach((it,k)=>it.classList.toggle("on",k===i));};
  [wh,wm].forEach(w=>{let t;w.addEventListener("scroll",()=>{clearTimeout(t);t=setTimeout(()=>mark(w),40);});
    w.querySelectorAll(".wheel-item").forEach(it=>it.addEventListener("click",()=>w.scrollTo({top:+it.dataset.i*40,behavior:"smooth"})));});
  requestAnimationFrame(()=>{wh.scrollTop=h0*40;wm.scrollTop=mIdx0*40;mark(wh);mark(wm);});
  const close=()=>{panel.style.display="none";btn.classList.remove("active");};
  panel.querySelector('[data-tp="ok"]').addEventListener("click",()=>{
    const h=Math.max(0,Math.min(23,Math.round(wh.scrollTop/40))),m=Math.max(0,Math.min(11,Math.round(wm.scrollTop/40)))*5;
    const val=pad(h)+":"+pad(m);inp.value=val;apptDraft[which]=val;btn.querySelector(".tb-val").textContent=val;btn.classList.remove("empty");
    if(which==="from"){const ti=scrim.querySelector("#a-to"),tb=scrim.querySelector('[data-timepick="to"]');
      if(ti&&tb&&(!ti.value||ti.value<=val)){const nv=pad(Math.min(23,h+1))+":"+pad(m);ti.value=nv;apptDraft.to=nv;tb.querySelector(".tb-val").textContent=nv;tb.classList.remove("empty");}}
    close();});
  panel.querySelector('[data-tp="clear"]').addEventListener("click",()=>{
    inp.value="";apptDraft[which]="";btn.querySelector(".tb-val").textContent="–:–";btn.classList.add("empty");close();});
}
function sheetMoveTask(id){const t=S.tasks.find(x=>x.id===id);if(!t)return"";
  return `<div class="sheet"><div class="grip-bar"></div><h3>${esc(t.name)}</h3><p class="sh-sub">Aufgabe verschieben</p><div class="menu-list">
    <button class="menu-item" data-move-task="${id}" data-to="1"><span class="mi-ic">${I.chevR}</span><span class="mi-tx"><span class="a">Auf morgen verschieben</span><span class="b">${prettyDate(dstr(addDays(today(),1)))}</span></span></button>
    <button class="menu-item" data-move-task="${id}" data-to="done"><span class="mi-ic">${I.check}</span><span class="mi-tx"><span class="a">Als erledigt markieren</span></span></button></div></div>`;}

let padState={goalId:null,val:0};
function sheetKeypad(){const g=S.goals.find(x=>x.id===padState.goalId);if(!g)return"";const k=n=>`<button data-key="${n}">${n}</button>`;
  return `<div class="popcard" data-stop style="max-width:300px"><h3>${esc(g.name)}</h3>
    <div class="kp-hint">wie viel dazu?</div>
    <div class="keypad-val">+${padState.val}</div>
    <div class="keypad-sub" id="kp-sub">${g.count} → ${g.count+padState.val} <span>/ ${g.target}</span></div>
    <div class="keypad">${k(1)}${k(2)}${k(3)}${k(4)}${k(5)}${k(6)}${k(7)}${k(8)}${k(9)}<button data-key="del">${I.bksp}</button>${k(0)}<button class="ok" data-key="ok">${I.check}</button></div></div>`;}

/* ================= Bindung ================= */
let press={timer:null,long:false};
function bindActs(root){root.querySelectorAll("[data-act]").forEach(el=>el.addEventListener("click",()=>{
    const a=el.dataset.act;
    if(a==="home")go("home",true);
    else if(a==="open-menu")openSheet(sheetAddMenu());
    else if(a==="score-info")openSheet(sheetScoreInfo());
    else if(a==="open-cal")go("termine");
    else if(a==="open-analysis"){anaY=null;go("analysis");}
    else if(a==="new-task"){taskDraft={name:"",mode:"heute",date:todayStr()};openSheet(sheetNewTask(),true);}
    else if(a==="new-goal"){goalDraft={id:null,name:"",target:"",repeat:true};openSheet(sheetNewGoal(),true);}
    else if(a==="new-appt-cal"){apptDraft={title:"",date:calSel||todayStr(),from:"",to:"",yearly:false};openSheet(sheetNewAppt(),true);}
  }));}
function bindPeeks(root){root.querySelectorAll("[data-peek]").forEach(el=>el.addEventListener("click",()=>{
    const box=document.getElementById(el.dataset.peek);if(!box)return;const open=box.style.display!=="none";
    box.style.display=open?"none":"block";el.classList.toggle("open",!open);}));}
function bindCheckRows(root){root.querySelectorAll("[data-check]").forEach(el=>{
    el.addEventListener("pointerdown",()=>{press.long=false;
      if(el.dataset.check==="task")press.timer=setTimeout(()=>{press.long=true;openSheet(sheetMoveTask(el.dataset.id));},480);});
    el.addEventListener("pointerup",()=>{clearTimeout(press.timer);if(press.long)return;toggleCheck(el.dataset.check,el.dataset.id,el);});
    el.addEventListener("pointerleave",()=>clearTimeout(press.timer));});}
function bindGoalRows(root){root.querySelectorAll("[data-goal]").forEach(el=>{
    el.addEventListener("pointerdown",()=>{press.long=false;press.timer=setTimeout(()=>{press.long=true;bumpGoal(el.dataset.goal,-1);},420);});
    el.addEventListener("pointerup",()=>{clearTimeout(press.timer);if(press.long)return;
      const g=S.goals.find(x=>x.id===el.dataset.goal);
      if(g&&g.target>15){padState={goalId:g.id,val:0};openSheet(sheetKeypad(),true);}else bumpGoal(el.dataset.goal,1);});
    el.addEventListener("pointerleave",()=>clearTimeout(press.timer));});}
// Nur Diagramm + Kacheln der Startseite aktualisieren, Scrollposition behalten
function softRefreshHome(){
  if(route!=="home"){render();return;}
  const sc=app.querySelector(".scroll");const top=sc?sc.scrollTop:0;
  const car=app.querySelector(".hero-carousel");
  if(car){const slides=[slideRing(),slideOverview(),slideCombined(),slideYoY()];
    const dots=slides.map((_,i)=>`<span class="dot-i ${i===heroSlide?"on":""}"></span>`).join("");
    car.innerHTML=tr(`<div class="slides" id="hero-slides">${slides.join("")}</div><div class="dots">${dots}</div>`);
    bindHero();bindActs(car);}
  const grid=app.querySelector(".grid");
  if(grid){grid.innerHTML=tr(S.grid.map(renderHomeTile).join(""));
    bindCheckRows(grid);bindGoalRows(grid);bindPeeks(grid);bindActs(grid);}
  if(sc)sc.scrollTop=top;
}
function bind(){
  bindActs(app);bindPeeks(app);bindCheckRows(app);bindGoalRows(app);

  // Verwaltung: löschen/umbenennen/bearbeiten/hinzufügen
  app.querySelectorAll("[data-del]").forEach(el=>el.addEventListener("click",()=>delItem(el.dataset.del,el.dataset.id)));
  app.querySelectorAll("input[data-rename]").forEach(el=>el.addEventListener("change",()=>renameItem(el.dataset.rename,el.dataset.id,el.value)));
  app.querySelectorAll("[data-rename='task']").forEach(el=>el.addEventListener("click",()=>{
    const t=S.tasks.find(x=>x.id===el.dataset.id);if(!t)return;
    taskDraft={name:t.name,mode:t.due===todayStr()?"heute":(t.due===dstr(addDays(today(),1))?"morgen":"datum"),date:t.due,edit:t.id};openSheet(sheetNewTask(),true);}));
  app.querySelectorAll("[data-editgoal]").forEach(el=>el.addEventListener("click",()=>{
    const g=S.goals.find(x=>x.id===el.dataset.editgoal);if(!g)return;
    goalDraft={id:g.id,name:g.name,target:g.target,repeat:g.repeat};openSheet(sheetNewGoal(),true);}));
  app.querySelectorAll("[data-add]").forEach(el=>el.addEventListener("click",()=>addFromField(el.dataset.add)));
  app.querySelectorAll("[data-addinput]").forEach(el=>el.addEventListener("keydown",e=>{if(e.key==="Enter")addFromField(el.dataset.addinput);}));

  // Drag-Reorder (Routinen/Tagesaufgaben/Wochenziele)
  const rl=app.querySelector("[data-reorder]");
  if(rl)wireReorder(rl,rl.dataset.reorder);

  // Baukasten
  if(route==="layout")bindBuilder();
  // Kalender
  if(route==="termine")bindCalendar();
  // Teilen
  if(route==="share")bindShare();
  // Monatsanalyse
  if(route==="analysis")bindAnalysis();
  // Startseite: Wisch-Karussell
  if(route==="home")bindHero();
}

function bindSheet(scrim){
  scrim.querySelectorAll("[data-menu]").forEach(el=>el.addEventListener("click",()=>{
    const m=el.dataset.menu;if(m==="close"){closeSheet();return;}
    if(m==="share"){shareSel=new Set();closeSheet();go("share");return;}
    if(m==="receive"){closeSheet();openReceive();return;}
    if(m==="templates"){openProfilePicker(false);return;}
    if(m==="backup"){closeSheet();openSheet(sheetBackup());return;}
    if(m==="reset"&&PREVIEW_BUILD){openResetConfirm();return;}
    closeSheet();
    if(m==="analysis")anaY=null;
    if(["routines","tasks","goals","termine","layout","analysis"].includes(m))go(m);}));
  scrim.querySelectorAll("[data-method]").forEach(el=>el.addEventListener("click",()=>openMethod(el.dataset.method)));
  scrim.querySelectorAll("[data-copy]").forEach(el=>el.addEventListener("click",()=>{const t=scrim.querySelector("#"+el.dataset.copy);if(t)copyText(t.value);}));
  scrim.querySelectorAll("[data-doshare]").forEach(el=>el.addEventListener("click",()=>{
    if(el.dataset.doshare==="url"){const i=scrim.querySelector("#share-url");if(i)navShare(i.value);}
    else if(el.dataset.doshare==="ics")navShareFile(currentICS,"konseq-termine.ics","text/calendar");}));
  scrim.querySelectorAll("[data-icsdl]").forEach(el=>el.addEventListener("click",()=>downloadFile(currentICS,"konseq-termine.ics","text/calendar")));
  const recg=scrim.querySelector("[data-recgo]");if(recg)recg.addEventListener("click",()=>{
    const inp=scrim.querySelector("#rec-in");const d=inp?decodePayload(inp.value):null;
    if(!d||!d.length){toast("Kein gültiger Code/Link");return;}openImportConfirm(d);});
  const rf=scrim.querySelector("[data-receivefile]");if(rf)rf.addEventListener("click",()=>pickICSFile());
  const rg=scrim.querySelector("[data-resetgo]");if(rg)rg.addEventListener("click",()=>{resetTestData();closeSheet();route="home";render();openProfilePicker(true);});
  const impg=scrim.querySelector("[data-importgo]");if(impg)impg.addEventListener("click",()=>{doImport(pendingImport);closeSheet();});
  scrim.querySelectorAll("[data-backup]").forEach(el=>el.addEventListener("click",()=>{const a=el.dataset.backup;if(a==="export")exportBackup();else if(a==="import")pickBackupFile();}));
  const bkg=scrim.querySelector("[data-backupgo]");if(bkg)bkg.addEventListener("click",()=>applyBackup(pendingBackup));
  scrim.querySelectorAll("[data-day-add]").forEach(el=>el.addEventListener("click",()=>{apptDraft={title:"",date:el.dataset.dayAdd,from:"",to:"",yearly:false};openSheet(sheetNewAppt(),true);}));
  scrim.querySelectorAll("[data-del-appt]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();
    const id=el.dataset.delAppt;const a0=S.appointments.find(a=>a.id===id);S.appointments=S.appointments.filter(a=>a.id!==id);save();
    const node=el.closest(".tl-ev,.ad-chip");
    if(node){node.classList.add("removing");setTimeout(()=>{node.remove();
      const ad=scrim.querySelector(".tl-allday");if(ad&&!ad.querySelector(".ad-chip"))ad.remove();},220);}
    if(daySheetDate)refreshCalCell(daySheetDate);toast(a0&&a0.yearly?"Jährlicher Termin gelöscht (alle Jahre)":"Gelöscht");}));
  scrim.querySelectorAll("[data-tmode]").forEach(el=>el.addEventListener("click",()=>{
    taskDraft.mode=el.dataset.tmode;scrim.querySelectorAll("[data-tmode]").forEach(b=>b.classList.toggle("on",b.dataset.tmode===taskDraft.mode));
    const w=scrim.querySelector("#t-datewrap");if(w)w.style.display=taskDraft.mode==="datum"?"":"none";}));
  const grep=scrim.querySelector("#g-rep");if(grep)grep.addEventListener("click",()=>{goalDraft.repeat=!goalDraft.repeat;grep.classList.toggle("on",goalDraft.repeat);});
  scrim.querySelectorAll("[data-save]").forEach(el=>el.addEventListener("click",()=>saveDraft(el.dataset.save,scrim)));
  const ayr=scrim.querySelector("#a-yearly");if(ayr)ayr.addEventListener("click",()=>{apptDraft.yearly=!apptDraft.yearly;ayr.classList.toggle("on",apptDraft.yearly);});
  scrim.querySelectorAll("[data-timepick]").forEach(b=>b.addEventListener("click",()=>openTimePanel(scrim,b.dataset.timepick)));
  const wd=scrim.querySelector("[data-wheel-done]");if(wd)wd.addEventListener("click",()=>{const w=scrim.querySelector("#wheel");if(w&&w.dataset.wy){calYear=+w.dataset.wy;calMonth=+w.dataset.wm;}closeSheet();render();});
  scrim.querySelectorAll("[data-move-task]").forEach(el=>el.addEventListener("click",()=>{
    const id=el.dataset.moveTask,to=el.dataset.to;const t=S.tasks.find(x=>x.id===id);if(!t){closeSheet();return;}
    if(to==="done"){t.done=true;logItemDone("task",t,true);toast("Erledigt ✓");}
    else{const td=todayStr();if(t.due===td){S.postpones=S.postpones||{};S.postpones[td]=(S.postpones[td]||0)+1;}logItemDone("task",t,false);t.due=dstr(addDays(today(),1));t.done=false;toast("Auf morgen verschoben");}
    save();closeSheet();render();}));
  scrim.querySelectorAll("[data-key]").forEach(el=>el.addEventListener("click",()=>{
    const k=el.dataset.key;
    if(k==="ok"){const g=S.goals.find(x=>x.id===padState.goalId);if(g){const before=g.count;g.count=Math.max(0,g.count+padState.val);logGoalDelta(g,g.count-before);save();}closeSheet();softRefreshHome();return;}
    if(k==="del")padState.val=Math.floor(padState.val/10);else{const nv=padState.val*10+(+k);padState.val=nv>99999?padState.val:nv;}
    const v=scrim.querySelector(".keypad-val");const sub=scrim.querySelector("#kp-sub");const g=S.goals.find(x=>x.id===padState.goalId);
    if(v)v.textContent="+"+padState.val;
    if(sub&&g)sub.innerHTML=`${g.count} → ${g.count+padState.val} <span>/ ${g.target}</span>`;}));
  const f=scrim.querySelector("input[type=text]");if(f)setTimeout(()=>f.focus(),120);
}

/* ---- Drag-Reorder-Utility (vertikal, mit Drop-Linie) ---- */
function wireReorder(list,kind){
  const arr=kind==="routine"?S.routines:kind==="task"?S.tasks:S.goals;
  const rows=[...list.querySelectorAll(".manage-item")];
  rows.forEach(row=>{
    const grip=row.querySelector(".grip");if(!grip)return;
    grip.addEventListener("pointerdown",ev=>{
      ev.preventDefault();
      const rects=rows.map(r=>r.getBoundingClientRect());
      const listRect=list.getBoundingClientRect();
      const fromIndex=rows.indexOf(row);const startY=ev.clientY;
      row.classList.add("dragging");
      const line=document.createElement("div");line.className="drop-line";list.appendChild(line);
      try{grip.setPointerCapture(ev.pointerId);}catch(e){}
      let ti=fromIndex;
      const place=y=>{let idx=0;for(let i=0;i<rects.length;i++){const c=rects[i].top+rects[i].height/2;if(y>c)idx=i+1;}ti=idx;
        const top=(idx<rows.length?rects[idx].top:rects[rows.length-1].bottom)-listRect.top;line.style.top=top+"px";};
      place(startY);
      const move=e=>{const dy=e.clientY-startY;row.style.transform=`translateY(${dy}px) scale(1.02)`;place(e.clientY);};
      const up=()=>{try{grip.releasePointerCapture(ev.pointerId);}catch(e){}
        grip.removeEventListener("pointermove",move);grip.removeEventListener("pointerup",up);
        row.classList.remove("dragging");row.style.transform="";line.remove();
        let insert=ti;if(insert>fromIndex)insert--;
        if(insert!==fromIndex){const [it]=arr.splice(fromIndex,1);arr.splice(insert,0,it);save();}
        render();};
      grip.addEventListener("pointermove",move);grip.addEventListener("pointerup",up);
    });
  });
}

/* ---- Baukasten-Interaktion ---- */
function bindBuilder(){
  // Bausteine (links) und Vorlagen (unten) — außerhalb des Rasters, einmal binden
  app.querySelectorAll("[data-addcomp]").forEach(el=>el.addEventListener("click",()=>{
    const type=el.dataset.addcomp;
    if(S.grid.some(e=>e.type===type)){toast("Baustein schon platziert");return;}
    S.grid.push({id:uid(),type,w:2,h:2});save();render();}));
  app.querySelectorAll("[data-preset]").forEach(el=>el.addEventListener("click",()=>{
    const k=el.dataset.preset;S.grid=PRESETS[k].map(([type,w,h])=>({id:uid(),type,w,h}));save();render();
    toast("Vorlage „"+el.querySelector("span").textContent+"“ übernommen");}));
  app.querySelectorAll("[data-lang-set]").forEach(el=>el.addEventListener("click",()=>{
    if(S.lang===el.dataset.langSet)return;S.lang=el.dataset.langSet;setLang(S.lang);save();render();
    toast(LANG==="en"?"Language: English":"Sprache: Deutsch");}));
  app.querySelectorAll("[data-theme-set]").forEach(el=>el.addEventListener("click",()=>{
    S.theme=el.dataset.themeSet;save();applyTheme(S.theme);render();
    toast(S.theme==="system"?"Folgt dem System":S.theme==="light"?"Heller Modus":"Dunkler Modus");}));
  bindBuilderGrid();
}
// Nur das Vorschau-Raster neu zeichnen (ohne Screen-Animation), z.B. während des Ziehens
function renderBuilderGrid(){
  const grid=app.querySelector(".b-grid");if(!grid)return;
  grid.innerHTML=tr(S.grid.map(builderTileHTML).join("")||`<div class="empty-lg" style="grid-column:span 2">Tippe links einen Baustein an</div>`);
  bindBuilderGrid();
  if(builderDrag&&builderDrag.moved){const t=app.querySelector(`[data-btile="${builderDrag.id}"]`);if(t)t.classList.add("bdrag");}
}
// Kachel-Interaktionen (Entfernen, Größe ziehen, Verschieben) — nach jedem Neuzeichnen neu setzen
function bindBuilderGrid(){
  app.querySelectorAll("[data-bremove]").forEach(el=>el.onclick=()=>{S.grid=S.grid.filter(e=>e.id!==el.dataset.bremove);save();render();});
  app.querySelectorAll("[data-bhandle]").forEach(h=>h.onpointerdown=handleResizeDown);
  app.querySelectorAll("[data-btile]").forEach(t=>t.onpointerdown=builderTileDown);
}
// Ecke ziehen = Größe ändern
function handleResizeDown(ev){
  ev.preventDefault();ev.stopPropagation();
  const h=ev.currentTarget;const id=h.dataset.bhandle;const entry=S.grid.find(e=>e.id===id);if(!entry)return;
  const tile=app.querySelector(`[data-btile="${id}"]`);
  const sx=ev.clientX,sy=ev.clientY,sw=entry.w,sh=entry.h;let pw=sw,ph=sh;
  try{h.setPointerCapture(ev.pointerId);}catch(e){}
  const move=e=>{const dx=e.clientX-sx,dy=e.clientY-sy;
    pw=Math.min(2,Math.max(1,sw+(dx>36?1:dx<-36?-1:0)));
    ph=Math.min(3,Math.max(1,sh+Math.round(dy/46)));
    tile.style.gridColumn=pw===2?"span 2":"span 1";tile.style.minHeight=BH[ph]+"px";};
  const up=()=>{try{h.releasePointerCapture(ev.pointerId);}catch(e){}
    h.removeEventListener("pointermove",move);h.removeEventListener("pointerup",up);
    entry.w=pw;entry.h=ph;save();render();};
  h.addEventListener("pointermove",move);h.addEventListener("pointerup",up);
}
// Kachel greifen und verschieben — die übrigen Kacheln ordnen sich live um
let builderDrag=null;
function builderTileDown(ev){
  if(ev.target.closest("[data-bhandle]")||ev.target.closest("[data-bremove]"))return; // Ecke/×: kein Verschieben
  const id=ev.currentTarget.dataset.btile;
  builderDrag={id,grabX:ev.clientX,grabY:ev.clientY,moved:false};
  document.addEventListener("pointermove",builderTileMove);
  document.addEventListener("pointerup",builderTileUp);
  document.addEventListener("pointercancel",builderTileUp);
}
function builderTileMove(ev){
  if(!builderDrag)return;
  const dx=ev.clientX-builderDrag.grabX,dy=ev.clientY-builderDrag.grabY;
  if(!builderDrag.moved){if(Math.hypot(dx,dy)<6)return;builderDrag.moved=true;
    const t=app.querySelector(`[data-btile="${builderDrag.id}"]`);if(t)t.classList.add("bdrag");}
  ev.preventDefault();
  // Einfügeindex aus Zeiger-Position (Lesereihenfolge: oben→unten, links→rechts)
  const rects=[...app.querySelectorAll("[data-btile]")].map(t=>({id:t.dataset.btile,r:t.getBoundingClientRect()}));
  let before=0;
  for(const {id,r} of rects){if(id===builderDrag.id)continue;
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const sameRow=Math.abs(cy-ev.clientY)<Math.max(30,r.height*0.5);
    if((cy<ev.clientY-r.height*0.4)||(sameRow&&cx<ev.clientX))before++;}
  const cur=S.grid.findIndex(e=>e.id===builderDrag.id);if(cur<0)return;
  const test=S.grid.slice();const [it]=test.splice(cur,1);test.splice(before,0,it);
  if(test.map(e=>e.id).join(",")!==S.grid.map(e=>e.id).join(",")){S.grid=test;save();renderBuilderGrid();}
}
function builderTileUp(){
  document.removeEventListener("pointermove",builderTileMove);
  document.removeEventListener("pointerup",builderTileUp);
  document.removeEventListener("pointercancel",builderTileUp);
  const moved=builderDrag&&builderDrag.moved;builderDrag=null;
  if(moved)render();
}

/* ================= State-Aktionen ================= */
function toggleCheck(kind,id,el){const arr=kind==="routine"?S.routines:S.tasks;const it=arr.find(x=>x.id===id);if(!it)return;
  it.done=!it.done;logItemDone(kind,it,it.done);save();
  if(it.done&&el){el.classList.add("done","leaving");setTimeout(()=>softRefreshHome(),320);}else softRefreshHome();}
function bumpGoal(id,delta){const g=S.goals.find(x=>x.id===id);if(!g)return;const before=g.count;g.count=Math.max(0,g.count+delta);logGoalDelta(g,g.count-before);save();softRefreshHome();}
function delItem(kind,id){
  if(kind==="routine")S.routines=S.routines.filter(x=>x.id!==id);
  else if(kind==="task")S.tasks=S.tasks.filter(x=>x.id!==id);
  else if(kind==="goal")S.goals=S.goals.filter(x=>x.id!==id);
  else if(kind==="appt")S.appointments=S.appointments.filter(x=>x.id!==id);
  save();render();toast("Gelöscht");}
function renameItem(kind,id,val){val=val.trim();if(!val)return;const arr=kind==="routine"?S.routines:kind==="task"?S.tasks:S.goals;const it=arr.find(x=>x.id===id);if(it){it.name=val;save();}}
function addFromField(act){const input=app.querySelector(`[data-addinput="${act}"]`);if(!input)return;const v=input.value.trim();if(!v)return;
  if(act==="add-routine"){if(S.routines.length>=20){toast("Maximal 20 Routinen");return;}S.routines.push({id:uid(),name:v,done:false});}
  save();input.value="";render();setTimeout(()=>{const n=app.querySelector(`[data-addinput="${act}"]`);if(n)n.focus();},50);}
function saveDraft(kind,scrim){
  if(kind==="task"){const name=scrim.querySelector("#t-name").value.trim();if(!name){toast("Bitte Aufgabe eingeben");return;}
    let due=todayStr();if(taskDraft.mode==="morgen")due=dstr(addDays(today(),1));else if(taskDraft.mode==="datum")due=scrim.querySelector("#t-date").value||todayStr();
    if(taskDraft.edit){const t=S.tasks.find(x=>x.id===taskDraft.edit);if(t){t.name=name;t.due=due;}}else S.tasks.push({id:uid(),name,due,done:false});toast("Aufgabe gespeichert");}
  else if(kind==="goal"){const name=scrim.querySelector("#g-name").value.trim();const target=parseInt(scrim.querySelector("#g-target").value,10);
    if(!name||!target||target<1){toast("Name und Zielzahl nötig");return;}
    if(goalDraft.id){const g=S.goals.find(x=>x.id===goalDraft.id);if(g){g.name=name;g.target=target;g.repeat=goalDraft.repeat;}}else S.goals.push({id:uid(),name,target,count:0,repeat:goalDraft.repeat});toast("Wochenziel gespeichert");}
  else if(kind==="appt"){const title=scrim.querySelector("#a-title").value.trim();const date=scrim.querySelector("#a-date").value||todayStr();
    if(!title){toast("Bitte Titel eingeben");return;}S.appointments.push({id:uid(),title,date,from:scrim.querySelector("#a-from").value,to:scrim.querySelector("#a-to").value,yearly:!!apptDraft.yearly});toast(apptDraft.yearly?"Jährlicher Termin gespeichert":"Termin gespeichert");
    if(route==="termine"){save();closeSheet();render();openDaySheet(date);return;}}
  save();closeSheet();render();}

/* ================= Kalender ================= */
let calYear,calMonth,calSel;
function calCellContent(ds){
  const evs=apptsOn(ds).sort((a,b)=>(a.from||"").localeCompare(b.from||""));
  const chips=evs.slice(0,2).map(e=>`<span class="cal-ev">${e.from?e.from+" ":""}${esc(e.title)}</span>`).join("");
  const more=evs.length>2?`<span class="cal-more">+${evs.length-2}</span>`:"";
  return `<span class="cal-d">${+ds.slice(8)}</span>${chips}${more}`;}
function refreshCalCell(ds){const c=app.querySelector(`[data-calday="${ds}"]`);if(c)c.innerHTML=calCellContent(ds);}
function viewCalendar(){
  if(calYear===undefined){const d=today();calYear=d.getFullYear();calMonth=d.getMonth();calSel=todayStr();}
  const first=new Date(calYear,calMonth,1);const startPad=(first.getDay()===0?7:first.getDay())-1;
  const daysIn=new Date(calYear,calMonth+1,0).getDate();const prevDays=new Date(calYear,calMonth,0).getDate();
  let cells="";
  for(let i=0;i<startPad;i++)cells+=`<div class="cal-cell out"><span class="cal-d">${prevDays-startPad+1+i}</span></div>`;
  for(let day=1;day<=daysIn;day++){
    const ds=`${calYear}-${pad(calMonth+1)}-${pad(day)}`;const isT=ds===todayStr();
    cells+=`<div class="cal-cell ${isT?"today":""}" data-calday="${ds}">${calCellContent(ds)}</div>`;}
  const trail=(7-(startPad+daysIn)%7)%7;
  for(let i=1;i<=trail;i++)cells+=`<div class="cal-cell out"><span class="cal-d">${i}</span></div>`;
  const dow=DOWS.map(d=>`<div class="cal-dow">${d}</div>`).join("");
  return head("Kalender","")+`<div class="scroll">
    <div class="cal-head"><button class="mn" data-monthpicker>${MONTHS[calMonth]} ${calYear} <span class="mn-chev">${I.chevD}</span></button></div>
    <div class="cal-grid" id="cal-grid">${dow}${cells}</div>
    <div class="cal-hint">Wischen für Monate · Titel tippen zum Springen</div></div>`;
}
function changeMonth(dir){calMonth+=dir;if(calMonth<0){calMonth=11;calYear--;}if(calMonth>11){calMonth=0;calYear++;}render();}
function bindCalendar(){
  const grid=app.querySelector("#cal-grid");
  if(grid){let sx=0,sy=0,active=false;
    grid.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;active=true;});
    grid.addEventListener("pointercancel",()=>{active=false;});
    grid.addEventListener("pointerup",e=>{if(!active)return;active=false;const dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){changeMonth(dx<0?1:-1);return;}
      if(Math.abs(dx)<12&&Math.abs(dy)<12){const cell=e.target.closest("[data-calday]");if(cell)openDaySheet(cell.dataset.calday);}});
  }
  const mp=app.querySelector("[data-monthpicker]");if(mp)mp.addEventListener("click",openMonthPicker);
}
/* Apple-Wecker-Rad für Monat/Jahr */
function openMonthPicker(){
  const base=today();const startIdx=base.getFullYear()*12+base.getMonth()-12;const count=72;
  const rows=[];for(let i=0;i<count;i++){const idx=startIdx+i;rows.push({y:Math.floor(idx/12),m:((idx%12)+12)%12});}
  const selIdx=Math.max(0,rows.findIndex(r=>r.y===calYear&&r.m===calMonth));
  const items=rows.map(r=>`<div class="wheel-item" data-wy="${r.y}" data-wm="${r.m}">${MONTHS[r.m]} ${r.y}</div>`).join("");
  openSheet(`<div class="sheet"><div class="grip-bar"></div><h3 style="text-align:center;margin-bottom:8px">Monat wählen</h3>
    <div class="wheel-wrap"><div class="wheel" id="wheel"><div class="wheel-pad"></div>${items}<div class="wheel-pad"></div></div><div class="wheel-band"></div></div>
    <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-wheel-done>Fertig</button></div></div>`);
  const wheel=document.getElementById("wheel");
  if(wheel){requestAnimationFrame(()=>{wheel.scrollTop=selIdx*40;updateWheel(wheel);});
    let t;wheel.addEventListener("scroll",()=>{clearTimeout(t);t=setTimeout(()=>updateWheel(wheel),50);});
    wheel.querySelectorAll(".wheel-item").forEach(it=>it.addEventListener("click",()=>{calYear=+it.dataset.wy;calMonth=+it.dataset.wm;closeSheet();render();}));}
}
function updateWheel(wheel){const idx=Math.round(wheel.scrollTop/40);const items=wheel.querySelectorAll(".wheel-item");
  items.forEach((it,i)=>it.classList.toggle("on",i===idx));const cur=items[idx];if(cur){wheel.dataset.wy=cur.dataset.wy;wheel.dataset.wm=cur.dataset.wm;}}
let daySheetDate=null;
function toMin(t){if(!t)return 0;const p=t.split(":");return (+p[0])*60+(+(p[1]||0));}
function dayLong(ds){const d=new Date(ds+"T00:00:00");return DAYNAMES[d.getDay()]+", "+fmtDM(d);}
function openDaySheet(ds){
  daySheetDate=ds;calSel=ds;const HH=54,START=5,END=24;
  const evs=apptsOn(ds);
  const timed=evs.filter(a=>a.from).sort((a,b)=>a.from.localeCompare(b.from));
  const allday=evs.filter(a=>!a.from);
  const lines=Array.from({length:END-START+1},(_,i)=>{const h=START+i;return `<div class="tl-line" style="top:${i*HH}px"><span class="tl-h">${pad(h)}:00</span></div>`;}).join("");
  const blocks=timed.map(a=>{const sm=toMin(a.from),em=a.to?Math.max(toMin(a.to),sm+30):sm+45;
    const top=Math.max(0,(sm-START*60)/60*HH),h=Math.max(30,(em-sm)/60*HH);
    return `<div class="tl-ev" style="top:${top}px;height:${h}px"><div class="tl-ev-t">${esc(a.title)}</div><div class="tl-ev-s">${a.from}${a.to?"–"+a.to:""}</div><button class="tl-ev-x" data-del-appt="${a.id}">${I.x}</button></div>`;}).join("");
  const ad=allday.length?`<div class="tl-allday">${allday.map(a=>`<span class="ad-chip">${esc(a.title)}<button class="ad-x" data-del-appt="${a.id}">${I.x}</button></span>`).join("")}</div>`:"";
  openSheet(`<div class="sheet daysheet">
      <div class="grip-bar"></div>
      <div class="ds-head"><div class="ds-title">${dayLong(ds)}</div><button class="ds-add" data-day-add="${ds}">${I.plus}</button></div>
      ${ad}
      <div class="tl-scroll" id="tl-scroll"><div class="tl-inner" style="height:${(END-START)*HH}px">${lines}${blocks}</div></div>
    </div>`);
  const sc=document.getElementById("tl-scroll");
  if(sc){const startMin=timed.length?Math.min(...timed.map(a=>toMin(a.from))):7*60;
    requestAnimationFrame(()=>{sc.scrollTop=Math.max(0,(startMin-START*60)/60*HH-24);});}
}

/* ================= Teilen & Empfangen ================= */
let shareSel=new Set();     // ausgewählte Termin-IDs
let currentICS="";          // zuletzt erzeugte .ics-Daten (für Teilen/Download)
let pendingImport=null;     // Termine, die auf Bestätigung warten
let pendingBackup=null;     // Voll-Sicherung, die auf Bestätigung wartet

function viewShare(){
  const appts=[...S.appointments].sort((a,b)=>(a.date+(a.from||"")).localeCompare(b.date+(b.from||"")));
  const rows=appts.map(a=>`<div class="share-item ${shareSel.has(a.id)?"sel":""}" data-shareid="${a.id}">
    <div class="sq">${I.check}</div>
    <div class="si-main"><div class="t">${esc(a.title)}</div><div class="s">${prettyDate(a.date)}${a.from?" · "+a.from:""}${a.to?"–"+a.to:""}</div></div></div>`).join("")||emptyMini("Noch keine Termine vorhanden");
  const n=shareSel.size,allSel=appts.length&&n===appts.length;
  return head("Termine teilen","mehrere auswählbar")+`<div class="scroll">
    <div class="share-top">
      <button data-shareall="${allSel?"0":"1"}" style="color:var(--accent)">${allSel?"Keine":"Alle"} auswählen</button>
      <button data-sharereceive style="color:var(--ink-2)">Code empfangen</button></div>
    <div class="manage-list" style="gap:8px">${rows}</div>
    <div class="share-bar"><button data-sharenext ${n?"":"disabled"}>${I.share} Teilen${n?" ("+n+")":""}</button></div></div>`;
}
function bindShare(){
  app.querySelectorAll("[data-shareid]").forEach(el=>el.addEventListener("click",()=>{
    const id=el.dataset.shareid;if(shareSel.has(id))shareSel.delete(id);else shareSel.add(id);render();}));
  const all=app.querySelector("[data-shareall]");
  if(all)all.addEventListener("click",()=>{if(all.dataset.shareall==="1")S.appointments.forEach(a=>shareSel.add(a.id));else shareSel.clear();render();});
  const next=app.querySelector("[data-sharenext]");
  if(next)next.addEventListener("click",()=>{if(shareSel.size)openShareMethod();});
  const rec=app.querySelector("[data-sharereceive]");
  if(rec)rec.addEventListener("click",()=>openReceive());
}
function selectedAppts(){return S.appointments.filter(a=>shareSel.has(a.id));}

function openShareMethod(){
  const mi=(m,ic,a,b)=>`<button class="menu-item" data-method="${m}"><span class="mi-ic">${ic}</span><span class="mi-tx"><span class="a">${a}</span><span class="b">${b}</span></span><span class="chev">${I.chevR}</span></button>`;
  const n=shareSel.size;
  openSheet(`<div class="sheet"><div class="grip-bar"></div><h3>${n} Termin${n>1?"e":""} teilen</h3><p class="sh-sub">Wie möchtest du übertragen?</p>
    <div class="menu-list">
      ${mi("link",I.link,"Link oder Code","Öffnet Konseq beim Empfänger")}
      ${mi("ics",I.download,"Kalenderdatei (.ics)","Für jede Kalender-App")}
      ${mi("qr",I.qr,"QR-Code","Zum Abscannen vor Ort")}</div></div>`);
}
function openMethod(m){
  const sel=selectedAppts();if(!sel.length)return;
  if(m==="link"){const url=payloadURL(sel);
    openSheet(`<div class="popcard" data-stop><h3>Teilen per Link</h3>
      <p style="font-size:13px;color:var(--ink-2);text-align:center;margin:-6px 0 14px">Sende diesen Link. Beim Öffnen fragt Konseq nach, ob die Termine importiert werden sollen.</p>
      <div class="field"><input type="text" id="share-url" readonly value="${esc(url)}"/></div>
      <div class="pop-actions">${navigator.share?'<button class="btn-primary" data-doshare="url">Teilen …</button>':""}
        <button class="${navigator.share?"btn-ghost":"btn-primary"}" data-copy="share-url">Link kopieren</button></div>
      <button class="btn-ghost" data-menu="close" style="width:100%;padding:12px;border-radius:14px;font-weight:600;margin-top:10px">Schließen</button></div>`,true);
  }else if(m==="ics"){currentICS=buildICS(sel);
    let canFiles=false;try{canFiles=!!(navigator.canShare&&navigator.canShare({files:[new File([currentICS],"x.ics",{type:"text/calendar"})]}));}catch(e){}
    openSheet(`<div class="popcard" data-stop><h3>Kalenderdatei</h3>
      <p style="font-size:13px;color:var(--ink-2);text-align:center;margin:-6px 0 14px">Als .ics teilen oder herunterladen — importierbar in jede Kalender-App.</p>
      <div class="pop-actions">${canFiles?'<button class="btn-primary" data-doshare="ics">Teilen …</button>':""}
        <button class="${canFiles?"btn-ghost":"btn-primary"}" data-icsdl>Herunterladen</button></div>
      <details style="margin-top:12px"><summary style="font-size:12.5px;color:var(--ink-3);cursor:pointer">.ics-Text anzeigen (Fallback)</summary>
        <textarea class="ta" id="ics-text" readonly>${esc(currentICS)}</textarea>
        <button class="btn-ghost" data-copy="ics-text" style="width:100%;padding:10px;border-radius:12px;font-weight:600;margin-top:8px">Text kopieren</button></details>
      <button class="btn-ghost" data-menu="close" style="width:100%;padding:12px;border-radius:14px;font-weight:600;margin-top:10px">Schließen</button></div>`,true);
  }else if(m==="qr"){const url=payloadURL(sel);
    openSheet(`<div class="popcard" data-stop><h3>QR-Code</h3>
      <p style="font-size:13px;color:var(--ink-2);text-align:center;margin:-6px 0 14px">Mit der Handy-Kamera scannen — öffnet Konseq mit den Terminen.</p>
      <div class="qr-box" id="qr-box">Wird erstellt …</div>
      <p id="qr-note" style="font-size:12px;color:var(--ink-3);text-align:center;margin-top:10px"></p>
      <button class="btn-ghost" data-menu="close" style="width:100%;padding:12px;border-radius:14px;font-weight:600;margin-top:12px">Schließen</button></div>`,true);
    renderQR(url);
  }
}
function openResetConfirm(){
  openSheet(`<div class="popcard" data-stop><h3>Testdaten zurücksetzen?</h3>
    <p class="prof-sub" style="text-align:center">Alle Routinen, Aufgaben, Wochenziele, Termine und der Score-Verlauf werden gelöscht. Danach wählst du neue Vorlagen. Sprache, Darstellung und Layout bleiben erhalten.</p>
    <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-resetgo>Zurücksetzen</button></div></div>`,true);}
// Frischer Start wie bei neuen Nutzern, aber ohne Sprachwahl und Tutorial
function resetTestData(){if(!PREVIEW_BUILD)return;
  const keep={lang:S.lang,theme:S.theme,grid:S.grid,tutSeen:S.tutSeen};
  S=seed();Object.assign(S,keep);S.setupDone=false;save();}
function openReceive(){
  openSheet(`<div class="popcard" data-stop><h3>Termine empfangen</h3>
    <p style="font-size:13px;color:var(--ink-2);text-align:center;margin:-6px 0 14px">Füge einen Link oder Code ein — oder wähle eine .ics-Datei aus Google oder Apple Kalender.</p>
    <div class="field"><input type="text" id="rec-in" placeholder="Link oder Code einfügen"/></div>
    <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-recgo>Importieren</button></div>
    <button class="btn-ghost" data-receivefile style="width:100%;margin-top:8px">Datei wählen (.ics)</button></div>`,true);
}
function openImportConfirm(list){
  pendingImport=list;
  const rows=list.slice(0,6).map(x=>`<div style="display:flex;gap:10px;padding:6px 2px;font-size:13px;color:var(--ink-2)"><b style="color:var(--accent)">•</b><span><b style="color:var(--ink)">${esc(x.title)}</b> — ${prettyDate(x.date)}${x.from?" "+x.from:""}</span></div>`).join("");
  const more=list.length>6?`<div style="font-size:12px;color:var(--ink-3);padding:2px 2px 0">+${list.length-6} weitere</div>`:"";
  openSheet(`<div class="sheet"><div class="grip-bar"></div><h3>${list.length} Termin${list.length>1?"e":""} empfangen</h3>
    <p class="sh-sub">In deinen Kalender übernehmen?</p><div style="margin:0 4px 6px">${rows}${more}</div>
    <div class="pop-actions"><button class="btn-ghost" data-menu="close">Verwerfen</button><button class="btn-primary" data-importgo>Importieren</button></div></div>`);
}
function doImport(list){if(!list)return;let added=0;
  list.forEach(x=>{const dup=S.appointments.some(a=>a.title===x.title&&a.date===x.date&&(a.from||"")===(x.from||""));
    if(!dup){S.appointments.push({id:uid(),title:x.title,date:x.date,from:x.from||"",to:x.to||"",yearly:!!x.yearly});added++;}});
  save();pendingImport=null;
  if(route==="home"||route==="termine")render();
  toast(added?`${added} Termin${added>1?"e":""} importiert`:"Bereits vorhanden");
}

/* ---- Payload (kompakt, unicode-sicher) ---- */
function encodePayload(appts){const arr=appts.map(a=>({t:a.title,d:a.date,f:a.from||"",o:a.to||"",y:a.yearly?1:0}));
  return btoa(unescape(encodeURIComponent(JSON.stringify(arr))));}
function decodePayload(str){try{let b64=str.trim();const i=b64.indexOf("import=");if(i>=0)b64=b64.slice(i+7);
    b64=b64.split("&")[0].replace(/[^A-Za-z0-9+/=]/g,"");if(!b64)return null;
    const json=decodeURIComponent(escape(atob(b64)));const arr=JSON.parse(json);if(!Array.isArray(arr))return null;
    return arr.filter(x=>x&&x.t&&x.d).map(x=>({title:String(x.t),date:String(x.d),from:x.f||"",to:x.o||"",yearly:!!x.y}));
  }catch(e){return null;}}
function payloadURL(appts){return location.origin+location.pathname+"#import="+encodePayload(appts);}

/* ---- .ics ---- */
function icsEsc(s){return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");}
function buildICS(appts){const dt=(d,t)=>d.replace(/-/g,"")+(t?"T"+t.replace(":","")+"00":"");
  let out=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Konseq//DE","CALSCALE:GREGORIAN"];
  appts.forEach(a=>{out.push("BEGIN:VEVENT","UID:"+uid()+"@konseq");
    if(a.from){out.push("DTSTART:"+dt(a.date,a.from));out.push("DTEND:"+dt(a.date,a.to||a.from));}
    else{out.push("DTSTART;VALUE=DATE:"+a.date.replace(/-/g,""));}
    if(a.yearly)out.push("RRULE:FREQ=YEARLY");
    out.push("SUMMARY:"+icsEsc(a.title),"END:VEVENT");});
  out.push("END:VCALENDAR");return out.join("\r\n");}

/* ---- .ics importieren ----
   Liest echte Dateien aus Google-/Apple-Kalender: entfaltet gefaltete Zeilen,
   ignoriert VALARM/VTIMEZONE, versteht all-day (VALUE=DATE), UTC (…Z) und
   TZID/floating (Wanduhrzeit), sowie jaehrliche Wiederholung (RRULE FREQ=YEARLY).
   Andere Wiederholungen werden als einmaliger Termin uebernommen. */
function icsUnescape(s){return String(s).replace(/\\n/gi," ").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\");}
function icsUnfold(text){const raw=String(text).replace(/\r\n/g,"\n").replace(/\r/g,"\n").split("\n");const lines=[];
  for(const ln of raw){if(lines.length&&/^[ \t]/.test(ln))lines[lines.length-1]+=ln.slice(1);else lines.push(ln);}return lines;}
function icsSplit(line){let q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"')q=!q;else if(c===":"&&!q)return [line.slice(0,i),line.slice(i+1)];}return [line,""];}
function icsDateParts(val){const v=String(val).trim();
  const m=v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);if(!m)return null;
  const y=m[1],mo=m[2],da=m[3],hh=m[4],mi=m[5],se=m[6],z=m[7];
  if(hh===undefined)return {date:`${y}-${mo}-${da}`,hhmm:null};
  if(z){const d=new Date(Date.UTC(+y,+mo-1,+da,+hh,+mi,+(se||0)));if(isNaN(d.getTime()))return null;
    return {date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,hhmm:`${pad(d.getHours())}:${pad(d.getMinutes())}`};}
  return {date:`${y}-${mo}-${da}`,hhmm:`${hh}:${mi}`};}
function parseICS(text){const lines=icsUnfold(text);const stack=[];const out=[];let cur=null;
  for(const line of lines){if(!line)continue;const parts=icsSplit(line);const value=parts[1];
    const name=parts[0].split(";")[0].trim().toUpperCase();
    if(name==="BEGIN"){const comp=value.trim().toUpperCase();stack.push(comp);if(comp==="VEVENT")cur={title:"",date:"",from:"",to:"",yearly:false,_end:null};continue;}
    if(name==="END"){const comp=value.trim().toUpperCase();
      if(comp==="VEVENT"&&cur){if(cur.date){if(cur._end&&cur._end.hhmm&&cur._end.date===cur.date&&cur._end.hhmm!==cur.from)cur.to=cur._end.hhmm;delete cur._end;if(!cur.title)cur.title="(ohne Titel)";out.push(cur);}cur=null;}
      stack.pop();continue;}
    if(stack[stack.length-1]!=="VEVENT"||!cur)continue;
    if(name==="SUMMARY")cur.title=icsUnescape(value).trim();
    else if(name==="DTSTART"){const p=icsDateParts(value);if(p){cur.date=p.date;cur.from=p.hhmm||"";}}
    else if(name==="DTEND"){const p=icsDateParts(value);if(p)cur._end=p;}
    else if(name==="RRULE"){if(/(^|;)FREQ=YEARLY(;|$)/i.test(value.trim()))cur.yearly=true;}}
  const seen=new Set(),uniq=[];for(const a of out){const k=a.title+"|"+a.date+"|"+a.from;if(!seen.has(k)){seen.add(k);uniq.push(a);}}return uniq;}
function pickICSFile(){const inp=document.createElement("input");inp.type="file";inp.accept=".ics,text/calendar";
  inp.style.position="fixed";inp.style.left="-9999px";document.body.appendChild(inp);
  inp.addEventListener("change",()=>{const f=inp.files&&inp.files[0];inp.remove();if(!f)return;
    const rd=new FileReader();
    rd.onload=()=>{let list=null;try{list=parseICS(rd.result);}catch(e){list=null;}
      if(!list||!list.length){toast("Keine Termine in der Datei");return;}openImportConfirm(list);};
    rd.onerror=()=>toast("Datei nicht lesbar");rd.readAsText(f);});
  inp.click();}

/* ---- QR (lazy von cdnjs) ---- */
const _scripts={};
function loadScript(src){return _scripts[src]||(_scripts[src]=new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);}));}
function renderQR(text){loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js").then(()=>{
    const box=document.getElementById("qr-box");if(!box)return;
    try{const qr=qrcode(0,"M");qr.addData(text);qr.make();box.innerHTML=qr.createSvgTag({cellSize:4,margin:2});}
    catch(e){box.textContent="";const n=document.getElementById("qr-note");if(n)n.textContent=tx("Zu viele Termine für einen QR-Code — nimm dafür Link oder Datei.");}
  }).catch(()=>{const box=document.getElementById("qr-box");if(box)box.textContent=tx("QR-Bibliothek konnte nicht geladen werden (offline?).");});}

/* ---- Teilen-/Kopier-Helfer ---- */
function copyText(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>toast("Kopiert")).catch(()=>fallbackCopy(t));}else fallbackCopy(t);}catch(e){fallbackCopy(t);}}
function fallbackCopy(t){try{const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Kopiert");}catch(e){toast("Kopieren nicht möglich");}}
function navShare(text){if(navigator.share)navigator.share({title:tx("Konseq Termine"),text}).catch(()=>{});else copyText(text);}
function navShareFile(text,name,type){try{const file=new File([text],name,{type});
    if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:tx("Konseq Termine")}).catch(()=>{});return;}}catch(e){}
  downloadFile(text,name,type);}
function downloadFile(text,name,type){try{const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},600);toast("Datei erstellt");}
  catch(e){toast("Download blockiert — nutze Teilen/Kopieren");}}

/* ================= Datensicherung (Voll-Export/Import) =================
   Sichert den kompletten App-Zustand als Datei und stellt ihn auf einem
   anderen Gerät 1:1 wieder her. Die Datei trägt eine Formatversion, damit
   sie auch nach späteren Umbauten des Datenmodells lesbar bleibt: ältere
   Sicherungen laufen beim Import durch migrate()/rollover(). */
const BACKUP_FORMAT="konseq-backup",BACKUP_VERSION=1;
function exportBackup(){
  const payload={format:BACKUP_FORMAT,version:BACKUP_VERSION,exportedAt:new Date().toISOString(),app:"Konseq",data:S};
  downloadFile(JSON.stringify(payload,null,2),"konseq-sicherung-"+todayStr()+".json","application/json");
}
function pickBackupFile(){
  const inp=document.createElement("input");inp.type="file";inp.accept="application/json,.json";
  inp.style.position="fixed";inp.style.left="-9999px";document.body.appendChild(inp);
  inp.addEventListener("change",()=>{const f=inp.files&&inp.files[0];inp.remove();if(!f)return;
    const rd=new FileReader();
    rd.onload=()=>{let obj=null;try{obj=JSON.parse(rd.result);}catch(e){toast("Datei nicht lesbar");return;}confirmBackupImport(obj);};
    rd.onerror=()=>toast("Datei nicht lesbar");
    rd.readAsText(f);});
  inp.click();
}
function confirmBackupImport(obj){
  if(!obj||obj.format!==BACKUP_FORMAT||typeof obj.data!=="object"||!obj.data){toast("Keine gültige Konseq-Sicherung");return;}
  if(typeof obj.version==="number"&&obj.version>BACKUP_VERSION){toast("Sicherung aus neuerer Version — bitte App aktualisieren");return;}
  pendingBackup=obj.data;
  const d=obj.data,n=a=>Array.isArray(a)?a.length:0;
  let when="";try{if(obj.exportedAt){const dt=new Date(obj.exportedAt);if(!isNaN(dt))when=fmtDM(dt)+" "+pad(dt.getHours())+":"+pad(dt.getMinutes());}}catch(e){}
  const count=(lbl,v)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1"><span style="font-size:11.5px;color:var(--ink-3)">${lbl}</span><b style="font-size:16px;color:var(--ink)">${v}</b></div>`;
  openSheet(`<div class="popcard" data-stop><h3>Sicherung laden?</h3>
    ${when?`<p style="font-size:12.5px;color:var(--ink-3);text-align:center;margin:-6px 0 10px">${esc(when)}</p>`:""}
    <div style="display:flex;justify-content:space-between;gap:8px;margin:4px 2px 0">${count("Routinen",n(d.routines))}${count("Aufgaben",n(d.tasks))}${count("Wochenziele",n(d.goals))}${count("Termine",n(d.appointments))}</div>
    <p style="font-size:13px;color:var(--ink-2);text-align:center;line-height:1.55;margin:12px 0 2px">Alle aktuellen Daten werden durch die Sicherung ersetzt. Das lässt sich nicht rückgängig machen.</p>
    <div class="pop-actions"><button class="btn-ghost" data-menu="close">Abbrechen</button><button class="btn-primary" data-backupgo>Importieren</button></div></div>`,true);
}
function applyBackup(data){
  if(!data)return;
  try{S=migrate(rollover(data));}catch(e){toast("Import fehlgeschlagen");return;}
  save();pendingBackup=null;closeSheet();
  try{setLang(S.lang||detectLang());}catch(e){}
  try{applyTheme(S.theme||"system");}catch(e){}
  route="home";render();toast("Sicherung geladen");
}
function sheetBackup(){const row=(act,ic,a,b)=>`<button class="menu-item" data-backup="${act}"><span class="mi-ic">${ic}</span><span class="mi-tx"><span class="a">${a}</span><span class="b">${b}</span></span><span class="chev">${I.chevR}</span></button>`;
  return `<div class="sheet"><div class="grip-bar"></div><h3>Datensicherung</h3>
    <p class="sh-sub">Alle Daten als Datei sichern oder eine Sicherung von einem anderen Gerät laden.</p>
    <div class="menu-list">
    ${row("export",I.download,"Daten exportieren","Als Datei auf diesem Gerät speichern")}
    ${row("import",I.shield,"Daten importieren","Sicherungsdatei von diesem Gerät wählen")}</div></div>`;}

/* ================= Theme ================= */
function applyTheme(t){const r=document.documentElement;
  if(t==="light")r.setAttribute("data-theme","light");
  else if(t==="dark")r.setAttribute("data-theme","dark");
  else r.removeAttribute("data-theme");}

/* ================= Empfangen über Link (#import=) ================= */
function initImport(){const h=location.hash||"";const i=h.indexOf("import=");if(i<0)return;
  const data=decodePayload(h.slice(i+7));
  try{history.replaceState(null,"",location.pathname+location.search);}catch(e){location.hash="";}
  if(data&&data.length){if(!S.setupDone)deferredImport=data;else openImportConfirm(data);}}

/* ================= Auswertung / Analytics ================= */
function dayScoreForDate(ds){if(ds===todayStr())return dayScore(todaySnapshot());const sn=S.history[ds];return sn?dayScore(sn):null;}
function avgDays(n){let sum=0,c=0;for(let i=0;i<n;i++){const v=dayScoreForDate(dstr(addDays(today(),-i)));if(v!=null){sum+=v;c++;}}return c?sum/c:null;}
function bestDay(n){let best=null;for(let i=0;i<n;i++){const v=dayScoreForDate(dstr(addDays(today(),-i)));if(v!=null&&(best==null||v>best))best=v;}return best;}
function startOfWeek(d){return addDays(d,-(weekdayMon(d)-1));}
function weeklyAverages(n){const res=[];const curMon=startOfWeek(today());
  for(let w=n-1;w>=0;w--){const mon=addDays(curMon,-7*w);let sum=0,c=0;
    for(let i=0;i<7;i++){const day=addDays(mon,i);if(day>today())break;const v=dayScoreForDate(dstr(day));if(v!=null){sum+=v;c++;}}
    res.push({label:pad(mon.getDate())+"."+pad(mon.getMonth()+1)+".",value:c?sum/c:null});}
  return res;}
function monthlyAverages(n){const res=[];const now=today();const MM=MONTHS_SHORT;
  for(let m=n-1;m>=0;m--){const dd=new Date(now.getFullYear(),now.getMonth()-m,1);const y=dd.getFullYear(),mo=dd.getMonth();
    const days=new Date(y,mo+1,0).getDate();let sum=0,c=0;
    for(let day=1;day<=days;day++){const dObj=new Date(y,mo,day);if(dObj>today())break;const v=dayScoreForDate(`${y}-${pad(mo+1)}-${pad(day)}`);if(v!=null){sum+=v;c++;}}
    res.push({label:MM[mo],value:c?sum/c:null});}
  return res;}
function yoy(){const cur=avgDays(30);let sum=0,c=0;
  for(let i=0;i<30;i++){const v=dayScoreForDate(dstr(addDays(today(),-365-i)));if(v!=null){sum+=v;c++;}}
  const prev=c?sum/c:null;return {cur,prev,delta:(cur!=null&&prev!=null)?Math.round((cur-prev)*100):null};}

function bestWeek(n){const ws=weeklyAverages(n).filter(w=>w.value!=null);return ws.length?Math.max(...ws.map(w=>w.value)):null;}

/* ================= Monatsanalyse (Sitzung 24) =================
   Die Regeln stehen in analysis.js (reine Funktionen, getestet). Hier nur
   Anzeige, Monatsauswahl und der Hinweis auf der Startseite.
   ANALYSIS_GATE: Premium-Sperre (Phase 8, Sitzungen 26/27). Solange es kein
   Abo gibt, sieht jeder alle Befunde; auf true gesetzt bleibt nur der stärkste
   Befund lesbar, die übrigen erscheinen verschwommen. */
const ANALYSIS_GATE=false;
let anaY=null,anaM=null,anaLast=null;
const KA=()=>(typeof window!=="undefined"&&window.KonseqAnalysis)||null;
function runAnalysis(y,m){return KA().analyzeMonth(S,y,m,{lang:LANG,today:todayStr(),scoreFor:dayScoreForDate});}
function prevMonthOf(y,m){return m===0?{y:y-1,m:11}:{y,m:m-1};}
function monthKeyOf(y,m){return `${y}-${pad(m+1)}`;}
// Standard: in der ersten Woche eines Monats der abgeschlossene Vormonat (falls genug Daten), sonst der laufende
function defaultAnalysisMonth(){const t=today(),y=t.getFullYear(),m=t.getMonth();
  if(t.getDate()<=7){const p=prevMonthOf(y,m);try{if(runAnalysis(p.y,p.m).enough)return p;}catch(e){}}
  return {y,m};}
function analysisBanner(){
  try{if(!KA())return "";const t=today();if(t.getDate()>7)return "";
    const p=prevMonthOf(t.getFullYear(),t.getMonth());if(S.analysisSeen===monthKeyOf(p.y,p.m))return "";
    const r=runAnalysis(p.y,p.m);if(!r.enough||!r.findings.length)return "";
    return `<button type="button" class="ana-banner" data-act="open-analysis"><span class="ana-banner-ic">${I.chart}</span>
      <span class="ana-banner-tx"><span class="a">Deine Monatsanalyse ist da</span><span class="b">${MONTHS[p.m]} · <span>${r.findings.length} ${r.findings.length===1?"Befund":"Befunde"}</span></span></span>
      <span class="chev">${I.chevR}</span></button>`;}catch(e){return "";}}
function anaItem(f,locked){return `<li class="ana-item ${f.kind}${locked?" locked":""}"${locked?' aria-hidden="true"':""}><span class="ana-dot" aria-hidden="true"></span><p>${esc(f.text)}</p></li>`;}
function viewAnalysis(){
  const sub="Was gut läuft und was nicht";
  if(!KA())return head("Monatsanalyse",sub)+`<div class="scroll">${emptyMini("Die Analyse konnte nicht geladen werden. Öffne die App einmal mit Internet.")}</div>`;
  if(anaY==null){const d=defaultAnalysisMonth();anaY=d.y;anaM=d.m;}
  let r;try{r=runAnalysis(anaY,anaM);}catch(e){anaLast=null;
    return head("Monatsanalyse",sub)+`<div class="scroll">${emptyMini("Die Analyse konnte nicht geladen werden. Öffne die App einmal mit Internet.")}</div>`;}
  anaLast=r;
  const t=today(),curIdx=t.getFullYear()*12+t.getMonth(),idx=anaY*12+anaM;
  const first=KA().firstDataMonth(S);const firstIdx=first?first.y*12+first.m:curIdx;
  const canPrev=idx>Math.min(firstIdx,curIdx),canNext=idx<curIdx;
  const nav=`<div class="ana-nav">
      <button type="button" class="ana-arrow" data-ana="-1" aria-label="Vorheriger Monat" ${canPrev?"":"disabled"}>${I.back}</button>
      <div class="ana-month" aria-live="polite">${MONTHS[anaM]} ${anaY}${r.complete?"":` <small>bisher</small>`}</div>
      <button type="button" class="ana-arrow" data-ana="1" aria-label="Nächster Monat" ${canNext?"":"disabled"}>${I.chevR}</button></div>`;
  let body;
  if(!r.enough){
    body=`<div class="card ana-empty"><div class="ana-empty-ic">${I.chart}</div><p>${LANG==="en"
      ?`Not enough data for this month yet: <b>${r.daysWithData} of ${r.minDays}</b> days tracked. The review fills up the longer you use Konseq.`
      :`Für diesen Monat gibt es noch zu wenig Daten: <b>${r.daysWithData} von ${r.minDays}</b> Tagen erfasst. Die Analyse füllt sich, je länger du Konseq nutzt.`}</p></div>`;
  }else{
    const avg=r.avgScore==null?"–":Math.round(r.avgScore*100);
    let delta="–",dcls="";if(r.avgScore!=null&&r.prevAvgScore!=null){const d=Math.round(r.avgScore*100)-Math.round(r.prevAvgScore*100);delta=(d>0?"+":"")+d;dcls=d>0?"up":d<0?"down":"";}
    const stat=(v,l,c)=>`<div class="stat"><div class="v ${c||""}">${v}</div><div class="l">${l}</div></div>`;
    const top=r.findings[0];
    const list=items=>items.length?`<ul class="ana-list">${items.map(f=>anaItem(f,ANALYSIS_GATE&&f!==top)).join("")}</ul>`:`<p class="ana-none">Hier ist in diesem Monat nichts auffällig.</p>`;
    body=`<div class="stat-row">${stat(avg,"Ø Score")}${stat(r.daysWithData,"Tage erfasst")}${stat(delta,"ggü. Vormonat",dcls)}</div>
      <section class="ana-sec" aria-labelledby="ana-good"><h2 class="ana-h good" id="ana-good">Läuft gut</h2>${list(r.good)}</section>
      <section class="ana-sec" aria-labelledby="ana-bad"><h2 class="ana-h bad" id="ana-bad">Ausbaufähig</h2>${list(r.bad)}</section>
      ${ANALYSIS_GATE&&r.findings.length>1?`<p class="ana-upsell">Mit Premium siehst du alle Befunde.</p>`:""}
      <div class="hint">Alle Befunde entstehen nach festen Regeln direkt auf deinem Gerät, nur aus deinen eigenen Daten.</div>`;
  }
  return head("Monatsanalyse",sub)+`<div class="scroll">${nav}${body}</div>`;
}
function bindAnalysis(){
  app.querySelectorAll("[data-ana]").forEach(b=>b.addEventListener("click",()=>{if(b.disabled)return;
    let idx=anaY*12+anaM+(+b.dataset.ana);anaY=Math.floor(idx/12);anaM=idx%12;render();}));
  // Hinweis auf der Startseite gilt als gesehen, sobald der abgeschlossene Vormonat angezeigt wurde
  const t=today(),p=prevMonthOf(t.getFullYear(),t.getMonth());
  if(anaLast&&anaLast.enough&&anaLast.key===monthKeyOf(p.y,p.m)&&S.analysisSeen!==anaLast.key){S.analysisSeen=anaLast.key;save();}
}

// Wisch-Karussell im Hero: Position halten und Punkte aktualisieren
function bindHero(){
  const el=app.querySelector("#hero-slides");if(!el)return;
  requestAnimationFrame(()=>{el.scrollLeft=heroSlide*el.clientWidth;});
  let t;
  el.addEventListener("scroll",()=>{clearTimeout(t);t=setTimeout(()=>{
    const i=Math.round(el.scrollLeft/el.clientWidth);if(i!==heroSlide){heroSlide=i;updateDots();}},60);});
  app.querySelectorAll("[data-slide]").forEach(dt=>dt.addEventListener("click",()=>{
    const i=+dt.dataset.slide;heroSlide=i;el.scrollTo({left:i*el.clientWidth,behavior:"smooth"});updateDots();}));
}
function updateDots(){app.querySelectorAll(".dot-i").forEach((d,i)=>d.classList.toggle("on",i===heroSlide));}

/* ================= Erst-Tutorial ================= */
const TUT_VERSION=2;
const TUT=[
  {ic:I.target,t:"Willkommen bei Konseq",b:"Dein Score zeigt, wie viel du von <b>deinen eigenen</b> Zielen der letzten Woche geschafft hast — kein Vergleich mit anderen. Eine perfekte Woche ergibt <b>100</b>."},
  {ic:I.task,t:"Drei Bausteine",b:"<b>Routinen</b> kehren täglich zurück. <b>Tagesaufgaben</b> sind einmalig — halte eine gedrückt, um sie auf morgen zu schieben. <b>Wochenziele</b> zählst du einfach hoch."},
  {ic:I.cal,t:"Dein Kalender",b:"Zwischen Monaten <b>wischen</b>, den Monatstitel tippen zum schnellen Springen, und ein Tag öffnet die Tagesansicht. Termine lassen sich <b>jährlich wiederholen</b> — praktisch für Geburtstage."},
  {ic:I.grid,t:"Mach es zu deinem",b:"Wisch über den Ring für deine Auswertungen. Über das Menü oben rechts gestaltest du dein Layout, wählst Hell/Dunkel und teilst Termine."},
];
const TUT_EN=[
  {ic:I.target,t:"Welcome to Konseq",b:"Your score shows how much of <b>your own</b> goals you reached over the last week — no comparison with others. A perfect week gives <b>100</b>."},
  {ic:I.task,t:"Three building blocks",b:"<b>Routines</b> come back every day. <b>Daily tasks</b> are one-time — hold one to move it to tomorrow. <b>Weekly goals</b> you simply count up."},
  {ic:I.cal,t:"Your calendar",b:"<b>Swipe</b> between months, tap the month title to jump quickly, and a day opens the day view. Appointments can <b>repeat yearly</b> — handy for birthdays."},
  {ic:I.grid,t:"Make it yours",b:"Swipe across the ring for your stats. The menu at the top right lets you shape your layout, pick light or dark mode, change the language and share appointments."},
];
let tutStep=0;
function openTutorial(){closeSheet();tutStep=0;
  const scrim=document.createElement("div");scrim.className="scrim center";scrim.id="scrim";
  app.appendChild(scrim);drawTut(scrim);}
function drawTut(scrim){
  const T=LANG==="en"?TUT_EN:TUT;const s=T[tutStep],last=tutStep===T.length-1;
  const dots=T.map((_,i)=>`<span class="dot-i ${i===tutStep?"on":""}"></span>`).join("");
  scrim.innerHTML=tr(`<div class="popcard tut" style="max-width:330px">
    <div class="tut-ic">${s.ic}</div>
    <h3 style="margin:2px 0 12px">${s.t}</h3>
    <p class="tut-b">${s.b}</p>
    <div class="dots" style="margin:20px 0 6px">${dots}</div>
    <div class="pop-actions">
      ${last?"":'<button class="btn-ghost" data-tut="skip">Überspringen</button>'}
      <button class="btn-primary" data-tut="${last?"done":"next"}">${last?"Los geht’s":"Weiter"}</button>
    </div></div>`);
  scrim.querySelectorAll("[data-tut]").forEach(el=>el.addEventListener("click",()=>{
    if(el.dataset.tut==="next"){tutStep++;drawTut(scrim);return;}
    S.tutSeen=TUT_VERSION;save();scrim.remove();if(!S.setupDone)openProfilePicker(true);}));
}

/* Alte Termine nur 3 Monate aufbewahren (jährliche bleiben) */
function pruneOld(){const cutoff=dstr(addDays(today(),-93));let changed=false;
  S.appointments=S.appointments.filter(a=>{if(a.yearly)return true;const keep=(a.date||"")>=cutoff;if(!keep)changed=true;return keep;});
  if(changed)save();}

/* ================= Ersteinrichtung: Sprache + Profil-Vorlagen ================= */
const TEMPLATES={
  school:{de:{r:["Schulsachen packen","Hausaufgaben checken","20 Minuten lernen"],t:["Vokabeln wiederholen"],g:[["3× für Klausuren lernen",3]]},
          en:{r:["Pack school bag","Check homework","Study 20 minutes"],t:["Review vocabulary"],g:[["Study for exams 3×",3]]}},
  study:{de:{r:["Vorlesung nacharbeiten","Uni-Mails checken"],t:["Literatur recherchieren"],g:[["5 Lerneinheiten",5],["60 Seiten lesen",60]]},
         en:{r:["Review lecture notes","Check uni email"],t:["Research sources"],g:[["5 study sessions",5],["Read 60 pages",60]]}},
  work:{de:{r:["Tag planen","Posteingang leeren"],t:["Wichtigste Aufgabe erledigen"],g:[["4 Fokus-Blöcke",4]]},
        en:{r:["Plan the day","Clear inbox"],t:["Finish top priority task"],g:[["4 focus blocks",4]]}},
  fitness:{de:{r:["2 Liter Wasser trinken","Dehnen"],t:[],g:[["3× Training",3],["5 Tage 10.000 Schritte",5]]},
           en:{r:["Drink 2 liters of water","Stretch"],t:[],g:[["Work out 3×",3],["10,000 steps on 5 days",5]]}},
  habits:{de:{r:["Bett machen","10 Minuten lesen","Tagebuch schreiben"],t:[],g:[["5× früh aufstehen",5]]},
          en:{r:["Make the bed","Read 10 minutes","Write a journal entry"],t:[],g:[["Wake up early 5×",5]]}}};
const PROFILES=[["school","task","Schule","Hausaufgaben, Lernen, Klausuren"],["study","target","Studium","Vorlesungen, Lernphasen, Lesen"],
  ["work","grid","Beruf","Planung, Fokus, Posteingang"],["fitness","routine","Sport & Fitness","Training, Bewegung, Wasser"],
  ["habits","check","Gewohnheiten","Bessere Routinen aufbauen"]];
// Vorlagen anhängen, ohne Doppelte; alles startet unerledigt (Score bleibt fair)
function applyTemplates(keys){const t=todayStr();let n=0;
  keys.forEach(k=>{const tp=TEMPLATES[k]&&TEMPLATES[k][LANG];if(!tp)return;
    tp.r.forEach(name=>{if(S.routines.length<20&&!S.routines.some(x=>x.name===name)){S.routines.push({id:uid(),name,done:false});n++;}});
    tp.t.forEach(name=>{if(!S.tasks.some(x=>x.name===name&&x.due===t)){S.tasks.push({id:uid(),name,due:t,done:false});n++;}});
    tp.g.forEach(([name,target])=>{if(!S.goals.some(x=>x.name===name)){S.goals.push({id:uid(),name,target,count:0,repeat:true});n++;}});});
  save();return n;}
let deferredImport=null; // geteilter Link beim allerersten Start: Import nach der Einrichtung nachholen
function overlayScrim(closable){closeSheet();const sc=document.createElement("div");sc.className="scrim center";sc.id="scrim";
  if(closable)sc.addEventListener("pointerdown",e=>{if(e.target===sc)closeSheet();});app.appendChild(sc);return sc;}
function openLangPicker(){const sc=overlayScrim(false);const g=S.lang||detectLang();
  sc.innerHTML=`<div class="popcard tut" style="max-width:320px"><div class="tut-ic">${I.globe}</div>
    <h3 style="margin:2px 0 6px">Sprache · Language</h3>
    <p class="tut-b" style="margin-bottom:18px">Wähle deine Sprache · Choose your language</p>
    <div class="pop-actions" style="margin-top:0"><button class="${g==="de"?"btn-primary":"btn-ghost"}" data-lang="de">Deutsch</button><button class="${g==="en"?"btn-primary":"btn-ghost"}" data-lang="en">English</button></div></div>`;
  sc.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{S.lang=b.dataset.lang;setLang(S.lang);save();render();openTutorial();}));}
let profSel=new Set();
function openProfilePicker(first){profSel=new Set();const sc=overlayScrim(!first);drawProfiles(sc,first);}
function drawProfiles(sc,first){
  const rows=PROFILES.map(([k,ic,a,b])=>`<div class="share-item ${profSel.has(k)?"sel":""}" data-prof="${k}"><div class="sq">${I.check}</div>
    <span class="prof-ic">${I[ic]}</span><div class="si-main"><div class="t">${a}</div><div class="s">${b}</div></div></div>`).join("");
  sc.innerHTML=tr(`<div class="popcard" style="max-width:340px"><h3 style="margin-bottom:6px">${first?"Wofür nutzt du Konseq?":"Vorlagen hinzufügen"}</h3>
    <p class="prof-sub">Wähle eine oder mehrere Vorlagen. Du kannst alles später ändern.</p>
    <div class="manage-list" style="gap:8px;margin-top:0">${rows}</div>
    <div class="pop-actions">${first?`<button class="btn-ghost" data-prof-go="empty">Leer starten</button>`:`<button class="btn-ghost" data-prof-go="cancel">Abbrechen</button>`}
      <button class="btn-primary" data-prof-go="ok" ${profSel.size?"":"disabled"}>${first?"Los geht’s":"Hinzufügen"}</button></div></div>`);
  sc.querySelectorAll("[data-prof]").forEach(el=>el.addEventListener("click",()=>{const k=el.dataset.prof;
    if(profSel.has(k))profSel.delete(k);else profSel.add(k);
    el.classList.toggle("sel",profSel.has(k));const ok=sc.querySelector('[data-prof-go="ok"]');if(ok)ok.disabled=!profSel.size;}));
  sc.querySelectorAll("[data-prof-go]").forEach(el=>el.addEventListener("click",()=>{const a=el.dataset.profGo;
    if(a==="cancel"){sc.remove();return;}
    let n=0;if(a==="ok")n=applyTemplates([...profSel]);
    if(first){S.setupDone=true;save();}
    sc.remove();route="home";render();
    if(a==="ok"&&!first)toast(n?"Vorlagen hinzugefügt":"Schon alles vorhanden");
    if(first&&deferredImport){const d=deferredImport;deferredImport=null;openImportConfirm(d);}}));
}

/* ================= Toast ================= */
let toastTimer;
function toast(msg){const t=document.getElementById("toast");t.textContent=tx(msg);t.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),1600);}

setLang(S.lang);
applyTheme(S.theme);
pruneOld();
render();
initImport();
if(!S.setupDone)openLangPicker();
else if(S.tutSeen!==TUT_VERSION)openTutorial();

/* ================= Automatischer Update-Hinweis =================
   Ersetzt das manuelle Hochzählen der Cache-Version. Erkennt eine neue
   Veröffentlichung auf zwei Wegen und zeigt dann eine dezente Leiste
   „Neue Version verfügbar · Neu laden":
   1) version.json (vom Deploy gestempelt) unterscheidet sich von APP_VERSION,
   2) der Service-Worker meldet eine wartende neue Fassung.
   Der Service-Worker lädt die App-Hülle „network-first", neue Deploys sind
   darum nach dem Neuladen sofort aktiv. */
let updateShown=false, waitingWorker=null;
function showUpdateBar(){
  if(updateShown)return;updateShown=true;
  const bar=document.createElement("div");bar.className="update-bar";
  bar.innerHTML=tr(`<span>Neue Version verfügbar</span><button type="button" class="update-reload">Neu laden</button>`);
  bar.querySelector(".update-reload").addEventListener("click",()=>{
    try{if(waitingWorker){waitingWorker.postMessage({type:"SKIP_WAITING"});}}catch(e){}
    location.reload();
  });
  document.body.appendChild(bar);
  requestAnimationFrame(()=>bar.classList.add("show"));
}
async function checkVersion(){
  try{
    const res=await fetch("./version.json?ts="+Date.now(),{cache:"no-store"});
    if(!res.ok)return;
    const data=await res.json();
    if(data&&typeof data.version==="string"&&data.version!=="dev"&&APP_VERSION!=="dev"&&data.version!==APP_VERSION)showUpdateBar();
  }catch(e){/* offline o. Ä. — kein Hinweis */}
}
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("sw.js").then(reg=>{
      if(reg.waiting){waitingWorker=reg.waiting;showUpdateBar();}
      reg.addEventListener("updatefound",()=>{const nw=reg.installing;if(!nw)return;
        nw.addEventListener("statechange",()=>{
          if(nw.state==="installed"&&navigator.serviceWorker.controller){waitingWorker=reg.waiting||nw;showUpdateBar();}});});
    }).catch(()=>{});
    // Nach einem SKIP_WAITING übernimmt der neue Worker -> genau einmal neu laden
    let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded)return;reloaded=true;location.reload();});
  });
}
checkVersion();
setInterval(checkVersion,5*60*1000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkVersion();});
