# Financial-Analysis Vision — The Best FIRE Math, End to End

> **Purpose.** This document is the north-star for turning the FIRE Masterplan
> Simulator into a rigorous, transparent, and reproducible financial-mathematical
> analysis. It defines *where we want to go* before we build. It drives two
> concrete deliverables:
>
> 1. a **general, parametric Excel workbook** (see
>    [`scripts/generate-workbook.mjs`](../fire-simulator/scripts/generate-workbook.mjs)
>    and the generated
>    [`public/templates/fire-analysis-template.xlsx`](../fire-simulator/public/templates/)),
>    and
> 2. a **parity + extension roadmap** for the online tool so it carries every
>    core competency of the workbook.
>
> **Privacy principle.** Everything here is deliberately **general**. No personal
> figures, no private circumstances, and no internal-only assumptions are baked
> into the online tool or the shipped template. Users supply their own numbers;
> the tool and template only provide *methodology* and *defaults that are clearly
> labelled as illustrative*.

---

## 1. Goals & non-goals

### Goals

- **Mathematically defensible.** Every KPI is derived from an explicit,
  documented formula. No magic numbers without a labelled assumption cell.
- **Real vs. nominal correctness.** Inflation is handled consistently. Results
  are shown in today's purchasing power (real) *and* nominal where useful.
- **After-tax truth.** German capital-gains taxation (Abgeltungssteuer, Soli,
  optional Kirchensteuer, Teilfreistellung, Sparer-Pauschbetrag, Vorabpauschale)
  is modelled in both accumulation and drawdown.
- **Uncertainty made visible.** Deterministic projections are always paired with
  a stochastic (Monte-Carlo) view and percentile bands, so a single point
  estimate is never mistaken for a promise.
- **Reproducible.** The workbook can be regenerated from source; the tool is
  fully client-side and deterministic given the same inputs and seed.
- **Two mirrors, one model.** The workbook and the online tool should agree
  cell-for-KPI on the deterministic core, so results can be cross-checked.

### Non-goals

- Not tax advice, not investment advice. The analysis is an educational planning
  aid.
- No storage of personal data server-side. The tool stays zero-backend.
- No hard-coded personal scenario in shipped artefacts.

---

## 2. The financial-math core

The analysis is organised into three phases plus a cross-cutting risk layer.

### 2.1 Accumulation phase

Year-by-year portfolio evolution with:

- **Contributions:** monthly savings with an annual dynamic (savings-rate
  growth), optional employer pension (bAV), and a savings-rate that can be
  overridden by life events.
- **Growth:** expected real/nominal return on a broadly diversified equity ETF,
  compounded annually (contributions treated mid-year via a half-year
  convention where appropriate).
- **Taxation during accumulation:** the German **Vorabpauschale** (advance
  lump-sum) on accumulating funds, netted against the Sparer-Pauschbetrag and
  Teilfreistellung, tracked against a running **cost basis** so realised-gain
  tax on later sales is correct.
