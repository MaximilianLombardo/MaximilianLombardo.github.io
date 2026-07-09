# Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the personal site as a dark-terminal Astro one-pager with a live Topo shader hero, a static Dither texture accent, and role-level work subpages preserving the existing detailed copy — deployed to GitHub Pages via Actions.

**Architecture:** Astro static output. Text ships as static HTML/CSS. The hero is a React + react-three-fiber island (`client:visible`) running a vendored GLSL shader, with a high-res poster fallback. Deploy via GitHub Actions to Pages; `master` stays live until the branch is merged.

**Tech Stack:** Astro 5, `@astrojs/react`, React 19, `@react-three/fiber` + `three`, `vite-plugin-glsl`, self-hosted Inter + JetBrains Mono, GitHub Actions.

## Global Constraints

- Branch: `feature/site-redesign`. Never commit to `master` in this plan.
- Node ≥ 20 (Astro 5 + Vite requirement).
- Palette (exact): bg `#000000`, warm-white `#F7F2E8`, body `#C4BFB3`, meta `#8A8680`, hairline `#1F1F1F`, grid `rgba(247,242,232,.045)`, accent red `#FF1E2D`.
- Type: Inter (hero 200, titles 300, body 400); JetBrains Mono for uppercase labels/section numbers.
- Red is the ONLY accent and used sparingly; never for body copy (contrast).
- Email must never appear as a contiguous string in built HTML (JS-assembled).
- `public/CNAME` must contain exactly `www.maximilianlombardo.com` and land in `dist/`.
- Shaders decorative → `aria-hidden`; respect `prefers-reduced-motion`; pause offscreen/hidden; DPR cap ≤ 1.5.
- Commit messages: no AI attribution / co-authorship lines (per repo owner's global rule).

## File Structure

```
astro.config.mjs            # astro + react + glsl integrations, site/base
package.json
src/
  styles/tokens.css         # palette, type, grid — vendored/adapted from biokit
  layouts/Base.astro        # <head> meta/OG/favicon, fonts, global styles, <slot/>
  lib/email.ts              # email assembly (obfuscation) — testable
  lib/email.test.ts
  shaders/topo.frag         # vendored from algo-art
  shaders/_lib/common.glsl
  shaders/_lib/fullscreen.vert
  components/
    Nav.astro
    Hero.astro              # poster + TopoHero island + copy overlay
    TopoHero.tsx            # R3F island
    Section.astro           # numbered section wrapper
    Work.astro
    Publications.astro
    DitherBand.astro        # static recolored poster + label
    Contact.astro           # uses lib/email.ts at runtime
    Footer.astro
  pages/
    index.astro
    work/biohub.astro
    work/kallyope.astro
    work/ibm.astro
    work/ventures.astro
public/
  CNAME, resume.pdf, favicon.svg, og-image.png
  posters/topo-hero.webp    # ~2560px hi-res render
  fonts/*.woff2
.github/workflows/deploy.yml
```

Source of preserved copy: the current `index.html` on `master` (read it via `git show master:index.html`). Its section text is the canonical content for the subpages.

---

### Task 1: Scaffold Astro + integrations

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/env.d.ts`
- Note: keep existing `CNAME`, `resume.pdf` (will move to `public/` in Task 7)

**Interfaces:**
- Produces: a runnable Astro dev server; `src/pages/index.astro` as the page entry.

- [ ] **Step 1: Initialize package + install deps**

```bash
cd /Users/maks/Documents/dev/MaximilianLombardo.github.io
npm init -y
npm install astro@^5 @astrojs/react@^4 react@^19 react-dom@^19 three @react-three/fiber
npm install -D vite-plugin-glsl @types/three @types/react @types/react-dom typescript
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  site: 'https://www.maximilianlombardo.com',
  base: '/',
  integrations: [react()],
  vite: { plugins: [glsl()] },
})
```

- [ ] **Step 3: Minimal `src/pages/index.astro`**

```astro
---
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Maximilian Lombardo</title></head>
  <body style="background:#000;color:#F7F2E8">Redesign scaffold OK</body>
