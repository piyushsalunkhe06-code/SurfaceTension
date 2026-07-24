# DeepSea Guardian

AI-powered digital twin of Earth's oceans — cinematic Next.js 15 + React Three Fiber experience.

## What's built

- **Loading screen** — animated spinning "planet", live progress percentage
- **Hero** — real 3D Earth (React Three Fiber): procedurally textured ocean/continents, rotating cloud layer, Fresnel atmosphere glow, orbiting satellite, mouse-reactive rotation, scroll-driven camera dive
- **Dive section** — 3D underwater scene (instanced fish school, coral clusters, pulsing jellyfish, light rays) with glassmorphic info cards on scroll, bubble/particle overlay, caustic light pattern
- **Mission Control** — glass dashboard with animated metric cards and real charts (area, radar, donut) via Recharts
- Lenis smooth scrolling, Framer Motion section reveals, full ocean color system in Tailwind

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Not yet wired up (from the original spec, left for a follow-up pass)

- GSAP scroll-timeline choreography (currently plain scroll-linked React state — works, but GSAP would give tighter easing/pinning control)
- Mapbox ocean sensor map (`react-map-gl`/`mapbox-gl` are installed as deps but no map component yet — needs a Mapbox token)
- Sound design (ocean ambience / hover / click) — intentionally left out; browsers block autoplay audio without a user gesture, so this needs a "sound on" toggle UI
- Whale / sea turtle / submarine drone / ship 3D models — current underwater scene uses simple procedural geometry (cones/spheres) for fish, coral, and jellyfish rather than sculpted GLTF models
- Real backend data — all metrics/charts are placeholder values; wire to your actual sensor/climate API when ready

## Structure

```
app/            Next.js App Router entry (layout, page, globals.css)
components/     Hero, DiveSection, MissionControl, HeroEarth (R3F), UnderwaterScene (R3F),
                Navbar, LoadingScreen, StarField, Particles, SmoothScroll, ui/GlassCard
lib/theme.ts    Shared color palette
```
