# Changelog

All notable changes to the FIRE Simulator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation (README, CONTRIBUTING, ARCHITECTURE, API reference)
- GitHub issue and pull request templates
- Security policy

---

## [0.1.0] — 2025-01-01

### Added

#### Core Calculation Engine
- FIRE number calculation from desired monthly income and safe withdrawal rate (SWR)
- Accumulation phase simulation (up to 50 years)
- Drawdown phase simulation (40 years post-FIRE)
- Coast FIRE calculation (dynamic, not hardcoded)
- Scenario comparison (optimistic +2%, pessimistic -2%)
- No-investment baseline comparison
- Reverse planner — calculate required savings for a target FIRE age
- Age-based savings analysis table

#### Monte Carlo Simulation
- Drawdown Monte Carlo (1,000 simulations) with percentile bands (P10–P90)
- Full lifecycle Monte Carlo (500 simulations) — accumulation through retirement
- Monte Carlo–backed savings recommendation (75th percentile target)

#### Multi-Country Tax Engine
- 9 countries: DE, US, UK, CH, AT, NL, CA, AU, FR
- Pluggable `TaxEngine` interface
- Country-specific defaults (income, pension, retirement age, SWR, returns, inflation)
- Auto-detection of user's country from browser locale

#### Life Events
- 10 event types: home purchase, child, career change, inheritance, pension start, healthcare, one-time expense/income, side income, savings rate change
- Cash-flow timeline modeling with inflation adjustment
- URL-serializable via base64 compact encoding

#### Dashboard & Visualization
- 3-tier dashboard mode: Beginner / Standard / Advanced
- 8+ KPI cards with contextual explanations
- Interactive charts (Recharts): accumulation, drawdown, lifecycle Monte Carlo
- Year-by-year detail table
- 5-phases timeline
- FIRE Progress Gauge (SVG circular)
- FIRE Score (0–100 composite)
- Milestones tracker
- What-If scenario panel (beginner mode)
- Chart Explainer overlays

#### Beginner Features
- 4-step onboarding wizard (shown on first visit)
- Education panel with FIRE concepts
- Glossary modal with searchable terms
- Beginner Journey Card (simplified summary)
- Contextual guidance cards with actionable feedback

#### UX & Tools
- Dark / light theme with system preference detection
- Responsive design (mobile sidebar, adaptive layout)
- Undo/redo (30-level stack) with Ctrl+Z keyboard shortcuts
- URL state persistence for sharing
- localStorage persistence across sessions
- Export: XLSX, PDF, CSV, JSON
- JSON import for saved configurations
- 15+ interactive input parameters with sliders and number inputs
- Tooltips on every parameter
- Input validation with warnings
- Example plans dropdown (multiple income scenarios)

#### Internationalization
- German (de) and English (en) translations
- 600+ translation keys
- Per-country currency formatting (EUR, USD, GBP, CHF, CAD, AUD)

#### Working Time Account (Arbeitszeitkonto)
- Accumulate hours for paid leave before FIRE
- Freistellung (paid leave) phase modeling
- Configurable hours per year and weekly hours

#### Infrastructure
- Next.js 16 with App Router and TypeScript
- Tailwind CSS styling
- Docker multi-stage build
- nginx reverse proxy configuration
- GitHub Actions CI/CD (lint, test, build, deploy)
- Vitest test suite (180+ tests)
- PWA support (service worker, manifest)

[Unreleased]: https://github.com/Festas/FIRE-Simulator/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Festas/FIRE-Simulator/releases/tag/v0.1.0
