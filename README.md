# AirScale AI — pitch site for HVAC contractors

Static site (HTML/CSS/JS, no build step). Deploys to **GitHub Pages**.

## Preview locally
Open `index.html` in any browser, or run `python3 -m http.server` in this folder.

## Deploy to GitHub Pages
```bash
# first time: create the repo (public) and push
gh repo create airscale-ai --public --source=. --push
# then enable Pages: repo Settings → Pages → Deploy from branch → main / root
```
The site will live at `https://<username>.github.io/airscale-ai/`.

## Before sharing
1. **Lead form** — see the setup comment at the top of `script.js`. Activate your
   email at formsubmit.co and set `LEAD_ENDPOINT`. Until then, the form falls
   back to opening the visitor's email app.
2. **Phone number** — add your real call/text number to the hero + audit section.
3. **Brand** — "AirScale AI" is a placeholder; rename in `index.html` (title,
   nav, footer) if you prefer something else.

## Files
- `index.html` — all copy/sections
- `styles.css` — theme (navy + orange)
- `script.js` — nav, reveal animations, lead form
