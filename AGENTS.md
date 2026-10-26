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

## Project rules
- All UI data goes through functions in src/services/api.ts; mock data lives in src/mockData.ts (marketplace data in src/marketplaceData.ts, re-exported) so real APIs can replace bodies later without touching pages.
- The global top nav lives in src/components/market/AppNav.tsx and is rendered in __root; the workspace page sizes itself to the viewport minus that bar.
