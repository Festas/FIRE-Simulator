# Contributing to FIRE Simulator

Thank you for your interest in contributing to the FIRE Simulator! This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Internationalization (i18n)](#internationalization-i18n)
- [Tax Engine](#tax-engine)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

### Prerequisites

- **Node.js** 22+ (LTS recommended)
- **npm** 10+
- **Git**

### Development Setup

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

---

## Project Structure

```
FIRE-Simulator/
├── fire-simulator/           # Next.js application
│   ├── app/                  # App Router pages and components
│   │   ├── components/       # React UI components (26+ components)
│   │   ├── hooks/            # Custom React hooks (useUrlState)
│   │   ├── layout.tsx        # Root layout with metadata/SEO
│   │   ├── page.tsx          # Main dashboard page
│   │   └── globals.css       # Global styles (Tailwind)
│   ├── lib/                  # Core business logic
│   │   ├── fireCalculations/ # Modular calculation engine
│   │   │   ├── index.ts      # Main orchestrator (calculateFIRE)
│   │   │   ├── types.ts      # TypeScript interfaces
│   │   │   ├── constants.ts  # Simulation constants
│   │   │   ├── accumulation.ts
│   │   │   ├── drawdown.ts
│   │   │   ├── monteCarlo.ts
│   │   │   ├── reverse.ts
│   │   │   ├── lifeEvents.ts
│   │   │   ├── tax.ts
│   │   │   └── helpers.ts
│   │   ├── tax/              # Multi-country tax engine (9 countries)
│   │   ├── i18n/             # Internationalization (DE + EN)
│   │   ├── export/           # XLSX, PDF, CSV, JSON export
│   │   ├── theme/            # Dark/light theme provider
│   │   ├── currency.ts       # Per-country currency formatting
│   │   ├── countryDefaults.ts
│   │   └── examplePlans.ts   # Pre-built example scenarios
│   ├── public/               # Static assets
│   ├── Dockerfile            # Multi-stage production build
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── docker-compose.yml        # Docker orchestration
├── fire-simulator.nginx.conf # nginx reference config
├── DEPLOYMENT.md             # Production deployment guide
├── docs/                     # Extended documentation
└── .github/workflows/        # CI/CD (lint, test, build, deploy)
```

---

## Development Workflow

### Available Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start development server (HMR)    |
| `npm run build`    | Production build                   |
| `npm run start`    | Start production server            |
| `npm run lint`     | Run ESLint                         |
| `npm test`         | Run all tests (Vitest)             |
| `npm run test:watch` | Run tests in watch mode          |

### Branch Naming

- `feature/<description>` — new features
- `fix/<description>` — bug fixes
- `docs/<description>` — documentation changes
- `refactor/<description>` — code refactoring

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add Monte Carlo confidence intervals to KPI cards
fix: correct tax calculation for UK capital gains
docs: update API reference for reverse planner
test: add edge case tests for zero savings rate
```

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled (`strict: true` in tsconfig.json)
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `@/` path alias for imports (resolves to project root)

### React & Next.js

- All pages use the **App Router** (`app/` directory)
- The main page is a client component (`"use client"`)
- Components live in `app/components/`
- Hooks live in `app/hooks/`
- Use `useMemo` and `useCallback` for expensive calculations

### Styling

- **Tailwind CSS** for all styling
- Support both **dark** and **light** themes
- Use responsive classes for mobile support
- Follow the existing Family Office Dashboard aesthetic

### Code Organization

- Business logic belongs in `lib/`, not in components
- Keep components focused — one responsibility per component
- Use the modular calculation engine pattern (see `lib/fireCalculations/`)

---

## Testing

We use **Vitest** for testing. Tests live alongside the code they test.

### Running Tests

```bash
cd fire-simulator
npm test              # Run all tests once
npm run test:watch    # Run in watch mode
```

### Test Files

| File                           | Tests | Coverage                           |
| ------------------------------ | ----- | ---------------------------------- |
| `lib/fireCalculations.test.ts` | 139+  | Core calculations, edge cases      |
| `lib/tax/index.test.ts`        | 38    | All 9 tax countries                |
| `lib/chartUtils.test.ts`       | 4     | Chart formatting utilities         |

### Writing Tests

- Place test files next to the module they test (e.g., `index.test.ts`)
- Test edge cases: zero values, extreme inputs, boundary conditions
- Test all tax countries when adding tax-related features
- Use descriptive test names that explain the expected behavior

```typescript
describe("calculateFIRE", () => {
  it("should reach FIRE within MAX_YEARS with reasonable inputs", () => {
    // ...
  });

  it("should handle zero savings rate gracefully", () => {
    // ...
  });
});
```

---

## Internationalization (i18n)

The app supports **German (de)** and **English (en)**.

### Adding Translation Keys

1. Add the key to the `Translations` interface in `lib/i18n/translations.ts`
2. Add the German value in the `de` translations object
3. Add the English value in the `en` translations object
4. Use the key in your component via `const { t } = useI18n()`

### Guidelines

- All user-facing text must be translated (no hardcoded strings)
- Use template functions for dynamic values: `(value: string) => string`
- Keep translations concise — the UI has limited space
- German is the primary language; ensure it reads naturally

---

## Tax Engine

The tax engine (`lib/tax/`) supports 9 countries with a pluggable architecture.

### Supported Countries

| Code | Country       | Tax Model                          |
| ---- | ------------- | ---------------------------------- |
| DE   | Germany       | Abgeltungssteuer (26.375%)         |
| US   | United States | Federal capital gains brackets     |
| UK   | United Kingdom| CGT with annual exempt amount      |
| CH   | Switzerland   | Wealth tax model (no cap gains)    |
| AT   | Austria       | KESt (27.5%)                       |
| NL   | Netherlands   | Box 3 deemed return                |
| CA   | Canada        | 50% inclusion rate                 |
| AU   | Australia     | 50% CGT discount                   |
| FR   | France        | PFU 30% flat tax                   |

### Adding a New Country

1. Add the country code to `TaxCountry` in `lib/tax/index.ts`
2. Implement the `TaxEngine` interface
3. Register it in the `engines` map
4. Add country defaults in `lib/countryDefaults.ts`
5. Add currency mapping in `lib/currency.ts`
6. Add locale detection in `app/page.tsx` (`detectCountryFromLocale`)
7. Add tests in `lib/tax/index.test.ts`

---

## Pull Request Process

1. **Fork** the repository and create your feature branch
2. Make your changes following the coding standards above
3. **Run tests**: `npm test` — all tests must pass
4. **Run lint**: `npm run lint` — no lint errors
5. **Build**: `npm run build` — build must succeed
6. Write a clear PR description explaining what and why
7. Reference any related issues
8. Request review from maintainers

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] New features have tests
- [ ] Translations added for both DE and EN
- [ ] No hardcoded strings in UI components
- [ ] Responsive design tested on mobile
- [ ] Dark mode compatibility checked

---

## Questions?

If you have questions about contributing, feel free to [open an issue](https://github.com/Festas/FIRE-Simulator/issues/new) with the `question` label.

Thank you for contributing! 🔥
