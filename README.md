# Visions Leadership CLC website redesign

This folder contains the production-ready static website for Visions Leadership Consultant and Life Coach. It is designed for Netlify hosting, Netlify Forms, and an invite-only Decap CMS events editor.

## Preview locally

From this directory, run:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Primary pages

- `index.html` — Home
- `course.html` — Individual and organization course access
- `travel.html` — Dare to Dream travel services
- `transitional-health.html` — Transitional-health guidance
- `about.html` — Story & Impact
- `testimonials.html` — Client testimonials
- `events.html` — Current event
- `store.html` — Course and publication ordering
- `contact.html` — Contact and live Netlify inquiry form
- `organizations.html` — Compatibility redirect to the organization section on the course page
- `services.html` — Compatibility redirect from the retired service page
- `impact.html` — Compatibility redirect to Story & Impact
- `MONIQUE_FOLLOW_UP.md` — Confirmed details and remaining launch decisions
- `WIX_HANDOFF.md` — Wix draft status, CMS instructions, and launch guardrails
- `LAUNCH_AND_MIGRATION_REPORT.md` — exact migration, costs, domain cutover, events editing, and Wix retirement plan
- `BOOK_CHECKOUT_MIGRATION.md` — audited Wix product data, missing fulfillment details, and the secure-checkout handoff

The forms are configured for Netlify and become live after the first Netlify deployment. The individual course button uses Monique's confirmed Kajabi checkout. Book and journal links prepare an email order request until permanent checkout links are approved.

## Build the public package

Run `node scripts/build_public.mjs`. Only the allowlisted public pages, optimized images, event data, and editor files are written to `dist/`; private source documents and raw working assets are excluded. Netlify runs this command automatically from `netlify.toml`.

## Image workflow

Approved originals remain untouched in `assets/`. Responsive WebP and AVIF derivatives live in `assets/optimized/` and can be regenerated with:

```bash
/Users/jude/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/optimize_assets.py
```

The script also creates safe historical-program crops that exclude obsolete prices, contact information, and meeting credentials.

## Run the smoke test

The test covers the nine-page architecture, compatibility redirects, four target viewport widths, local links and images, navigation, the current event, FAQs, query-based interest selection, forms, and reduced motion.

```bash
python3 /Users/jude/.agents/skills/webapp-testing/scripts/with_server.py \
  --server "python3 -m http.server 4173 --bind 127.0.0.1" \
  --port 4173 \
  --timeout 30 \
  -- /usr/bin/env \
  NODE_PATH=/Users/jude/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/jude/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tests/smoke.js
```