- **Inflation:** every nominal figure has a real (today's €) counterpart via a
  price-level index.

Key outputs: portfolio balance (nominal & real), cumulative contributions,
cumulative gains, cumulative tax, effective savings quota, and the year each
milestone (Coast FIRE, Full FIRE) is reached.

### 2.2 The FIRE number

The target capital is derived — not guessed — from the **desired income**:

- **Baseline:** `FIRE number = annual desired net income / SWR`, where SWR is the
  Safe Withdrawal Rate (Trinity-study style, adjustable 2.5 %–5.0 %).
- **Pension-aware (two-phase):** when a state pension is expected, the required
  capital is split into a *bridge* (full income from FIRE age to pension age) and
  a *gap* (income minus net pension thereafter), each discounted appropriately.
  This avoids over-saving for income the pension already covers.
- **Cost overlays:** lifelong health-insurance cost (freiwillige GKV / PKV) and
  the taxation of the state pension (Besteuerungsanteil + KVdR) are added to the
  need so the number is *after-tax, after-health-cost* real income.

### 2.3 Drawdown / decumulation phase

Post-FIRE withdrawals modelled to age ~90 with:

- Two modes: **perpetual income** ("Ewige Rente") and **capital depletion**
  ("Kapitalverzehr", deplete deliberately by a target year).
- A conservative allocation assumption (return deduction) reflecting a less
  aggressive glide-path in retirement.
- Withdrawal need that is inflation-scaled, pension-credited, health-cost-loaded,
  and **after capital-gains tax** on each sale (with optional Günstigerprüfung:
  the lower of flat Abgeltungssteuer and a personal income-tax approximation with
  Grundfreibetrag).
- A **depletion warning** and a distinction between an *intended* Kapitalverzehr
  depletion and a genuine Ewige-Rente shortfall.

### 2.4 Risk & uncertainty layer (cross-cutting)

- **Drawdown Monte Carlo:** 1,000+ runs with randomised annual returns →
  portfolio-survival success rate and P10–P90 bands.
- **Lifecycle Monte Carlo:** full accumulation-through-retirement simulation →
  confidence intervals for the FIRE year and end-of-life portfolio.
- **Return model:** log-normal returns (interpreting the input as the geometric
  / CAGR mean) as the realistic default, with an additive-normal fallback for
  comparison.
- **Sequence-of-returns risk** is surfaced explicitly, because early bad years
  dominate decumulation outcomes far more than average return.
- **MC-backed recommendation:** the savings rate targeted at a chosen success
  rate (e.g. 75 %), not merely the deterministic break-even.

### 2.5 Sensitivity & reverse planning

- **Reverse planner:** the exact monthly savings needed to hit a target FIRE age.
- **Sensitivity table:** required savings and FIRE number across a return grid,
  so the plan's fragility to the return assumption is legible at a glance.
- **Scenario bands:** optimistic / pessimistic (±2 % return) trajectories.

---

## 3. KPI dictionary (the numbers that matter)

| KPI | Definition | Phase |
|-----|-----------|-------|
| FIRE number | Capital required to fund desired real income (pension-aware) | Planning |
| Coast FIRE age/year | Age at which no further contributions are needed to reach the target by pension age | Accumulation |
| Full FIRE age/year | Age at which the FIRE number is reached | Accumulation |
| Passive income at exit | Sustainable real income the portfolio supports at FIRE | Handover |
| Effective savings quota | Contributions incl. dynamic & bAV as % of net income, horizon-averaged | Accumulation |
| Total tax paid | Cumulative capital-gains tax across both phases | Both |
| Effective tax rate | Total tax ÷ total gains | Both |
| Drawdown survival rate | Share of MC runs whose portfolio survives to age ~90 | Drawdown |
| FIRE year percentiles | P10–P90 of the year FIRE is reached | Risk |
| FIRE score | Composite 0–100 readiness score | Summary |

Every KPI in the online tool must map to a **named cell or column** in the
workbook, and vice versa, so the two can be reconciled.

---

## 4. Deliverable 1 — the Excel workbook

The workbook is **general and parametric**: a user drops in their own numbers and
every downstream sheet recomputes. It is generated reproducibly (no hand-editing)
so it can be re-shipped whenever the methodology changes.

**Sheet layout:**

1. **Read me** — purpose, disclaimer, how to use, methodology links.
2. **Assumptions** — all inputs in one labelled block (starting capital, monthly
   savings + dynamic, expected return, inflation, SWR, desired income, state
   pension, pension age, tax model, church tax, health-insurance cost, …). Every
   downstream formula references these cells; nothing is hard-coded.
3. **Accumulation** — year-by-year table (contributions, growth, Vorabpauschale
   tax, nominal & real balance, cumulative gains) driven entirely by formulas.
4. **FIRE number** — derivation of the target capital, incl. the pension-aware
   two-phase variant.
5. **Drawdown** — year-by-year decumulation to age ~90 with inflation-scaled,
   pension-credited, after-tax withdrawals and a depletion flag.
6. **Sensitivity** — required savings / FIRE number across a return grid.
7. **Dashboard** — the KPI summary block for a one-glance read.

**Design rules:** inputs are visually distinct from computed cells; currency and
percent formatting throughout; no personal data; clearly-labelled *illustrative*
defaults only.

See [`fire-simulator/scripts/README.md`](../fire-simulator/scripts/README.md) for
how to regenerate it.

---

## 5. Deliverable 2 — online-tool parity & extension roadmap

The online tool already implements the majority of the core (accumulation,
drawdown, Monte-Carlo, reverse planner, German tax engine, life events). The
target is **full parity with the workbook plus modest, general extensions** —
without leaking any internal-only detail.

### Parity checklist (workbook ⇄ tool)

- [x] Assumptions block ⇄ input sliders / number fields
- [x] Accumulation table ⇄ `simulateAccumulation`
- [x] FIRE-number derivation (incl. pension-aware) ⇄ `retirementIncome` + `calculateFIRE`
- [x] Drawdown to age ~90 (after-tax, pension-credited) ⇄ `simulateDrawdown`
- [x] Sensitivity grid ⇄ `calculateReverse` sensitivity rows
- [x] Monte-Carlo bands & success rate ⇄ `simulateMonteCarlo` / lifecycle MC
- [x] KPI dashboard ⇄ KPI cards / FIRE score
- [x] Workbook export ⇄ XLSX export + downloadable template

### Extension ideas (general, opt-in, no internal details)

These are *candidate* enhancements that keep the tool general:

- **Sequence-of-returns stress view** — a "bad first decade" scenario alongside
  the average path.
- **Withdrawal-strategy comparison** — fixed real vs. guardrails
  (e.g. Guyton-Klinger style bands) vs. fixed percentage.
- **Contribution-timing convention toggle** — begin/end-of-year / mid-year, so
  power users can reconcile with their own spreadsheets.
- **Downloadable analysis template** — offer the general workbook from the UI so
  users can continue offline.
- **Assumption provenance** — every default clearly labelled as illustrative with
  a short rationale, reinforcing that nothing personal is embedded.

Any extension must remain **general**: shipped defaults are illustrative,
user-overridable, and never encode a specific individual's situation.

---

## 6. Guardrails

- **No internal or personal details** in shipped artefacts (tool bundle, template,
  docs). Defaults are illustrative and labelled as such.
- **Backward compatibility.** New capabilities are additive and default-preserving
  so existing saved scenarios and URLs keep working.
- **One source of truth.** The deterministic core must match between workbook and
  tool; divergences are bugs.
- **Disclaimer everywhere.** Educational planning aid, not financial/tax advice.
