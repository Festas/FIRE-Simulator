# FIRE Simulator — Developer Guide

> Internal developer documentation for the FIRE Simulator Next.js application.
>
> For the project overview, see the [root README](../README.md).
> For the API reference, see [docs/API.md](../docs/API.md).
> For the architecture, see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Production build
npm run build
```

---

## Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start development server (HMR)  |
| `npm run build`      | Production build (standalone)    |
| `npm run start`      | Start production server          |
| `npm run lint`       | Run ESLint 9                     |
| `npm test`           | Run all tests (Vitest)           |
| `npm run test:watch` | Run tests in watch mode          |

---

## Directory Structure

```
fire-simulator/
├── app/                          # Next.js App Router
│   ├── components/               # React components (26+)
│   │   ├── ui/                   # Shared UI primitives
│   │   ├── Sidebar.tsx           # Input parameters panel
│   │   ├── KPICards.tsx          # Metric cards
│   │   ├── FireChart.tsx         # Accumulation chart
│   │   ├── DrawdownChart.tsx     # Withdrawal chart
│   │   ├── MonteCarloChart.tsx   # MC percentile chart
│   │   ├── LifecycleMonteCarloChart.tsx
│   │   ├── DetailTable.tsx       # Year-by-year table
│   │   ├── ReversePlanner.tsx    # Reverse calculation
│   │   ├── LifeEventsEditor.tsx  # Life events UI
│   │   ├── ScenarioManager.tsx   # Scenario comparison
│   │   ├── OnboardingWizard.tsx  # First-visit wizard
│   │   ├── FireScore.tsx         # 0-100 composite score
│   │   ├── Milestones.tsx        # Progress milestones
│   │   ├── PhasesTimeline.tsx    # 5-phase roadmap
│   │   └── ...                   # More components
│   ├── hooks/
│   │   └── useUrlState.ts        # URL ↔ state sync
│   ├── layout.tsx                # Root layout + metadata
│   ├── page.tsx                  # Main dashboard orchestrator
│   └── globals.css               # Tailwind base styles
├── lib/                          # Core business logic
│   ├── fireCalculations/         # Modular calc engine
│   │   ├── index.ts              # calculateFIRE() orchestrator
│   │   ├── types.ts              # All TypeScript interfaces
│   │   ├── constants.ts          # MAX_YEARS, MC_SIMULATIONS, etc.
│   │   ├── accumulation.ts       # Wealth growth simulation
│   │   ├── drawdown.ts           # Withdrawal phase
│   │   ├── monteCarlo.ts         # MC simulations
│   │   ├── reverse.ts            # Reverse planning
│   │   ├── lifeEvents.ts         # Life event cash flows
│   │   ├── tax.ts                # Tax bridge
│   │   └── helpers.ts            # Utilities
│   ├── fireCalculations.ts       # Backward-compat re-export barrel
│   ├── fireCalculations.test.ts  # 139+ calc tests
│   ├── tax/
│   │   ├── index.ts              # 9-country tax engine
│   │   └── index.test.ts         # 38 tax tests
│   ├── i18n/
│   │   ├── index.tsx             # I18nProvider + useI18n hook
│   │   └── translations.ts       # DE + EN (600+ keys)
│   ├── export/
│   │   └── index.ts              # XLSX, PDF, CSV, JSON export
│   ├── theme/
│   │   └── index.tsx             # ThemeProvider + useTheme hook
│   ├── currency.ts               # COUNTRY_CURRENCY + formatting
│   ├── countryDefaults.ts        # Per-country defaults
│   ├── examplePlans.ts           # Pre-built example scenarios
│   └── chartUtils.ts             # Chart formatting helpers
├── public/                       # Static assets
├── Dockerfile                    # Multi-stage Docker build
├── next.config.ts                # output: "standalone"
├── tsconfig.json                 # TypeScript strict mode
├── vitest.config.ts              # Test config with @ alias
├── eslint.config.mjs             # ESLint 9 config
├── postcss.config.mjs            # PostCSS + Tailwind
└── package.json
```

---

## Key Architecture Decisions

### State Management

No external state library — all state lives in `page.tsx` using React `useState`.

- **Inputs** → `FireInputs` state object
- **Persistence** → localStorage (`fire-simulator-inputs`)
- **URL Sync** → Short-key URL params via `useUrlState.ts`
- **Undo/Redo** → 30-level stack with `Ctrl+Z` / `Ctrl+Shift+Z`
- **Deferred Rendering** → `useDeferredValue` prevents UI jank

### Calculation Engine

`calculateFIRE()` is a **pure function** — deterministic for same inputs (except Monte Carlo randomness).

The engine is split into focused sub-modules in `lib/fireCalculations/`:
- `accumulation.ts` — Year-by-year growth
- `drawdown.ts` — Post-FIRE withdrawal
- `monteCarlo.ts` — Stochastic simulations
- `reverse.ts` — Binary-search reverse planning
- `lifeEvents.ts` — Cash-flow timeline
- `tax.ts` — Bridge to `lib/tax/`

The barrel file `lib/fireCalculations.ts` re-exports everything for backward compatibility.

### Tax Engine

Pluggable interface (`TaxEngine`) with 9 country implementations. Each engine:
- Calculates tax on gains
- Reports annual allowance
- Reports partial exemption rate

### i18n

Simple, type-safe i18n with no external library:
- `Translations` interface with 600+ keys
- `de` and `en` objects implementing the interface
- `useI18n()` hook returns `t` (translations) and `locale`
- Dynamic values use template functions: `(value: string) => string`

### Dashboard Modes

3-tier UI complexity stored in `localStorage`:
- **Beginner** — Simplified, educational
- **Standard** — Full dashboard
- **Advanced** — All features including life events and detail table

---

## Testing

```bash
npm test              # 180+ tests, ~3s
npm run test:watch    # Interactive watch mode
```

### Test Structure

| File                          | Tests | Covers                                  |
| ----------------------------- | ----- | --------------------------------------- |
| `lib/fireCalculations.test.ts` | 139+ | Core engine, edge cases, all countries |
| `lib/tax/index.test.ts`      | 38    | All 9 tax models                        |
| `lib/chartUtils.test.ts`     | 4     | Chart formatting                        |

### Writing Tests

```typescript
import { calculateFIRE } from "@/lib/fireCalculations";
import { describe, it, expect } from "vitest";

