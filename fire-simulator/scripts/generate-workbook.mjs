// ---------------------------------------------------------------------------
// FIRE Analysis Workbook generator
// ---------------------------------------------------------------------------
// Builds a GENERAL, parametric FIRE-analysis Excel workbook. Every downstream
// sheet is formula-driven and references the single "Assumptions" block, so a
// user only has to change their own inputs and the whole model recomputes.
//
// The workbook contains no personal or internal data: all defaults are clearly
// labelled as illustrative and are meant to be overwritten by the user.
//
// Run:  node scripts/generate-workbook.mjs
// Out:  public/templates/fire-analysis-template.xlsx
//
// See docs/FINANCIAL_ANALYSIS_VISION.md for the methodology this encodes.
// ---------------------------------------------------------------------------

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import ExcelJS from "exceljs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "templates");
const OUT_FILE = join(OUT_DIR, "fire-analysis-template.xlsx");

// Simulation span for the formula-driven tables. Kept general and generous so
// the same sheet works for a wide range of ages and horizons.
const ACCUM_ROWS = 60; // years of accumulation table
const DRAW_ROWS = 60; // years of drawdown table

// Styling helpers -----------------------------------------------------------
const COLORS = {
  header: "FF1F2937", // slate-800
  headerText: "FFFFFFFF",
  input: "FFFFF3CD", // soft amber — user-editable
  computed: "FFEFF6FF", // soft blue — formula output
  accent: "FF2563EB",
};

const eur = '#,##0 "€"';
const pct = '0.0"%"';

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.header } };
    cell.font = { bold: true, color: { argb: COLORS.headerText } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
}

function inputCell(cell, value, numFmt) {
  cell.value = value;
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.input } };
  cell.font = { bold: true };
  if (numFmt) cell.numFmt = numFmt;
  cell.border = { bottom: { style: "thin", color: { argb: "FFBBBBBB" } } };
}

function computed(cell, formula, numFmt) {
  cell.value = { formula };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.computed } };
  if (numFmt) cell.numFmt = numFmt;
}

function computedNum(cell, value, numFmt) {
  cell.value = value;
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.computed } };
  if (numFmt) cell.numFmt = numFmt;
}

// ---------------------------------------------------------------------------
const wb = new ExcelJS.Workbook();
wb.creator = "FIRE Masterplan Simulator";
wb.created = new Date();

// ---------------------------------------------------------------------------
// 1) Read me
// ---------------------------------------------------------------------------
const readme = wb.addWorksheet("Read me", { properties: { tabColor: { argb: COLORS.accent } } });
readme.getColumn(1).width = 100;
const readmeLines = [
  ["🔥 FIRE Analysis — General Template", true],
  ["", false],
  ["This workbook is a general, parametric financial-independence analysis.", false],
  ["Change ONLY the amber cells on the 'Assumptions' sheet — every other sheet recomputes automatically.", false],
  ["", false],
  ["Sheets:", true],
  ["• Assumptions   — all your inputs in one place (amber = editable).", false],
  ["• Accumulation  — year-by-year portfolio growth, contributions, tax drag (Vorabpauschale) and real value.", false],
  ["• FIRE number   — how much capital you need, incl. a pension-aware two-phase estimate.", false],
  ["• Drawdown      — year-by-year decumulation with inflation-scaled, pension-credited, after-tax withdrawals.", false],
  ["• Sensitivity   — required monthly savings across a range of expected returns.", false],
  ["• Dashboard     — the KPI summary at a glance.", false],
  ["", false],
  ["Colour key:  amber = your input,  blue = calculated (do not edit).", false],
  ["", false],
  ["Methodology: see docs/FINANCIAL_ANALYSIS_VISION.md in the repository.", false],
  ["", false],
  ["Disclaimer: Educational planning aid only. Not financial, tax or investment advice.", false],
  ["Tax model is a simplified German capital-gains approximation; verify with a professional.", false],
  ["All default numbers are illustrative placeholders — replace them with your own.", false],
];
readmeLines.forEach(([text, bold], i) => {
  const cell = readme.getCell(i + 1, 1);
  cell.value = text;
  if (bold) cell.font = { bold: true, size: i === 0 ? 16 : 12 };
});

// ---------------------------------------------------------------------------
// 2) Assumptions  (single source of truth — defined names for clean formulas)
// ---------------------------------------------------------------------------
const a = wb.addWorksheet("Assumptions", { properties: { tabColor: { argb: COLORS.input } } });
a.getColumn(1).width = 42;
a.getColumn(2).width = 16;
a.getColumn(3).width = 60;

