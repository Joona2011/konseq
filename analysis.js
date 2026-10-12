"use strict";
/* ================= Konseq — Monatsanalyse (Fahrplan Sitzung 24) =================
   Erzeugt aus dem Tageslog (S.log), dem Score-Verlauf (S.history) und den
   Verschiebungen (S.postpones) konkrete Befunde, was in einem Monat gut lief
   und was nicht. Alles läuft nach festen Regeln direkt auf dem Gerät — ohne
   KI, ohne Server, ohne laufende Kosten.

   Grundsatz: Jeder Befund nennt echte Zahlen ("2 von 6 Tagen") und entsteht
   nur, wenn genug Daten vorliegen. Wo ein alter Tag sich nicht eindeutig
   rekonstruieren lässt (vor dem Tagesplan im Log), wird er für die
   Einzel-Auswertung übersprungen statt geschätzt.

   Reine Funktionen ohne DOM-Zugriff: im Browser als window.KonseqAnalysis,
   in Node (Tests) per require(). */
(function(root){

const MIN_DAYS=7;            // so viele erfasste Tage braucht ein Monat für eine Analyse
const MAX_PER_SECTION=5;     // höchstens so viele Befunde je Abschnitt

/* ---- Datum (eigenständig, unabhängig von app.js) ---- */
const pad=n=>String(n).padStart(2,"0");
const ymd=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
function parse(s){return new Date(s+"T00:00:00");}
function fmt(d){return ymd(d.getFullYear(),d.getMonth(),d.getDate());}
function addDays(s,n){const d=parse(s);d.setDate(d.getDate()+n);return fmt(d);}
function dowMon(s){const w=parse(s).getDay();return w===0?7:w;}        // 1 = Mo … 7 = So
function monthKey(y,m){return `${y}-${pad(m+1)}`;}

/* ---- Texte ---- */
const T={
  de:{months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
      monShort:["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sep.","Okt.","Nov.","Dez."],
      adv:["montags","dienstags","mittwochs","donnerstags","freitags","samstags","sonntags"],
      nom:["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"],
      plural:["Montagen","Dienstagen","Mittwochen","Donnerstagen","Freitagen","Samstagen","Sonntagen"]},
  en:{months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      monShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      adv:["on Mondays","on Tuesdays","on Wednesdays","on Thursdays","on Fridays","on Saturdays","on Sundays"],
      nom:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      plural:["Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays","Sundays"]}};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const q=(lang,name)=>lang==="en"?`“${name}”`:`„${name}“`;
// Häufigkeit in Worten — immer zusammen mit den echten Zahlen ausgegeben
function often(lang,k,n){const r=n?k/n:0;
  if(lang==="en"){if(k===n)return "every time";if(k===0)return "never";if(r>=.85)return "almost every time";
    if(r>=.6)return "most of the time";if(r>=.4)return "about every other time";if(r>=.28)return "about one time in three";return "rarely";}
  if(k===n)return "jedes Mal";if(k===0)return "nie";if(r>=.85)return "fast immer";
  if(r>=.6)return "meistens";if(r>=.4)return "etwa jedes zweite Mal";if(r>=.28)return "etwa jedes dritte Mal";return "selten";}
function ofDays(lang,k,n){return lang==="en"?`${k} of ${n} day${n===1?"":"s"}`:`${k} von ${n} ${n===1?"Tag":"Tagen"}`;}
const pts=v=>Math.round(v*100);

/* ---- Tage eines Monats einsammeln ----
   Berücksichtigt nur abgeschlossene Tage (vor opts.today) mit Daten. */
function routinesFor(st,s,h,lg){
  if(lg&&lg.plan&&lg.plan.r&&typeof lg.plan.r==="object"){
    const out=[];for(const id of Object.keys(lg.plan.r))out.push({id,name:String(lg.plan.r[id]||""),done:!!(lg.r&&lg.r[id])});
    return out;}
  // Ältere Tage ohne Tagesplan: nur übernehmen, wenn sich der Plan eindeutig ergibt
  // (aktuelle Routinen + an dem Tag erledigte = genau die Anzahl im Score-Verlauf).
  if(!lg||!h||typeof h.rTotal!=="number")return null;
  const done=lg.r||{};const ids=new Set(Object.keys(done));
  (st.routines||[]).forEach(r=>ids.add(r.id));
  if(ids.size!==h.rTotal||Object.keys(done).length!==h.rDone)return null;
  const cur={};(st.routines||[]).forEach(r=>cur[r.id]=r.name);
  return [...ids].map(id=>({id,name:String(cur[id]||(done[id]&&done[id].name)||""),done:!!done[id]}));}
function collectDays(st,y,m,opts){
  const last=new Date(y,m+1,0).getDate();const out=[];
  for(let d=1;d<=last;d++){const s=ymd(y,m,d);if(s>=opts.today)break;
    const h=(st.history&&st.history[s])||null,lg=(st.log&&st.log[s])||null;
    if(!h&&!lg)continue;
    const pp=(st.postpones&&+st.postpones[s])||0;
    let tDue=null,tDone=null;
    if(h&&typeof h.tTotal==="number"){tDue=Math.max(0,Math.round(h.tTotal-pp));tDone=Math.max(0,Math.round((h.tDone||0)-0.5*pp));}
    let score=null;try{score=opts.scoreFor?opts.scoreFor(s):null;}catch(e){score=null;}
    out.push({ds:s,day:d,dow:dowMon(s),score:(typeof score==="number"&&isFinite(score))?score:null,
      routines:routinesFor(st,s,h,lg),rDone:h?h.rDone:null,rTotal:h?h.rTotal:null,tDue,tDone,pp});}
  return out;}

/* ---- Regeln ---- */
function routineStats(days){const map={};
  days.forEach(d=>{if(!d.routines)return;d.routines.forEach(r=>{
    const e=map[r.id]||(map[r.id]={id:r.id,name:r.name,n:0,k:0,dow:Array.from({length:8},()=>({n:0,k:0})),wd:{n:0,k:0},we:{n:0,k:0}});
    if(r.name)e.name=r.name;e.n++;if(r.done)e.k++;
    e.dow[d.dow].n++;if(r.done)e.dow[d.dow].k++;
    const part=d.dow>=6?e.we:e.wd;part.n++;if(r.done)part.k++;});});
  return Object.values(map).filter(e=>e.name);}

function ruleRoutines(lang,days,F){
  const stats=routineStats(days);const used=new Set();
  // R1: Unterschied Woche / Wochenende
  stats.forEach(e=>{if(e.wd.n<4||e.we.n<2)return;
    const a=e.wd.k/e.wd.n,b=e.we.k/e.we.n,diff=a-b;if(Math.abs(diff)<.35)return;
    const wdTxt=lang==="en"?"on weekdays":"unter der Woche",weTxt=lang==="en"?"on weekends":"am Wochenende";
    const [hiL,hiK,hiN,loL,loK,loN]=diff>0?[wdTxt,e.wd.k,e.wd.n,weTxt,e.we.k,e.we.n]:[weTxt,e.we.k,e.we.n,wdTxt,e.wd.k,e.wd.n];
    const text=lang==="en"
      ?`${q(lang,e.name)} works ${often(lang,hiK,hiN)} ${hiL} (${ofDays(lang,hiK,hiN)}) but ${often(lang,loK,loN)} ${loL} (${ofDays(lang,loK,loN)}).`
      :`${q(lang,e.name)} klappt ${hiL} ${often(lang,hiK,hiN)} (${ofDays(lang,hiK,hiN)}), ${loL} ${often(lang,loK,loN)} (${ofDays(lang,loK,loN)}).`;
    F.push({id:"routine-weekend:"+e.id,kind:"bad",strength:Math.abs(diff)*Math.sqrt(Math.min(e.wd.n,e.we.n))*1.4,text});used.add(e.id);});
  // R4: einzelner schwacher Wochentag
  stats.forEach(e=>{if(used.has(e.id)||e.n<10)return;const all=e.k/e.n;if(all<.6)return;
    let worst=null;for(let w=1;w<=7;w++){const c=e.dow[w];if(c.n<3)continue;const r=c.k/c.n;
      if(r<=all-.45&&(!worst||r<worst.r))worst={w,r,k:c.k,n:c.n};}
    if(!worst)return;const ok=e.k-worst.k,on=e.n-worst.n;const L=T[lang];
    const text=lang==="en"
      ?`${q(lang,e.name)} mostly slips ${L.adv[worst.w-1]}: done on ${worst.k} of ${worst.n} ${L.plural[worst.w-1]}, but on ${ok} of ${on} other days.`
      :`${q(lang,e.name)} fällt vor allem ${L.adv[worst.w-1]} aus: erledigt an ${worst.k} von ${worst.n} ${L.plural[worst.w-1]}, an den übrigen Tagen an ${ok} von ${on}.`;
    F.push({id:"routine-dow:"+e.id,kind:"bad",strength:(all-worst.r)*Math.sqrt(worst.n)*1.3,text});used.add(e.id);});
  // R2: stärkste Routinen
  stats.filter(e=>!used.has(e.id)&&e.n>=8&&e.k/e.n>=.85).sort((a,b)=>b.k/b.n-a.k/a.n||b.n-a.n).slice(0,2).forEach(e=>{
    const text=lang==="en"?`${q(lang,e.name)} is solid: done on ${ofDays(lang,e.k,e.n)}.`
      :`${q(lang,e.name)} sitzt: erledigt an ${ofDays(lang,e.k,e.n)}.`;
    F.push({id:"routine-strong:"+e.id,kind:"good",strength:(e.k/e.n-.6)*Math.sqrt(e.n)*1.2,text});used.add(e.id);});
  // R3: Routinen, die oft liegen bleiben
  stats.filter(e=>!used.has(e.id)&&e.n>=8&&e.k/e.n<=.4).sort((a,b)=>a.k/a.n-b.k/b.n||b.n-a.n).slice(0,2).forEach(e=>{
    const text=e.k===0
      ?(lang==="en"?`${q(lang,e.name)} didn't happen on any of the ${e.n} days.`:`${q(lang,e.name)} hast du an keinem der ${e.n} Tage erledigt.`)
      :(lang==="en"?`${q(lang,e.name)} often gets left undone: only on ${ofDays(lang,e.k,e.n)}.`
        :`${q(lang,e.name)} bleibt oft liegen: nur an ${ofDays(lang,e.k,e.n)} erledigt.`);
    F.push({id:"routine-weak:"+e.id,kind:"bad",strength:(.6-e.k/e.n)*Math.sqrt(e.n)*1.2,text});used.add(e.id);});
  // R11: längste Serie mit allen Routinen (Kalendertage am Stück)
  let best=null,run=null;
  days.forEach(d=>{const all=d.routines?(d.routines.length>0&&d.routines.every(r=>r.done)):(d.rTotal>0&&d.rDone===d.rTotal);
    if(all&&run&&addDays(run.to,1)===d.ds){run.to=d.ds;run.n++;}else if(all){run={from:d.ds,to:d.ds,n:1};}else run=null;
    if(run&&(!best||run.n>best.n))best={...run};});
  if(best&&best.n>=5){const L=T[lang],a=parse(best.from),b=parse(best.to);
    const range=lang==="en"?`${L.monShort[a.getMonth()]} ${a.getDate()}–${b.getDate()}`:`${a.getDate()}.–${b.getDate()}. ${L.monShort[a.getMonth()]}`;
    const text=lang==="en"?`Longest streak: all routines done ${best.n} days in a row (${range}).`
      :`Längste Serie: ${best.n} Tage am Stück alle Routinen erledigt (${range}).`;
    F.push({id:"streak",kind:"good",strength:Math.sqrt(best.n)*.9,text});}
}

function rulePostpones(lang,st,y,m,today,F){
  const by=Array(8).fill(0);let total=0;const last=new Date(y,m+1,0).getDate();
  for(let d=1;d<=last;d++){const s=ymd(y,m,d);if(s>=today)break;const n=(st.postpones&&+st.postpones[s])||0;if(n>0){by[dowMon(s)]+=n;total+=n;}}
  if(total<3)return;
  const order=[1,2,3,4,5,6,7].sort((a,b)=>by[b]-by[a]);const top=order[0],c1=by[top],c2=by[order[1]];
  if(c1<2||c1/total<.4||c1<=c2)return;const L=T[lang];
  const text=lang==="en"
    ?`You postpone the most tasks ${L.adv[top-1]}: ${c1} of ${total} postponements in ${L.months[m]}.`
    :`${cap(L.adv[top-1])} verschiebst du die meisten Aufgaben: ${c1} von ${total} Verschiebungen im ${L.months[m]}.`;
  F.push({id:"postpone-dow",kind:"bad",strength:(c1/total)*Math.sqrt(total)*1.3,text});}

function ruleTasks(lang,days,F){
  let due=0,done=0;days.forEach(d=>{if(d.tDue!=null){due+=d.tDue;done+=Math.min(d.tDone,d.tDue);}});
  if(due<6)return;const r=done/due;
  if(r>=.85)F.push({id:"tasks",kind:"good",strength:(r-.6)*Math.sqrt(Math.min(due,20))*1.1,
    text:lang==="en"?`You get daily tasks done reliably: ${done} of ${due} on the planned day.`
      :`Tagesaufgaben erledigst du zuverlässig: ${done} von ${due} am geplanten Tag.`});
  else if(r<=.5)F.push({id:"tasks",kind:"bad",strength:(.7-r)*Math.sqrt(Math.min(due,20))*1.1,
    text:lang==="en"?`Many daily tasks stay open: only ${done} of ${due} done on the planned day.`
      :`Viele Tagesaufgaben bleiben liegen: nur ${done} von ${due} am geplanten Tag erledigt.`});}

function avg(list){return list.length?list.reduce((a,b)=>a+b,0)/list.length:null;}
function ruleScores(lang,days,prevAvg,prevDays,m,F){
  const L=T[lang];const scored=days.filter(d=>d.score!=null);
  // R7: stärkster / schwächster Wochentag
  const per=[];for(let w=1;w<=7;w++){const v=scored.filter(d=>d.dow===w).map(d=>d.score);if(v.length>=2)per.push({w,a:avg(v),n:v.length});}
  if(per.length>=5){per.sort((x,y)=>y.a-x.a);const hi=per[0],lo=per[per.length-1];
    if(hi.a-lo.a>=.2){const text=lang==="en"
        ?`Your strongest day is ${L.nom[hi.w-1]} (avg ${pts(hi.a)}), your weakest is ${L.nom[lo.w-1]} (avg ${pts(lo.a)}).`
        :`Dein stärkster Tag ist der ${L.nom[hi.w-1]} (Ø ${pts(hi.a)}), dein schwächster der ${L.nom[lo.w-1]} (Ø ${pts(lo.a)}).`;
      F.push({id:"dow-score",kind:"bad",strength:(hi.a-lo.a)*Math.sqrt(Math.min(hi.n,lo.n))*1.5,text});}}
  // R8: erste vs. zweite Monatshälfte
  const a=scored.filter(d=>d.day<=15).map(d=>d.score),b=scored.filter(d=>d.day>15).map(d=>d.score);
  if(a.length>=4&&b.length>=4){const A=avg(a),B=avg(b),diff=B-A;
    if(Math.abs(diff)>=.1)F.push({id:"halves",kind:diff>0?"good":"bad",strength:Math.abs(diff)*Math.sqrt(Math.min(a.length,b.length))*1.4,
      text:diff>0
        ?(lang==="en"?`The second half of the month went clearly better: avg ${pts(B)} instead of ${pts(A)}.`:`In der zweiten Monatshälfte lief es deutlich besser: Ø ${pts(B)} statt ${pts(A)}.`)
        :(lang==="en"?`You slowed down in the second half of the month: avg ${pts(B)} instead of ${pts(A)}.`:`In der zweiten Monatshälfte hast du nachgelassen: Ø ${pts(B)} statt ${pts(A)}.`)});}
  // R9: Vergleich mit dem Vormonat
  const cur=avg(scored.map(d=>d.score));
  if(cur!=null&&prevAvg!=null&&scored.length>=MIN_DAYS&&prevDays>=MIN_DAYS){const diff=pts(cur)-pts(prevAvg);
    if(Math.abs(diff)>=5){const pm=L.months[(m+11)%12];
      F.push({id:"vs-prev",kind:diff>0?"good":"bad",strength:Math.abs(diff)/100*Math.sqrt(scored.length)*1.6,
        text:lang==="en"?`Compared with ${pm}: ${diff>0?"+":""}${diff} points on average (avg ${pts(cur)} instead of ${pts(prevAvg)}).`
          :`Gegenüber ${pm}: ${diff>0?"+":""}${diff} Punkte im Schnitt (Ø ${pts(cur)} statt ${pts(prevAvg)}).`});}}
  // R12: Anteil starker Tage
  if(scored.length>=MIN_DAYS){const k=scored.filter(d=>d.score>=.8).length,n=scored.length;
    if(k/n>=.5)F.push({id:"strong-days",kind:"good",strength:(k/n-.3)*Math.sqrt(n)*.8,
      text:lang==="en"?`On ${k} of ${n} days you met at least 80 % of your own standards.`
        :`An ${k} von ${n} Tagen hast du mindestens 80 % deiner Ansprüche erfüllt.`});}
}

function ruleGoals(lang,st,y,m,today,F){
  // Wochen, deren Sonntag in diesem Monat liegt und die schon vorbei sind
  const last=new Date(y,m+1,0).getDate();const per={};
  for(let d=1;d<=last;d++){const sun=ymd(y,m,d);if(dowMon(sun)!==7||sun>=today)continue;
    const week=[];for(let i=6;i>=0;i--)week.push(addDays(sun,-i));
    const seen={};
    // Endstand: letzter Tag der Woche mit Tagesplan
    for(let i=6;i>=0;i--){const lg=st.log&&st.log[week[i]];if(lg&&lg.plan&&lg.plan.g){
        Object.keys(lg.plan.g).forEach(id=>{const g=lg.plan.g[id];if(!Array.isArray(g))return;
          seen[id]={name:String(g[0]||""),target:+g[1]||0,count:+g[2]||0,known:true};});break;}}
    // Ereignisse der Woche (auch für Tage ohne Tagesplan)
    week.forEach(s=>{const lg=st.log&&st.log[s];if(!lg||!lg.g)return;
      Object.keys(lg.g).forEach(id=>{const e=lg.g[id];if(!e)return;const r=seen[id]||(seen[id]={name:String(e.name||""),target:+e.target||0,count:0,known:false});
        if(e.done)r.done=true;if(!r.name)r.name=String(e.name||"");});});
    Object.keys(seen).forEach(id=>{const r=seen[id];if(!(r.target>0)||!r.name)return;
      const e=per[id]||(per[id]={id,name:r.name,weeks:0,hit:0,fr:[]});e.name=r.name;e.weeks++;
      const hit=r.done||(r.known&&r.count>=r.target);if(hit)e.hit++;
      if(r.known)e.fr.push(Math.min(1,r.count/r.target));});}
  Object.values(per).forEach(e=>{if(e.weeks<2)return;
    if(e.hit===e.weeks)F.push({id:"goal-hit:"+e.id,kind:"good",strength:Math.sqrt(e.weeks)*.9,
      text:lang==="en"?`Weekly goal ${q(lang,e.name)} reached every week (${e.hit} of ${e.weeks}).`
        :`Wochenziel ${q(lang,e.name)} in jeder Woche geschafft (${e.hit} von ${e.weeks}).`});
    else if(e.hit===0){const p=e.fr.length?Math.round(avg(e.fr)*100):null;
      F.push({id:"goal-miss:"+e.id,kind:"bad",strength:Math.sqrt(e.weeks)*.9,
        text:lang==="en"?`Weekly goal ${q(lang,e.name)} wasn't reached in any of the ${e.weeks} weeks${p!=null?` — on average ${p} % of the target`:""}.`
          :`Wochenziel ${q(lang,e.name)} hast du in keiner der ${e.weeks} Wochen erreicht${p!=null?` – im Schnitt ${p} % des Ziels`:""}.`});}});
}

/* ---- Öffentliche Funktionen ---- */
// Analyse eines Monats. opts: {lang:"de"|"en", today:"YYYY-MM-DD", scoreFor:(ds)=>0..1|null}
function analyzeMonth(st,y,m,opts){
  opts=opts||{};const lang=opts.lang==="en"?"en":"de";const today=opts.today||fmt(new Date());
  st=st&&typeof st==="object"?st:{};
  const days=collectDays(st,y,m,{today,scoreFor:opts.scoreFor});
  const scored=days.filter(d=>d.score!=null);
  const pm=m===0?11:m-1,py=m===0?y-1:y;
  const prev=collectDays(st,py,pm,{today,scoreFor:opts.scoreFor}).filter(d=>d.score!=null);
  const res={year:y,month:m,key:monthKey(y,m),lang,daysWithData:days.length,minDays:MIN_DAYS,
    enough:days.length>=MIN_DAYS,avgScore:avg(scored.map(d=>d.score)),prevAvgScore:avg(prev.map(d=>d.score)),
    complete:ymd(y,m,new Date(y,m+1,0).getDate())<today,
    perfectDays:days.filter(d=>d.score!=null&&d.score>=.999).length,good:[],bad:[],findings:[]};
  if(!res.enough)return res;
  const F=[];
  ruleRoutines(lang,days,F);
  rulePostpones(lang,st,y,m,today,F);
  ruleTasks(lang,days,F);
  ruleScores(lang,days,res.prevAvgScore,prev.length,m,F);
  ruleGoals(lang,st,y,m,today,F);
  F.forEach(f=>{if(!isFinite(f.strength))f.strength=0;});
  F.sort((a,b)=>b.strength-a.strength);
  res.good=F.filter(f=>f.kind==="good").slice(0,MAX_PER_SECTION);
  res.bad=F.filter(f=>f.kind==="bad").slice(0,MAX_PER_SECTION);
  res.findings=[...res.good,...res.bad].sort((a,b)=>b.strength-a.strength);
  return res;}

// Frühester Monat mit Daten (für die Monatsauswahl)
function firstDataMonth(st){let min=null;
  [st&&st.history,st&&st.log].forEach(o=>{if(o&&typeof o==="object")Object.keys(o).forEach(k=>{if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&(!min||k<min))min=k;});});
  return min?{y:+min.slice(0,4),m:+min.slice(5,7)-1}:null;}

const api={analyzeMonth,firstDataMonth,MIN_DAYS,_internal:{collectDays,often,dowMon}};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.KonseqAnalysis=api;
})(typeof window!=="undefined"?window:globalThis);
