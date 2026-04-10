# FIRE Masterplan Simulator

A modern, interactive **FIRE (Financial Independence, Retire Early) Masterplan Simulator** styled as a high-end **Family Office Dashboard**.

Built with **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, and **Recharts**.

## Features

- **Sidebar Control Panel** – 9 interactive sliders for all financial parameters:
  - Startkapital, Monatliche Sparrate, Dynamik Sparrate
  - ETF-Rendite, Inflation, BAV-Zuschuss
  - Zielvermögen (FIRE-Zahl), LZK-Phase & LZK-Rendite
- **KPI Cards** – Coast FIRE year, Full FIRE exit year, monthly passive income, LZK start year
- **Interactive Area Chart** – Portfolio development in today's purchasing power with milestone markers
- **5-Phases Timeline** – Dynamic FIRE roadmap from foundation through exit
- **Mathematical Engine** – Two-pass simulation with inflation adjustment and LZK (Langzeitkonto) logic

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** for styling (system font stack: Inter, Roboto, ui-sans-serif)
- **Recharts** for interactive charts
- German locale (`de-DE`) number formatting

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

