# Scripts

## `generate-workbook.mjs`

Generates the **general, parametric FIRE-analysis Excel workbook** that mirrors
the online tool's financial-math core. The workbook is fully formula-driven from
a single `Assumptions` sheet — change the amber input cells and every other sheet
recomputes.

```bash
npm run workbook
```

Output: `public/templates/fire-analysis-template.xlsx`

The template is **general and contains no personal or internal data** — all
default numbers are clearly labelled as illustrative placeholders. See
[`docs/FINANCIAL_ANALYSIS_VISION.md`](../../docs/FINANCIAL_ANALYSIS_VISION.md)
for the methodology it encodes.

### Sheets

| Sheet | Purpose |
|-------|---------|
| Read me | Instructions, colour key, disclaimer |
| Assumptions | Single source of truth for all inputs (amber = editable) |
| Accumulation | Year-by-year growth, contributions, Vorabpauschale tax, real value |
| FIRE number | Target capital incl. pension-aware two-phase estimate |
| Drawdown | Decumulation with inflation-scaled, pension-credited, after-tax withdrawals |
| Sensitivity | Required monthly savings across a range of expected returns |
| Dashboard | KPI summary at a glance |

> The workbook uses a simplified German capital-gains tax approximation. It is an
> educational planning aid, not financial or tax advice.
