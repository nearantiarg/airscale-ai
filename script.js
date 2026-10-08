/* agenticrx — front-end behavior
   ------------------------------------------------------------------
   LEAD FORM SETUP (owner: do this once before sharing the site):
   1. Go to https://formsubmit.co and activate YOUR email address.
   2. Set LEAD_ENDPOINT below to:
      "https://formsubmit.co/ajax/your@email.com"
   Until then, submissions open the visitor's email app addressed to
   LEAD_EMAIL_FALLBACK so no lead is ever lost.
*/
const LEAD_ENDPOINT = "";
const LEAD_EMAIL_FALLBACK = "agenticrx@gmail.com";

const _yr = document.getElementById("year");
if (_yr) _yr.textContent = new Date().getFullYear();

/* ---------- mobile nav ---------- */
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => links.classList.toggle("open"));
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".card,.step,.kpi,.ba-col,.phone-frame,.calc-out,.audit-form").forEach(el => {
  el.classList.add("reveal"); io.observe(el);
});

/* ---------- animated counters ---------- */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const dur = 1400, t0 = performance.now();
  function frame(t) {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
}), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach(el => cio.observe(el));

/* ---------- ROI calculator (main page only) ---------- */
if (document.getElementById("rJob")) {
const fmt$ = n => "$" + Math.round(n).toLocaleString("en-US");
const rJob = document.getElementById("rJob"),   oJob = document.getElementById("oJob");
const rMissed = document.getElementById("rMissed"), oMissed = document.getElementById("oMissed");
const rClose = document.getElementById("rClose"), oClose = document.getElementById("oClose");
const rRec = document.getElementById("rRec"),   oRec = document.getElementById("oRec");
const coWeek = document.getElementById("coWeek"), coMonth = document.getElementById("coMonth"),
      coAnnual = document.getElementById("coAnnual"), coRec = document.getElementById("coRec");

function paintRange(r) {
  const pct = (r.value - r.min) / (r.max - r.min) * 100;
  r.style.setProperty("--fill", pct + "%");
}
function calc() {
  const job = +rJob.value, missed = +rMissed.value, close = +rClose.value / 100, rec = +rRec.value / 100;
  oJob.textContent = fmt$(job);
  oMissed.textContent = missed;
  oClose.textContent = rClose.value + "%";
  oRec.textContent = rRec.value + "%";
  [rJob, rMissed, rClose, rRec].forEach(paintRange);
  const week = missed * close * job;
  coWeek.textContent = fmt$(week);
  coMonth.textContent = fmt$(week * 4.33);
  coAnnual.textContent = fmt$(week * 52);
  coRec.textContent = fmt$(week * 52 * rec) + " / yr";
}
[rJob, rMissed, rClose, rRec].forEach(r => r.addEventListener("input", calc));
calc();
} // end ROI calculator guard

/* ---------- audit form (pages that have it) ---------- */
const form = document.getElementById("auditForm");
const note = document.getElementById("formNote");
if (form) {
form.addEventListener("submit", async ev => {
  ev.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = Object.fromEntries(new FormData(form).entries());
  note.textContent = "Sending…"; note.classList.remove("ok");

  if (LEAD_ENDPOINT) {
    try {
      const r = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ ...data, _subject: "New audit request: " + data.company })
      });
      if (!r.ok) throw new Error("send failed");
      done("Thanks " + data.name.split(" ")[0] + "! Your audit request is in — we reply within one business day.");
      form.reset(); return;
    } catch (e) { /* fall through to mailto */ }
  }
  const subject = encodeURIComponent("Free AI audit request — " + data.company);
  const body = encodeURIComponent(
    "Name: " + data.name + "\nCompany: " + data.company +
    "\nWebsite: " + data.website + "\nPhone: " + data.phone);
  window.location.href = "mailto:" + LEAD_EMAIL_FALLBACK + "?subject=" + subject + "&body=" + body;
  done("Opening your email app — hit send and we'll reply within one business day.");

  function done(msg) { note.textContent = msg; note.classList.add("ok"); }
});
} // end audit form guard

