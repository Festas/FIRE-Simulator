// ---------------------------------------------------------------------------
// Export utilities — XLSX and PDF export for FIRE simulation data
// ---------------------------------------------------------------------------

import type { FireResult, YearDataPoint, FireInputs } from "@/lib/fireCalculations";
import type { Translations } from "@/lib/i18n/translations";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

interface ExportContext {
  result: FireResult;
  inputs: FireInputs;
  t: Translations;
  formatCurrency: (value: number) => string;
}

function getPhaseLabel(d: YearDataPoint, t: Translations): string {
  if (d.isDrawdownPhase) return t.phaseWithdrawal;
  if (d.isFreistellungsPhase) return t.phaseFreistellung;
  if (d.isCoastPhase) return t.phaseCoast;
  if (d.isLZKPhase) return t.phaseLzk;
  return t.phaseSaving;
}

function getAllData(result: FireResult): YearDataPoint[] {
  return [...result.yearlyData, ...result.drawdownData];
}

function getHeaders(t: Translations): string[] {
  return [
    t.calendarYear,
    t.tableAge,
    t.tableEtf,
    t.tableLzk,
    t.tableTotal,
    t.tableSavingsMonth,
    t.tableGains,
    t.tableTaxes,
    t.tableWithdrawal,
    t.tablePhase,
  ];
}

function getRow(d: YearDataPoint, t: Translations): (string | number)[] {
  return [
    d.calendarYear,
    d.age,
    Math.round(d.etfBalanceReal),
    Math.round(d.lzkBalanceReal),
    Math.round(d.totalReal),
    Math.round(d.monthlySavings),
    Math.round(d.annualGains),
    Math.round(d.taxPaid),
    Math.round(d.annualWithdrawal),
    getPhaseLabel(d, t),
  ];
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// XLSX Export (ExcelJS)
// ---------------------------------------------------------------------------

export async function exportXLSX(ctx: ExportContext): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");
  const { result, t } = ctx;

  const wb = new ExcelJS.Workbook();
  wb.creator = "FIRE Simulator";
  wb.created = new Date();

  const ws = wb.addWorksheet(t.tableTitle ?? "Simulation");

  const headers = getHeaders(t);
  const headerRow = ws.addRow(headers);

  // Style the header row
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F294D" },
    };
    cell.alignment = { horizontal: "center" };
  });

  const allData = getAllData(result);
  for (const d of allData) {
    const row = getRow(d, t);
    const wsRow = ws.addRow(row);

    // Apply number format for currency columns (cols 3–9, 1-indexed)
    for (let colIdx = 3; colIdx <= 9; colIdx++) {
      const cell = wsRow.getCell(colIdx);
      cell.numFmt = "#,##0";
    }

    // Colour-code by phase
    let bgColor: string | undefined;
    if (d.isDrawdownPhase) bgColor = "FFFFF7ED"; // amber-50
    else if (d.isFreistellungsPhase) bgColor = "FFFFF7ED";
    else if (d.isCoastPhase) bgColor = "FFF5F3FF"; // violet-50
    else if (d.isLZKPhase) bgColor = "FFEFF6FF"; // blue-50

    if (bgColor) {
      wsRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
      });
    }
  }

  // Auto-fit column widths (approximate)
  ws.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 4, 30);
  });

  // Auto-filter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: allData.length + 1, column: headers.length },
  };

  // Generate blob and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fire-simulation-${dateStamp()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// PDF Export (jsPDF + jsPDF-AutoTable)
// ---------------------------------------------------------------------------

