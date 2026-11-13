/* Second Reader · app logic (vanilla JS, no build). Content lives in data.js. */
(() => {
"use strict";
const D = window.SR;
const DEFAULT_ENDPOINT = "https://jev-sandbox-proxy.watkins-um.workers.dev";
const KEY = "secondreader.v1";
const MAX_CHARS = 5800;      // the relay refuses documents over 6,000 characters
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pct = p => Math.round(p * 100) + "%";
const clamp01 = x => Math.max(0, Math.min(1, +x || 0));

/* ---------------- saved state (this browser only) ---------------- */
const defaults = () => ({
  endpoint: "",
  intake: { sample: "porch", text: null, thresh: 85, res: null },
  panel: { sample: "nets", text: null, mine: {}, res: null },
  reports: { questions: null, extra: [], res: {} },
  coach: { sample: "first", text: null, res: null, history: [] },
  collection: { img: "maker", alt: null, res: null }
});
const store = {
  data: (() => { try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"), d = defaults(); for (const k in d) if (s[k] != null) d[k] = (typeof d[k] === "object") ? Object.assign(d[k], s[k]) : s[k]; return d; } catch { return defaults(); } })(),
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch {} }
};
const S = store.data;
const endpoint = () => S.endpoint || DEFAULT_ENDPOINT;

/* ---------------- Jev ---------------- */
const usage = { calls: 0, input: 0, output: 0, model: "" };
async function jev(state, questions, assets) {
  const body = { state, model: "jev-latest", questions };
  if (assets) body.assets = assets;
  let r;
  try { r = await fetch(endpoint(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
  catch { throw new Error("Could not reach the relay. Check your connection, then open Connection in the header."); }
  const t = await r.text(); let j;
  try { j = JSON.parse(t); } catch { throw new Error("The relay returned something unreadable (status " + r.status + ")."); }
  if (!r.ok || j.error || !j.answers) {
    const m = typeof j.error === "string" ? j.error : (j.error && j.error.message) || j.message || j.detail;
    throw new Error(m ? String(m) : "Jev did not answer (status " + r.status + ").");
  }
  usage.calls++; usage.input += (j.usage && j.usage.input_tokens) || 0; usage.output += (j.usage && j.usage.output_tokens) || 0; usage.model = j.model || usage.model;
  $("#usage").textContent = `This visit: ${usage.calls} request${usage.calls === 1 ? "" : "s"} to ${usage.model || "Jev"}, ${usage.input.toLocaleString()} tokens in, ${usage.output.toLocaleString()} out.`;
  return j;
}
const noulP = a => clamp01(a && (typeof a.noul === "number" ? a.noul : a.probability));
function levelProbs(a, n) {
  const P = (a && a.probabilities) || {}; const out = [];
  for (let i = 0; i < n; i++) out.push(clamp01(Array.isArray(P) ? P[i] : P[String(i)]));
  const sum = out.reduce((x, y) => x + y, 0);
  if (!sum && a && typeof a.score === "number") out[Math.max(0, Math.min(n - 1, Math.round(a.score)))] = 1;
  return out;
}
const argmax = arr => arr.reduce((b, v, i) => v > arr[b] ? i : b, 0);
const rawBlock = (req, res) => `<details class="raw"><summary>See exactly what was sent and what came back</summary><pre>${esc(JSON.stringify({ sent: req, returned: res }, null, 2))}</pre></details>`;
const trimAssets = req => { const v = JSON.parse(JSON.stringify(req)); for (const a of Object.values(v.assets || {})) a.data_base64 = a.data_base64.slice(0, 32) + "… (" + Math.round(a.data_base64.length / 1024) + " KB of image data)"; return v; };

async function withBusy(btn, errEl, fn) {
  const label = btn.textContent; btn.disabled = true; btn.classList.add("busy"); if (errEl) errEl.innerHTML = "";
  try { await fn(); }
  catch (e) { if (errEl) errEl.innerHTML = `<div class="err" role="alert">${esc(e.message || e)}</div>`; }
  finally { btn.disabled = false; btn.classList.remove("busy"); btn.textContent = label; }
}

/* ---------------- shared: room header and step guide ---------------- */
const RID = { "01": "intake", "02": "panel", "03": "reports", "04": "coach", "05": "collection" };
const STEPS = {
  intake: [["A sample is loaded", "Switch samples, edit the text, or write your own."], ["Press Run the eight checks", "Jev reads the application. It takes about five seconds."], ["Move the dial", "Watch which checks go to staff as you ask for more certainty."]],
  panel: [["Read the application", "It is on the left. Switch samples if you like."], ["Score it yourself", "Click one band under each of the six criteria."], ["Reveal and compare", "Press the button, then look for the rows marked Split."]],
  reports: [["Look over the questions", "Edit the wording, add a column, or leave them as they are."], ["Press Read all reports", "Jev answers every question for every report. About thirty seconds."], ["Open the dashed circles", "Click a grantee to read the report. Download the table if you want it."]],
  coach: [["A first draft is loaded", "Edit it, switch to the revised draft, or write your own."], ["Press Check my draft", "Each criterion shows the band it reads at and one next step."], ["Revise and check again", "Change the text on the left and press the button again to see what moved."]],
  collection: [["Choose a photograph", "Click a thumbnail, or use your own image."], ["Write the description", "Edit the text a screen reader would speak for this image."], ["Press Tag this image", "Check the box on the photo and each tag against what you see."]]
};
function roomHead(n, name, title, lede, who) {
  const id = RID[n];
  return `<header class="rh"><span class="num" aria-hidden="true">${n}</span><div><p class="kicker">${name}</p><h1 class="room-h">${title}</h1></div></header>
    <p class="room-p">${lede}</p><p class="who">${who}</p>
    <h2 class="steps-h">What to do here</h2>
    <ol class="steps" id="${id}Steps">${STEPS[id].map((x, i) => `<li data-n="${i + 1}"><span class="sn" aria-hidden="true">${i + 1}</span><div><b>${x[0]}</b><span>${x[1]}</span></div></li>`).join("")}</ol>`;
}
function setStep(id, n) {
  $$("#" + id + "Steps li").forEach(li => { const k = +li.dataset.n; li.classList.toggle("done", k < n); li.classList.toggle("on", k === n); k === n ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current"); });
}
const HINT = `<span class="hint">Sends the text on this page to Jev. About five seconds.</span>`;

/* ---------------- shared: document picker ---------------- */
function docPicker({ samples, st, short, onChange }) {
  // returns html + a binder. st has .sample and .text (null = untouched sample text)
  const cur = samples.find(s => s.id === st.sample);
  const text = st.text != null ? st.text : (cur ? cur.text : "");
  const edited = cur && st.text != null && st.text !== cur.text;
  const html = `
    <div class="tabs" role="group" aria-label="Choose a document">
      ${samples.map(s => `<button class="tab" type="button" data-s="${s.id}" aria-pressed="${s.id === st.sample}">${esc(s.title)}</button>`).join("")}
      <button class="tab" type="button" data-s="" aria-pressed="${!cur}">Write your own</button>
    </div>
    <div class="sheet">
      <div class="meta"><span>${cur ? esc([cur.org, cur.county].filter(Boolean).join(" · ") || cur.title) : "Your text"}</span>
        <span class="fic">${cur ? (edited ? "Fictional sample, edited" : "Fictional sample") : "Do not paste real applications"}</span></div>
      <textarea class="doc${short ? " short" : ""}" aria-label="Document text" spellcheck="true" placeholder="Type or paste invented text here.">${esc(text)}</textarea>
      <div class="count"></div>
    </div>
    <p class="cap edit-hint">Click inside the page to edit it. Your changes are saved in this browser only.</p>`;
  const bind = root => {
    const ta = $("textarea.doc", root), cnt = $(".count", root);
    const upd = () => { const n = ta.value.length; cnt.textContent = n.toLocaleString() + " of " + MAX_CHARS.toLocaleString() + " characters"; cnt.classList.toggle("over", n > MAX_CHARS); };
    upd();
    ta.addEventListener("input", () => { st.text = ta.value; store.save(); upd(); });
    $$(".tab[data-s]", root).forEach(b => b.addEventListener("click", () => { st.sample = b.dataset.s; st.text = b.dataset.s ? null : ""; onChange(); }));
  };
  return { html, bind, text: () => text };
}
const docText = (samples, st) => (st.text != null ? st.text : (samples.find(s => s.id === st.sample) || { text: "" }).text).trim();
function checkLen(t) { if (t.length < 40) throw new Error("Add a little more text first."); if (t.length > MAX_CHARS) throw new Error("That is over the " + MAX_CHARS.toLocaleString() + " character limit. Trim it and try again."); }

/* ================= HOME demo ================= */
function renderHero() {
  const el = $("#heroDemo");
  const doc = "When it is finished we expect to have some kind of unveiling, date to be decided.";
  const ask = "Does this describe a public engagement component?";
  const rings = []; for (let i = 0; i < 9; i++) { const r = 16 + i * 17, o = 1 - i * .09; rings.push(`<circle cx="170" cy="170" r="${r}" fill="none" stroke="${i % 2 ? "#C79A36" : "#B88A2A"}" stroke-width="13" opacity="${o.toFixed(2)}"/><circle cx="170" cy="170" r="${r}" fill="none" stroke="#6E4F0F" stroke-width="13" stroke-dasharray="1.5 ${(5 + i * .6).toFixed(1)}" opacity="${(o * .7).toFixed(2)}"/>`); }
  const coil = $("#coil"); if (coil) coil.innerHTML = `<svg viewBox="0 0 340 340" aria-hidden="true">${rings.join("")}<circle cx="170" cy="170" r="6" fill="#6E4F0F"/></svg>`;
  el.innerHTML = `<h3>Try it first</h3><p class="doc">${esc(doc)}</p>
    <p><b>Question:</b> ${esc(ask)}</p>
    <div id="heroOut"><div class="pbar" aria-hidden="true"><span class="mid"></span></div><p class="cap">No answer yet. A plain chatbot would say yes or no. Press the button to see what Jev says.</p></div>
    <div class="row"><button class="btn" id="heroBtn" type="button">Ask Jev</button><span class="hint">Press once. The answer appears above in a few seconds.</span></div><div id="heroErr"></div>`;
  $("#heroBtn").addEventListener("click", e => withBusy(e.currentTarget, $("#heroErr"), async () => {
    const r = await jev({ sentence: doc }, { q: { type: "noul", instructions: ask } });
    const p = noulP(r.answers.q);
    const read = p >= .85 ? "Sure enough to move on." : p <= .15 ? "Sure enough to flag." : "Not sure. In the rooms, an answer like this goes to a person.";
    $("#heroOut").innerHTML = `<div class="pbar" role="img" aria-label="${pct(p)} yes"><i style="width:${p * 100}%"></i><span class="mid"></span></div>
      <p class="cap"><span class="pct">Jev: ${pct(p)} yes.</span> ${read}</p>`;
  }));
}

/* ================= 01 INTAKE ================= */
function renderIntake() {
  const st = S.intake, el = $("#intake"), C = D.intake.checks;
  const picker = docPicker({ samples: D.intake.samples, st, onChange: () => { st.res = null; store.save(); renderIntake(); } });
  el.innerHTML = `
    ${roomHead("01","Intake desk",`Eight eligibility checks, and one dial for how sure is sure enough.`,`Before an application reaches a panel, someone confirms it meets the rules. Here Jev reads the application against eight rules drawn from the Art of Community: Rural SC guidelines. Anything it is not sure about goes to a person, and so does anything it flags.`,`<b>Who would use it:</b> grants staff. <b>What it replaces:</b> nothing. It sorts the stack so staff time goes to the unclear ones.`)}
    <div class="bench">
      <div class="col"><h2>The application</h2>${picker.html}
        <div class="row"><button class="btn" id="inRun" type="button">Run the eight checks</button>${HINT}</div><div id="inErr"></div></div>
      <div class="col"><h2>The checks</h2>
        <div class="thresh"><label for="inT"><span>Certainty needed to skip a person</span><span class="pct" id="inTv"></span></label>
          <input id="inT" type="range" min="60" max="99" step="1" value="${st.thresh}">
          <p>Move the dial and watch checks change hands. A cautious agency sets it high.</p></div>
        <div id="inOut" aria-live="polite"></div></div>
    </div>`;
  picker.bind(el);
  const paint = () => {
    const T = st.thresh / 100; $("#inTv").textContent = st.thresh + "%";
    const A = st.res && st.res.answers; let c = 0, f = 0, u = 0; setStep("intake", A ? 3 : 2);
    const rows = C.map(k => {
      let cls = "", badge = "Not run", meter = "";
      if (A && A[k.id]) {
        const p = noulP(A[k.id]), pe = k.expect === "yes" ? p : 1 - p;
        if (pe >= T) { cls = "clear"; badge = "Clear"; c++; } else if (pe <= 1 - T) { cls = "flag"; badge = "Flagged"; f++; } else { cls = "staff"; badge = "Unsure"; u++; }
        meter = `<div class="meter"><div class="pbar" role="img" aria-label="${pct(p)} yes"><i style="width:${p * 100}%"></i><span class="mid"></span></div><span class="pct">Jev: ${pct(p)} yes</span></div>`;
      }
      return `<li class="check ${cls}"><h3>${esc(k.label)}</h3><span class="badge">${badge}</span>
        <p class="q">Asked: ${esc(k.ask)} Expected answer: ${k.expect}.</p>${meter}</li>`;
    }).join("");
    $("#inOut").innerHTML = (A ? `<div class="tally"><div class="c"><b>${c}</b>clear</div><div class="s"><b>${u}</b>unsure, to staff</div><div class="f"><b>${f}</b>flagged, to staff</div></div>` : "")
      + `<ul class="checks">${rows}</ul>`
      + (A ? `<p class="note"><b>What happens next.</b> ${f + u ? `A person reads ${f + u} of 8 checks on this application.` : "Nothing needs a second look at this setting."} The model has not declined anything. A flag is a reason to read, not a ruling.</p>${rawBlock(st.req, st.res)}` : "");
  };
  paint();
  $("#inT").addEventListener("input", e => { st.thresh = +e.target.value; store.save(); paint(); });
  $("#inRun").addEventListener("click", e => withBusy(e.currentTarget, $("#inErr"), async () => {
    const t = docText(D.intake.samples, st); checkLen(t);
    const qs = {}; C.forEach(k => qs[k.id] = { type: "noul", instructions: k.ask });
    const state = { application: t };
    st.res = await jev(state, qs); st.req = { state, questions: qs }; store.save(); paint();
  }));
}

/* ================= 02 PANEL ================= */
function bandsHtml(c, probs, mine, interactive) {
  const top = probs ? argmax(probs) : -1;
  return `<div class="bands">${c.bands.map((b, i) => {
    const inner = `<b>${c.points ? esc(c.points[i]) + " pts" : "Band " + (i + 1)}</b><span>${esc(b)}</span>${probs ? `<span class="jp">${pct(probs[i])}</span><span class="fill" style="height:${probs[i] * 100}%"></span>` : ""}`;
    return interactive
      ? `<button type="button" class="band${i === top ? " jtop" : ""}" data-c="${c.id}" data-i="${i}" aria-pressed="${mine === i}">${inner}</button>`
      : `<div class="band${i === top ? " jtop" : ""}">${inner}</div>`;
  }).join("")}</div>`;
}
function renderPanel() {
  const st = S.panel, el = $("#panel"), C = D.panel.criteria;
  const picker = docPicker({ samples: D.panel.samples, st, onChange: () => { st.res = null; st.mine = {}; store.save(); renderPanel(); } });
  el.innerHTML = `
    ${roomHead("02","Panel room",`Score it yourself first. Then see where the second reader lands.`,`Panelists score against a published rubric. Here you score six criteria from the Folklife and Traditional Arts rubric, then reveal Jev's read: a spread across the four bands, not a single number. The point is the disagreement. A split is a prompt for the panel to talk, and a check on whether two panels are reading the rubric the same way.`,`<b>Who would use it:</b> panel chairs and staff preparing a panel. <b>The panel still scores.</b> ${esc(D.panel.note)}`)}
    <div class="bench">
      <div class="col"><h2>The application</h2>${picker.html}</div>
      <div class="col"><h2>The rubric</h2>
        <div class="legend"><span><i class="sw you"></i> Your score</span><span><i class="sw"></i> Jev's spread across bands</span></div>
        <div id="pnCrit"></div>
        <div class="row"><button class="btn" id="pnRun" type="button">Reveal the second read</button><button class="btn ghost" id="pnReset" type="button">Clear my scores</button>${HINT}</div>
        <div id="pnErr"></div><div id="pnSum" aria-live="polite"></div></div>
    </div>`;
  picker.bind(el);
  const paint = () => {
    const A = st.res && st.res.answers; const tally = { agree: [], near: [], split: [], unsure: [] };
    $("#pnCrit").innerHTML = C.map(c => {
      const probs = A && A[c.id] ? levelProbs(A[c.id], 4) : null, mine = st.mine[c.id];
      let state = mine == null ? `<span class="state todo">Pick a band</span>` : `<span class="state mine">Your score: band ${mine + 1}</span>`;
      if (probs) {
        const top = argmax(probs), sure = probs[top] >= .6;
        let k = null, txt = "";
        if (mine != null) { const d = Math.abs(mine - top); k = d >= 2 ? "split" : !sure ? "unsure" : d === 1 ? "near" : "agree"; txt = { split: "Split: talk about this one", unsure: "Jev is torn", near: "One band apart", agree: "You agree" }[k]; }
        else if (!sure) { k = "unsure"; txt = "Jev is torn"; }
        else state = "";
        if (k) { tally[k].push(c.label); state = `<span class="state ${k}">${txt}</span>`; }
      }
      return `<div class="crit"><header><h3>${esc(c.label)}</h3>${state}</header>${bandsHtml(c, probs, mine, true)}</div>`;
    }).join("");
    $$("#pnCrit .band").forEach(b => b.addEventListener("click", () => { const i = +b.dataset.i, id = b.dataset.c; st.mine[id] = st.mine[id] === i ? undefined : i; store.save(); paint(); }));
    const scored = C.filter(c => st.mine[c.id] != null).length; setStep("panel", A || scored === C.length ? 3 : 2);
    $("#pnRun").textContent = A ? "Read it again" : scored ? "Reveal the second read" : "Reveal without scoring";
    let sum = "";
    if (A) {
      const first = tally.split.concat(tally.unsure);
      sum = `<p class="note"><b>For the panel.</b> ${scored ? `You and Jev agree on ${tally.agree.length}, sit one band apart on ${tally.near.length}, and split on ${tally.split.length}.` : "Score the criteria to compare your read with Jev's."} ${first.length ? "Start the discussion with: " + esc(first.join(", ")) + "." : scored ? "No splits on this one." : ""} Jev has only the words on the page. It cannot know the community, the artists, or the work.</p>${rawBlock(st.req, st.res)}`;
    } else sum = `<p class="progress"><b>${scored} of ${C.length} scored.</b> ${scored === C.length ? "Now press Reveal the second read." : "Click the band that fits best under each criterion. There is no single right answer."}</p>`;
    $("#pnSum").innerHTML = sum;
  };
  paint();
  $("#pnReset").addEventListener("click", () => { st.mine = {}; store.save(); paint(); });
  $("#pnRun").addEventListener("click", e => withBusy(e.currentTarget, $("#pnErr"), async () => {
    const t = docText(D.panel.samples, st); checkLen(t);
    const qs = {}; C.forEach(c => qs[c.id] = { type: "score", instructions: c.ask, criteria: c.bands });
    const state = { application: t };
    st.res = await jev(state, qs); st.req = { state, questions: qs }; store.save(); paint();
  }));
}

/* ================= 03 REPORTS ================= */
function renderReports() {
  const st = S.reports, el = $("#reports");
  if (!st.questions) st.questions = D.reports.questions.map(q => ({ ...q }));
  const items = () => D.reports.items.concat(st.extra);
  let open = null;
  el.innerHTML = `
    ${roomHead("03","Report room",`Every final report, the same questions, one table.`,`Every grantee files a final report, and most of what matters in it is prose. Ask the same yes or no questions of the whole stack and the narratives become counts a legislator or the National Endowment for the Arts can read. Hollow circles mean no. Dashed circles mean Jev was not sure, and those are the ones a person should open.`,`<b>Who would use it:</b> grants and data staff, after the fact. No funding decision depends on it, which makes it the safest place to start.`)}
    <div class="bench wide-right">
      <div class="col"><h2>The questions</h2>
        <div class="qlist" id="rpQ"></div>
        <div class="row"><button class="btn ghost small" id="rpAdd" type="button">Add a question</button><button class="btn ghost small" id="rpDef" type="button">Restore defaults</button></div>
        <h2 style="margin-top:22px">Add a report</h2>
        <label class="lab" for="rpOrg" style="margin-top:0">Organization (invented)</label>
        <input class="field" id="rpOrg" style="min-height:0;font-family:inherit;font-size:16px" maxlength="80">
        <label class="lab" for="rpTxt">Report text</label>
        <textarea class="field" id="rpTxt" placeholder="Type an invented final report. Do not paste a real one."></textarea>
        <div class="row"><button class="btn ghost small" id="rpAddR" type="button">Add to the stack</button></div>
      </div>
      <div class="col"><h2>The stack</h2>
        <div class="row" style="margin-top:0"><button class="btn" id="rpRun" type="button">Read all reports</button><button class="btn ghost" id="rpCsv" type="button">Download CSV</button><span id="rpProg" role="status" class="cap"></span></div>
        <div id="rpErr"></div>
        <div class="legend"><span><i class="dot y">Y</i> Yes</span><span><i class="dot n">N</i> No</span><span><i class="dot u">?</i> Unsure, open it</span><span>Fainter means less certain</span></div>
        <div class="tablewrap"><table class="mx" id="rpT"></table></div>
        <div id="rpSum" aria-live="polite"></div>
      </div>
    </div>`;
  const cell = p => {
    if (p == null) return `<i class="dot w" title="Not read yet"></i>`;
    if (p >= .8) return `<i class="dot y" style="opacity:${(.5 + (p - .8) * 2.5).toFixed(2)}" title="${pct(p)} yes">Y</i>`;
    if (p <= .2) return `<i class="dot n" style="opacity:${(.5 + (.2 - p) * 2.5).toFixed(2)}" title="${pct(p)} yes">N</i>`;
    return `<i class="dot u" title="${pct(p)} yes">?</i>`;
  };
  const paintQ = () => {
    $("#rpQ").innerHTML = st.questions.map((q, i) => `<div class="qrow"><input value="${esc(q.label)}" data-i="${i}" data-f="label" aria-label="Column name ${i + 1}" maxlength="40"><input value="${esc(q.ask)}" data-i="${i}" data-f="ask" aria-label="Question ${i + 1}" maxlength="240"><button class="x" type="button" data-del="${i}" aria-label="Remove question ${i + 1}">&times;</button></div>`).join("");
    $$("#rpQ input").forEach(inp => inp.addEventListener("change", () => {
      const q = st.questions[+inp.dataset.i]; q[inp.dataset.f] = inp.value.trim() || q[inp.dataset.f];
      if (inp.dataset.f === "ask") for (const r of Object.values(st.res)) delete r[q.id];
      store.save(); paintT();
    }));
    $$("#rpQ [data-del]").forEach(b => b.addEventListener("click", () => { if (st.questions.length > 1) { st.questions.splice(+b.dataset.del, 1); store.save(); paintQ(); paintT(); } }));
    $("#rpAdd").disabled = st.questions.length >= 8;
  };
  const paintT = () => {
    const Q = st.questions, R = items(); let unsure = 0, read = 0;
    const foot = Q.map(q => { let y = 0, u = 0, n = 0; R.forEach(r => { const p = st.res[r.id] && st.res[r.id][q.id]; if (p == null) return; n++; if (p >= .8) y++; else if (p > .2) u++; }); unsure += u; read += n; return n ? `<td>${y} of ${n} yes${u ? `<br>${u} unsure` : ""}</td>` : "<td></td>"; }).join("");
    $("#rpT").innerHTML = `<thead><tr><th class="org" scope="col">Grantee (fictional)</th>${Q.map(q => `<th scope="col">${esc(q.label)}</th>`).join("")}</tr></thead>
      <tbody>${R.map(r => `<tr class="${open === r.id ? "open" : ""}"><td class="org"><button type="button" data-open="${r.id}" aria-expanded="${open === r.id}">${esc(r.org)}</button><small>${esc([r.county ? r.county + " County" : "", r.grant].filter(Boolean).join(" · ") || "Added by you")}</small></td>${Q.map(q => `<td>${cell(st.res[r.id] ? st.res[r.id][q.id] : null)}</td>`).join("")}</tr>
        ${open === r.id ? `<tr><td class="reader" colspan="${Q.length + 1}">${esc(r.text)}<div class="probs">${Q.map(q => { const p = st.res[r.id] && st.res[r.id][q.id]; return p == null ? "" : `${esc(q.label)}: ${pct(p)} yes`; }).filter(Boolean).join(" · ") || "Not read yet."}${r.mine ? ` <button class="btn ghost small" type="button" data-rm="${r.id}">Remove this report</button>` : ""}</div></td></tr>` : ""}`).join("")}</tbody>
      <tfoot><tr><td class="org">Totals</td>${foot}</tr></tfoot>`;
    $$("#rpT [data-open]").forEach(b => b.addEventListener("click", () => { open = open === b.dataset.open ? null : b.dataset.open; paintT(); }));
    $$("#rpT [data-rm]").forEach(b => b.addEventListener("click", () => { st.extra = st.extra.filter(x => x.id !== b.dataset.rm); delete st.res[b.dataset.rm]; open = null; store.save(); paintT(); }));
    $("#rpRun").textContent = `Read all ${R.length} reports`; setStep("reports", read ? 3 : 2);
    $("#rpSum").innerHTML = read ? `<p class="note"><b>Needs a human read:</b> ${unsure} of ${read} answers. Click a grantee to open the report beside Jev's answers. Counts like these describe what reports say, which is not always what happened.</p>` : `<p class="cap">Nothing read yet. Edit the questions if you like, then read the stack.</p>`;
  };
  paintQ(); paintT();
  $("#rpAdd").addEventListener("click", () => { if (st.questions.length < 8) { st.questions.push({ id: "q" + Date.now().toString(36), label: "New column", ask: "Does the report say that ...?" }); store.save(); paintQ(); paintT(); } });
  $("#rpDef").addEventListener("click", () => { st.questions = D.reports.questions.map(q => ({ ...q })); st.res = {}; store.save(); paintQ(); paintT(); });
  $("#rpAddR").addEventListener("click", () => {
    const text = $("#rpTxt").value.trim(), org = $("#rpOrg").value.trim() || "Your report";
    if (text.length < 40) { $("#rpErr").innerHTML = `<div class="err" role="alert">Write a few sentences for the report first.</div>`; return; }
    st.extra.push({ id: "x" + Date.now().toString(36), org, text: text.slice(0, MAX_CHARS), mine: true }); $("#rpTxt").value = ""; $("#rpOrg").value = ""; $("#rpErr").innerHTML = ""; store.save(); paintT();
  });
  $("#rpRun").addEventListener("click", e => withBusy(e.currentTarget, $("#rpErr"), async () => {
    const R = items(), qs = {}; st.questions.forEach(q => qs[q.id] = { type: "noul", instructions: q.ask });
    let done = 0, failed = 0, lastErr = "";
    for (const r of R) {
      $("#rpProg").textContent = `Reading ${done + 1} of ${R.length}`;
      try { const j = await jev({ final_report: r.text }, qs); st.res[r.id] = {}; for (const q of st.questions) if (j.answers[q.id]) st.res[r.id][q.id] = noulP(j.answers[q.id]); }
      catch (err) { failed++; lastErr = err.message; }
      done++; store.save(); paintT();
    }
    $("#rpProg").textContent = failed ? "" : "Done.";
    if (failed) throw new Error(`${failed} of ${R.length} reports could not be read. ${lastErr}`);
  }));
  $("#rpCsv").addEventListener("click", () => {
    const Q = st.questions, q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["grantee_fictional", "county", "grant", ...Q.flatMap(x => [x.label + " (probability yes)", x.label + " (reading)"])];
    const rows = items().map(r => [r.org, r.county || "", r.grant || "", ...Q.flatMap(x => { const p = st.res[r.id] && st.res[r.id][x.id]; return p == null ? ["", "not read"] : [p.toFixed(3), p >= .8 ? "yes" : p <= .2 ? "no" : "unsure"]; })]);
    const csv = [head, ...rows].map(r => r.map(q).join(",")).join("\n") + "\n\"Fictional demonstration data. Readings by Jev (TypeSafe AI) via Second Reader. Not Commission data.\"\n";
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "second-reader-reports.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
}

/* ================= 04 COACH ================= */
function renderCoach() {
  const st = S.coach, el = $("#coach"), C = D.coach.criteria;
  const picker = docPicker({ samples: D.coach.samples, st, short: true, onChange: () => { st.res = null; store.save(); renderCoach(); } });
  el.innerHTML = `
    ${roomHead("04","Applicant coach",`Test a draft against the rubric before the deadline.`,`The Commission publishes its rubrics and tells applicants to write to them. A small library friends group with no grant writer could paste a draft here and see which band each answer reads at and what the next band asks for. Revise and check again as often as you like.`,`<b>Who would use it:</b> first-time applicants, alongside the Commission's own coaching calls. <b>It is a practice read, not a score.</b> ${esc(D.coach.note)}`)}
    <div class="bench">
      <div class="col"><h2>Your draft narrative</h2>${picker.html}
        <div class="row"><button class="btn" id="coRun" type="button">Check my draft</button><button class="btn ghost" id="coClr" type="button">Clear attempts</button>${HINT}</div><div id="coErr"></div>
        <div id="coHist" class="attempts" aria-live="polite"></div></div>
      <div class="col"><h2>How it reads</h2><div id="coOut" aria-live="polite"></div></div>
    </div>`;
  picker.bind(el);
  const paint = () => {
    const A = st.res && st.res.answers; setStep("coach", A ? 3 : 2);
    if (!A) { $("#coOut").innerHTML = `<div class="empty">Five criteria will appear here with the band your draft reads at and one concrete next step for each. Try the first draft, then the revised one, to see the difference.</div>`; }
    else $("#coOut").innerHTML = C.map(c => {
      const probs = levelProbs(A[c.id], 4), top = argmax(probs), torn = probs[top] < .6;
      const tip = top >= 3 ? "This reads at the top band. Ask someone outside your organization to read it too." : c.next[top];
      return `<div class="crit"><header><h3>${esc(c.label)}</h3><span class="state ${torn ? "unsure" : top >= 2 ? "agree" : "near"}">${torn ? "Between bands" : "Reads at band " + (top + 1) + " of 4"}</span></header>
        ${bandsHtml(c, probs, null, false)}<div class="nextup"><b>${top >= 3 ? "Keep going" : "To reach the next band"}</b>${esc(tip)}</div></div>`;
    }).join("") + `<p class="note"><b>Remember.</b> Jev rewards writing that matches the rubric's wording. A panel also weighs things a model cannot see: your community, your track record, your budget.</p>${rawBlock(st.req, st.res)}`;
    const H = st.history;
    $("#coHist").innerHTML = H.length ? "<b>Your attempts</b><br>" + H.map((h, i) => {
      const prev = H[i - 1]; let d = "";
      if (prev) { const up = h.tops.filter((t, k) => t > prev.tops[k]).length, dn = h.tops.filter((t, k) => t < prev.tops[k]).length; d = ` <span class="up">${up ? up + " up" : ""}</span> <span class="dn">${dn ? dn + " down" : ""}</span>${!up && !dn ? " no change" : ""}`; }
      return `Attempt ${i + 1}: ${h.words} words, bands ${h.tops.map(t => t + 1).join(" ")}${d}`;
    }).join("<br>") : "";
  };
  paint();
  $("#coClr").addEventListener("click", () => { st.history = []; st.res = null; store.save(); paint(); });
  $("#coRun").addEventListener("click", e => withBusy(e.currentTarget, $("#coErr"), async () => {
    const t = docText(D.coach.samples, st); checkLen(t);
    const strict = " Judge only what is written in the draft. General claims with no specific local detail belong in the lowest two bands.";
    const qs = {}; C.forEach(c => qs[c.id] = { type: "score", instructions: c.ask + strict, criteria: c.bands });
    const state = { draft_narrative: t };
    st.res = await jev(state, qs); st.req = { state, questions: qs };
    st.history.push({ words: t.split(/\s+/).length, tops: C.map(c => argmax(levelProbs(st.res.answers[c.id], 4))) }); if (st.history.length > 8) st.history.shift();
    store.save(); paint();
  }));
}

/* ================= 05 COLLECTION ================= */
let IMG = null; // {dataUrl, b64, meta}
function prepImage(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  let s = Math.min(1, 1024 / Math.max(w, h)); if (Math.min(w, h) * s < 280) s = Math.min(280 / Math.min(w, h), 1568 / Math.max(w, h));
  const cw = Math.max(280, Math.round(w * s)), ch = Math.max(280, Math.round(h * s));
  const c = document.createElement("canvas"); c.width = cw; c.height = ch; const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, cw, ch); g.drawImage(img, (cw - Math.round(w * s)) / 2, (ch - Math.round(h * s)) / 2, Math.round(w * s), Math.round(h * s));
  const dataUrl = c.toDataURL("image/jpeg", .86); return { dataUrl, b64: dataUrl.split(",")[1] };
}
const loadImg = (src, cross) => new Promise((res, rej) => { const i = new Image(); if (cross) i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => rej(new Error("Could not load that image.")); i.src = src; });
const LEVELS_ALT = ["The description does not match the image.", "It partly matches but misses the main subject.", "It matches the main subject but lacks useful detail.", "It matches and is specific enough for someone who cannot see the image."];

function renderCollection() {
  const st = S.collection, el = $("#collection"), IM = D.collection.images;
  el.innerHTML = `
    ${roomHead("05","Collection desk",`Tag a photograph, see where the model looked, and check the description.`,`Folklife documentation and a state art collection hold thousands of images that need consistent records and descriptions for people who cannot see them. Jev can propose tags with probabilities, draw a box around what it means, and rate whether a written description matches the picture. A cataloguer confirms or corrects.`,`<b>Who would use it:</b> collections and folklife staff. The photographs here are openly licensed images of South Carolina traditional work from Wikimedia Commons, not works from the State Art Collection.`)}
    <div class="bench">
      <div class="col"><h2>The image</h2>
        <div class="thumbs" role="group" aria-label="Choose an image">${IM.map(m => `<button class="thumb" type="button" data-img="${m.id}" aria-pressed="${st.img === m.id}" title="${esc(m.title)}"><img src="${m.thumb}" alt="${esc(m.title)}"></button>`).join("")}
          <button class="thumb up" type="button" id="clUp">Use your own</button></div>
        <input type="file" id="clFile" accept="image/png,image/jpeg" hidden>
        <div class="frame"><div class="imgbox" id="clBox"><div class="empty" style="line-height:1.5">Loading the photograph.</div></div></div>
        <p class="cap" id="clCap"></p></div>
      <div class="col"><h2>The record</h2>
        <label class="lab" for="clAlt" style="margin-top:0">Image description to check</label>
        <textarea class="field" id="clAlt" maxlength="600" placeholder="Describe the image for someone who cannot see it."></textarea>
        <p class="cap">Some samples start with a thin description on purpose. Improve it and run again.</p>
        <div class="row"><button class="btn" id="clRun" type="button">Tag this image</button><span class="hint">Sends this image and description to Jev. About ten seconds.</span></div><div id="clErr"></div>
        <div id="clOut" aria-live="polite"></div></div>
    </div>`;
  const paintImg = () => {
    if (!IMG) return;
    const A = st.res && st.res.forImg === IMG.id && st.res.answers; let box = "";
    if (A && A.where && A.where.box) { const b = A.where.box, pr = noulP(A.present), cf = clamp01(A.where.confidence);
      box = `<div class="bx${pr < .5 ? " faint" : ""}" style="left:${b.left * 100}%;top:${b.top * 100}%;width:${(b.right - b.left) * 100}%;height:${(b.bottom - b.top) * 100}%"><span>Jev: main handmade object · ${pct(cf)}</span></div>`; }
    $("#clBox").innerHTML = `<img src="${IMG.dataUrl}" alt="${esc(IMG.title)}">${box}`;
    $("#clCap").innerHTML = IMG.page ? `${esc(IMG.title)}. Photo: ${esc(IMG.credit)}, ${esc(IMG.license)}, via <a href="${IMG.page}" target="_blank" rel="noopener">Wikimedia Commons</a>.` : "Your image. It is sent to Jev when you press the button and is not saved here.";
  };
  const paintOut = () => {
    const A = st.res && IMG && st.res.forImg === IMG.id && st.res.answers; setStep("collection", A ? 3 : 2);
    if (!A) { $("#clOut").innerHTML = `<div class="empty">A draft catalogue record will appear here: medium, whether a maker is visible, whether there is writing on the object, a box around the main object, and a rating of the description.</div>`; return; }
    const M = D.collection.mediums, mp = A.medium.probabilities || {}, mk = Object.keys(M).sort((a, b) => (mp[b] || 0) - (mp[a] || 0))[0], mpp = clamp01(mp[mk]);
    const alt = levelProbs(A.alt, 4), at = argmax(alt);
    const yn = (a, yes, no) => { const p = noulP(a); return `${p >= .8 ? yes : p <= .2 ? no : "Unsure, check by eye"}<div class="pbar" role="img" aria-label="${pct(p)} yes"><i style="width:${p * 100}%"></i><span class="mid"></span></div><span class="cap pct">${pct(p)} yes</span>`; };
    $("#clOut").innerHTML = `<div class="catcard"><dl>
      <dt>Medium</dt><dd><b>${esc(mk[0].toUpperCase() + mk.slice(1))}</b>${mpp < .8 ? " (unsure)" : ""}<div class="pbar" role="img" aria-label="${pct(mpp)}"><i style="width:${mpp * 100}%"></i></div><span class="cap pct">${Object.keys(M).map(k => `${k} ${pct(clamp01(mp[k]))}`).join(" · ")}</span></dd>
      <dt>Maker visible</dt><dd>${yn(A.person, "A person is shown making or holding the work", "No person shown")}</dd>
      <dt>Writing on object</dt><dd>${yn(A.writing, "Legible writing or an inscription is visible", "No writing visible")}</dd>
      <dt>Main object</dt><dd>${noulP(A.present) >= .5 ? "Boxed on the image" : "Jev doubts there is one handmade object here; the box is dashed"}. Box confidence ${pct(clamp01(A.where && A.where.confidence))}.</dd>
      <dt>Description</dt><dd><b>${["Does not match", "Partly matches", "Matches, thin on detail", "Matches and is specific"][at]}</b>${alt[at] < .6 ? " (between levels)" : ""}<span class="cap pct" style="display:block">${alt.map((p, i) => `level ${i + 1}: ${pct(p)}`).join(" · ")}</span></dd>
    </dl></div>
    <p class="note"><b>Check the box.</b> Jev always draws one, and it can land on the wrong thing. A tag is a suggestion for a cataloguer. Names, makers, communities, and meaning come from people and records, never from the picture.</p>${rawBlock(st.req, st.res)}`;
  };
  const setImg = async (meta, src, cross) => {
    $("#clErr").innerHTML = "";
    try { const p = prepImage(await loadImg(src, cross)); IMG = { ...p, ...meta }; }
    catch { IMG = null; $("#clBox").innerHTML = `<div class="empty" style="line-height:1.5">Could not load that image. Check your connection or use your own.</div>`; $("#clCap").textContent = ""; return; }
    $$("#collection .thumb[data-img]").forEach(b => b.setAttribute("aria-pressed", b.dataset.img === meta.id));
    paintImg(); paintOut();
  };
  const pick = id => { const m = IM.find(x => x.id === id) || IM[0]; st.img = m.id; if (st.altFor !== m.id) { st.alt = m.alt; st.altFor = m.id; } $("#clAlt").value = st.alt || ""; store.save(); return setImg(m, m.src, true); };
  $$("#collection .thumb[data-img]").forEach(b => b.addEventListener("click", () => pick(b.dataset.img)));
  $("#clAlt").addEventListener("input", e => { st.alt = e.target.value; store.save(); });
  $("#clUp").addEventListener("click", () => $("#clFile").click());
  $("#clFile").addEventListener("change", e => {
    const f = e.target.files[0]; if (!f) return; const url = URL.createObjectURL(f);
    st.alt = ""; st.altFor = "own"; $("#clAlt").value = "";
    setImg({ id: "own" + Date.now(), title: "Your image" }, url, false).then(() => URL.revokeObjectURL(url));
  });
  $("#clRun").addEventListener("click", e => withBusy(e.currentTarget, $("#clErr"), async () => {
    if (!IMG) throw new Error("Choose an image first.");
    const desc = ($("#clAlt").value || "").trim() || "(no description written)";
    const questions = {
      medium: { type: "choice", instructions: "What is the main craft medium shown in `image`?", criteria: D.collection.mediums },
      person: { type: "noul", instructions: "Does `image` show a person making or holding the work?" },
      writing: { type: "noul", instructions: "Is legible writing or an inscription visible on the main object in `image`?" },
      present: { type: "noul", instructions: "Does `image` show a single main handmade object?" },
      where: { type: "box", instructions: "Find the main handmade object in `image`." },
      alt: { type: "score", instructions: "How well does `description` describe `image` for someone who cannot see it?", criteria: LEVELS_ALT }
    };
    const req = { state: { image: "img1", description: desc }, questions, assets: { img1: { type: "image", format: "jpg", data_base64: IMG.b64 } } };
    const j = await jev(req.state, questions, req.assets);
    st.res = { answers: j.answers, model: j.model, usage: j.usage, forImg: IMG.id }; st.req = trimAssets(req); store.save(); paintImg(); paintOut();
  }));
  pick(st.img); paintOut();
}

/* ================= shell ================= */
const ROOMS = { intake: renderIntake, panel: renderPanel, reports: renderReports, coach: renderCoach, collection: renderCollection };
const rendered = new Set();
function route() {
  let id = (location.hash || "#home").slice(1); if (!document.getElementById(id) || !$("#" + id + "[data-page]")) id = "home";
  $$("[data-page]").forEach(p => p.hidden = p.id !== id);
  $$(".rooms a").forEach(a => a.getAttribute("href") === "#" + id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  if (ROOMS[id] && !rendered.has(id)) { ROOMS[id](); rendered.add(id); }
  document.title = (id === "home" ? "" : ({ about: "Disclosure" }[id] || id[0].toUpperCase() + id.slice(1)) + " · ") + "Second Reader";
  window.scrollTo(0, 0);
}
async function checkConn() {
  const b = $("#connBtn"), l = $("#connLbl"); b.className = "conn"; l.textContent = "Checking Jev";
  try { const r = await fetch(endpoint(), { method: "GET" }); if (!r.ok) throw 0; b.classList.add("on"); l.textContent = "Jev connected"; return true; }
  catch { b.classList.add("off"); l.textContent = "Jev offline"; return false; }
}
function init() {
  $("#srcList").innerHTML = ["aoc", "flk", "plan", "reports"].map(k => `<li><a href="${D.sources[k].url}" target="_blank" rel="noopener">${esc(D.sources[k].label)}</a></li>`).join("") + `<li>All retrieved ${esc(D.sources.retrieved)}.</li>`;
  $("#imgCredits").innerHTML = D.collection.images.map(m => `<li><a href="${m.page}" target="_blank" rel="noopener">${esc(m.title)}</a>. ${esc(m.credit)}, ${esc(m.license)}.</li>`).join("");
  renderHero();
  $("#connBtn").addEventListener("click", () => { $("#epIn").value = S.endpoint; $("#connMsg").textContent = ""; $("#connDlg").showModal(); });
  $("#epSave").addEventListener("click", async e => {
    e.preventDefault(); const v = $("#epIn").value.trim();
    if (v && !/^https?:\/\//.test(v)) { $("#connMsg").textContent = "Enter a full address starting with https://"; return; }
    S.endpoint = v.replace(/\/$/, ""); store.save();
    $("#connMsg").textContent = (await checkConn()) ? "Connected." : "No answer from that address.";
  });
  $("#clearBtn").addEventListener("click", () => { try { localStorage.removeItem(KEY); } catch {} $("#clearMsg").textContent = "Cleared. Reloading."; setTimeout(() => location.reload(), 500); });
  window.addEventListener("hashchange", route); route(); checkConn();
}
init();
})();