a.getCell("A1").value = "Parameter";
a.getCell("B1").value = "Value";
a.getCell("C1").value = "Notes (illustrative defaults — replace with your own)";
styleHeaderRow(a.getRow(1));

// [name, label, value, numFmt, note]
const params = [
  ["startCapital", "Starting capital", 50000, eur, "Invested capital you already have today."],
  ["monthlySavings", "Monthly savings", 800, eur, "Amount invested every month (before any dynamic increase)."],
  ["savingsDynamic", "Savings dynamic (annual)", 2, pct, "Yearly % increase of the savings rate (e.g. with salary)."],
  ["expReturn", "Expected return (nominal)", 7, pct, "Long-run nominal return of a broad equity ETF."],
  ["inflation", "Inflation", 2.5, pct, "Assumed long-run price inflation."],
  ["swr", "Safe withdrawal rate", 3.5, pct, "Sustainable withdrawal rate (Trinity-study style)."],
  ["desiredIncome", "Desired monthly income (today's €)", 2500, eur, "Net monthly spending you want in retirement, in today's money."],
  ["healthMonthly", "Health insurance (monthly)", 0, eur, "Lifelong health-insurance cost in retirement (0 = ignore)."],
  ["statePension", "State pension (monthly, net)", 1200, eur, "Expected net monthly state pension (0 = none)."],
  ["currentAge", "Current age", 35, "0", "Your age today."],
  ["fireAge", "Target FIRE age", 55, "0", "Age at which you stop accumulating and start drawdown."],
  ["pensionAge", "Pension start age", 67, "0", "Age at which the state pension begins."],
  ["endAge", "Planning end age", 90, "0", "Age the plan must last to."],
  ["taxRate", "Capital-gains tax rate", 26.375, pct, "Abgeltungssteuer + Soli (add church tax if applicable)."],
  ["partialExemption", "Partial exemption (Teilfreistellung)", 30, pct, "Tax-free share of equity-ETF gains."],
  ["saverAllowance", "Saver's allowance (annual)", 1000, eur, "Sparer-Pauschbetrag (1000 single / 2000 couple)."],
  ["basiszins", "Base rate (Vorabpauschale)", 2.53, pct, "Annual Basiszins set by the finance ministry."],
  ["drawReturnDed", "Drawdown return deduction", 1, pct, "Return reduction for a more conservative retirement allocation."],
  ["withdrawalTaxDrag", "Withdrawal tax drag", 5, pct, "Approx. effective tax on gross withdrawals in drawdown."],
];

params.forEach((p, i) => {
  const r = i + 2;
  a.getCell(`A${r}`).value = p[1];
  inputCell(a.getCell(`B${r}`), p[2], p[3]);
  a.getCell(`C${r}`).value = p[4];
  a.getCell(`C${r}`).font = { color: { argb: "FF6B7280" }, size: 10 };
  a.getCell(`B${r}`).name = p[0]; // defined name -> usable in formulas
});

// Convenience defined-name helpers (percent values are stored as whole numbers)
// so formulas divide by 100 where needed.

// ---------------------------------------------------------------------------
// 3) Accumulation
// ---------------------------------------------------------------------------
const acc = wb.addWorksheet("Accumulation");
const accHeaders = [
  "Year",
  "Age",
  "Start balance",
  "Contributions",
  "Growth",
  "Tax (Vorabpauschale)",
  "End balance (nominal)",
  "Price index",
  "End balance (real)",
  "Cumulative contrib.",
  "Cumulative gains",
];
acc.addRow(accHeaders);
styleHeaderRow(acc.getRow(1));
accHeaders.forEach((_, i) => (acc.getColumn(i + 1).width = i === 0 ? 8 : 20));

