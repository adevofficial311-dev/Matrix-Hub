# CokeBoys Client — Official Website & API

A full-stack, production-grade website for the **CokeBoys Client** Blox Fruits PvP community. Built with React 19, TypeScript, Vite, Tailwind CSS, Motion, and an Express backend compatible with Netlify (frontend) and Railway (backend).

---

## 🌟 Key Features

- **Atmospheric Welcome Gate**: Immersive landing gate with interactive "YES / NO" prompts, access safety fallbacks, and music initialization.
- **Dedicated Script Card**: Syntax-highlighted code block containing the exact verified Lua loader (`loadstring(game:HttpGet("https://raw.githubusercontent.com/cokeboysclient/CokeboysClient0/refs/heads/main/main.lua"))()`) with one-click clipboard copying and visual feedback.
- **Key System Gateway**: Direct cards for 3-Hour, 24-Hour, and Permanent community keys.
- **Live Executor Status Matrix**: Real-time compatibility status endpoint (`/api/executors`) tracking working (Potassium, Delta, Opiumware, Madium, Real) and offline executors (Xeno, Solara) with offline fallback.
- **YouTube Showcases**: Section displaying latest videos, durations, view counts, and channel links from `@cokeboysclient` via the backend proxy (`/api/videos`).
- **Interactive Pikachu Easter Egg**: Smoothly floating Pikachu across the canvas with interactive Poké Ball throwing, catch physics, 50% capture probability, escape animations, and audio effects.
- **Atmospheric Audio Engine**: Built-in HTML5 Web Audio Synthesizer and custom audio track player with localStorage persistence, volume slider, mute control, and section-reactive ambient soundscapes.

---

## 📂 Project Architecture

```
cokeboys-client/
├── src/
│   ├── components/
│   │   ├── AtmosphericBackground.tsx
│   │   ├── AudioPlayerWidget.tsx
│   │   ├── ExecutorSection.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── KeySystemSection.tsx
│   │   ├── Navbar.tsx
│   │   ├── PikachuEasterEgg.tsx
│   │   ├── ScriptSection.tsx
│   │   ├── VideosSection.tsx
│   │   └── WelcomeScreen.tsx
│   ├── data/
│   │   └── fallbackData.ts
│   ├── utils/
│   │   └── audioEngine.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server/
│   ├── config/
│   │   └── env.ts
│   ├── routes/
│   │   ├── executors.ts
│   │   └── youtube.ts
│   └── services/
│       └── youtubeService.ts
├── public/
│   └── audio/              # Optional .mp3 tracks (welcome.mp3, main.mp3, status.mp3, videos.mp3)
├── server.ts               # Express entry point with Vite middleware in dev & static serving in prod
├── netlify.toml            # Netlify SPA redirect rules
├── .env.example            # Environment variables template
└── package.json
```

---

## 🚀 Deployment Targets

### 1. Frontend on Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Configured via `netlify.toml` for Single Page Application client routing.

### 2. Full-Stack / Backend on Railway
- Start command: `npm start` (runs `node dist/server.cjs`)
- Set `NODE_ENV=production` and `PORT=3000`.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env`:

```env
# Optional: YouTube Data API v3 key for dynamic video sync
YOUTUBE_API_KEY=""
YOUTUBE_CHANNEL_ID="UC_cokeboysclient"

# Server configuration
PORT=3000
NODE_ENV="development"
```
*(If no YouTube API key is provided, verified high-resolution fallback showcases are served seamlessly).*