/* ================================================================
   LIVE DEMO CHAT — scripted "Ava" AI receptionist demo.
   The visitor plays the homeowner; the bot plays the AI on the
   contractor's site. Milestones fill the receipt panel live.
   ================================================================ */
(function () {
  const chat = document.getElementById("demoChat");
  const quick = document.getElementById("demoQuick");
  const input = document.getElementById("demoInput");
  const send = document.getElementById("demoSend");
  const receipt = document.getElementById("demoReceipt");
  if (!chat) return;

  const CFG = Object.assign({
    company: "Johnson Heating & Air",
    botName: "Ava"
  }, (typeof window !== "undefined" && window.DEMO_CONFIG) || {});
  let dState = "start";
  let dSlot = "Wed 9–11 AM";
  const log = [];
  const R = html => { log.push(html); receipt.innerHTML = log.map(i => "<li>" + i + "</li>").join(""); };

  const scroll = () => { chat.scrollTop = chat.scrollHeight; };
  const msg = (html, who) => {
    const d = document.createElement("div");
    d.className = "bubble " + who; d.innerHTML = html;
    chat.appendChild(d); scroll();
  };
  const typing = cb => {
    const t = document.createElement("div");
    t.className = "bubble bot typing"; t.innerHTML = "<span></span><span></span><span></span>";
    chat.appendChild(t); scroll();
    setTimeout(() => { t.remove(); cb(); }, 900 + Math.random() * 600);
  };
  const bot = (html, replies) => typing(() => { msg(html, "bot"); chips(replies || []); });
  const chips = replies => {
    quick.innerHTML = "";
    replies.forEach(r => {
      const b = document.createElement("button");
      b.textContent = r;
      b.onclick = () => userSay(r);
      quick.appendChild(b);
    });
  };
  const userSay = text => {
    if (!text.trim()) return;
    msg(text.replace(/</g, "&lt;"), "me");
    quick.innerHTML = "";
    setTimeout(() => respond(text), 350);
  };

  const MENU = ["❄️ AC not cooling", "🔥 Heater issue", "🧰 Schedule tune-up", "💲 Pricing question"];

  function respond(raw) {
    const t = raw.toLowerCase();

    if (dState === "await_name") {
      const name = raw.trim().split(" ")[0].replace(/[^a-z']/gi, "") || "friend";
      const cap = name.charAt(0).toUpperCase() + name.slice(1);
      R("✓ <strong>Job booked: " + dSlot + "</strong> — " + cap);
      R("✓ Confirmation text sent to customer");
      R("✓ Owner got a 1-line summary — not a 2 AM wake-up");
      bot("You're booked, " + cap + "! ✅ <strong>" + dSlot + "</strong> with our senior tech. I just texted you a confirmation — he'll call when he's on the way. Anything else?", ["No thanks", "💲 Pricing question"]);
      dState = "booked";
      return;
    }
    if (dState === "await_phone") {
      R("✓ Callback queued — owner calls within 15 min");
      bot("Got it — we'll call <strong>" + raw.trim().replace(/</g, "&lt;") + "</strong> within 15 minutes. Anything else I can do?", ["No thanks"]);
      dState = "booked";
      return;
    }

    // global intents
    if (/human|real person|someone real|agent|owner/.test(t)) return dHuman();
    if (/call me|ring me|phone me/.test(t)) return dCallback();
    if (/price|cost|how much|quote|estimate/.test(t)) return dPricing();
    if (/thank|no thanks|bye|done/.test(t) && dState !== "start") {
      bot("Anytime! We're here 24/7 — literally. 👋", ["Back to start"]);
      dState = "menu"; return;
    }
    if (/back to start|start over|menu/.test(t)) {
      bot("What can I help with?", MENU); dState = "menu"; return;
    }

    switch (dState) {
      case "start":
      case "menu":
        if (/ac\b|cool|air cond/.test(t)) return dAC();
        if (/heat|furnace|warm house|cold/.test(t)) return dHeat();
        if (/tune|maintenance|checkup/.test(t)) return dTuneup();
        bot("I can help with that — tap an option below and I'll take it from there. 👇", MENU);
        return;
      case "ac_q":
        if (/warm/.test(t)) return dOfferSlot("Warm air — that's usually a quick fix (often refrigerant or a capacitor). ");
        return dOfferSlot("Not turning on at all — I'll flag it priority. ");
      case "book_offer":
        if (/yes|book|sure|ok|lock/.test(t)) return dAskName();
        return dAltTime();
      case "alt_offer":
        if (/work|yes|thursday|thu/.test(t)) { dSlot = "Thu 1–3 PM"; return dAskName(); }
        return dCallback();
      case "tuneup_offer":
        if (/yes|book|sure|ok/.test(t)) { dSlot = "Wed 9–11 AM"; return dAskName(); }
        return dPricing();
      case "pricing":
        if (/book|tune/.test(t)) { dSlot = "Wed 9–11 AM"; return dAskName(); }
        return dHuman();
      default:
        bot("Tap an option below and I'll take it from there. 👇", MENU);
        dState = "menu";
    }
  }

  function dAC() {
    dState = "ac_q";
    bot("Sorry to hear that — quick question so I send the right help: is it <strong>blowing warm air</strong>, or <strong>not turning on</strong> at all?", ["Blowing warm air", "Won't turn on"]);
  }
  function dHeat() {
    dState = "book_offer"; dSlot = "Wed 9–11 AM";
    bot("No heat in this weather is miserable — I'll get you <strong>priority scheduling</strong>. I have <strong>Wed 9–11 AM</strong> with our senior tech. Want me to lock it in?", ["Yes, book it", "Need a different time"]);
  }
  function dOfferSlot(prefix) {
    dState = "book_offer"; dSlot = "Wed 9–11 AM";
    bot(prefix + "I have <strong>Wed 9–11 AM</strong> open with our senior tech. Shall I lock it in?", ["Yes, book it", "Need a different time"]);
  }
  function dAltTime() {
    dState = "alt_offer";
    bot("No problem — how about <strong>Thu 1–3 PM</strong> instead?", ["That works", "Just call me"]);
  }
  function dAskName() {
    dState = "await_name";
    bot("Perfect — what <strong>name</strong> should I put on the booking?");
  }
  function dTuneup() {
    dState = "tuneup_offer";
    bot("Smart move — tune-ups are <strong>$89 this month</strong> (normally $129). Want me to book one for <strong>Wed 9–11 AM</strong>?", ["Yes, book it", "Just the pricing"]);
  }
  function dPricing() {
    dState = "pricing";
    R("✓ Pricing answered instantly — no “we'll call you back”");
    bot("Straight pricing, no games: tune-up <strong>$89</strong> · service call <strong>$129</strong> (waived with any repair) · <strong>free estimates</strong> on full installs. Want me to book something?", ["Book tune-up", "Talk to a human"]);
  }
  function dHuman() {
    R("✓ Escalated to owner — per your rules");
    bot("Of course — connecting you now… <em>(in the live version this rings the owner directly)</em> 👋", ["Back to start"]);
    dState = "menu";
  }
  function dCallback() {
    dState = "await_phone";
    bot("Done — I'll have the owner call you <strong>within 15 minutes</strong>. What's the best number?");
  }

  send.onclick = () => { const v = input.value; input.value = ""; userSay(v); input.focus(); };
  input.addEventListener("keydown", e => { if (e.key === "Enter") send.onclick(); });

  // kick off
  setTimeout(() => {
    bot("Hi! 👋 Thanks for reaching <strong>" + CFG.company + "</strong> — I'm " + CFG.botName + ", the AI assistant. What can I help with tonight?", MENU);
    dState = "menu";
    R("✓ <strong>Answered in 8 seconds</strong> — 11:04 PM, no human needed");
  }, 1200);
})();
