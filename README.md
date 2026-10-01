# 🌊 रक्षक · RAKSHAK
### *AI Decision Intelligence for Urban Crisis & Flood Response*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00B4D8?style=for-the-badge&logo=github)](https://902adi.github.io/Decision-Intelligence-69/)
[![Build Status](https://img.shields.io/badge/Build-Passing-2ECC71?style=for-the-badge&logo=vite)](https://github.com/902adi/Decision-Intelligence-69)
[![License](https://img.shields.io/badge/License-MIT-3498DB?style=for-the-badge)](LICENSE)

> **Rakshak (रक्षक)** is a calm, authoritative AI Decision Intelligence command & citizen platform for extreme flood events. It analyzes multimodal sensor data, models flood surge dynamics across urban wards, and generates single, high-confidence, actionable decisions within critical response windows.

---

## 🚀 Live Demo

- **URL:** [https://902adi.github.io/Decision-Intelligence-69/](https://902adi.github.io/Decision-Intelligence-69/)
- **Mobile Citizen View:** Direct link via `?mode=citizen` query param or bottom toggle.
- **Incident Commander Room:** Real-time simulation, ward risk maps, SOS triage, and explainable audit logs.

---

## ⚡ Core Capabilities

### 1. 🎛️ Incident Commander Center
- **Decisive Decision Brief:** Top-level executive verdict with action countdown timer, cost-of-delay risk curve, and Monte Carlo confidence score.
- **Explainability & Alternatives:** Transparent signal attribution, rejected counter-proposals with mathematical rationale, and complete audit logging.
- **Dynamic Topology & Ward Heatmap:** Real-time flood simulation across all municipal wards based on rainfall intensity (0–240 mm/h) and river surge.
- **Triage & SOS Dispatch:** Real-time prioritized queue of rescue requests with battery level, water height, and dispatch coordination.
- **Scenario Lab:** Multi-timeline forecast projections (Normal, Heavy Rain, Cloudburst, Dam Sluice Release) with Web Audio synthesized atmospheric audio.

### 2. 📱 Citizen Crisis Assistant
- **Immediate Plain-Language Verdict:** Single card indicating hyper-local danger level (Safe & Dry / Rising Water / High Danger).
- **Dry-Route Evacuation Guidance:** Real-time pathfinding routing evacuees around submerged corridors toward verified relief shelters.
- **One-Tap Emergency SOS:** Offline-capable rescue beacon transmitting location and medical status directly to officers.
- **Hyper-Local Ward Selector & Check-In:** Instant interactive check-ins (*"Safe & Dry"*, *"Water Entering"*, *"Evacuating Now"*) feeding the disaster map.
- **Shelter Availability Feed:** Live shelter occupancy, clean drinking water supply, food rations, and medical inventory.

---

## 🧠 Decision Pipeline Architecture

```
[ Sensor Stream: Rain Gauges + River Sensors + Elevation Topo + Citizen SOS ]
                                ↓
                 [ Deterministic Decision Engine ]
                                ↓
        ┌───────────────────────┼───────────────────────┐
        ↓                       ↓                       ↓
 [ Ward Risk Matrix ]    [ Evacuation Routes ]    [ Action Recommender ]
   • Elevation Delays      • Submerged avoidance    • Confidence %
   • Runoff Models         • Shelter assignments    • Delay Cost vs Lives
                                ↓
               [ Explainability & Audit Log ]
```

---

## 🛠️ Technology Stack

- **Frontend & Framework:** React 19, TypeScript, Vite 8
- **State Management & Synchronization:** Zustand
- **Animations & Micro-interactions:** Framer Motion, Tailwind CSS
- **Visualization & Maps:** Recharts, SVG Vector Geo Engine, Google Maps Integration
- **Acoustic Simulation:** Web Audio API Realtime Synthesizer (Zero asset overhead)
- **Deployment:** GitHub Pages / GitHub Actions

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.0 or newer
- **npm**: v9.0 or newer

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/902adi/Decision-Intelligence-69.git
cd Decision-Intelligence-69

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173/Decision-Intelligence-69/` in your browser.

### Production Build & Deployment

```bash
# Compile and build production bundle
npm run build

# Deploy directly to GitHub Pages (gh-pages branch)
npm run deploy
```

---

## 🎨 Design Philosophy

1. **Calm Under Pressure:** In critical emergencies, visual clutter creates panic. Rakshak employs deep slate backgrounds, high-contrast typography, and gentle micro-animations.
2. **Decisive Directives:** Never produces ambiguous suggestions ("you may consider"). Recommends definitive action directives with time-critical windows.
3. **Transparent Explainability:** Every automated suggestion exposes underlying telemetry drivers and rejected alternatives.
4. **Resilient & Offline-First:** Integrated local storage fallback and Service Worker registration ensures continuity in degraded connectivity scenarios.

---

## 📄 License & Disclaimer

- **License:** Distributed under the MIT License.
- **Emergency Notice:** *This system is an AI decision intelligence demonstration and research platform. In immediate life-threatening situations, always contact municipal emergency services (112).*