</html>
```

- [ ] **Step 4: Add scripts to `package.json`**

Add: `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`, `"test": "vitest run"`.

- [ ] **Step 5: Verify dev server + build**

Run: `npm run dev` → open localhost, confirm the scaffold text on black. Then `npm run build`.
Expected: build writes `dist/index.html` with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Scaffold Astro project with React and GLSL support"
```

---

### Task 2: Design tokens, fonts, and Base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/layouts/Base.astro`, `public/fonts/*.woff2`
- Modify: `src/pages/index.astro` (use Base)

**Interfaces:**
- Produces: `Base.astro` accepting props `{ title, description, ogImage? }` and a `<slot/>`; CSS custom properties `--bg, --ww, --t2, --t3, --line, --grid, --red` and font families available globally.

- [ ] **Step 1: Fetch self-hosted fonts** — download Inter (200,300,400,500,600) and JetBrains Mono (400,600) woff2 into `public/fonts/` (from the Google Webfonts Helper or fontsource). List the exact files placed.

- [ ] **Step 2: Write `src/styles/tokens.css`** — `:root` custom properties for the exact palette values in Global Constraints; `@font-face` for the woff2 files; base element styles (body bg/grid/typography, `.mono` helper, heading weights, link color `--red`). Include the 64px background grid using `--grid`.

- [ ] **Step 3: Write `src/layouts/Base.astro`**

```astro
---
const { title, description = 'Product · Biological AI & Foundation Models · Creative Technologist', ogImage = '/og-image.png' } = Astro.props
import '../styles/tokens.css'
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="canonical" href={Astro.site} />
  </head>
  <body><slot /></body>
</html>
```

- [ ] **Step 4: Point index.astro at Base**, render a placeholder `<h1>`. Run `npm run build`; confirm meta tags present in `dist/index.html`.

- [ ] **Step 5: Commit** — `git commit -am "Add design tokens, self-hosted fonts, and Base layout"`

---

### Task 3: Email obfuscation utility (TDD)

**Files:**
- Create: `src/lib/email.ts`, `src/lib/email.test.ts`
- Install: `npm i -D vitest`

**Interfaces:**
- Produces: `assembleEmail(): string` returning `maximilian.g.lombardo@gmail.com` from split parts (no contiguous literal in source), and `emailParts` used by the client script.

- [ ] **Step 1: Failing test** `src/lib/email.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { assembleEmail } from './email'
import { readFileSync } from 'node:fs'

describe('email', () => {
  it('assembles the real address', () => {
    expect(assembleEmail()).toBe('maximilian.g.lombardo@gmail.com')
  })
  it('has no contiguous literal in its own source', () => {
    const src = readFileSync(new URL('./email.ts', import.meta.url), 'utf8')
    expect(src.includes('maximilian.g.lombardo@gmail.com')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test → FAIL** (`npx vitest run src/lib/email.test.ts`).

- [ ] **Step 3: Implement `src/lib/email.ts`**

```ts
const user = ['maximilian', 'g', 'lombardo'].join('.')
const domain = ['gmail', 'com'].join('.')
export function assembleEmail(): string {
  return `${user}@${domain}`
}
```

- [ ] **Step 4: Run test → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "Add tested email obfuscation utility"`

---

### Task 4: Vendor shaders + generate hi-res Topo poster

**Files:**
- Create: `src/shaders/topo.frag`, `src/shaders/_lib/common.glsl`, `src/shaders/_lib/fullscreen.vert`, `public/posters/topo-hero.webp`

**Interfaces:**
- Produces: a compilable fullscreen fragment shader exporting the topo effect, parameterized by uniforms `uTime`, `uResolution`, and palette uniforms `uInk` (vec3), `uLine` (vec3), `uAccent` (vec3); a hi-res poster image.

- [ ] **Step 1: Copy shader sources** from `/Users/maks/Documents/dev/algo-art/src/experiments/topo-contours/topo.frag` and `/Users/maks/Documents/dev/algo-art/src/experiments/_lib/{common.glsl,fullscreen.vert}` into `src/shaders/`. Read `topo.frag` and note its existing uniform names.

