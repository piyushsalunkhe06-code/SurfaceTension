# DeepSea Guardian — AI-Powered Ocean Intelligence Platform

DeepSea Guardian (codename: *SurfaceTension*) is a cinematic, interactive 3D digital twin of Earth's ocean ecosystems. Combining photorealistic WebGL rendering, real-time simulated telemetry, and advanced Generative AI diagnostics via **Google Gemini**, the platform provides researchers, conservationists, and policymakers with deep visual insights into marine health, temperature variances, and environmental hazards.

---

## 🌊 Core Features

### 1. Stylized 3D Ocean Globe
* **Vector Aesthetic**: Designed to match clean vector graphics with vibrant lime-green continents and deep royal-blue ocean gradients.
* **Glossy Specular Highlights**: Custom fragment shaders simulate curved light sheen reflections on the water's surface.
* **Shipping Lanes**: Animated orbital shipping corridors mapping global maritime trade routes (optional toggle).
* **Click Telemetry**: Click anywhere on the sphere to retrieve instantaneous coordinates and surface-specific parameters.

### 2. Tabbed Ocean Telemetry Panel
* **Overview Mode**: Displays primary measurements, including elevation, surface temperature, salinity/NDVI, and dissolved oxygen.
* **Ocean Vitals Mode**: Deep dive into marine indicators:
  * Plastic pollution density (pieces/km²).
  * Oil spill risk zones.
  * Coral health & bleaching indices.
  * Wind speeds and vectors.
  * Marine population densities.
  * Illegal fishing net activity warnings.
* **Observed Flora & Fauna**: Interactive tags listing native marine species and vegetation at the chosen coordinate.

### 3. Integrated Gemini AI Sentinel
* Powered by the `@google/genai` SDK.
* Provides real-time automated ecological diagnostics and threat reports tailored to specific regions, currents, and coordinate parameters.

### 4. Interactive Analytics Dashboard
* Glassmorphic telemetry metrics.
* Real-time charting (area, line, and radar charts) via Recharts.
* Decadal environmental projections slider (2020–2030).

---

## 🛠 Tech Stack

* **Frontend Framework**: Next.js 15.5 (App Router, React 19)
* **3D Graphics**: Three.js, React Three Fiber (R3F), `@react-three/drei`
* **Animations**: Framer Motion 11, GSAP 3
* **Smooth Scrolling**: Lenis
* **Data Visualization**: Recharts 2.13
* **AI Integration**: `@google/genai` (Gemini 2.5 Flash API)
* **Styling**: Tailwind CSS v3, PostCSS, Lucide Icons

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

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.x or later)
* npm (v9.x or later)
* A Google Gemini API Key (optional, for active AI diagnostics)

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
* **Oceans**: Yields marine salinity (PSU), bathymetric depth, wind vectors, coral bleaching scores, shipping route traffic, and marine fauna lists.
* **Rivers**: Yields freshwater flow rates (m³/s), oxygen concentration (mg/L), and riparian flora lists.
* **Land**: Yields continental elevation (meters), NDVI greenness indices, and soil moisture levels.

---

## 🛡 License

This project is licensed under the MIT License. See the LICENSE file for details.
