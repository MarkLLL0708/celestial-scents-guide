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
- Keep all mock services in src/data/api.ts and browser-only state in its provider; screens must not implement persistence or real astrology.
- Keep bilingual UI strings in the typed English/Vietnamese dictionaries and consume them through the language provider.
- Define all visual values in the global token/style system and use shared scent controls; original SVG artwork is the only product imagery.
- Keep the only main element in the root shell and use Radix primitives for keyboard-managed dialogs and city search.
- Chart questions live in one ChartFlow driven by the optional ?step search param, with answers held in the store provider so moving back never loses input.
- Phones use a fixed bottom tab bar instead of a menu overlay; /saved permanently redirects to /you.
- All routes use the same theme from themeFor(), applied to the document and shell during SSR; global font aliases share the navigation family so navigation cannot introduce theme or typography flashes.
- Mock astrology copy (readings, today, ask answers, rituals) lives in src/data/astro-mock.ts and reaches screens only through api.ts, so a real engine can replace one file.
- Soft-sell limits live in src/lib/sellRules.ts (tested); ProductCard hides itself on no-sell screens, so new screens inherit the rule.
- Shop listings use an index route, not a parent screen, so product leaf routes render their own content; keep filtered results visible with React transitions while replacement data loads.
