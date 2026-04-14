# FIRE Masterplan Simulator

A modern, interactive **FIRE (Financial Independence, Retire Early) Masterplan Simulator** styled as a high-end **Family Office Dashboard**.

Built with **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, and **Recharts**.

## Features

### 🎯 Retirement Planning
- **Desired Monthly Income** – Start from what you want to spend, auto-derives your FIRE number
- **State Pension Integration** – Reduces required portfolio by accounting for Gesetzliche Rente
- **Adjustable Safe Withdrawal Rate** – Slider from 2.5% to 5% (default 3.5%)
- **Dynamic Coast FIRE** – Calculated based on your actual target and expected returns (not hardcoded)

### 💰 Accumulation Phase
- **15+ Interactive Parameters** with sliders AND clickable number inputs for precision
- Startkapital, Monatliche Sparrate, Dynamik Sparrate, Nettoeinkommen
- ETF-Rendite, Inflation, BAV-Zuschuss
- Zielvermögen (auto or manual), LZK-Phase & LZK-Rendite

### 🏛️ German Tax Modeling
- **Abgeltungssteuer** (26.375%) with optional Kirchensteuer (27.82%)
- **Teilfreistellung** (30% tax-free for equity ETFs)
- **Sparerpauschbetrag** (€1,000 single / €2,000 couple)
- Tax impact shown in KPI cards and year-by-year table

### 📤 Withdrawal Phase
- **"Ewige Rente" vs. "Kapitalverzehr"** toggle — perpetual income or spend down over X years
- **40-Year Drawdown Simulation** – See if your portfolio survives post-FIRE
- Conservative allocation modeling (−1% return in withdrawal phase)
- Depletion year warning if portfolio runs out

### 📊 Dashboard & Visualization
- **8 KPI Cards** – FIRE exit year, passive income, Coast FIRE, FIRE number, drawdown status, total taxes, required savings rate, savings rate
- **Accumulation Chart** – Stacked area chart with ETF + LZK (inflation-adjusted)
- **Scenario Comparison** – Toggle optimistic (+2%) / pessimistic (−2%) overlay
- **Drawdown Chart** – Post-FIRE portfolio trajectory with survival indicator
- **Year-by-Year Detail Table** – Collapsible table with all data points
- **5-Phases Timeline** – Dynamic FIRE roadmap from foundation through exit

### 🔧 UX & Tools
- **Tooltips** on every parameter with educational explanations
- **Input Validation** – Warnings for unrealistic parameter combinations
- **Reverse Calculation** – Shows required monthly savings to reach your goal
- **CSV Export** – Download complete simulation data
- **localStorage Persistence** – Your inputs are saved across sessions
- **Responsive Design** – Mobile sidebar, adaptive layout

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
- No external dependencies beyond React + Recharts

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

