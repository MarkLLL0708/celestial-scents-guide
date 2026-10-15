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
- Use TanStack file routes, including real leaf routes for every named screen, because the hosting bootstrap requires this router.
- Keep screen-facing services in src/data/api.ts, Cloud operations in authenticated server functions, and browser-only state in its provider; screens must not implement persistence or astrology calculations.
- Keep bilingual UI strings in the typed English/Vietnamese dictionaries and consume them through the language provider.
- Define all visual values in the global token/style system and use shared scent controls; original SVG artwork is the only product imagery.
- Keep the only main element in the root shell and use Radix primitives for keyboard-managed dialogs and city search.
- Chart questions live in one ChartFlow driven by the optional ?step search param, with answers held in the store provider so moving back never loses input.
- Phones use a fixed bottom tab bar instead of a menu overlay; /saved permanently redirects to /you.
- All routes use the same theme from themeFor(), applied to the document and shell during SSR; global font aliases share the navigation family so navigation cannot introduce theme or typography flashes.
- Astrology maths lives in src/lib/astro (placements, aspects, chart, today; tested against fixed reference numbers) and runs only in the browser so birth details never leave the device; screens reach it only through api.ts.
- The current chart is the only thing kept in sessionStorage (one record with its id); the demo id resolves to a real chart computed from a fixed birth.
- Approved library text is resolved in api.ts through privacy-safe keys with placeholder fallback; library keys and validation are shared pure modules, while generation prompts and providers remain server-only.
- Library generation requires server-validated admin roles and a durable single-flight lease with terminal pause reasons, preventing duplicate billing and unauthorized writes.
- Soft-sell limits live in src/lib/sellRules.ts (tested); ProductCard hides itself on no-sell screens, so new screens inherit the rule.
- Shop uses an Outlet-only parent with separate index listing and product leaves, so details render correctly; keep filtered results visible with React transitions while replacement data loads.
- Shared back navigation lives in the root shell, with questionnaire and Ask controls kept in their own headers so every content page has a way back.
- Cloud stores only explicit privacy-safe chart projections; birth inputs and location context remain browser-only, and saved charts use UTC as a neutral display context when reopened.
