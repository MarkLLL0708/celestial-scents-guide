<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Natal Notes architecture
- Keep reading-voice experiments isolated in hidden dev routes and authenticated admin-only test services; the staged voice-bank SQL is unapplied until approval, so tests never alter live reading flows.
- Use TanStack file routes, including real leaf routes for every named screen, because the hosting bootstrap requires this router.
- Keep screen-facing services in src/data/api.ts, Cloud operations in authenticated server functions, and browser-only state in its provider; screens must not implement persistence or astrology calculations.
- Keep bilingual UI strings in the typed English/Vietnamese dictionaries and consume them through the language provider.
- Define all visual values in the global token/style system and use shared scent controls; original SVG artwork is the only product imagery.
- Keep the only main element in the root shell and use Radix primitives for keyboard-managed dialogs and city search.
- Chart questions live in one ChartFlow driven by the optional ?step search param, with answers held in the store provider so moving back never loses input.
- Phones use a fixed bottom tab bar instead of a menu overlay; /saved permanently redirects to /you.
- All routes use the same theme from themeFor(), applied to the document and shell during SSR; global font aliases share the navigation family so navigation cannot introduce theme or typography flashes.
- Astrology maths lives in src/lib/astro (placements, aspects, chart, today; tested against fixed reference numbers) and runs only in the browser so birth details never leave the device; screens reach it only through api.ts.
- sessionStorage keeps only the current chart record, including optional browser-only birth inputs for editing; Cloud projections omit those inputs, and the demo id resolves to a real fixed-birth chart.
- Approved library text is resolved in api.ts through privacy-safe keys with placeholder fallback; library keys and validation are shared pure modules, while generation prompts and providers remain server-only.
- Library generation requires server-validated admin roles and a durable single-flight lease with terminal pause reasons, preventing duplicate billing and unauthorized writes.
- Soft-sell limits live in src/lib/sellRules.ts (tested); ProductCard hides itself on no-sell screens; the post-reading 3–5 perfume capsule comes from buildCapsule via api.getCapsule and the shared ScentCapsule, so every reading surface shows the same picks.
- Shop uses an Outlet-only parent with separate index listing and product leaves, so details render correctly; keep filtered results visible with React transitions while replacement data loads.
- Shared back navigation lives in the root shell, with questionnaire and Ask controls kept in their own headers so every content page has a way back.
- Cloud stores only explicit privacy-safe chart projections; birth inputs and location context remain browser-only, and saved charts use UTC as a neutral display context when reopened.
- Shared React contexts are created with stableContext() so they keep the same identity across hot reloads; otherwise providers and consumers drift apart and the preview blanks.
- Catalogue names and bilingual story hooks have a bundled source with Cloud overrides; incomplete commercial metadata disables purchase and does not influence price, style or intensity scoring, so unknown facts never become fabricated offers.
- Outer-planet chart placements are computed separately from the established seven-body daily-transit model and remain optional on saved charts, preserving existing references and old records.
- Saved scent capsules and ritual step progress use authenticated owner-scoped Cloud services; raw birth edits stay in the browser and only calculated charts may be saved.
- Placement, daily and chapter interpretations are pure browser-safe astrology services reached through api.ts, keeping screens free of astrology logic.
- Ask routes suggested questions to approved library answers first, then live AI with privacy-safe context (signs, transit, ritual, perfume) through a server function with per-visitor hashed rate limits logged in ask_usage; failures fall back to bundled lines so Ask never breaks.
- Short readings (truth/cost/scent) come only from POST /api/public/write-reading (port of the owner-supplied write-reading function, prompt in prompts/reading.ts), which picks the perfume by smell_words in code, validates, retries and caches in the readings table; the frontend only displays them.
- astronomy-engine loads only through the lazy src/lib/astro/engine.ts import in api.ts, and the sample chart is a precomputed JSON checked by a test, so non-chart pages never download or run star maths.