describe("calculateFIRE", () => {
  it("handles zero savings gracefully", () => {
    const result = calculateFIRE({ ...baseInputs, monatlicheSparrate: 0 });
    expect(result.targetReached).toBe(false);
  });
});
```

Path alias `@/` resolves to the `fire-simulator/` root (configured in `vitest.config.ts`).

---

## Docker

### Build Stages

1. **deps** — Install npm dependencies (`npm ci`)
2. **builder** — Build Next.js app (`npm run build`)
3. **runner** — Minimal production image with standalone output

```bash
# Build image
docker build -t fire-simulator .

# Run container
docker run -p 3000:3000 fire-simulator
```

The `next.config.ts` uses `output: "standalone"` for a minimal server bundle.

---

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Test job**: `npm ci` → `npm run lint` → `npm test` → `npm run build`
2. **Deploy job** (on success): SCP to server → `docker compose build && up -d`

Triggers: push to `main` or manual dispatch.

---

## Environment Variables

The app has **no required environment variables**. All configuration is done through the UI.

Optional build-time variables:
- `NEXT_TELEMETRY_DISABLED=1` — Disable Next.js telemetry (set in Dockerfile)

---

## Useful Links

- [Root README](../README.md) — Project overview
- [Architecture](../docs/ARCHITECTURE.md) — System design
- [API Reference](../docs/API.md) — Calculation engine docs
- [Configuration](../docs/CONFIGURATION.md) — All parameters explained
- [Deployment](../DEPLOYMENT.md) — Production deployment
- [Contributing](../CONTRIBUTING.md) — How to contribute

