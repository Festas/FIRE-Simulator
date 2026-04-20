# Architecture

> Technical architecture of the FIRE Masterplan Simulator.

## Overview

The FIRE Simulator is a **client-side single-page application** built with Next.js. All calculations, data storage, and rendering happen in the user's browser — there is no backend server or database.

```
┌─────────────────────────────────────────────────────────┐
│                       Browser                           │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Sidebar    │  │  Dashboard   │  │    Charts     │  │
│  │  (Inputs)    │  │  (KPIs)      │  │  (Recharts)   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│         ▼                 ▼                   ▼          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              page.tsx (Orchestrator)              │   │
│  │       State management, undo/redo, URL sync      │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │          lib/fireCalculations/ (Engine)           │   │
│  │  accumulation · drawdown · monteCarlo · reverse   │   │
│  │  lifeEvents · tax · helpers · constants           │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│              ┌──────────┼──────────┐                    │
│              ▼          ▼          ▼                    │
│        ┌──────────┐ ┌───────┐ ┌──────────┐             │
│        │ lib/tax/  │ │ i18n  │ │ currency │             │
│        │ (9 ctry)  │ │(de/en)│ │ (6 curr) │             │
│        └──────────┘ └───────┘ └──────────┘             │
│                                                         │
│  Storage: localStorage  │  Sharing: URL params          │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer          | Technology                | Purpose                        |
| -------------- | ------------------------- | ------------------------------ |
| Framework      | Next.js 16 (App Router)   | SSR-capable React framework    |
| Language       | TypeScript (strict)       | Type safety                    |
| Styling        | Tailwind CSS 4            | Utility-first CSS              |
| Charts         | Recharts 3                | Interactive SVG charts         |
| Export         | ExcelJS, jsPDF            | XLSX and PDF generation        |
| Testing        | Vitest 4                  | Fast unit testing              |
| Linting        | ESLint 9                  | Code quality                   |
| Container      | Docker (multi-stage)      | Production deployment          |
| CI/CD          | GitHub Actions            | Lint, test, build, deploy      |
| Web Server     | nginx                     | Reverse proxy + TLS            |

---

## Application Architecture

### State Management

The app uses **React state** in the main `page.tsx` component — no external state library.

```
FireInputs (state)
    │
    ├── localStorage          ← persist across sessions
    ├── URL params            ← shareable links
    ├── undo/redo stack       ← 30-level history
    └── useDeferredValue      ← deferred for smooth UI
          │
          ▼
    calculateFIRE(inputs)     ← pure function, no side effects
          │
          ▼
    FireResult                ← passed to all dashboard components
