# DeepSea Guardian — AI-Powered Ocean Intelligence Platform

DeepSea Guardian (codename: _SurfaceTension_) is a cinematic, interactive 3D digital twin of Earth's ocean ecosystems. Combining photorealistic WebGL rendering, real-time simulated telemetry, and advanced Generative AI diagnostics via **Google Gemini**, the platform provides researchers, conservationists, and policymakers with deep visual insights into marine health, temperature variances, and environmental hazards.

---

## 🌊 Core Features

### 1. Stylized 3D Ocean Globe

- **Vector Aesthetic**: Designed to match clean vector graphics with vibrant lime-green continents and deep royal-blue ocean gradients.
- **Glossy Specular Highlights**: Custom fragment shaders simulate curved light sheen reflections on the water's surface.
- **Shipping Lanes**: Animated orbital shipping corridors mapping global maritime trade routes (optional toggle).
- **Click Telemetry**: Click anywhere on the sphere to retrieve instantaneous coordinates and surface-specific parameters.

### 2. Tabbed Ocean Telemetry Panel

- **Overview Mode**: Displays primary measurements, including elevation, surface temperature, salinity/NDVI, and dissolved oxygen.
- **Ocean Vitals Mode**: Deep dive into marine indicators:
  - Plastic pollution density (pieces/km²).
  - Oil spill risk zones.
  - Coral health & bleaching indices.
  - Wind speeds and vectors.
  - Marine population densities.
  - Illegal fishing net activity warnings.
- **Observed Flora & Fauna**: Interactive tags listing native marine species and vegetation at the chosen coordinate.

### 3. Integrated Gemini AI Sentinel

- Powered by the `@google/genai` SDK.
- Provides real-time automated ecological diagnostics and threat reports tailored to specific regions, currents, and coordinate parameters.

### 4. Interactive Analytics Dashboard

- Glassmorphic telemetry metrics.
- Real-time charting (area, line, and radar charts) via Recharts.
- Decadal environmental projections slider (2020–2030).

---

## 🛠 Tech Stack

- **Frontend Framework**: Next.js 15.5 (App Router, React 19)
- **3D Graphics**: Three.js, React Three Fiber (R3F), `@react-three/drei`
- **Animations**: Framer Motion 11, GSAP 3
- **Smooth Scrolling**: Lenis
- **Data Visualization**: Recharts 2.13
- **AI Integration**: `@google/genai` (Gemini 2.5 Flash API)
- **Styling**: Tailwind CSS v3, PostCSS, Lucide Icons

---

## 📁 Directory Architecture

```
deepsea-guardian/
├── app/
│   ├── api/gemini/        # Route handler for AI diagnostics
│   ├── dashboard/         # Full analytics page
│   ├── explorer/          # 3D planet coordinate explorer
│   ├── layout.tsx         # Root configuration & viewport shell
│   └── page.tsx           # Interactive cinematic landing page
├── components/
│   ├── 3d/                # Three.js / R3F scenes (bleaching, waves, biolum)
│   │   ├── EarthV2.tsx    # Homepage vector globe background
│   │   └── WaterSurface.ts# Caustic waves shader
│   ├── dashboard/         # Visual cards, metrics & timeline sliders
│   ├── explorer/
│   │   └── OceanGlobe3D.tsx# Main interactive 3D globe component
│   └── Navbar.tsx         # Brand header navbar with emoji tags
├── lib/
│   ├── gemini.ts          # Google Gemini API connector
│   └── oceanData.ts       # Telemetry generation algorithms
└── package.json           # Scripts & package manifest
```

---

# 🌊 DeepSea Guardian — Ocean Intelligence System

> **A real-time, 3D WebGL digital twin of Earth's marine ecosystems, powered by predictive climate modeling and Google Gemini AI.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-Three.js-blue?style=flat-square&logo=three.js)](https://docs.pmnd.rs/react-three-fiber)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Google_DeepMind-8E75FF?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 💡 The Mission: Why DeepSea Guardian?

Our oceans cover more than **70% of Earth’s surface**, driving global climate patterns and sustaining over 80% of all life on Earth. Yet, marine ecosystems are collapsing at unprecedented rates due to rising sea surface temperatures, rapid ocean acidification, expanding microplastic gyres, and severe coral bleaching.

Traditional environmental reporting relies on static 2D maps and delayed quarterly publications. **DeepSea Guardian** changes that. By combining **physically based 3D satellite visualization**, **multi-spectral telemetry**, **predictive timeline forecasting**, and **Google Gemini AI**, DeepSea Guardian provides researchers, policy-makers, and conservationists with a high-fidelity, real-time command center for planetary defense.

---

## ✨ Key Features

### 🌍 1. NASA Blue Marble 3D Earth Engine

- **Photorealistic WebGL Rendering**: Built with custom GLSL shaders, multi-layered texture maps (day/night, specularity, normals, clouds), and atmospheric Rayleigh scattering.
- **Pixel-Perfect Specular Raycasting**: Uses a custom specular mask sampling engine to accurately classify ocean vs. fluvial river vs. terrestrial land coordinates upon user click.
- **Dynamic Camera Flight**: Smooth lerped camera flight that auto-rotates Earth to center on any selected coordinate or hotspot worldwide.

### 📍 2. 3D Location Marker Pin System

- Every selected coordinate or hotspot drops an **outward-pointing 3D location marker pin**, calculated using 3D surface normal vectors (`THREE.Quaternion.setFromUnitVectors`).
- Includes a pulsing base ring, vertical glowing stem, 3D pin head core, and an attached HTML floating badge `📍 [Location Name]`.

### 🧭 3. 24 World-Famous Biodiversity Hotspots

