# Personal Site Redesign — Design Spec

**Date:** 2026-07-09
**Repo:** `MaximilianLombardo.github.io` (served at `www.maximilianlombardo.com`)
**Branch:** `feature/site-redesign` (nothing merges to `master` until built, verified, and approved)

## Goal

Replace the stock "minimal" Jekyll theme (which reads academic) with a distinctive,
dark-terminal, technical-minimal one-pager that showcases Maximilian's work and
his creative-technologist side via a live generative-art hero — while preserving
the comprehensive existing copy on dedicated subpages. Must stay fast, accessible,
and hosted on GitHub Pages.

## Non-goals

- No backend, CMS, or database (static hosting only).
- No full `algo-art` gallery yet (the design leaves a hook for it later).
- No change to the domain, email address, or resume content.

## Architecture

- **Framework:** Astro (static output), deployed to GitHub Pages via GitHub Actions
  (official Astro Pages action). Source on `master`; built `dist/` published.
  Actions is free on public repos.
- **Interactivity:** React islands via `@astrojs/react` + `@react-three/fiber` for
  the shader hero and dither accent. Hydrated with `client:visible`; text ships as
  static HTML/CSS.
- **Shaders:** vendored (copied) from `dev/algo-art` into `src/shaders/`:
  `topo.frag`, `dither.frag`, `_lib/common.glsl`, `_lib/fullscreen.vert`, plus a
  thin R3F wrapper. Self-contained; no submodule. (Tradeoff: future shader edits in
  algo-art require a re-copy — acceptable at this cadence.)
- **Domain/assets preserved:** `public/CNAME` (verbatim), `public/resume.pdf`,
  new `public/favicon` + `public/og-image`.

### Proposed structure
```
src/
  pages/
    index.astro              # main one-pager
    work/biohub.astro        # detailed subpages (full existing copy)
    work/kallyope.astro
    work/ibm.astro
    work/ventures.astro
  components/
    Nav.astro, Hero.astro, Section.astro, Work.astro, Publications.astro,
    DitherBand.astro, Contact.astro, Footer.astro
    TopoHero.tsx             # R3F island (topo shader)
    DitherAccent.tsx         # optional R3F island (v2 — v1 uses a static poster)
  shaders/                   # vendored from algo-art
  styles/tokens.css          # vendored/adapted biokit tokens
public/  CNAME, resume.pdf, favicon.*, og-image.*, posters/
```

## Design system (adapted from biokit, tuned minimal)

**Palette (core):** bg `#000`, warm-white `#F7F2E8` (headings/key text),
`#C4BFB3` (body), `#8A8680` (labels/meta), hairline `#1F1F1F`, faint grid
`rgba(247,242,232,.045)`.
**Accent (sparing):** signal red `#FF1E2D` — links, the red "o", hero highlight,
rare emphasis. Blue `#59C6FF` reserved/likely unused. No other terminal colors.

**Type:** Inter (variable) — hero display **200 (ExtraLight)**, section titles
300, body 400; JetBrains Mono for small uppercase labels/metadata (`//` tags,
section numbers). Fonts self-hosted or Google Fonts with preconnect.

## Page structure — main one-pager

- **Sticky top nav** (blurred): brand (name w/ red "o") left; mono links
  Work / Publications / Contact / Resume right.
- **Hero:** full-viewport live Topo shader (warm-white lines on black, red woven
  in), name in ExtraLight, mono tagline, red tick accent, scroll cue.
- **`00 · About`:** tightened 2-sentence intro + skills as mono tags (replaces the
  current multi-paragraph essay).
- **`01 · Work`:** org/role rows (Biohub·CZI / Kallyope / IBM·CAS / Ventures),
  current role marked red. Each row links to its detailed subpage ("read more →").
- **`02 · Publications`:** tight linked list, mono year tags (6 papers).
- **Dither band:** full-width texture divider, "Creative Technology" label,
  recolored **black/white/grey with restrained red highlights** (not overwhelming).
  Doubles as a future "Lab"/gallery hook.
- **`03 · Contact`:** JS-obfuscated email (privacy work preserved), GitHub,
  LinkedIn, resume download; footer "New York, NY" in mono.

## Content preservation — subpages

The comprehensive copy currently in `index.html` is **not discarded**; it is moved
into role-level subpages, each linked from the main Work rows:
- `/work/biohub` — CELLxGENE, Virtual Cells/foundation models, VariantFormer GTM,
  automated annotation, strategic/biosafety work.
- `/work/kallyope` — full single-cell / gut-brain axis writeup.
- `/work/ibm` — multi-omics research detail.
- `/work/ventures` — BioKit Labs, Kambrian Technologies.

Subpages use the same design system, a simple back-to-home nav, and can be split
into finer per-project pages later. (Granularity is role-level for v1 — adjustable.)

## Shader behavior, fallbacks, performance

- **Recolor in-shader** via palette uniforms (warm-white + red on black).
- **Poster fallback:** high-res render (~2560px + a smaller responsive size),
  generated from algo-art's capture pipeline — NOT the 640px thumbnail. Shown
  before hydration and as the static fallback. (Directly addresses the hero
  resolution concern.)
- **`prefers-reduced-motion`:** freeze to poster, no animation.
- **No WebGL / unsupported:** poster, no error.
- **Pause when offscreen or tab hidden** (IntersectionObserver + visibilitychange).
- **DPR cap ≈1.5**, modest frame cap. **Dither v1 = a static recolored poster**
  (zero runtime cost, honors "not overwhelming"); may become a low-FPS live canvas
  in v2.

## Accessibility & SEO

- Shaders decorative (`aria-hidden`); text contrast AA (red for accents/large only,
  never body copy).
- Keyboard/focus unaffected; nav links are real anchors.
- Add `<title>`, meta description, Open Graph + Twitter Card tags, favicon,
  `og-image` (static hero render) — closes the earlier social-preview/favicon gaps.

## Deployment

- `feature/site-redesign` branch throughout. Live site (served from `master`) stays
  untouched until merge.
- GitHub Actions: build on the feature branch (verify only), deploy on `master`.
- First merge switches Pages from raw-file serving to Actions-built — done
  deliberately with the revert path ready. `CNAME` in `public/` keeps the domain.

## Verification before merge

1. `astro build` succeeds; local `astro preview` looks right.
2. Email still non-scrapable in built HTML (re-run the earlier scraper-regex check).
3. `CNAME` present in `dist/`; resume link resolves.
4. Reduced-motion and no-WebGL both show the hi-res poster (no errors).
5. Lighthouse pass on performance + accessibility.
6. Mobile render verified (hero poster/quality, nav, tap targets).
7. Subpage links resolve; back-nav works.

## Decisions & defaults (adjustable during build)

- **Subpage granularity:** role-level for v1 (Biohub / Kallyope / IBM / Ventures);
  can split into per-project pages later.
- **Dither:** static recolored poster for v1; optional live canvas in v2.
- **Fonts:** self-hosted Inter + JetBrains Mono (performance + no third-party
  request), with system-font fallback stack.