```

**Key design decisions:**

- `calculateFIRE` is a **pure function** — same inputs always produce the same outputs.
- The result is memoized via `useMemo` with deferred inputs.
- URL state uses short parameter keys (e.g., `sk` for `startKapital`) for compact URLs.
- Life events are base64-encoded in the URL `le` parameter.

### Dashboard Modes

The app offers three dashboard complexity levels:

| Mode       | Components Shown                                              |
| ---------- | ------------------------------------------------------------- |
| Beginner   | Journey card, what-if panel, milestones, one chart, FIRE score |
| Standard   | Full KPIs, all charts, milestones                              |
| Advanced   | Everything + life events, detail table, phases timeline        |

The mode is stored in `localStorage` under the key `fire-simulator-mode`.

---

## Calculation Engine

The calculation engine lives in `lib/fireCalculations/` and is organized into focused modules:

### Module Map

```
lib/fireCalculations/
├── index.ts          # Main orchestrator: calculateFIRE()
├── types.ts          # All TypeScript interfaces
├── constants.ts      # Simulation parameters (MAX_YEARS, MC_SIMULATIONS, etc.)
├── accumulation.ts   # simulateAccumulation(), simulateNoInvestment()
├── drawdown.ts       # simulateDrawdown()
├── monteCarlo.ts     # simulateMonteCarlo(), simulateLifecycleMonteCarlo()
├── reverse.ts        # calculateRequiredSparrate(), calculateReverse(), calculateAgeSavingsAnalysis()
├── lifeEvents.ts     # lifeEventCashFlow(), getSavingsRateOverride()
├── tax.ts            # calculateTax(), makeTaxConfig() (bridge to lib/tax/)
└── helpers.ts        # makeYearZero() and utility functions
```

### Calculation Flow

```
calculateFIRE(inputs: FireInputs): FireResult
    │
    ├─► Derive FIRE number from desired income + SWR
    │     fireNumber = (monthlyIncome × 12) / (SWR / 100)
    │
    ├─► simulateAccumulation(inputs, ...)
    │     Loop year 0..MAX_YEARS (50):
    │       - Apply savings + dynamics
    │       - Apply ETF returns
    │       - Apply life event cash flows
    │       - Calculate tax on gains
    │       - Check: totalReal >= fireNumber? → fullFireYear
    │       - Check: coastFire threshold
    │
    ├─► simulateNoInvestment(inputs)
    │     Savings-only comparison (no returns, inflation-eroded)
    │
    ├─► simulateDrawdown(inputs, exitYear, ...)
    │     Loop 40 years post-FIRE:
    │       - Monthly withdrawals (SWR-based or capital depletion)
    │       - Reduced return rate (-1% deduction)
    │       - Tax on gains during withdrawal
    │       - State pension kicks in at renteneintrittsalter
    │
    ├─► Scenario comparison: repeat accumulation at ±2% return
    │
    ├─► simulateMonteCarlo(...)
    │     1,000 simulations of drawdown with randomized returns
    │     → success rate + percentile bands (P10–P90)
    │
    ├─► simulateLifecycleMonteCarlo(...)
    │     500 simulations of full lifecycle (accumulation + drawdown)
    │     → FIRE year confidence intervals + lifecycle survival rate
    │
    └─► calculateRequiredSparrate(inputs, ...)
          Binary search for minimum monthly savings to reach FIRE
```

### Key Constants

| Constant                    | Value | Purpose                              |
| --------------------------- | ----- | ------------------------------------ |
| `MAX_YEARS`                 | 50    | Maximum accumulation horizon         |
| `DRAWDOWN_YEARS`            | 40    | Post-FIRE simulation length          |
| `DRAWDOWN_RETURN_DEDUCTION` | 1     | Conservative return adjustment (%)   |
| `LIFECYCLE_END_AGE`         | 90    | Target age for lifecycle simulation  |
| `MC_SIMULATIONS`            | 1,000 | Monte Carlo runs (drawdown)          |
| `MC_LIFECYCLE_SIMULATIONS`  | 500   | Monte Carlo runs (full lifecycle)    |
| `MC_TARGET_SUCCESS_RATE`    | 0.75  | Target for MC savings recommendation |

---

## Tax Engine

The tax engine (`lib/tax/`) uses a **pluggable architecture** with a common interface:

```typescript
interface TaxEngine {
  readonly id: TaxCountry;
  calculateTax(gains: number, config: TaxConfig): number;
  annualAllowance(config: TaxConfig): number;
  partialExemptionRate: number;
}
```

Each country implements this interface. The calculation engine calls `calculateTax()` through a unified bridge in `lib/fireCalculations/tax.ts`.

### Tax Models by Country

| Country | Model                                       |
| ------- | ------------------------------------------- |
| DE      | Flat 26.375% + optional Kirchensteuer       |
| US      | Progressive federal capital gains brackets   |
| UK      | CGT with annual exempt amount (£6,000)       |
| CH      | No capital gains tax (wealth tax model)      |
| AT      | Flat KESt 27.5%                              |
| NL      | Box 3 deemed return on assets                |
| CA      | 50% inclusion rate + marginal tax            |
| AU      | 50% CGT discount for >12 months              |
| FR      | PFU 30% flat tax                             |

---

## Component Architecture

### Component Hierarchy

```
page.tsx (Orchestrator)
├── OnboardingWizard          # First-visit 4-step wizard
├── FireEducationPanel        # Dismissible FIRE explainer
├── Sidebar                   # All input parameters
│   └── ExamplePlansDropdown  # Pre-built scenarios
├── DashboardSection (×N)     # Collapsible sections
│   ├── KPICards              # 8+ metric cards
│   ├── GuidanceCard          # Contextual feedback
│   ├── FireProgressGauge     # SVG progress ring
│   ├── Warnings              # Input validation alerts
│   ├── BeginnerJourneyCard   # Simplified summary
│   ├── WhatIfPanel           # Quick scenario comparison
│   ├── Milestones            # 5-step timeline
│   ├── FireScore             # 0–100 composite score
│   ├── FireChart             # Accumulation area chart
│   │   └── ChartExplainer    # ? overlay + summary
│   ├── DrawdownChart         # Post-FIRE trajectory
│   ├── LifecycleMonteCarloChart
│   ├── MonteCarloChart       # MC percentile bands
│   ├── ScenarioManager       # Comparison overlay
│   ├── PhasesTimeline        # Dynamic roadmap
│   ├── DetailTable           # Year-by-year data
│   ├── LifeEventsEditor      # Event timeline editor
│   └── ReversePlanner        # Required savings calculator
└── LearnGlossaryModal        # Searchable glossary
```

### Key Components

| Component               | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `Sidebar`               | All 15+ input parameters with sliders and number inputs  |
| `KPICards`              | FIRE year, passive income, Coast FIRE, taxes, etc.       |
| `FireChart`             | Stacked area chart (ETF + LZK, inflation-adjusted)       |
| `DrawdownChart`         | Post-FIRE portfolio trajectory with survival indicator   |
| `LifecycleMonteCarloChart` | Full lifecycle MC with confidence bands               |
| `ReversePlanner`        | Reverse calculation + sensitivity analysis               |
| `LifeEventsEditor`      | Add/edit/delete life events with timeline preview        |
| `OnboardingWizard`      | 4-step guided setup for first-time users                 |
| `FireScore`             | Composite 0–100 score with SVG gauge visualization       |

---

## Data Flow

### Input → Calculation → Render

```
User Input (slider/number)
    │
    ▼
