/* AirScale AI — front-end behavior
   ------------------------------------------------------------------
   LEAD FORM SETUP (owner: do this once before sharing the site):
   1. Go to https://formsubmit.co and activate YOUR email address.
   2. Set LEAD_ENDPOINT below to:
      "https://formsubmit.co/ajax/your@email.com"
   Until then, submissions open the visitor's email app addressed to
   LEAD_EMAIL_FALLBACK so no lead is ever lost.
*/
const LEAD_ENDPOINT = "";
const LEAD_EMAIL_FALLBACK = "hello@airscale.ai";

document.getElementById("year").textContent = new Date().getFullYear();

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

/* ---------- ROI calculator ---------- */
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

/* ---------- audit form ---------- */
const form = document.getElementById("auditForm");
const note = document.getElementById("formNote");
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