- [ ] **Step 2: Add palette uniforms** — edit the copied `topo.frag` so final color mixes toward `uLine` on contour lines over `uInk` background, with a subset of lines/high band tinted `uAccent`. Keep a `uReducedRed` scalar (0..1) to dial red intensity. Show the exact modified color-assembly block.

- [ ] **Step 3: Generate the poster** — run algo-art to capture Topo at high res:

```bash
cd /Users/maks/Documents/dev/algo-art && npm run dev -- --port 5199 &
# navigate a headless browser to the topo experiment route at 2560x1440,
# apply the redesign palette via the shader defaults, screenshot to webp
```

Use Playwright to load the topo route, set viewport 2560×1440, wait 2s for the shader to develop, screenshot, and `cwebp` to `public/posters/topo-hero.webp` (target < 250 KB). Record the exact route URL used.

- [ ] **Step 4: Verify** the shader imports compile in a throwaway Vite build (`import frag from './shaders/topo.frag'` logs a string) and the poster opens and is sharp at full size.

- [ ] **Step 5: Commit** — `git commit -am "Vendor Topo shader with palette uniforms and hi-res poster"`

---

### Task 5: TopoHero React island

**Files:**
- Create: `src/components/TopoHero.tsx`

**Interfaces:**
- Consumes: `src/shaders/topo.frag`, `_lib/fullscreen.vert`.
- Produces: default-export React component `TopoHero` rendering a full-size `<canvas>` (position absolute, inset 0). Self-manages: reduced-motion freeze, offscreen/hidden pause, DPR cap. No props required.

- [ ] **Step 1: Implement the island**

```tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import frag from '../shaders/topo.frag'
import vert from '../shaders/_lib/fullscreen.vert'

const PALETTE = {
  uInk: new THREE.Color('#000000'),
  uLine: new THREE.Color('#F7F2E8'),
  uAccent: new THREE.Color('#FF1E2D'),
}

function Plane() {
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const { size } = useThree()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uResolution: { value: new THREE.Vector2() },
    uInk: { value: PALETTE.uInk }, uLine: { value: PALETTE.uLine },
    uAccent: { value: PALETTE.uAccent }, uReducedRed: { value: 0.85 },
  }), [])
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
    uniforms.uResolution.value.set(size.width, size.height)
  })
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
    </mesh>
  )
}

export default function TopoHero() {
  const prefersReduced = typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas
      aria-hidden="true"
      frameloop={prefersReduced ? 'never' : 'always'}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Plane />
    </Canvas>
  )
}
```

- [ ] **Step 2: Pause offscreen/hidden** — add an effect using `IntersectionObserver` on the canvas parent and `document.visibilitychange` that toggles R3F's frameloop via the `useThree().setFrameloop` API (`'always'`/`'never'`). Show the exact effect code.

- [ ] **Step 3: Manual verify** — temporarily mount in `index.astro` with `client:visible`; run `npm run dev`; confirm the shader renders warm-white lines on black with subtle red, is crisp, and stops when the tab is hidden (log in the visibility handler).

- [ ] **Step 4: Commit** — `git commit -am "Add TopoHero R3F island with reduced-motion and offscreen pause"`

---

### Task 6: Nav + Hero composition

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `TopoHero.tsx`, `public/posters/topo-hero.webp`.
- Produces: `Nav.astro` (sticky blurred bar) and `Hero.astro` (poster `<img>` under the island, copy overlay, vignette).

