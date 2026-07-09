# maximilianlombardo.com

Personal website of Maximilian Lombardo — a dark-terminal one-pager with a live
WebGL shader hero, built with Astro and deployed to GitHub Pages.

**Live:** https://www.maximilianlombardo.com

## Stack

- [Astro](https://astro.build) (static output)
- React + [react-three-fiber](https://github.com/pmndrs/react-three-fiber) / Three.js
  for the hero shader, loaded as a `client:visible` island
- Self-hosted Inter + JetBrains Mono (via `@fontsource`, latin subsets)
- GLSL shaders vendored from the sibling `algo-art` project
- Deployed via GitHub Actions → GitHub Pages

## Develop

```bash
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm test         # vitest (email-obfuscation utility)
```

## Structure

```
src/
  pages/          index.astro (home), work/*.astro (detail pages), lab.astro (coming soon)
  components/     Nav, Hero, Section, Work, Publications, DitherBand, Contact, Footer
                  TopoHero.tsx — the react-three-fiber shader island
  shaders/        vendored GLSL (topo hero + _lib)
  styles/         tokens.css — palette + type tokens
  lib/            email.ts — runtime email assembly (+ test)
public/           CNAME, resume.pdf, favicon.svg, og-image.png, posters/, fonts/
.github/workflows/ deploy.yml (Pages, on push to master) + build-check.yml (branches/PRs)
```

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the
Astro site and publishes it to GitHub Pages. **Do not hand-edit built files** —
edit the source and push. The custom domain is set by `public/CNAME`.

## Notes

- The hero poster (`public/posters/topo-hero.webp`) and the dither band poster are
  pre-rendered stills captured from the `algo-art` shaders. Regenerate them there
  if the shaders change.
- The contact email is assembled client-side (`src/lib/email.ts`) and never appears
  as a literal string in the built HTML; `npm test` enforces this.

See `docs/superpowers/` for the redesign spec and implementation plan.
