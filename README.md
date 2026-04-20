<p align="center">
  <h1 align="center">🔥 FIRE Masterplan Simulator</h1>
  <p align="center">
    <strong>Plan your path to Financial Independence — with precision.</strong>
  </p>
  <p align="center">
    A modern, interactive <strong>FIRE (Financial Independence, Retire Early)</strong> simulator<br/>
    styled as a high-end Family Office Dashboard.
  </p>
  <p align="center">
    <a href="https://fire.festas-builds.com">Live Demo</a> ·
    <a href="docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="docs/API.md">API Reference</a> ·
    <a href="CONTRIBUTING.md">Contributing</a>
  </p>
</p>

---

## ✨ Highlights

- **9 Country Tax Models** — DE, US, UK, CH, AT, NL, CA, AU, FR with pluggable engine
- **Monte Carlo Simulation** — 1,000+ simulation runs for drawdown confidence intervals
- **Full Lifecycle Analysis** — Accumulation through retirement (to age 90) with percentile bands
- **Life Events Timeline** — Model home purchases, children, career changes, inheritance, and more
- **3 Dashboard Modes** — Beginner / Standard / Advanced for every experience level
- **Reverse Planner** — Calculate the exact savings needed for your target FIRE age
- **26+ Components** — Interactive charts, KPI cards, FIRE score, milestones, guidance
- **Bilingual** — German 🇩🇪 and English 🇬🇧 with 600+ translation keys
- **Zero Backend** — 100% client-side; your data never leaves the browser

---

## 📸 Features

### 🎯 Retirement Planning
- **Desired Monthly Income** — Start from what you want to spend, auto-derives your FIRE number
- **State Pension Integration** — Reduces required portfolio by accounting for government pension
- **Safe Withdrawal Rate** — Adjustable 2.5%–5.0% (default varies by country)
- **Dynamic Coast FIRE** — Calculated based on your actual target and expected returns

### 💰 Accumulation Phase
- **15+ Interactive Parameters** with sliders and clickable number inputs
- Starting capital, monthly savings, savings rate dynamics, net income
- ETF return, inflation, employer pension (BAV)
- Target wealth (auto or manual override), LZK phase & return

### 🏛️ Multi-Country Tax Engine
| Country | Tax Model |
|---------|-----------|
| 🇩🇪 Germany | Abgeltungssteuer (26.375%) + optional Kirchensteuer |
| 🇺🇸 USA | Federal capital gains brackets |
| 🇬🇧 UK | CGT with annual exempt amount |
| 🇨🇭 Switzerland | No capital gains tax (wealth tax model) |
| 🇦🇹 Austria | KESt (27.5%) |
| 🇳🇱 Netherlands | Box 3 deemed return |
| 🇨🇦 Canada | 50% inclusion rate |
| 🇦🇺 Australia | 50% CGT discount |
| 🇫🇷 France | PFU 30% flat tax |

### 📤 Withdrawal Phase
- **Perpetual Income** ("Ewige Rente") vs. **Capital Depletion** ("Kapitalverzehr")
- **40-Year Drawdown Simulation** with depletion warning
- Conservative allocation modeling (−1% return deduction)
- Monte Carlo confidence intervals (P10–P90)

### 📊 Dashboard & Visualization
- **8+ KPI Cards** — FIRE year, passive income, Coast FIRE, taxes, savings rate, and more
- **Interactive Charts** — Accumulation, drawdown, lifecycle Monte Carlo, scenario comparison
- **Year-by-Year Detail Table** — Every data point, exportable
- **5-Phases Timeline** — Dynamic FIRE roadmap from foundation through exit
- **FIRE Score** — Composite 0–100 score with SVG gauge visualization
- **Milestones Tracker** — Visual progress toward key goals

### 🧪 Monte Carlo Analysis
- **Drawdown Monte Carlo** — 1,000 simulations with randomized returns
- **Lifecycle Monte Carlo** — 500 full-lifecycle simulations (accumulation + retirement)
- **MC-Backed Savings Recommendation** — Targeted at 75% success rate
- **Percentile Bands** — P10, P25, P50, P75, P90 portfolio trajectories

### 🎭 Life Events
- 10 event types: home purchase, child, career change, inheritance, pension, healthcare, and more
- Cash-flow timeline modeling with optional inflation adjustment
- URL-serializable for easy sharing