handleChange(field, value)
    │
    ├── Update state
    ├── Update localStorage
    ├── Update URL params
    └── Push to undo stack
          │
          ▼
    useDeferredValue(inputs)
          │
          ▼
    useMemo(() => calculateFIRE(deferredInputs))
          │
          ▼
    FireResult
          │
          ├── KPICards
          ├── Charts
          ├── DetailTable
          ├── Warnings
          └── ...all dashboard components
```

### Persistence

| Mechanism      | Purpose                    | Key/Format                      |
| -------------- | -------------------------- | ------------------------------- |
| localStorage   | Session persistence        | `fire-simulator-inputs` (JSON)  |
| URL params     | Shareable links            | Short keys: `sk`, `ms`, `ds`... |
| JSON export    | Backup/restore             | Full `FireInputs` JSON          |
| XLSX/PDF/CSV   | Data export                | Year-by-year simulation data    |

---

## Production Deployment

```
GitHub (push to main)
    │
    ▼
GitHub Actions
    ├── npm ci → lint → test → build     (validation)
    └── scp + ssh → docker compose       (deploy)
          │
          ▼
Hetzner Server
    ├── Docker container (Next.js standalone on :3000)
    └── nginx reverse proxy (:80/:443 → :3200)
          │
          ▼
    fire.festas-builds.com (HTTPS via Let's Encrypt)
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed server setup instructions.

---

## Performance Considerations

- **Deferred rendering**: `useDeferredValue` prevents UI jank during heavy calculations.
- **Monte Carlo throttling**: Lifecycle MC uses 500 sims (vs. 1,000 for drawdown) for performance.
- **Memoization**: `calculateFIRE` result is memoized; only recalculated when inputs change.
- **Standalone output**: Next.js `output: "standalone"` produces a minimal production bundle.
- **Docker multi-stage**: Only production artifacts are included in the final image.

---

## Security Model

- **No server-side data** — all data stays in the browser.
- **No authentication** — the app is a standalone calculator.
- **No external API calls** — all computation is local.
- **CSP headers** — configured via nginx in production.
- **URL encoding** — life events use base64 for compactness, not security.

See [SECURITY.md](../SECURITY.md) for the full security policy.
