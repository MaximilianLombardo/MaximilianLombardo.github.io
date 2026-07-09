# Project guidance — maximilianlombardo.com

Personal website. Astro static site, dark-terminal aesthetic, live WebGL shader
hero. Deployed to GitHub Pages via GitHub Actions on push to `master`.

## Architecture

- **Astro**, static output. Text ships as static HTML; only the hero shader
  hydrates as a React island (`client:visible`).
- **Hero shader**: `src/components/TopoHero.tsx` runs a vendored GLSL fragment
  shader (`src/shaders/topo.frag`) via react-three-fiber on a fullscreen quad.
  Palette is applied through uniforms — `uLineColor=#F7F2E8`,
  `uMajorColor=#FF1E2D` (the red accent), `uBgLow=uBgHigh=#000`. The island
  probes for WebGL before mounting, respects `prefers-reduced-motion`, and pauses
  when offscreen or the tab is hidden. `public/posters/topo-hero.webp` is the
  instant poster fallback; the island fades in over it.
- **Design tokens**: `src/styles/tokens.css` — palette
  (`--bg --ww --t2 --t3 --line --line-faint --red --scrim`), self-hosted Inter +
  JetBrains Mono. Use tokens, never hardcoded hex.
- **Pages**: `index.astro` (home one-pager), `work/{biohub,kallyope,ibm,ventures}.astro`
  (detailed writeups), `lab.astro` (a "coming soon" placeholder for a future
  generative-art gallery — the Dither band links to it).

## Conventions & gotchas

- **Deploy is automatic**: push to `master` → Actions builds and deploys. Never
  hand-edit `dist/`. Custom domain comes from `public/CNAME`
  (`www.maximilianlombardo.com`) — do not remove it.
- **Email must never be a literal in built HTML.** It is assembled at runtime
  from split parts in `src/lib/email.ts`; `npm test` enforces this. Reuse
  `assembleEmail()` rather than duplicating the split logic.
- **Mobile breakpoint is 600px**: nav becomes a hamburger menu, the hero centers,
  and contact rows stack. Keep these in sync when touching the nav/hero/contact.
- **No em dashes in copy** — the owner finds they read "LLM-y." Use colons,
  commas, or middots.
- **Shaders are vendored** from the sibling `algo-art` project; the poster images
  are pre-rendered stills. To change a shader or re-render a poster, do it in
  `algo-art` and re-copy — don't try to author shaders here from scratch.
- Follow the owner's global rules: work on a branch (not `master`) for changes,
  and no AI attribution in commit messages.

## Commands

`npm run dev` · `npm run build` · `npm run preview` · `npm test`

## History

Redesign spec and implementation plan live in `docs/superpowers/specs/` and
`docs/superpowers/plans/`.