- [ ] **Step 1: `Nav.astro`** — sticky, `backdrop-filter: blur`, brand with red `o`, mono anchor links (`#work`, `#pubs`, `#contact`, `/resume.pdf`). Full markup + scoped styles.
- [ ] **Step 2: `Hero.astro`** — full-viewport section: `<img src="/posters/topo-hero.webp">` as the base layer, `<TopoHero client:visible />` layered above (fades in over the poster on mount via a CSS class toggle), left vignette, red tick, mono tagline, `<h1>` name (weight 200) with red `o`, lede, scroll cue. Full markup + styles.
- [ ] **Step 3: Compose** in `index.astro`: `Base` → `Nav` → `Hero`. Build and eyeball the hero at desktop + a 390px mobile viewport.
- [ ] **Step 4: Commit** — `git commit -am "Add sticky nav and hero with poster fallback + shader island"`

---

### Task 7: Main-page content sections

**Files:**
- Create: `src/components/Section.astro`, `Work.astro`, `Publications.astro`, `DitherBand.astro`, `Contact.astro`, `Footer.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `lib/email.ts`, `public/posters/dither-band.webp` (recolored B/W/grey + minimal red — capture via the same algo-art method as Task 4, dither route).
- Produces: `Section.astro` props `{ n: string, name: string }` with `<slot/>`; content components with fixed copy.

- [ ] **Step 1: `Section.astro`** — renders `<div class="shead"><span class="snum">{n}</span><span class="sname">{name}</span></div><slot/>` with scoped styles.
- [ ] **Step 2: `Work.astro`** — the four org rows (Biohub·CZI CURRENT / Kallyope / IBM·CAS / Ventures), each row's title links to its subpage (`/work/biohub` etc.) with a "read more →". One-line role summaries (copy from the approved preview). Current role marker red.
- [ ] **Step 3: `Publications.astro`** — the 6 papers as linked rows with mono year tags and venue. Use the real URLs from `git show master:index.html`.
- [ ] **Step 4: `DitherBand.astro`** — full-width band: `<img src="/posters/dither-band.webp">` recolored, radial mask, "CREATIVE TECHNOLOGY" label + "Generative art & interactive systems →" (red arrow). `aria-hidden` on the image.
- [ ] **Step 5: `Contact.astro`** — rows for Email/GitHub/LinkedIn/Resume. Email: render a `<a id="email-link">` placeholder + an inline module script importing/using the split parts to set `href`/text at runtime (mirror `lib/email.ts` logic); `<noscript>` LinkedIn fallback. Verify no contiguous email literal in output.
- [ ] **Step 6: `Footer.astro`** — mono "© MAXIMILIAN LOMBARDO" / "NEW YORK, NY".
- [ ] **Step 7: Compose** all into `index.astro` in order (About inline intro + skill tags, then the components). Build.
- [ ] **Step 8: Verify email** — `grep -c 'maximilian.g.lombardo@gmail.com' dist/index.html` → expect `0`.
- [ ] **Step 9: Commit** — `git commit -am "Add main-page sections: about, work, publications, dither band, contact"`

---

### Task 8: Work subpages (preserved detailed copy)

**Files:**
- Create: `src/pages/work/biohub.astro`, `kallyope.astro`, `ibm.astro`, `ventures.astro`

**Interfaces:**
- Consumes: `Base.astro`, `Section.astro`, `Nav.astro` (or a lighter back-nav).
- Produces: four static detail pages.

- [ ] **Step 1: Extract canonical copy** — `git show master:index.html` and lift the full text for each area (Biohub incl. CELLxGENE / Virtual Cells / VariantFormer / annotation / strategic; Kallyope; IBM; Ventures incl. BioKit Labs, Kambrian). Keep the real outbound links.
- [ ] **Step 2: `work/biohub.astro`** — `Base` (title "Biohub — Maximilian Lombardo"), a back-to-home link, `<h1>`, and the full Biohub writeup using the design system (headings/body/mono labels). Full content.
- [ ] **Step 3–5: kallyope / ibm / ventures** — same pattern, each with its lifted copy. (Repeat the structure; do not abbreviate the copy.)
- [ ] **Step 6: Verify** — build; click through from the main Work rows to each subpage and back; all links resolve.
- [ ] **Step 7: Commit** — `git commit -am "Add work subpages preserving detailed copy"`

---

### Task 9: Public assets, favicon, OG image

**Files:**
- Move: `CNAME` → `public/CNAME`; `resume.pdf` → `public/resume.pdf`
- Create: `public/favicon.svg`, `public/og-image.png`
- Delete: old `index.html`, `stylesheets/`, `javascripts/` (superseded)

**Interfaces:** none.

- [ ] **Step 1: Move CNAME + resume** into `public/`; confirm `public/CNAME` is exactly `www.maximilianlombardo.com`.
- [ ] **Step 2: favicon.svg** — a minimal mark (e.g., a warm-white "M" / red dot) on transparent.
- [ ] **Step 3: og-image.png** — 1200×630 static hero render (reuse the topo poster + name overlay) for social previews.
- [ ] **Step 4: Remove superseded files** — delete `index.html`, `stylesheets/`, `javascripts/` from repo root (their content now lives in Astro).
- [ ] **Step 5: Build + verify** — `npm run build`; confirm `dist/CNAME`, `dist/resume.pdf`, `dist/favicon.svg`, `dist/og-image.png` exist.
- [ ] **Step 6: Commit** — `git commit -am "Move CNAME/resume to public, add favicon and OG image, remove old theme"`

---

### Task 10: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:** none.

- [ ] **Step 1: Write `deploy.yml`**

```yaml
name: Deploy site
on:
  push: { branches: [master] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add a build-check job for the feature branch** — a second workflow (or a `pull_request`/branch trigger) that runs `npm ci && npm run build` WITHOUT deploying, so the branch is validated but only `master` publishes. Show the trigger block.
- [ ] **Step 3: Commit** — `git commit -am "Add GitHub Actions build-and-deploy for Pages"`. (Note: Pages repo setting must be switched to 'GitHub Actions' source — a manual step flagged for the owner at merge time.)

---

### Task 11: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1:** `npm run build && npm run preview` — walk the whole page + all four subpages.
- [ ] **Step 2:** `grep -rc 'maximilian.g.lombardo@gmail.com' dist/` → expect `0` everywhere.
- [ ] **Step 3:** confirm `dist/CNAME` == `www.maximilianlombardo.com`; `dist/resume.pdf` opens.
- [ ] **Step 4:** emulate `prefers-reduced-motion: reduce` and a no-WebGL context → hero shows the poster, no console errors.
- [ ] **Step 5:** Lighthouse (performance + accessibility) on the built preview; record scores; fix any contrast/tap-target regressions.
- [ ] **Step 6:** 390px mobile viewport — nav, hero legibility, tap targets OK.
- [ ] **Step 7:** Commit any fixes — `git commit -am "Verification fixes"`.

---

## Merge & go-live (owner-gated, after plan completion)

Not a task — a checklist for when the owner approves going live:
1. Open PR `feature/site-redesign` → `master`; review the built preview.
2. In repo Settings → Pages, set source to **GitHub Actions**.
3. Merge; watch the Actions deploy; verify `www.maximilianlombardo.com` serves the new site and the domain/cert hold.
4. If anything breaks, revert the merge commit — `master` returns to the current site immediately.

## Self-Review

- **Spec coverage:** architecture (T1,T5,T10) ✓; tokens/type (T2) ✓; hero shader + poster + fallbacks (T4,T5,T6) ✓; dither static accent (T7) ✓; main sections + trimmed copy (T7) ✓; subpages preserving copy (T8) ✓; email obfuscation (T3,T7) ✓; SEO/favicon/OG (T2,T9) ✓; CNAME/resume (T9) ✓; deploy + branch safety (T10, merge checklist) ✓; verification incl. reduced-motion/no-WebGL/Lighthouse/mobile (T11) ✓.
- **Placeholders:** content-heavy steps (T2 fonts, T4 shader edit, T8 copy) point to exact source files and describe the concrete transformation rather than leaving TODOs; no "add error handling"-style gaps.
- **Type consistency:** shader uniforms (`uInk/uLine/uAccent/uReducedRed`) defined in T4 and consumed identically in T5; `assembleEmail()` defined in T3, used in T7.