- Pre-loaded with 24 world-renowned ecological reserves across 3 categories:
  - **Oceans & Coral Reefs**: Great Barrier Reef, Mariana Trench, Galápagos, Coral Triangle, Sargasso Sea, Mid-Atlantic Vents, etc.
  - **Fluvial River Basins**: Amazon River, Nile Corridor, Mississippi, Yangtze System, Congo Basin, Ganges-Brahmaputra Delta.
  - **Terrestrial & Alpine Reserves**: Himalayan Alpine Range, Sahara Desert, Madagascar Rainforest, Australian Outback.
- Integrated search bar and category filters (`All`, `Ocean`, `River`, `Land`) with a dedicated full-height sidebar.

### ⏳ 4. 2018–2030 Climate Timeline Scrubber

- Model environmental degradation or recovery over a **13-year timeline (2018 to 2030)**.
- Watch 8 core telemetry parameters compound dynamically: Health Score, Water Temp, Plastic Concentration (mg/L), Coral Cover (%), Biodiversity Index, Oil Spill Risk, Shipping Density, and Protected Area coverage.
- Includes an interactive **mini trend bar chart** covering 2018 to 2030.

### 🎛️ 5. Interactive Layer Controls & Environmental Risk Alerts

- **8 Toggleable Map Layers**: Ocean Health, Water Temperature, Plastic Pollution, Oil Spills, Coral Health, Marine Biodiversity, Shipping Routes, and Protected Areas.
- **Live Environmental Risk Alerts**: Automated risk flagging system identifying `CRITICAL` and `HIGH` severity events (mass coral bleaching, oil spills, deforestation, microplastic surges) linked to specific global coordinates.

### 📡 6. Live Telemetry Dashboard

- High-level global monitoring suite featuring an interactive **Global Health Index (62/100)**, real-time Recharts visualizations (SST trend, plastic waste breakdown, ecosystem radar), and marine incident feeds.

### 🤖 7. On-Demand Gemini AI Sentinel Scan

- Powered by Google Gemini AI to synthesize multi-variable telemetry data into a 3-sentence environmental summary and predictive forecast for any chosen spot on Earth.

---

## 🛠️ Technology Stack

| Domain                      | Technologies Used                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**               | [Next.js 14 (App Router)](https://nextjs.org/)                                                                                 |
| **Language**                | [TypeScript](https://www.typescriptlang.org/)                                                                                  |
| **3D Engine**               | [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (`@react-three/drei`)           |
| **Styling & UI**            | [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/) |
| **Data Visualization**      | [Recharts](https://recharts.org/)                                                                                              |
| **Artificial Intelligence** | [Google Gemini AI API](https://deepmind.google/technologies/gemini/)                                                           |

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/piyushsalunkhe06-code/SurfaceTension.git
   cd deepsea-guardian
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Local Development Server**

   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the live application.

---

## 📁 Project Architecture

```
deepsea-guardian/
├── app/
│   ├── layout.tsx              # Root Layout with custom fonts & ocean theme
│   ├── page.tsx                # Landing Page with Hero, Crisis Cards, & Matrix
│   ├── explorer/
│   │   └── page.tsx            # 3D Planet Explorer, Timeline Scrubber, & Hotspots
│   ├── dashboard/
│   │   └── page.tsx            # Live Telemetry Dashboard & Recharts Analytics
│   └── api/
│       └── gemini/             # Gemini AI Sentinel API Route
├── components/
│   ├── Hero.tsx                # Landing Hero Section
│   ├── OceanCrisis.tsx         # Crisis Highlight Cards
│   ├── WhatWeMonitor.tsx       # 3-Tier Ecosystem Matrix
│   ├── OceanDataPreview.tsx    # Satellite Telemetry Preview
│   ├── ProtectTheDeep.tsx      # Conservation Call-to-Action
│   ├── explorer/
│   │   └── OceanGlobe3D.tsx    # Real-Time 3D PBR Earth Engine & Location Markers
│   └── dashboard/
│       └── OceanWatchHeader.tsx# Sticky Dashboard Navigation & Status Header
├── public/
│   ├── textures/               # High-res NASA Blue Marble texture maps
│   └── images/                 # Optimized ocean crisis & satellite imagery
├── package.json
└── README.md
```

---

## 🕹️ Controls & Navigation

| Control                           | Action                                                                     |
| --------------------------------- | -------------------------------------------------------------------------- |
| **Left Click + Drag**             | Rotate the 3D Earth globe freely in 360° space                             |
| **Scroll Wheel**                  | Zoom in / out of Earth's atmosphere                                        |
| **Click Any Point on Globe**      | Inspect coordinates, detect ocean/river/land surface, drop location marker |
| **Click Sidebar Hotspot**         | Smoothly auto-rotate Earth to center on target hotspot                     |
| **Timeline Scrubber (2018–2030)** | Slide to change historical & projected climate datasets                    |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve DeepSea Guardian, fix an issue, or add new ocean datasets:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <b>DeepSea Guardian</b> • Built for Planetary Defense 🌊<br>
  <i>Protecting the deep blue through data, graphics, and intelligence.</i>
</p>

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- A Google Gemini API Key (optional, for active AI diagnostics)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/deepsea-guardian.git
   cd deepsea-guardian
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory and add your API key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** in your browser to view the application.

---

## 📈 Telemetry Classification Engine

Coordinates clicked on the globe are classified deterministically based on geographical boundaries:

- **Oceans**: Yields marine salinity (PSU), bathymetric depth, wind vectors, coral bleaching scores, shipping route traffic, and marine fauna lists.
- **Rivers**: Yields freshwater flow rates (m³/s), oxygen concentration (mg/L), and riparian flora lists.
- **Land**: Yields continental elevation (meters), NDVI greenness indices, and soil moisture levels.

---

## 🛡 License

This project is licensed under the MIT License. See the LICENSE file for details.