for (let n = 1; n <= ACCUM_ROWS; n++) {
  const r = n + 1;
  const prev = r - 1;
  const A = `A${r}`, B = `B${r}`, C = `C${r}`, D = `D${r}`, E = `E${r}`,
    F = `F${r}`, G = `G${r}`, H = `H${r}`, I = `I${r}`, J = `J${r}`, K = `K${r}`;

  computedNum(acc.getCell(A), n, "0");
  computed(acc.getCell(B), `currentAge+${n}-1`, "0");
  // Only accumulate while age < fireAge, otherwise blank the row's numbers.
  const active = `(currentAge+${n}-1) < fireAge`;
  // Start balance
  if (n === 1) computed(acc.getCell(C), `startCapital`, eur);
  else computed(acc.getCell(C), `G${prev}`, eur);
  // Contributions (with dynamic), only while active
  computed(acc.getCell(D), `IF(${active}, monthlySavings*12*(1+savingsDynamic/100)^(${n}-1), 0)`, eur);
  // Growth: full year on start balance + half year on contributions
  computed(acc.getCell(E), `IF(${active}, ${C}*expReturn/100 + ${D}*expReturn/200, 0)`, eur);
  // Vorabpauschale approximation, netted against the saver's allowance & partial exemption, capped by growth
  computed(
    acc.getCell(F),
    `IF(${active}, MAX(0, (MIN(${E}, ${C}*basiszins/100)*(1-partialExemption/100)-saverAllowance)*taxRate/100), 0)`,
    eur,
  );
  computed(acc.getCell(G), `${C}+${D}+${E}-${F}`, eur);
  computed(acc.getCell(H), `(1+inflation/100)^${n}`, "0.000");
  computed(acc.getCell(I), `${G}/${H}`, eur);
  if (n === 1) computed(acc.getCell(J), `${D}`, eur);
  else computed(acc.getCell(J), `J${prev}+${D}`, eur);
  if (n === 1) computed(acc.getCell(K), `${E}`, eur);
  else computed(acc.getCell(K), `K${prev}+${E}`, eur);
}

// ---------------------------------------------------------------------------
// 4) FIRE number
// ---------------------------------------------------------------------------
const fire = wb.addWorksheet("FIRE number");
fire.getColumn(1).width = 46;
fire.getColumn(2).width = 20;
fire.getColumn(3).width = 60;
fire.getCell("A1").value = "FIRE-number derivation";
fire.getCell("A1").font = { bold: true, size: 14 };

const fireRows = [
  ["Annual desired income (today's €)", `(desiredIncome+healthMonthly)*12`, eur, "Desired spend incl. health cost, per year."],
  ["Annual net state pension", `statePension*12`, eur, "Credited once you reach pension age."],
  ["Annual gap after pension", `MAX(0, B2 - B3)`, eur, "Income still needed once the pension is paid."],
  ["FIRE number — simple (income / SWR)", `B2/(swr/100)`, eur, "Classic SWR target ignoring the pension."],
  ["Capital for the post-pension gap", `B4/(swr/100)`, eur, "SWR target for the residual gap only."],
  ["Bridge years (FIRE → pension)", `MAX(0, pensionAge-fireAge)`, "0", "Years you must fully self-fund before the pension."],
  ["Bridge capital (pension pre-funding)", `B3*B7`, eur, "Undiscounted pension income you must bridge (conservative)."],
  ["FIRE number — pension-aware", `B6+B8`, eur, "Two-phase estimate: gap capital + bridge capital."],
  ["Projected real portfolio at FIRE age", `IFERROR(INDEX(Accumulation!$I:$I, MATCH(fireAge, Accumulation!$B:$B, 0)), 0)`, eur, "From the Accumulation sheet, today's €."],
  ["Surplus / shortfall vs. pension-aware target", `B10-B9`, eur, "Positive = on track (real terms)."],
];
fireRows.forEach((row, i) => {
  const r = i + 2;
  fire.getCell(`A${r}`).value = row[0];
  computed(fire.getCell(`B${r}`), row[1], row[2]);
  fire.getCell(`C${r}`).value = row[3];
  fire.getCell(`C${r}`).font = { color: { argb: "FF6B7280" }, size: 10 };
});

// ---------------------------------------------------------------------------
// 5) Drawdown
// ---------------------------------------------------------------------------
const dd = wb.addWorksheet("Drawdown");
const ddHeaders = [
  "Year",
  "Age",
  "Start balance",
  "Withdrawal need (net)",
  "Withdrawal (gross of tax)",
  "Growth",
  "End balance (nominal)",
  "End balance (real)",
];
dd.addRow(ddHeaders);
styleHeaderRow(dd.getRow(1));
ddHeaders.forEach((_, i) => (dd.getColumn(i + 1).width = i === 0 ? 8 : 22));