export async function exportPDF(ctx: ExportContext): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const { result, inputs, t, formatCurrency } = ctx;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // --- Title page / header ---
  doc.setFontSize(18);
  doc.setTextColor(15, 41, 77); // #0f294d
  doc.text(t.appTitle, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`${t.appSubtitle}  ·  ${dateStamp()}`, 14, 27);

  // --- KPI summary ---
  doc.setFontSize(12);
  doc.setTextColor(15, 41, 77);
  doc.text("Key Metrics", 14, 38);

  const yearsToFire = result.fullFireYear ?? 0;
  const fireReached = result.targetReached && result.fullFireAge !== null;
  const mcSuccess = (result.monteCarlo.successRate * 100).toFixed(0);

  const kpiData: string[][] = [
    [
      t.kpiFireNumber,
      formatCurrency(result.derivedFireNumber),
    ],
    [
      t.kpiFullFire,
      fireReached
        ? `${t.kpiAgeLabel(result.fullFireAge!)} (${yearsToFire} ${t.tableYear})`
        : t.kpiSavingsRateIncrease,
    ],
    [
      t.kpiPassiveIncome,
      `${formatCurrency(result.passiveIncomeAtExit)} / ${t.perMonth}`,
    ],
    [
      `SWR`,
      `${result.swRate.toFixed(1)}%`,
    ],
    [
      t.kpiMonteCarlo,
      `${mcSuccess}%`,
    ],
    [
      t.kpiRequiredSavings,
      `${formatCurrency(result.requiredSparrate)} / M`,
    ],
    [
      t.kpiSavingsRate,
      `${result.sparquote.toFixed(1)}%`,
    ],
    [
      t.kpiDrawdownPhase,
      result.drawdownSurvives
        ? t.kpiPortfolioSurvives
        : result.drawdownDepletionYear
          ? t.kpiPortfolioDepleted(result.drawdownDepletionYear)
          : "—",
    ],
  ];

  autoTable(doc, {
    startY: 42,
    head: [["Metric", "Value"]],
    body: kpiData,
    theme: "striped",
    headStyles: { fillColor: [15, 41, 77], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 14 },
    tableWidth: 120,
  });

  // --- Input parameters summary (right side of KPIs) ---
  const inputData: string[][] = [
    [t.desiredIncome, formatCurrency(inputs.monatlichesWunschEinkommen)],
    [t.statePension, formatCurrency(inputs.gesetzlicheRente)],
    [t.retirementAge, String(inputs.renteneintrittsalter)],
    [t.startCapital, formatCurrency(inputs.startKapital)],
    [t.monthlySavings, formatCurrency(inputs.monatlicheSparrate)],
    [t.dynamicSavings, `${inputs.dynamikSparrate}%`],
    [t.expectedReturn, `${inputs.etfRendite}%`],
    [t.inflationRate, `${inputs.inflation}%`],
  ];

  autoTable(doc, {
    startY: 42,
    head: [["Parameter", "Value"]],
    body: inputData,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 150 },
    tableWidth: 120,
  });

  // --- Yearly data table ---
  doc.addPage("a4", "landscape");
  doc.setFontSize(14);
  doc.setTextColor(15, 41, 77);
  doc.text(t.tableTitle ?? "Yearly Data", 14, 16);

  const headers = getHeaders(t);
  const allData = getAllData(result);
  const tableBody = allData.map((d) => {
    const row = getRow(d, t);
    // Format numbers for readability in the PDF
    return row.map((v, i) =>
      typeof v === "number" && i >= 2 && i <= 8 ? v.toLocaleString() : String(v),
    );
  });

  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [15, 41, 77], textColor: 255, fontStyle: "bold", fontSize: 7 },
    styles: { fontSize: 6.5, cellPadding: 1.5 },
    margin: { left: 8, right: 8 },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const d = allData[data.row.index];
      if (!d) return;
      if (d.isDrawdownPhase) data.cell.styles.fillColor = [255, 247, 237];
      else if (d.isFreistellungsPhase) data.cell.styles.fillColor = [255, 247, 237];
      else if (d.isCoastPhase) data.cell.styles.fillColor = [245, 243, 255];
      else if (d.isLZKPhase) data.cell.styles.fillColor = [239, 246, 255];
    },
  });

  // Save
  doc.save(`fire-simulation-${dateStamp()}.pdf`);
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

export function exportCSV(ctx: ExportContext): void {
  const { result, t } = ctx;
  const allData = getAllData(result);
  const headers = getHeaders(t);

  // Escape CSV fields that may contain commas or quotes
  const escapeField = (field: string | number): string => {
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [headers.map(escapeField).join(",")];
  for (const d of allData) {
    lines.push(getRow(d, t).map(escapeField).join(","));
  }

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fire-simulation-${dateStamp()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// JSON Scenario Export / Import
// ---------------------------------------------------------------------------

export function exportScenarioJSON(inputs: FireInputs): void {
  const json = JSON.stringify(inputs, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fire-scenario-${dateStamp()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a scenario from a JSON file. Returns the parsed FireInputs
 * or throws if the file is invalid.
 */
export function importScenarioJSON(file: File): Promise<FireInputs> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        // Validate required fields
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          typeof parsed.startKapital !== "number" ||
          typeof parsed.monatlicheSparrate !== "number" ||
          typeof parsed.etfRendite !== "number"
        ) {
          throw new Error("Invalid scenario file: missing required fields");
        }
        resolve(parsed as FireInputs);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