### 🔧 UX & Tools
- **Dark / Light Theme** with system preference detection
- **Responsive Design** — Full mobile support with adaptive sidebar
- **Undo/Redo** — 30-level history stack with Ctrl+Z shortcuts
- **URL State Persistence** — Share your exact scenario via link
- **Export** — XLSX, PDF, CSV, JSON formats
- **JSON Import** — Load saved configurations
- **Onboarding Wizard** — 4-step guided setup for first-time users
- **Glossary** — Searchable financial terms modal
- **Example Plans** — Pre-built scenarios for different income levels

### 🏗️ Working Time Account (Arbeitszeitkonto)
- Accumulate hours for paid leave before FIRE
- Freistellung (paid leave) phase modeling
- Configurable hours per year and weekly hours

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Festas/FIRE-Simulator.git
cd FIRE-Simulator/fire-simulator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
# Build and run with Docker Compose
docker compose up -d

# Access at http://localhost:3200
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | App Router, React framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety (strict mode) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Recharts 3](https://recharts.org/) | Interactive SVG charts |
| [ExcelJS](https://github.com/exceljs/exceljs) | XLSX export |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF export |
| [Vitest 4](https://vitest.dev/) | Fast unit testing (180+ tests) |
| [Docker](https://www.docker.com/) | Multi-stage production build |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |

---

## 📁 Project Structure

```
FIRE-Simulator/
├── fire-simulator/               # Next.js application
│   ├── app/                      # Pages and components
│   │   ├── components/           # 26+ React components
│   │   ├── hooks/                # Custom hooks (URL state)
│   │   ├── layout.tsx            # Root layout + SEO
│   │   └── page.tsx              # Main dashboard
│   ├── lib/                      # Core business logic
│   │   ├── fireCalculations/     # Modular calculation engine
│   │   ├── tax/                  # Multi-country tax engine
│   │   ├── i18n/                 # Internationalization (DE + EN)
│   │   ├── export/               # XLSX, PDF, CSV, JSON
│   │   ├── theme/                # Dark/light theme
│   │   ├── currency.ts           # Currency formatting
│   │   └── countryDefaults.ts    # Country-specific defaults
│   ├── Dockerfile                # Multi-stage Docker build
│   └── vitest.config.ts          # Test configuration
├── docker-compose.yml            # Container orchestration
├── docs/                         # Extended documentation
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── API.md                    # Calculation engine API
│   └── CONFIGURATION.md          # All parameters explained
├── DEPLOYMENT.md                 # Production deployment guide
├── CONTRIBUTING.md               # Contribution guidelines
├── CHANGELOG.md                  # Version history
├── SECURITY.md                   # Security policy
├── CODE_OF_CONDUCT.md            # Community guidelines
└── LICENSE                       # MIT License
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 🧮 Calculation Engine

The FIRE calculation engine is modular and fully tested:

| Module | Responsibility |
|--------|---------------|
| `accumulation.ts` | Year-by-year portfolio growth simulation |
| `drawdown.ts` | Post-FIRE withdrawal modeling |
| `monteCarlo.ts` | Monte Carlo simulations (1,000+ runs) |
| `reverse.ts` | Reverse planning + sensitivity analysis |
| `lifeEvents.ts` | Cash-flow timeline from life events |
| `tax.ts` | Bridge to the multi-country tax engine |

→ See [API Reference](docs/API.md) for the complete function documentation.

---

## 🧪 Testing

```bash
cd fire-simulator
npm test
```

**180+ tests** covering:
- Core FIRE calculations with edge cases (zero values, extremes)
- All 9 tax country models
- Chart formatting utilities
- Reverse planner and Monte Carlo integration

→ See [CONTRIBUTING.md](CONTRIBUTING.md) for testing guidelines.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, component hierarchy |
| [API Reference](docs/API.md) | Complete calculation engine documentation |
| [Configuration](docs/CONFIGURATION.md) | All parameters and settings explained |
| [Deployment](DEPLOYMENT.md) | Production deployment on Hetzner/Docker |
| [Contributing](CONTRIBUTING.md) | How to contribute to the project |
| [Changelog](CHANGELOG.md) | Version history and release notes |
| [Security](SECURITY.md) | Security policy and vulnerability reporting |

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Trinity Study](https://en.wikipedia.org/wiki/Trinity_study) — Foundation for the 4% rule
- [Recharts](https://recharts.org/) — Beautiful chart library
- [Next.js](https://nextjs.org/) — The React framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS

---

<p align="center">
  Built with 🔥 for the FIRE community
</p>