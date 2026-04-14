// ---------------------------------------------------------------------------
// Example FIRE plans — realistic, achievable scenarios for every income group
// All values are in EUR. Each plan uses Monte Carlo via the standard engine.
// ---------------------------------------------------------------------------

import type { FireInputs } from "@/lib/fireCalculations";

export interface ExamplePlan {
  /** Translation key for the plan name */
  nameKey: string;
  /** Translation key for the short description */
  descKey: string;
  /** Full FireInputs to load */
  inputs: FireInputs;
}

/** Base year used for all example plans — will be updated to the current year at load time */
const BASE_YEAR = 2026;

/**
 * Helper to compute a FIRE number from monthly gap and SWR.
 */
function fireNumber(monthlyIncome: number, pension: number, swr: number): number {
  const gap = Math.max(0, monthlyIncome - pension);
  return swr > 0 ? Math.round((gap * 12) / (swr / 100)) : 0;
}

export const EXAMPLE_PLANS: ExamplePlan[] = [
  // -----------------------------------------------------------------------
  // 1. Student / Career Starter — very low income, tiny savings
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanStudentStarter",
    descKey: "examplePlanStudentStarterDesc",
    inputs: {
      startKapital: 1_000,
      monatlicheSparrate: 300,
      dynamikSparrate: 3.0,       // aggressive salary growth expected early
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 0,            // no employer pension yet
      zielvermoegen: fireNumber(2_000, 800, 3.5),
      lzkJahre: 2,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 22,
      monatlichesWunschEinkommen: 2_000,
      gesetzlicheRente: 800,
      swr: 3.5,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 1_800,
      lifeEvents: [],
    },
  },

  // -----------------------------------------------------------------------
  // 2. Blue-Collar / Skilled Worker — modest income, steady saver
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanBlueCollar",
    descKey: "examplePlanBlueCollarDesc",
    inputs: {
      startKapital: 5_000,
      monatlicheSparrate: 400,
      dynamikSparrate: 2.0,
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 2_400,        // small employer pension
      zielvermoegen: fireNumber(2_200, 1_000, 3.5),
      lzkJahre: 2,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 25,
      monatlichesWunschEinkommen: 2_200,
      gesetzlicheRente: 1_000,
      swr: 3.5,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 2_200,
      lifeEvents: [],
    },
  },

  // -----------------------------------------------------------------------
  // 3. Median Earner — the classic FIRE path
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanMedianEarner",
    descKey: "examplePlanMedianEarnerDesc",
    inputs: {
      startKapital: 15_000,
      monatlicheSparrate: 800,
      dynamikSparrate: 2.0,
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 4_000,
      zielvermoegen: fireNumber(3_000, 1_200, 3.5),
      lzkJahre: 3,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 30,
      monatlichesWunschEinkommen: 3_000,
      gesetzlicheRente: 1_200,
      swr: 3.5,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 3_000,
      lifeEvents: [],
    },
  },

  // -----------------------------------------------------------------------
  // 4. Dual Income Couple — two earners, higher target
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanDualIncome",
    descKey: "examplePlanDualIncomeDesc",
    inputs: {
      startKapital: 40_000,
      monatlicheSparrate: 1_800,
      dynamikSparrate: 2.0,
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 8_000,        // both partners contribute
      zielvermoegen: fireNumber(4_500, 2_400, 3.5),
      lzkJahre: 3,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 32,
      monatlichesWunschEinkommen: 4_500,
      gesetzlicheRente: 2_400,
      swr: 3.5,
      steuerModell: "couple",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 5_500,
      lifeEvents: [],
    },
  },

  // -----------------------------------------------------------------------
  // 5. High Earner — aggressive savings, early FIRE
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanHighEarner",
    descKey: "examplePlanHighEarnerDesc",
    inputs: {
      startKapital: 80_000,
      monatlicheSparrate: 3_000,
      dynamikSparrate: 2.0,
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 8_000,
      zielvermoegen: fireNumber(5_000, 1_500, 3.5),
      lzkJahre: 3,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 28,
      monatlichesWunschEinkommen: 5_000,
      gesetzlicheRente: 1_500,
      swr: 3.5,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 6_500,
      lifeEvents: [],
    },
  },

  // -----------------------------------------------------------------------
  // 6. Late Starter — proves it's never too late
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanLateStarter",
    descKey: "examplePlanLateStarterDesc",
    inputs: {
      startKapital: 20_000,
      monatlicheSparrate: 1_200,
      dynamikSparrate: 1.5,
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 4_800,
      zielvermoegen: fireNumber(3_000, 1_500, 3.5),
      lzkJahre: 2,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 40,
      monatlichesWunschEinkommen: 3_000,
      gesetzlicheRente: 1_500,
      swr: 3.5,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "kapitalverzehr",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 3_500,
      lifeEvents: [],
    },
  },

  // -----------------------------------------------------------------------
  // 7. Extreme Saver — 62% savings rate, FIRE in ~10 years
  // -----------------------------------------------------------------------
  {
    nameKey: "examplePlanAggressiveSaver",
    descKey: "examplePlanAggressiveSaverDesc",
    inputs: {
      startKapital: 10_000,
      monatlicheSparrate: 2_500,
      dynamikSparrate: 2.0,
      etfRendite: 7.0,
      inflation: 2.5,
      bavJaehrlich: 4_000,
      zielvermoegen: fireNumber(2_500, 800, 3.5),
      lzkJahre: 2,
      lzkRendite: 3.5,
      startYear: BASE_YEAR,
      currentAge: 25,
      monatlichesWunschEinkommen: 2_500,
      gesetzlicheRente: 800,
      swr: 3.5,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: "DE",
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: 4_000,
      lifeEvents: [],
    },
  },
];
