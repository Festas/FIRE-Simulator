# Configuration Guide

> Detailed guide to all FIRE Simulator parameters and settings.

## Table of Contents

- [Retirement Goals](#retirement-goals)
- [Savings Phase](#savings-phase)
- [Return & Market](#return--market)
- [Taxes](#taxes)
- [Withdrawal Strategy](#withdrawal-strategy)
- [Working Time Account](#working-time-account)
- [Life Events](#life-events)
- [Dashboard Modes](#dashboard-modes)
- [German Defaults](#german-defaults)

---

## Retirement Goals

### Desired Monthly Income (`monatlichesWunschEinkommen`)
- **Range:** €0 – €50,000/month
- **Default:** €2,500 (DE)
- **Description:** The monthly income you want in retirement. This drives the automatic FIRE number calculation.
- **Formula:** `FIRE Number = (Monthly Income × 12) / (SWR / 100)`

### State Pension (`gesetzlicheRente`)
- **Range:** €0 – €10,000/month
- **Default:** €1,200 (DE)
- **Description:** Expected monthly state pension. Reduces required portfolio withdrawals once you reach the state pension age. The pension starts at the configured retirement age — until then, the full withdrawal comes from the portfolio.

### Pension Start Age (`renteneintrittsalter`)
- **Range:** 55 – 75
- **Default:** 67 (DE), 65 (CH/AT/CA), 64 (FR), 66 (UK)
- **Description:** Age at which you begin receiving state pension payments. Before this age, the full desired income must come from portfolio withdrawals.

### Safe Withdrawal Rate (`swr`)
- **Range:** 2.5% – 5.0%
- **Default:** 3.5% (DE/UK/AT/NL/FR/CH), 4.0% (US/CA/AU)
- **Description:** The percentage of your portfolio you withdraw annually. Lower rates are more conservative (portfolio more likely to survive). The classic "4% rule" comes from the Trinity Study.

### Current Age (`currentAge`)
- **Range:** 18 – 80
- **Default:** 30
- **Description:** Your current age. Used to calculate milestones (Coast FIRE age, FIRE age) and lifecycle Monte Carlo (simulates to age 90).

---

## Savings Phase

### Starting Capital (`startKapital`)
- **Range:** €0 – €10,000,000
- **Default:** €30,000
- **Description:** Your current invested capital. This is the starting point for the accumulation simulation.

### Monthly Savings (`monatlicheSparrate`)
- **Range:** €0 – €50,000/month
- **Default:** €1,500
- **Description:** How much you invest each month. This is the single most impactful parameter for reaching FIRE quickly.

### Savings Rate Dynamics (`dynamikSparrate`)
- **Range:** 0% – 10%
- **Default:** 2.0%
- **Description:** Annual percentage increase in your monthly savings. Models salary increases over time. A 2% annual increase means your savings grow from €1,500 to €1,530 after one year.

### Monthly Net Income (`monatlichesNetto`)
- **Range:** €0 – €100,000/month
- **Default:** €3,500 (DE)
- **Description:** Your current monthly net income. Used to calculate the savings rate percentage displayed in the KPI cards. Does not affect the simulation directly.

### Employer Pension Contribution (`bavJaehrlich`)
- **Range:** €0 – €50,000/year
- **Default:** €0
- **Description:** Annual employer contribution to your pension (Betriebliche Altersvorsorge in Germany). Added to your investment annually.

### Target Wealth (`zielvermoegen`)
- **Mode:** Automatic (from desired income + SWR) or manual override
- **Description:** The portfolio value you need to achieve FIRE. By default, this is automatically calculated. You can override it with a custom value.

### LZK Phase (`lzkJahre`, `lzkRendite`)
- **LZK Years:** 0 – 30
- **LZK Return:** 0% – 15%
- **Description:** Lebensarbeitszeitkonto (lifetime working account) phase. Models a period where savings go into a separate, potentially lower-return vehicle. Set to 0 to disable.

---

## Return & Market

### Expected ETF Return (`etfRendite`)
- **Range:** 0% – 20%
- **Default:** 7.0%
- **Description:** Expected annual nominal return on your ETF portfolio. Historical global equity averages are ~7-10% nominal. This is before inflation is deducted.

### Expected Inflation (`inflation`)
- **Range:** 0% – 10%
- **Default:** 2.5%
- **Description:** Expected annual inflation rate. Used to calculate real (purchasing-power-adjusted) portfolio values. The real return is approximately `ETF Return - Inflation`.

---

## Taxes

### Taxes (Germany)

The simulator applies the German **Abgeltungssteuer** to investment gains.

| Component            | Detail                                             |
| -------------------- | -------------------------------------------------- |
| Abgeltungssteuer     | 25% + 5.5% Solidaritätszuschlag (26.375%)          |
| Kirchensteuer (`kirchensteuer`) | Optional 8/9% church-tax surcharge      |
| Teilfreistellung     | 30% partial exemption for equity ETFs              |
| Sparer-Pauschbetrag  | 1.000 € (single) / 2.000 € (couple) annual allowance |
| Vorabpauschale       | Advance lump-sum tax on accumulating ETFs (see below) |

During the accumulation phase the simulator models **tax deferral** the way
German accumulating ("thesaurierend") equity ETFs are actually taxed: instead of
taxing the full unrealised gain each year, only the annual **Vorabpauschale**
(advance lump sum) is taxed. The Vorabpauschale equals
`value × Basiszins × 70%`, capped at the position's actual gain for the year,
reduced by the 30% Teilfreistellung and offset by the Sparer-Pauschbetrag. Any
Vorabpauschale already taxed raises the position's cost basis so it is not taxed
again when the shares are sold.

During drawdown only the **realised-gain fraction** of each withdrawal is taxed
(proportional-gain method), based on the tracked cost basis, crediting the
Vorabpauschale paid during accumulation. A single Sparer-Pauschbetrag budget is
shared per year across the Vorabpauschale and realised gains.

### Filing Status (`steuerModell`)
- **Options:** Single, Couple
- **Default:** Single
- **Description:** Affects tax-free allowances (e.g., €1,000 single vs. €2,000 couple in Germany).

### Church Tax (`kirchensteuer`)
- **Options:** Yes, No
- **Default:** No
- **Description:** Germany-specific: adds church tax surcharge to capital gains tax (effective rate rises from 26.375% to 27.82%).

### Base Rate / Basiszins (`basiszins`)
- **Range:** 0%–5%
- **Default:** 2.53% (the 2025 tax-year value published by the Bundesfinanzministerium; 2024 was 2.29%)
- **Description:** The base interest rate used to compute the yearly Vorabpauschale on accumulating ETFs. Setting it to 0 disables the Vorabpauschale (no advance taxation during accumulation).

---

## Withdrawal Strategy

### Withdrawal Mode (`entnahmeModell`)
- **Options:**
  - **Perpetual Income (Ewige Rente):** Withdraw SWR% annually — portfolio intended to last forever
  - **Capital Depletion (Kapitalverzehr):** Spend down the portfolio over a fixed number of years

### Depletion Period (`kapitalverzehrJahre`)
- **Range:** 10 – 60 years
- **Default:** 30
- **Description:** Only used in Capital Depletion mode. The number of years over which to fully consume the portfolio.

---

## Working Time Account (Arbeitszeitkonto)

### Enable (`arbeitszeitkontoEnabled`)
- **Default:** Disabled
- **Description:** Models a working time account where you accumulate paid leave hours that can be used for a sabbatical or early exit.

### Hours per Year (`stundenProJahr`)
- **Range:** 0 – 2,000
- **Default:** 0
- **Description:** Hours you accumulate on the working time account each year.

### Weekly Hours (`wochenStunden`)
- **Range:** 10 – 60
- **Default:** 40
- **Description:** Your regular weekly working hours. Used to convert accumulated hours into years of paid leave.

---

## Life Events

Life events model significant financial changes over your FIRE journey.

### Event Types

| Type                | Impact       | Example                           |
| ------------------- | ------------ | --------------------------------- |
| `home_purchase`     | Expense      | Down payment, mortgage            |
| `child`             | Expense      | Childcare, education              |
| `career_change`     | Varies       | Salary change, gap period         |
| `inheritance`       | Income       | One-time windfall                 |
| `pension_start`     | Income       | Additional pension income         |
| `healthcare`        | Expense      | Medical costs                     |
| `one_time_expense`  | Expense      | Major purchase, renovation        |
| `one_time_income`   | Income       | Bonus, sale of property           |
| `side_income`       | Income       | Freelancing, rental income        |
| `savings_rate_change` | Adjustment | Changed monthly savings           |

### Event Properties

- **Start Year / End Year:** Calendar years the event is active
- **Annual Amount:** Yearly cash-flow impact (negative = expense, positive = income)
- **Inflation Adjusted:** Whether the amount grows with inflation

---

## Dashboard Modes

| Mode       | Best For             | Shows                                                       |
| ---------- | -------------------- | ----------------------------------------------------------- |
| Beginner   | New to FIRE          | Simplified journey, what-if scenarios, one chart, FIRE score |
| Standard   | Regular users        | Full KPIs, all charts, milestones                            |
| Advanced   | Power users          | Everything + life events, detail table, phases timeline      |

The mode is stored in `localStorage` and persists across sessions.

---

## German Defaults

The simulator ships with sensible defaults for Germany (`lib/germanDefaults.ts`):

| Parameter          | 🇩🇪 Default |
| ------------------ | ----------- |
| Net Income         | €3,500      |
| Monthly Savings    | €800        |
| Desired Income     | €2,500      |
| State Pension      | €1,200      |
| Pension Age        | 67          |
| ETF Return         | 7.0%        |
| Inflation          | 2.5%        |
| SWR                | 3.5%        |