for (let n = 1; n <= DRAW_ROWS; n++) {
  const r = n + 1;
  const prev = r - 1;
  const A = `A${r}`, B = `B${r}`, C = `C${r}`, D = `D${r}`, E = `E${r}`, F = `F${r}`, G = `G${r}`, H = `H${r}`;
  // yearsFromStart for inflation scaling = (fireAge - currentAge) + n - 1
  const yfs = `(fireAge-currentAge)+${n}-1`;
  const age = `fireAge+${n}-1`;
  const active = `(${age}) <= endAge`;

  computedNum(dd.getCell(A), n, "0");
  computed(dd.getCell(B), age, "0");
  // Seed from the projected NOMINAL portfolio at FIRE age (consistent with the
  // nominal, inflation-scaled withdrawals below). Falls back to 0 if not reached.
  if (n === 1)
    computed(dd.getCell(C), `IFERROR(INDEX(Accumulation!$G:$G, MATCH(fireAge, Accumulation!$B:$B, 0)), 0)`, eur);
  else computed(dd.getCell(C), `MAX(0, G${prev})`, eur);
  // Net need: desired income (+health), inflation-scaled, minus net pension once at pension age
  computed(
    dd.getCell(D),
    `IF(${active}, MAX(0, (desiredIncome+healthMonthly)*12*(1+inflation/100)^(${yfs}) - IF((${age})>=pensionAge, statePension*12*(1+inflation/100)^(${yfs}), 0)), 0)`,
    eur,
  );
  // Gross up for withdrawal tax drag
  computed(dd.getCell(E), `${D}*(1+withdrawalTaxDrag/100)`, eur);
  // Growth on the balance net of the withdrawal, at the conservative return
  computed(dd.getCell(F), `IF(${active}, MAX(0, ${C}-${E})*(expReturn-drawReturnDed)/100, 0)`, eur);
  computed(dd.getCell(G), `IF(${active}, MAX(0, ${C}-${E}+${F}), "")`, eur);
  computed(dd.getCell(H), `IF(${active}, ${G}/(1+inflation/100)^(${yfs}+1), "")`, eur);
}

// ---------------------------------------------------------------------------
// 6) Sensitivity
// ---------------------------------------------------------------------------
const sens = wb.addWorksheet("Sensitivity");
sens.getColumn(1).width = 22;
sens.getColumn(2).width = 26;
sens.getColumn(3).width = 26;
sens.addRow(["Expected return", "Required monthly savings", "Nominal target at FIRE age"]);
styleHeaderRow(sens.getRow(1));
// Required level payment (annuity) to reach the nominal target from starting
// capital over the accumulation horizon, for a grid of returns.
const returns = [4, 5, 6, 7, 8, 9, 10];
returns.forEach((rr, i) => {
  const r = i + 2;
  const N = `(fireAge-currentAge)`;
  const rate = `${rr}/100`;
  // Nominal target = pension-aware FIRE number grown by inflation to FIRE age
  const target = `'FIRE number'!B9*(1+inflation/100)^${N}`;
  inputCell(sens.getCell(`A${r}`), rr, pct);
  sens.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.computed } };
  sens.getCell(`A${r}`).font = { bold: false };
  computed(sens.getCell(`C${r}`), target, eur);
  // FV of annuity due-ish (end of year) solving for annual payment, then /12
  computed(
    sens.getCell(`B${r}`),
    `MAX(0, (C${r} - startCapital*(1+${rate})^${N}) * (${rate}) / (((1+${rate})^${N})-1) / 12)`,
    eur,
  );
});

// ---------------------------------------------------------------------------
// 7) Dashboard
// ---------------------------------------------------------------------------
const dash = wb.addWorksheet("Dashboard", { properties: { tabColor: { argb: COLORS.accent } } });
dash.getColumn(1).width = 44;
dash.getColumn(2).width = 24;
dash.getCell("A1").value = "KPI Dashboard";
dash.getCell("A1").font = { bold: true, size: 16 };
const kpis = [
  ["FIRE number (pension-aware)", `'FIRE number'!B9`, eur],
  ["FIRE number (simple SWR)", `'FIRE number'!B4`, eur],
  ["Projected real portfolio at FIRE age", `'FIRE number'!B10`, eur],
  ["Surplus / shortfall (real)", `'FIRE number'!B11`, eur],
  ["Years to FIRE", `fireAge-currentAge`, "0"],
  ["Desired annual income (today's €)", `(desiredIncome+healthMonthly)*12`, eur],
  ["Sustainable income at SWR", `'FIRE number'!B9*swr/100`, eur],
  ["Portfolio at end of plan (real)", `INDEX(Drawdown!$H:$H, MATCH(endAge, Drawdown!$B:$B, 0))`, eur],
];
kpis.forEach((k, i) => {
  const r = i + 3;
  dash.getCell(`A${r}`).value = k[0];
  dash.getCell(`A${r}`).font = { bold: true };
  computed(dash.getCell(`B${r}`), k[1], k[2]);
});

// ---------------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
await wb.xlsx.writeFile(OUT_FILE);
console.log(`✔ Workbook written to ${OUT_FILE}`);
