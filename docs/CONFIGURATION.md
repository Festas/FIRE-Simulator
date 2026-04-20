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
- [Country Defaults](#country-defaults)

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

### Tax Country (`taxCountry`)
- **Options:** DE, US, UK, CH, AT, NL, CA, AU, FR
- **Default:** Auto-detected from browser locale
- **Description:** Determines which tax model is applied to investment gains. Each country has different rules.

| Country | Tax on Investment Gains                                |
| ------- | ------------------------------------------------------ |
| 🇩🇪 DE  | 26.375% flat (Abgeltungssteuer) + optional church tax  |
| 🇺🇸 US  | Progressive federal capital gains brackets             |
| 🇬🇧 UK  | CGT with £6,000 annual exempt amount                   |
| 🇨🇭 CH  | No capital gains tax (wealth tax model)                |
| 🇦🇹 AT  | 27.5% flat (KESt)                                      |
| 🇳🇱 NL  | Box 3 deemed return on net assets                      |
| 🇨🇦 CA  | 50% inclusion rate + marginal income tax               |
| 🇦🇺 AU  | 50% CGT discount for assets held >12 months            |
| 🇫🇷 FR  | 30% flat PFU (Prélèvement Forfaitaire Unique)          |

### Filing Status (`steuerModell`)
- **Options:** Single, Couple
- **Default:** Single
- **Description:** Affects tax-free allowances (e.g., €1,000 single vs. €2,000 couple in Germany).

### Church Tax (`kirchensteuer`)
- **Options:** Yes, No
- **Default:** No
- **Description:** Germany-specific: adds church tax surcharge to capital gains tax (effective rate rises from 26.375% to 27.82%).

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

## Country Defaults

When you select a country (or it's auto-detected), these default values are suggested:

| Parameter          | 🇩🇪 DE    | 🇺🇸 US    | 🇬🇧 UK    | 🇨🇭 CH    | 🇦🇹 AT    | 🇳🇱 NL    | 🇨🇦 CA    | 🇦🇺 AU    | 🇫🇷 FR    |
| ------------------ | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| Net Income         | €3,500    | $5,000    | £3,000    | CHF 6,000 | €3,000    | €3,500    | CA$4,500  | A$5,000   | €3,000    |
| Monthly Savings    | €800      | $1,200    | £700      | CHF 1,500 | €700      | €800      | CA$1,000  | A$1,200   | €600      |
| Desired Income     | €2,500    | $4,000    | £2,500    | CHF 4,500 | €2,300    | €2,500    | CA$3,500  | A$3,500   | €2,300    |
| State Pension      | €1,200    | $1,800    | £900      | CHF 2,000 | €1,400    | €1,100    | CA$1,200  | A$1,500   | €1,300    |
| Pension Age        | 67        | 67        | 66        | 65        | 65        | 67        | 65        | 67        | 64        |
| ETF Return         | 7.0%      | 7.0%      | 7.0%      | 6.0%      | 7.0%      | 7.0%      | 7.0%      | 7.0%      | 7.0%      |
| Inflation          | 2.5%      | 2.5%      | 2.5%      | 1.5%      | 2.5%      | 2.5%      | 2.5%      | 2.5%      | 2.5%      |
| SWR                | 3.5%      | 4.0%      | 3.5%      | 3.5%      | 3.5%      | 3.5%      | 4.0%      | 4.0%      | 3.5%      |
