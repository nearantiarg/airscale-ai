/* AirScale AI — front-end behavior
   ------------------------------------------------------------------
   LEAD FORM SETUP (owner: do this once before sharing the site):
   1. Go to https://formsubmit.co and activate YOUR email address.
   2. Set LEAD_ENDPOINT below to:
      "https://formsubmit.co/ajax/your@email.com"
   Until then, submissions open the visitor's email app addressed to
   LEAD_EMAIL_FALLBACK so no lead is ever lost.
*/
const LEAD_ENDPOINT = "";                       // e.g. "https://formsubmit.co/ajax/you@domain.com"
const LEAD_EMAIL_FALLBACK = "hello@airscale.ai"; // shown only if no endpoint set

document.getElementById("year").textContent = new Date().getFullYear();

// mobile nav
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => links.classList.toggle("open"));
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

// scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".card,.step,.stat,.audit-form").forEach(el => {
  el.classList.add("reveal"); io.observe(el);
});

// audit form
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
        body: JSON.stringify({ ...data, _subject: `New audit request: ${data.company}` })
      });
      if (!r.ok) throw new Error("send failed");
      done("Thanks " + data.name.split(" ")[0] + "! Your audit request is in — we reply within one business day.");
      form.reset(); return;
    } catch (e) { /* fall through to mailto */ }
  }
  const subject = encodeURIComponent(`Free AI audit request — ${data.company}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nCompany: ${data.company}\nWebsite: ${data.website}\nPhone: ${data.phone}`);
  window.location.href = `mailto:${LEAD_EMAIL_FALLBACK}?subject=${subject}&body=${body}`;
  done("Opening your email app — hit send and we'll reply within one business day.");

  function done(msg) { note.textContent = msg; note.classList.add("ok"); }
});
