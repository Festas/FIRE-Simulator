// ---------------------------------------------------------------------------
// Internationalization (i18n) — German + English translations
// ---------------------------------------------------------------------------

export type Locale = "de" | "en";

export interface Translations {
  // App
  appTitle: string;
  appSubtitle: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  menuOpen: string;
  exportImport: string;
  xlsxExport: string;
  pdfExport: string;
  csvExport: string;
  jsonExport: string;
  jsonImport: string;
  exportError: string;
  importError: string;
  importSuccess: string;
  live: string;

  // Sidebar sections
  retirementGoals: string;
  savingsPhase: string;
  returnMarket: string;
  taxes: string;
  withdrawalStrategy: string;
  lzkSection: string;
  manualTarget: string;

  // Arbeitszeitkonto sidebar fields
  azkEnabled: string;
  azkEnabledTooltip: string;
  azkHoursPerYear: string;
  azkHoursPerYearSub: string;
  azkHoursPerYearTooltip: string;
  azkWeeklyHours: string;
  azkWeeklyHoursSub: string;
  azkWeeklyHoursTooltip: string;
  azkFreistellungDuration: string;

  // KPI cards — Freistellung
  kpiFreistellungStart: string;
  kpiFreistellungStartSub: string;
  kpiFreistellungEnd: string;
  kpiFreistellungEndSub: string;
  kpiFreistellungDuration: (years: string) => string;

  // Sidebar fields
  desiredIncome: string;
  desiredIncomeSub: string;
  desiredIncomeTooltip: string;
  statePension: string;
  statePensionSub: string;
  statePensionTooltip: string;
  swr: string;
  swrSub: string;
  swrTooltip: string;
  startCapital: string;
  startCapitalSub: string;
  startCapitalTooltip: string;
  monthlySavings: string;
  monthlySavingsSub: string;
  monthlySavingsTooltip: string;
  dynamicSavings: string;
  dynamicSavingsSub: string;
  dynamicSavingsTooltip: string;
  netIncome: string;
  netIncomeSub: string;
  netIncomeTooltip: string;
  bavContribution: string;
  bavContributionSub: string;
  bavContributionTooltip: string;
  expectedReturn: string;
  expectedReturnSub: string;
  expectedReturnTooltip: string;
  inflationRate: string;
  inflationRateSub: string;
  inflationRateTooltip: string;
  taxFiling: string;
  taxFilingTooltip: string;
  taxFilingSingle: string;
  taxFilingCouple: string;
  churchTax: string;
  churchTaxTooltip: string;
  withdrawalMode: string;
  withdrawalModeTooltip: string;
  withdrawalPreserve: string;
  withdrawalSpend: string;
  withdrawalDuration: string;
  withdrawalDurationSub: string;
  withdrawalDurationTooltip: string;
  lzkPhase: string;
  lzkPhaseSub: string;
  lzkPhaseTooltip: string;
  lzkReturn: string;
  lzkReturnSub: string;
  lzkReturnTooltip: string;
  targetWealth: string;
  targetWealthSub: string;
  targetWealthTooltip: string;
  targetWealthOverride: string;
  targetWealthOverrideTooltip: string;
  targetWealthAuto: string;
  simulationStart: string;

  // Formatters
  years: string;
  perYear: string;
  perMonth: string;

  // KPI Cards
  kpiFullFire: string;
  kpiPassiveIncome: string;
  kpiCoastFire: string;
  kpiFireNumber: string;
  kpiDrawdownPhase: string;
  kpiTotalTaxes: string;
  kpiRequiredSavings: string;
  kpiSavingsRate: string;
  kpiLzkStart: string;
  kpiTargetReached: (years: number, target: string) => string;
  kpiTargetNotReached: string;
  kpiYearLabel: (year: number) => string;
  kpiAgeLabel: (age: number) => string;
  kpiOver30Years: string;
  kpiThreshold: (amount: string) => string;
  kpiGapPerMonth: (amount: string) => string;
  kpiPortfolioSurvives: string;
  kpiPortfolioDepleted: (year: number) => string;
  kpiCapitalSpend: (years: number) => string;
  kpiPerpetualIncome: string;
  kpiEffectiveTaxRate: (rate: string) => string;
  kpiCurrentSavings: (amount: string) => string;
  kpiSavingsRateSub: (savings: string, net: string) => string;
  kpiLzkStartSub: string;
  kpiSavingsRateIncrease: string;

  // Chart
  chartTitle: string;
  chartSubtitle: string;
  chartScenarios: string;
  chartScenariosHide: string;
  chartTarget: (amount: string) => string;

  // Drawdown Chart
  drawdownTitle: string;
  drawdownPerpetualSub: (amount: string) => string;
  drawdownSpendSub: (years: number) => string;
  drawdownSurvives40: string;
  drawdownDepleted: (year: number) => string;
  drawdownNoTarget: string;

  // Monte Carlo
  monteCarloTitle: string;
  monteCarloSubtitle: string;
  monteCarloSuccess: (rate: string) => string;
  monteCarloMedian: string;
  monteCarloP10: string;
  monteCarloP25: string;
  monteCarloP75: string;
  monteCarloP90: string;
  monteCarloSimulations: string;

  // Detail Table
  tableTitle: string;
  tableSubtitle: string;
  tableYear: string;
  tableAge: string;
  tableEtf: string;
  tableLzk: string;
  tableTotal: string;
  tableSavingsMonth: string;
  tableGains: string;
  tableTaxes: string;
  tableWithdrawal: string;
  tablePhase: string;
  phaseWithdrawal: string;
  phaseLzk: string;
  phaseSaving: string;
  phaseFreistellung: string;
  phaseCoast: string;

  // Phases Timeline
  phasesTitle: string;
  phasesSubtitle: string;
  phase1Title: string;
  phase1Subtitle: string;
  phase1Desc: string;
  phase2Title: string;
  phase2Subtitle: string;
  phase2Desc: string;
  phase3Title: string;
  phase3Subtitle: string;
  phase3Desc: string;
  phase4Title: string;
  phase4Subtitle: string;
  phase4Desc: string;
  phase5Title: string;
  phase5Subtitle: string;
  phase5Desc: (swr: string) => string;
  phaseCritical: string;

  // Warnings
  warnReturnBelowInflation: (ret: string, inf: string) => string;
  warnNoCapitalNoSavings: string;
  warnIncomeAbovePension: string;
  warnHighSwr: string;
  warnHighReturn: string;
  warnSavingsExceedIncome: string;
  warnPensionAgeTooLow: string;
  warnDesiredIncomeHigh: string;

  // Disclaimer
  disclaimer: string;

  // Dark mode
  darkMode: string;
  lightMode: string;

  // Language
  language: string;

  // Chart labels (i18n)
  chartLabelETF: string;
  chartLabelLZK: string;
  chartLabelTotal: string;
  chartLabelOptimistic: string;
  chartLabelPessimistic: string;
  chartLabelRealistic: string;
  chartLabelPortfolio: string;
  chartLabelWithdrawal: string;
  calendarYear: string;

  // Share / Copy
  shareLink: string;
  linkCopied: string;

  // Reset
  resetDefaults: string;
  resetConfirm: string;

  // Current age
  currentAge: string;
  currentAgeSub: string;
  currentAgeTooltip: string;
  retirementAge: string;
  retirementAgeSub: string;
  retirementAgeTooltip: string;

  // Life events — savings rate change
  lifeEventSavingsRateChange: string;

  // Inflation-adjusted spending at FIRE
  kpiInflationAdjustedSpending: string;
  kpiInflationAdjustedSpendingSub: (today: string, atFire: string, years: number) => string;

  // Reverse Planner
  reversePlannerTab: string;
  forwardSimTab: string;
  reversePlannerTitle: string;
  reversePlannerSubtitle: string;
  reverseTargetIncome: string;
  reverseTargetIncomeSub: string;
  reverseTargetYears: string;
  reverseTargetYearsSub: string;
  reverseExitAge: string;
  reverseExitAgeSub: string;
  reverseResultSavings: string;
  reverseResultFireNumber: string;
  reverseResultMonteCarlo: string;
  reverseCalculate: string;
  reverseProjectionTitle: string;
  reverseProjectionSubtitle: string;
  reverseReturnRate: string;
  reverseReturnRateSub: string;
  reverseInflation: string;
  reverseInflationSub: string;
  reverseSwr: string;
  reverseSwrSub: string;
  reverseTotalTaxPaid: string;
  reversePassiveIncome: string;
  reversePassiveIncomeSub: string;
  reverseCoastFireYear: string;
  reverseCoastFireYearSub: string;
  reverseCoastFireNone: string;
  reverseSavingsRate: string;
  reverseSavingsRateSub: (savings: string, net: string) => string;
  reverseDrawdownTitle: string;
  reverseDrawdownSubtitle: string;
  reverseDrawdownSurvives: string;
  reverseDrawdownDepleted: (year: number) => string;
  reverseMonteCarloTitle: string;
  reverseMonteCarloSubtitle: string;
  reverseSensitivityTitle: string;
  reverseSensitivitySubtitle: string;
  reverseSensitivityReturn: string;
  reverseSensitivitySavings: string;
  reverseSensitivityFireNum: string;
  reverseCurrentVsRequired: string;
  reverseCurrentLine: string;
  reverseRequiredLine: string;
  reverseTableTitle: string;
  reverseTableSubtitle: string;

  // MC-backed savings
  reverseMcRecommendedSavings: string;
  reverseMcRecommendedSavingsSub: string;
  reverseMcSuccessRate: string;
  reverseMcSuccessRateSub: string;
  reverseDeterministicSavings: string;
  reverseDeterministicSavingsSub: string;
  reverseAccMcTitle: string;
  reverseAccMcSubtitle: string;
  reverseMcConfidenceBadge: (pct: number) => string;

  // Age-based savings analysis
  reverseAgeSavingsTitle: string;
  reverseAgeSavingsSubtitle: string;
  reverseAgeSavingsAge: string;
  reverseAgeSavingsMc: string;
  reverseAgeSavingsDet: string;
  reverseAgeSavingsFireNum: string;
  reverseAgeSavingsSuccessRate: string;
  reverseAgeSavingsYears: string;
  reverseAgeSavingsChartLabel: string;
  reverseAgeSavingsDetLabel: string;

  // Presets
  presetConservative: string;
  presetBalanced: string;
  presetAggressive: string;
  presetLabel: string;
  presetConservativeDesc: string;
  presetBalancedDesc: string;
  presetAggressiveDesc: string;

  // Error Boundary
  errorTitle: string;
  errorMessage: string;
  errorRetry: string;

  // Milestone labels
  coastFireLabel: string;
  fullFireLabel: string;

  // KPI Monte Carlo title
  kpiMonteCarlo: string;

  // Phase label
  phaseLabel: (n: number) => string;

  // Tax Country
  taxCountry: string;
  taxCountryTooltip: string;
  taxCountryDE: string;
  taxCountryUS: string;
  taxCountryUK: string;
  taxCountryCH: string;
  taxCountryAT: string;
  taxCountryNL: string;
  taxCountryCA: string;
  taxCountryAU: string;
  taxCountryFR: string;

  // Life Events
  lifeEventsSection: string;
  lifeEventsAdd: string;
  lifeEventsName: string;
  lifeEventsType: string;
  lifeEventsStartYear: string;
  lifeEventsEndYear: string;
  lifeEventsAmount: string;
  lifeEventsInflationAdj: string;
  lifeEventsRemove: string;
  lifeEventHomePurchase: string;
  lifeEventChild: string;
  lifeEventCareerChange: string;
  lifeEventInheritance: string;
  lifeEventPensionStart: string;
  lifeEventHealthcare: string;
  lifeEventOneTimeExpense: string;
  lifeEventOneTimeIncome: string;
  lifeEventSideIncome: string;
  lifeEventsEmpty: string;

  // Scenarios
  scenariosSection: string;
  scenariosSave: string;
  scenariosLoad: string;
  scenariosDelete: string;
  scenariosName: string;
  scenariosNamePrompt: string;
  scenariosCurrent: string;
  scenariosEmpty: string;

  // Lifecycle Monte Carlo
  lifecycleMCTitle: string;
  lifecycleMCSubtitle: string;
  lifecycleMCSuccess: (rate: string) => string;
  lifecycleMCYearsToFire: string;
  lifecycleMCP50Years: (age: string) => string;
  lifecycleMCRange: (p10: string, p90: string) => string;

  // Example Plans
  examplePlansSection: string;
  examplePlansSelect: string;
  examplePlansDescription: string;
  examplePlanStudentStarter: string;
  examplePlanStudentStarterDesc: string;
  examplePlanBlueCollar: string;
  examplePlanBlueCollarDesc: string;
  examplePlanMedianEarner: string;
  examplePlanMedianEarnerDesc: string;
  examplePlanDualIncome: string;
  examplePlanDualIncomeDesc: string;
  examplePlanHighEarner: string;
  examplePlanHighEarnerDesc: string;
  examplePlanLateStarter: string;
  examplePlanLateStarterDesc: string;
  examplePlanAggressiveSaver: string;
  examplePlanAggressiveSaverDesc: string;

  // No-investment comparison
  noInvestmentLabel: string;
  noInvestmentTooltip: string;
  chartLabelNoInvestment: string;

  // Simple / Advanced mode (legacy)
  simpleMode: string;
  advancedMode: string;
  simpleModeHint: string;

  // Sidebar section headers
  mainParameters: string;
  adjustments: string;

  // Onboarding wizard
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingStep1Title: string;
  onboardingStep1Desc: string;
  onboardingStep2Title: string;
  onboardingStep2Desc: string;
  onboardingStep3Title: string;
  onboardingStep3Desc: string;
  onboardingStep4Title: string;
  onboardingStep4Desc: string;
  onboardingNext: string;
  onboardingBack: string;
  onboardingFinish: string;
  onboardingSkip: string;
  onboardingAgeLabel: string;
  onboardingIncomeLabel: string;
  onboardingSavingsLabel: string;
  onboardingDesiredIncomeLabel: string;
  onboardingCountryLabel: string;
  onboardingStartCapitalLabel: string;

  // Dashboard sections
  sectionFireJourney: string;
  sectionFireJourneyDesc: string;
  sectionStressTesting: string;
  sectionStressTestingDesc: string;
  sectionDrawdownAnalysis: string;
  sectionDrawdownAnalysisDesc: string;
  sectionPlanning: string;
  sectionPlanningDesc: string;

  // Undo / Redo
  undo: string;
  redo: string;

  // FIRE Progress Gauge
  fireProgressTitle: string;
  fireProgressSub: string;
  fireProgressComplete: string;
  fireProgressOf: string;

  // Contextual Guidance Card
  guidanceOnTrack: (fireAge: number, yearsEarly: number) => string;
  guidanceNeedMore: (amount: string) => string;
  guidanceAlreadyFire: string;
  guidanceNoTarget: string;
  guidanceTip: string;
  guidanceMcWarning: (pct: string) => string;
  guidanceMcGood: (pct: string) => string;
  guidanceSavingsLow: (current: string, required: string) => string;
  guidanceSavingsGood: string;

  // Nominal/Real Toggle
  showNominal: string;
  showReal: string;
  nominalTooltip: string;

  // Country-Specific Defaults
  applyCountryDefaults: string;
  countryDefaultsApplied: string;

  // Onboarding Result Preview
  onboardingPreviewTitle: string;
  onboardingPreviewFireAge: (age: number) => string;
  onboardingPreviewFireNumber: string;
  onboardingPreviewNotReachable: string;

  // --- NEW: Education Hub / Learn modal ---
  learnButton: string;
  learnTitle: string;
  learnClose: string;
  learnWhatIsFire: string;
  learnWhatIsFireDesc: string;
  learnFireNumber: string;
  learnFireNumberDesc: string;
  learnSwr: string;
  learnSwrDesc: string;
  learnCoastFire: string;
  learnCoastFireDesc: string;
  learnMonteCarlo: string;
  learnMonteCarloDesc: string;
  learnDrawdown: string;
  learnDrawdownDesc: string;
  learnSavingsRate: string;
  learnSavingsRateDesc: string;
  learnCompoundInterest: string;
  learnCompoundInterestDesc: string;

  // --- NEW: Education panel (What is FIRE?) on dashboard ---
  fireEducationTitle: string;
  fireEducationBody: string;
  fireEducationDismiss: string;
  fireEducationShowAgain: string;

  // --- NEW: Revamped onboarding (story-driven) ---
  onboardingStep1DescStory: string;
  onboardingStep2DescStory: string;
  onboardingStep3DescStory: string;
  onboardingStep4DescStory: string;
  onboardingBenchmarkAge: string;
  onboardingBenchmarkIncome: (currency: string) => string;
  onboardingBenchmarkSavings: (currency: string) => string;
  onboardingBenchmarkDesiredIncome: (currency: string) => string;
  onboardingUseCountryAvg: string;
  onboardingQuickResultTitle: string;
  onboardingQuickResultBody: (age: number) => string;
  onboardingQuickResultCelebrate: string;

  // --- NEW: Beginner-friendly terminology ---
  beginnerFireNumber: string;
  beginnerCoastFire: string;
  beginnerMonteCarlo: string;
  beginnerDrawdown: string;
  beginnerSwr: string;
  beginnerSavingsRate: string;
  beginnerPassiveIncome: string;
  beginnerWithdrawalPreserve: string;
  beginnerWithdrawalSpend: string;

  // --- NEW: Dashboard mode toggle ---
  modeBeginner: string;
  modeStandard: string;
  modeAdvanced: string;
  modeLabel: string;

  // --- NEW: Beginner Journey Card ---
  beginnerJourneyTitle: string;
  beginnerJourneySavings: (amount: string) => string;
  beginnerJourneyFireAge: (age: number) => string;
  beginnerJourneyFireNumber: (amount: string) => string;
  beginnerJourneyProgress: (pct: string) => string;
  beginnerJourneyTips: string;
  beginnerTipSaveMore: string;
  beginnerTipStartEarly: string;
  beginnerTipReduceSpending: string;
  beginnerTipInvest: string;

  // --- NEW: Actionable guidance ---
  guidanceActionRetireEarlier: (amount: string) => string;
  guidanceActionMcLow: (amount: string) => string;
  guidanceActionSavingsLow: string;
  guidanceActionAlreadyFire: string;

  // --- NEW: What If? panel ---
  whatIfTitle: string;
  whatIfSaveMore: (amount: string) => string;
  whatIfRetireLater: string;
  whatIfLessIncome: string;
  whatIfYearsEarlier: (n: number) => string;
  whatIfYearsLater: (n: number) => string;
  whatIfNoChange: string;

  // --- NEW: Chart explainers ---
  chartExplainButton: string;
  chartExplainFireChart: string;
  chartExplainMonteCarloChart: string;
  chartExplainDrawdownChart: string;
  chartExplainLifecycleChart: string;
  chartSummaryFireChart: (age: number | null) => string;
  chartSummaryMonteCarloChart: (pct: string) => string;
  chartSummaryDrawdownChart: (survives: boolean) => string;

  // --- NEW: Milestones ---
  milestonesTitle: string;
  milestonesStart: string;
  milestones25: string;
  milestonesCoast: string;
  milestones75: string;
  milestonesFire: string;
  milestonesNextTitle: string;
  milestonesNextBody: (amount: string, months: number) => string;
  milestonesCompleted: string;

  // --- NEW: FIRE Score ---
  fireScoreTitle: string;
  fireScoreSub: string;
  fireScoreExcellent: string;
  fireScoreGreat: string;
  fireScoreGood: string;
  fireScoreNeedsWork: string;
  fireScoreSavingsRate: string;
  fireScoreTimeline: string;
  fireScoreMonteCarlo: string;
  fireScoreDrawdown: string;

  // --- NEW: Accessibility ---
  skipToContent: string;
  chartAltFireChart: string;
  chartAltMonteCarloChart: string;
  chartAltDrawdownChart: string;
}

export const de: Translations = {
  appTitle: "FIRE Masterplan Simulator",
  appSubtitle: "Family Office Dashboard · Kaufkraftbereinigte Projektion · inkl. Steuern & Entnahmephase",
  sidebarTitle: "FIRE Masterplan",
  sidebarSubtitle: "Family Office Simulator",
  menuOpen: "Menü öffnen",
  exportImport: "Export / Import",
  xlsxExport: "Excel Export",
  pdfExport: "PDF Export",
  csvExport: "CSV Export",
  jsonExport: "JSON Export",
  jsonImport: "JSON Import",
  exportError: "Export fehlgeschlagen. Bitte versuchen Sie es erneut.",
  importError: "Import fehlgeschlagen. Die Datei ist ungültig oder beschädigt.",
  importSuccess: "Szenario erfolgreich importiert.",
  live: "Live",

  retirementGoals: "🎯 Ruhestandsziel",
  savingsPhase: "💰 Sparphase",
  returnMarket: "📈 Rendite & Markt",
  taxes: "🏛️ Steuern",
  withdrawalStrategy: "📤 Entnahme-Strategie",
  lzkSection: "🔒 Arbeitszeitkonto",
  manualTarget: "Manuelles Zielvermögen",

  azkEnabled: "Arbeitszeitkonto aktiv",
  azkEnabledTooltip: "Aktiviert das Arbeitszeitkonto-Modell: Stunden ansammeln, ab Coast FIRE bezahlt freigestellt werden, danach ins Full FIRE coasten.",
  azkHoursPerYear: "Stunden / Jahr",
  azkHoursPerYearSub: "Auf dem Arbeitszeitkonto ansparen",
  azkHoursPerYearTooltip: "Wie viele Arbeitsstunden Sie pro Jahr auf Ihrem Zeitkonto ansammeln können.",
  azkWeeklyHours: "Wochenstunden",
  azkWeeklyHoursSub: "Reguläre Arbeitszeit",
  azkWeeklyHoursTooltip: "Ihre reguläre Wochenarbeitszeit — wird zur Umrechnung der gesammelten Stunden in Freistellungsjahre verwendet.",
  azkFreistellungDuration: "Freistellungsdauer",
  kpiFreistellungStart: "Freistellung Start",
  kpiFreistellungStartSub: "Bezahlt freigestellt · Kein Sparen",
  kpiFreistellungEnd: "Freistellung Ende",
  kpiFreistellungEndSub: "Stundenabbau abgeschlossen",
  kpiFreistellungDuration: (years) => `${years} Jahre bezahlte Freistellung`,

  desiredIncome: "Wunsch-Einkommen",
  desiredIncomeSub: "Netto monatlich im Ruhestand (heute)",
  desiredIncomeTooltip: "Wie viel möchten Sie monatlich im Ruhestand zur Verfügung haben? Daraus wird automatisch Ihr Zielvermögen berechnet.",
  statePension: "Gesetzliche Rente",
  statePensionSub: "Erwartete monatliche Rente",
  statePensionTooltip: "Ihre erwartete gesetzliche Rente reduziert die benötigte Entnahme aus dem Portfolio. Finden Sie Ihren Wert in der jährlichen Renteninformation.",
  swr: "Safe Withdrawal Rate",
  swrSub: "Sichere jährliche Entnahmerate",
  swrTooltip: "Die Entnahmerate bestimmt, wie viel Prozent Ihres Vermögens Sie pro Jahr entnehmen. 3,5% gilt als konservativ, 4% als Standard (Trinity Study).",
  startCapital: "Startkapital",
  startCapitalSub: "Aktuelles investiertes Vermögen",
  startCapitalTooltip: "Der Gesamtwert Ihrer aktuellen Investments (ETF-Depot, Aktien etc.).",
  monthlySavings: "Monatliche Sparrate",
  monthlySavingsSub: "Monatlicher ETF-Sparplan",
  monthlySavingsTooltip: "Ihr regelmäßiger monatlicher Investitionsbetrag.",
  dynamicSavings: "Dynamik Sparrate",
  dynamicSavingsSub: "Jährliche Erhöhung der Sparrate",
  dynamicSavingsTooltip: "Prozentuale Steigerung der Sparrate pro Jahr, z.B. durch Gehaltserhöhungen.",
  netIncome: "Nettoeinkommen",
  netIncomeSub: "Für Sparquoten-Berechnung",
  netIncomeTooltip: "Ihr monatliches Nettoeinkommen. Wird nur zur Berechnung Ihrer Sparquote verwendet.",
  bavContribution: "BAV-Zuschuss",
  bavContributionSub: "Betriebliche Altersversorgung p.a.",
  bavContributionTooltip: "Jährlicher Gesamtbetrag der betrieblichen Altersversorgung inkl. Arbeitgeberanteil.",
  expectedReturn: "Erwartete ETF-Rendite",
  expectedReturnSub: "Erwartete Jahresrendite (brutto)",
  expectedReturnTooltip: "Historische Durchschnittsrendite des MSCI World liegt bei ca. 7% p.a. vor Inflation.",
  inflationRate: "Inflation p.a.",
  inflationRateSub: "Inflationsrate zur Kaufkraftanpassung",
  inflationRateTooltip: "Alle Werte werden kaufkraftbereinigt dargestellt. Die EZB strebt 2% an, historisch lag sie bei 2-3%.",
  taxFiling: "Veranlagung",
  taxFilingTooltip: "Bestimmt den Sparerpauschbetrag: 1.000 € (Einzel) oder 2.000 € (Zusammen).",
  taxFilingSingle: "Einzel",
  taxFilingCouple: "Zusammen",
  churchTax: "Kirchensteuer",
  churchTaxTooltip: "Erhöht den Steuersatz auf Kapitalerträge von 26,375% auf ca. 27,82%.",
  withdrawalMode: "Entnahme-Modus",
  withdrawalModeTooltip: "'Kapital erhalten' (Ewige Rente): Sie leben nur von den Erträgen. 'Aufbrauchen': Das Vermögen wird über einen definierten Zeitraum komplett entnommen.",
  withdrawalPreserve: "Kapital erhalten",
  withdrawalSpend: "Aufbrauchen",
  withdrawalDuration: "Entnahme-Dauer",
  withdrawalDurationSub: "Kapital in X Jahren aufbrauchen",
  withdrawalDurationTooltip: "Über wie viele Jahre soll das Kapital verteilt werden?",
  lzkPhase: "Sabbatical (Jahre)",
  lzkPhaseSub: "Freistellung vor dem FIRE-Exit",
  lzkPhaseTooltip: "Langzeitkonto auffüllen und vor dem endgültigen Ausstieg ein Sabbatical nehmen. Gehalt fließt weiter, ETF-Beiträge laufen.",
  lzkReturn: "LZK-Rendite",
  lzkReturnSub: "Wird nicht mehr verwendet",
  lzkReturnTooltip: "Im Sabbatical-Modell gibt es kein separates Finanzkonto mehr.",
  targetWealth: "Zielvermögen",
  targetWealthSub: "Ihr manuelles FIRE-Ziel",
  targetWealthTooltip: "Standardmäßig wird Ihr Zielvermögen automatisch aus Wunsch-Einkommen und SWR berechnet. Aktivieren Sie den manuellen Modus, um einen eigenen Wert festzulegen.",
  targetWealthOverride: "Manuell festlegen",
  targetWealthOverrideTooltip: "Wenn aktiv, können Sie Ihr Zielvermögen manuell mit dem Schieberegler einstellen. Wenn deaktiviert, wird es automatisch berechnet: (Wunsch-Einkommen × 12) ÷ SWR.",
  targetWealthAuto: "Automatisch berechnet",
  simulationStart: "Simulationsbeginn",

  years: "Jahre",
  perYear: "/J",
  perMonth: "/ Monat",

  kpiFullFire: "Full FIRE Exit",
  kpiPassiveIncome: "Passives Einkommen",
  kpiCoastFire: "Coast FIRE",
  kpiFireNumber: "FIRE-Zahl",
  kpiDrawdownPhase: "Entnahme-Phase",
  kpiTotalTaxes: "Steuern gesamt",
  kpiRequiredSavings: "Benötigte Sparrate",
  kpiSavingsRate: "Sparquote",
  kpiLzkStart: "Sabbatical Start",
  kpiTargetReached: (years, target) => `Zielvermögen ${target} in ${years} Jahren`,
  kpiTargetNotReached: "Sparrate oder Rendite erhöhen",
  kpiYearLabel: (year) => `Jahr ${year}`,
  kpiAgeLabel: (age) => `Alter ${age}`,
  kpiOver30Years: "> 50 Jahre",
  kpiThreshold: (amount) => `Schwelle: ${amount} (real)`,
  kpiGapPerMonth: (amount) => `${amount} Lücke/Monat`,
  kpiPortfolioSurvives: "✅ Portfolio überlebt",
  kpiPortfolioDepleted: (year) => `⚠️ Aufgebraucht ${year}`,
  kpiCapitalSpend: (years) => `Kapitalverzehr über ${years} Jahre`,
  kpiPerpetualIncome: "Ewige Rente (Kapital erhalten)",
  kpiEffectiveTaxRate: (rate) => `Eff. Steuersatz: ${rate} %`,
  kpiCurrentSavings: (amount) => `Aktuell: ${amount} / Monat`,
  kpiSavingsRateSub: (savings, net) => `${savings} von ${net} netto`,
  kpiLzkStartSub: "Freistellung beginnt · Kein neues Sparen",
  kpiSavingsRateIncrease: "Ziel > 50 Jahre",

  chartTitle: "Portfolio-Entwicklung",
  chartSubtitle: "Kaufkraftbereinigt in heutigen € (real, nach Steuern)",
  chartScenarios: "Szenarien ±2%",
  chartScenariosHide: "Szenarien ausblenden",
  chartTarget: (amount) => `Ziel: ${amount}`,

  drawdownTitle: "Entnahme-Phase (Post-FIRE)",
  drawdownPerpetualSub: (amount) => `Ewige Rente · ${amount}/Monat Entnahme`,
  drawdownSpendSub: (years) => `Kapitalverzehr über ${years} Jahre`,
  drawdownSurvives40: "✅ Portfolio überlebt 40 Jahre",
  drawdownDepleted: (year) => `⚠️ Aufgebraucht ${year}`,
  drawdownNoTarget: "Das FIRE-Ziel wurde innerhalb von 50 Jahren nicht erreicht. Passen Sie Ihre Parameter an.",

  monteCarloTitle: "Monte-Carlo-Simulation",
  monteCarloSubtitle: "1.000 stochastische Szenarien der Entnahmephase",
  monteCarloSuccess: (rate) => `${rate} % Erfolgswahrscheinlichkeit`,
  monteCarloMedian: "Median (50%)",
  monteCarloP10: "10. Perzentil",
  monteCarloP25: "25. Perzentil",
  monteCarloP75: "75. Perzentil",
  monteCarloP90: "90. Perzentil",
  monteCarloSimulations: "1.000 Simulationen",

  tableTitle: "Jahr-für-Jahr Übersicht",
  tableSubtitle: "Detaillierte Tabelle aller Spar- und Entnahmejahre",
  tableYear: "Jahr",
  tableAge: "Alter",
  tableEtf: "ETF (real)",
  tableLzk: "LZK (real)",
  tableTotal: "Gesamt (real)",
  tableSavingsMonth: "Sparrate/M",
  tableGains: "Erträge",
  tableTaxes: "Steuern",
  tableWithdrawal: "Entnahme",
  tablePhase: "Phase",
  phaseWithdrawal: "Entnahme",
  phaseLzk: "Sabbatical",
  phaseSaving: "Sparen",
  phaseFreistellung: "Freistellung",
  phaseCoast: "Coasting",

  phasesTitle: "Die 5 Phasen Ihres FIRE-Plans",
  phasesSubtitle: "Strategischer Fahrplan von heute bis zum finanziellen Exit",
  phase1Title: "Fundament & System-Autopilot",
  phase1Subtitle: "Grundstein legen",
  phase1Desc: "ETF-Sparplan starten, Haushalt optimieren, Versicherungen checken, automatisiertes Sparen einrichten. Budget-Disziplin aufbauen.",
  phase2Title: "Skalierung & Business-Aufbau",
  phase2Subtitle: "Einkommen erhöhen",
  phase2Desc: "Gehaltserhöhungen verhandeln, Nebeneinnahmen aufbauen, Steuerstrategie optimieren. Sparrate jährlich erhöhen.",
  phase3Title: "Souveränität & Teilzeit",
  phase3Subtitle: "Freiheit gewinnen",
  phase3Desc: "Teilzeitmodelle prüfen, passives Einkommen ausbauen, Familie und Finanzen ausbalancieren. Weniger Stress, mehr Lebensqualität.",
  phase4Title: "Freistellung (AZK)",
  phase4Subtitle: "Bezahlt freigestellt",
  phase4Desc: "Arbeitszeitkonto wird eingelöst. Sie sind voll bezahlt freigestellt. Keine neuen ETF-Beiträge, aber Ihr Portfolio wächst durch Rendite weiter.",
  phase5Title: "Exit & Entnahme",
  phase5Subtitle: "FIRE erreicht",
  phase5Desc: (swr) => `Finanzieller Ruhestand. Entnahme nach der Safe Withdrawal Rate (${swr} %). ETF deckt alle Lebenshaltungskosten. Arbeit optional.`,
  phaseCritical: "Kritisch",

  warnReturnBelowInflation: (ret, inf) => `⚠️ Ihre erwartete Rendite (${ret}%) liegt unter oder gleich der Inflation (${inf}%). Ihr Vermögen verliert real an Kaufkraft.`,
  warnNoCapitalNoSavings: "⚠️ Ohne Startkapital und ohne monatliche Sparrate kann kein Vermögen aufgebaut werden.",
  warnIncomeAbovePension: "ℹ️ Ihr Wunsch-Einkommen ist geringer als die erwartete Rente. Kein zusätzliches Vermögen nötig!",
  warnHighSwr: "⚠️ Eine SWR von 5% oder mehr gilt als riskant. Historisch hatte die 4%-Regel bereits eine Ausfallwahrscheinlichkeit.",
  warnHighReturn: "ℹ️ Eine Rendite von 10%+ p.a. ist sehr optimistisch. Der MSCI World liegt historisch bei ca. 7% brutto.",
  warnSavingsExceedIncome: "⚠️ Ihre Sparrate übersteigt Ihr Nettoeinkommen. Bitte überprüfen Sie Ihre Eingaben.",
  warnPensionAgeTooLow: "⚠️ Das Renteneintrittsalter liegt unter oder beim aktuellen Alter.",
  warnDesiredIncomeHigh: "ℹ️ Ihr gewünschtes Ruhestandseinkommen liegt über Ihrem aktuellen Nettoeinkommen.",

  disclaimer: "Diese Simulation dient ausschließlich Informationszwecken und stellt keine Anlageberatung dar. Alle Werte basieren auf vereinfachten Annahmen und historischen Durchschnittswerten. Steuerberechnung nach deutschem Recht (Abgeltungssteuer + Teilfreistellung).",

  darkMode: "Dunkel",
  lightMode: "Hell",
  language: "Sprache",

  chartLabelETF: "ETF",
  chartLabelLZK: "Freistellung",
  chartLabelTotal: "Gesamt",
  chartLabelOptimistic: "Optimistisch (+2%)",
  chartLabelPessimistic: "Pessimistisch (−2%)",
  chartLabelRealistic: "Realistisch",
  chartLabelPortfolio: "Portfolio (real)",
  chartLabelWithdrawal: "Entnahme",
  calendarYear: "Kalenderjahr",

  shareLink: "Link teilen",
  linkCopied: "Link kopiert!",

  resetDefaults: "Zurücksetzen",
  resetConfirm: "Alle Eingaben auf Standardwerte zurücksetzen?",

  currentAge: "Aktuelles Alter",
  currentAgeSub: "Ihr heutiges Alter",
  currentAgeTooltip: "Wird für altersbasierte Darstellungen und die Berechnung des Rentenbeginns verwendet.",
  retirementAge: "Renteneintrittsalter",
  retirementAgeSub: "Beginn der gesetzlichen Rente",
  retirementAgeTooltip: "Ab diesem Alter erhalten Sie die gesetzliche Rente. Vorher müssen Sie Ihren gesamten Bedarf aus dem Portfolio decken. Standard: 67 (Regelaltersgrenze).",

  lifeEventSavingsRateChange: "Sparraten-Änderung",

  kpiInflationAdjustedSpending: "Bedarf bei FIRE",
  kpiInflationAdjustedSpendingSub: (today, atFire, years) => `${today} heute = ${atFire} in ${years} Jahren (inflationsbereinigt)`,

  reversePlannerTab: "🔄 Rückwärtsrechner",
  forwardSimTab: "📊 Simulation",
  reversePlannerTitle: "Rückwärtsrechner",
  reversePlannerSubtitle: "Wie viel müssen Sie monatlich sparen, um Ihr Ziel zu erreichen?",
  reverseTargetIncome: "Wunsch-Einkommen",
  reverseTargetIncomeSub: "Netto monatlich im Ruhestand",
  reverseTargetYears: "Zieljahre",
  reverseTargetYearsSub: "FIRE in X Jahren erreichen",
  reverseExitAge: "Ausstiegsalter",
  reverseExitAgeSub: "In welchem Alter möchten Sie FIRE erreichen?",
  reverseResultSavings: "Benötigte Sparrate",
  reverseResultFireNumber: "FIRE-Zahl",
  reverseResultMonteCarlo: "Erfolgswahrscheinlichkeit",
  reverseCalculate: "Berechnen",
  reverseProjectionTitle: "Spar-Projektion",
  reverseProjectionSubtitle: "Vermögensentwicklung bei benötigter Sparrate",
  reverseReturnRate: "Erwartete Rendite",
  reverseReturnRateSub: "Jährliche Rendite p.a.",
  reverseInflation: "Inflation",
  reverseInflationSub: "Jährliche Inflationsrate",
  reverseSwr: "Entnahmerate (SWR)",
  reverseSwrSub: "Sichere Entnahmerate p.a.",
  reverseTotalTaxPaid: "Steuern gesamt",
  reversePassiveIncome: "Passives Einkommen",
  reversePassiveIncomeSub: "Monatlich bei FIRE",
  reverseCoastFireYear: "Coast FIRE",
  reverseCoastFireYearSub: "Ab dann nur noch wachsen lassen",
  reverseCoastFireNone: "Nicht erreicht",
  reverseSavingsRate: "Sparquote",
  reverseSavingsRateSub: (savings: string, net: string) => `${savings} von ${net} Netto`,
  reverseDrawdownTitle: "Entnahmephase",
  reverseDrawdownSubtitle: "Vermögensentwicklung nach FIRE",
  reverseDrawdownSurvives: "Portfolio überlebt 40 Jahre ✓",
  reverseDrawdownDepleted: (year: number) => `Portfolio aufgebraucht in Jahr ${year}`,
  reverseMonteCarloTitle: "Monte Carlo – Entnahmephase",
  reverseMonteCarloSubtitle: "1.000 Simulationen mit zufälligen Renditen",
  reverseSensitivityTitle: "Sensitivitätsanalyse",
  reverseSensitivitySubtitle: "Wie sich Rendite-Annahmen auf die Sparrate auswirken",
  reverseSensitivityReturn: "Rendite",
  reverseSensitivitySavings: "Sparrate/Monat",
  reverseSensitivityFireNum: "FIRE-Zahl",
  reverseCurrentVsRequired: "Aktuell vs. Benötigt",
  reverseCurrentLine: "Aktuelle Sparrate",
  reverseRequiredLine: "Benötigte Sparrate",
  reverseTableTitle: "Jahresübersicht",
  reverseTableSubtitle: "Detaillierte Projektion Jahr für Jahr",

  reverseMcRecommendedSavings: "MC-Empfehlung",
  reverseMcRecommendedSavingsSub: "75 % Erfolgswahrscheinlichkeit",
  reverseMcSuccessRate: "MC-Erfolgsrate",
  reverseMcSuccessRateSub: "Anteil erfolgreicher Simulationen",
  reverseDeterministicSavings: "Deterministisch",
  reverseDeterministicSavingsSub: "Bei konstanter Rendite",
  reverseAccMcTitle: "Monte Carlo – Ansparphase",
  reverseAccMcSubtitle: "500 Simulationen: Vermögenswachstum mit empfohlener Sparrate",
  reverseMcConfidenceBadge: (pct: number) => `${pct.toFixed(0)} % Konfidenz`,

  reverseAgeSavingsTitle: "Sparraten nach Ausstiegsalter",
  reverseAgeSavingsSubtitle: "Monte-Carlo-simulierte Sparrate für verschiedene FIRE-Alter",
  reverseAgeSavingsAge: "Alter",
  reverseAgeSavingsMc: "MC-Sparrate",
  reverseAgeSavingsDet: "Deterministisch",
  reverseAgeSavingsFireNum: "FIRE-Zahl",
  reverseAgeSavingsSuccessRate: "MC-Erfolg",
  reverseAgeSavingsYears: "Jahre",
  reverseAgeSavingsChartLabel: "MC-Sparrate (75 % Konfidenz)",
  reverseAgeSavingsDetLabel: "Deterministisch",

  presetConservative: "Konservativ",
  presetBalanced: "Ausgewogen",
  presetAggressive: "Aggressiv",
  presetLabel: "Schnellvorlagen",
  presetConservativeDesc: "5 % Rendite · 3 % SWR · 3 % Inflation",
  presetBalancedDesc: "7 % Rendite · 3,5 % SWR · 2,5 % Inflation",
  presetAggressiveDesc: "9 % Rendite · 4 % SWR · 2 % Inflation",

  errorTitle: "Etwas ist schiefgelaufen",
  errorMessage: "Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.",
  errorRetry: "Erneut versuchen",
  coastFireLabel: "Coast FIRE",
  fullFireLabel: "Full FIRE",
  kpiMonteCarlo: "Monte Carlo",
  phaseLabel: (n: number) => `Phase ${n}`,

  // Tax Country
  taxCountry: "Steuerland",
  taxCountryTooltip: "Wählen Sie Ihr Steuerland für die Kapitalertragsbesteuerung.",
  taxCountryDE: "🇩🇪 Deutschland",
  taxCountryUS: "🇺🇸 USA",
  taxCountryUK: "🇬🇧 Großbritannien",
  taxCountryCH: "🇨🇭 Schweiz",
  taxCountryAT: "🇦🇹 Österreich",
  taxCountryNL: "🇳🇱 Niederlande",
  taxCountryCA: "🇨🇦 Kanada",
  taxCountryAU: "🇦🇺 Australien",
  taxCountryFR: "🇫🇷 Frankreich",

  // Life Events
  lifeEventsSection: "Lebensereignisse",
  lifeEventsAdd: "Ereignis hinzufügen",
  lifeEventsName: "Bezeichnung",
  lifeEventsType: "Typ",
  lifeEventsStartYear: "Startjahr",
  lifeEventsEndYear: "Endjahr",
  lifeEventsAmount: "Jährl. Betrag",
  lifeEventsInflationAdj: "Inflationsbereinigt",
  lifeEventsRemove: "Entfernen",
  lifeEventHomePurchase: "Immobilienkauf",
  lifeEventChild: "Kind",
  lifeEventCareerChange: "Karrierewechsel",
  lifeEventInheritance: "Erbschaft",
  lifeEventPensionStart: "Rentenbeginn",
  lifeEventHealthcare: "Gesundheitskosten",
  lifeEventOneTimeExpense: "Einmalausgabe",
  lifeEventOneTimeIncome: "Einmaleinnahme",
  lifeEventSideIncome: "Nebeneinkommen",
  lifeEventsEmpty: "Keine Lebensereignisse geplant",

  // Scenarios
  scenariosSection: "Szenarien",
  scenariosSave: "Speichern",
  scenariosLoad: "Laden",
  scenariosDelete: "Löschen",
  scenariosName: "Szenario-Name",
  scenariosNamePrompt: "Name für das Szenario:",
  scenariosCurrent: "Aktuell",
  scenariosEmpty: "Keine gespeicherten Szenarien",

  // Lifecycle Monte Carlo
  lifecycleMCTitle: "Lebenszyklus Monte Carlo",
  lifecycleMCSubtitle: "500 stochastische Simulationen der Ansparphase",
  lifecycleMCSuccess: (rate: string) => `${rate} % erreichen FIRE`,
  lifecycleMCYearsToFire: "FIRE-Alter",
  lifecycleMCP50Years: (age: string) => `Median: Alter ${age}`,
  lifecycleMCRange: (p10: string, p90: string) => `P10–P90: ${p10}–${p90}`,

  // Example Plans
  examplePlansSection: "Beispiel-FIRE-Pläne",
  examplePlansSelect: "Beispielplan laden…",
  examplePlansDescription: "Vordefinierte, realistische FIRE-Pläne für verschiedene Einkommensgruppen",
  examplePlanStudentStarter: "🎓 Student / Berufseinsteiger (1.800 € netto)",
  examplePlanStudentStarterDesc: "22 Jahre, 300 €/Monat sparen — selbst kleine Beträge wirken über die Zeit",
  examplePlanBlueCollar: "🔧 Facharbeiter (2.200 € netto)",
  examplePlanBlueCollarDesc: "25 Jahre, 400 €/Monat — solides Fundament durch frühen Start",
  examplePlanMedianEarner: "💼 Durchschnittsverdiener (3.000 € netto)",
  examplePlanMedianEarnerDesc: "30 Jahre, 800 €/Monat — der klassische FIRE-Weg",
  examplePlanDualIncome: "👫 Doppelverdiener (5.500 € netto zusammen)",
  examplePlanDualIncomeDesc: "32 Jahre, Paar-Strategie mit 1.800 €/Monat",
  examplePlanHighEarner: "🚀 Gutverdiener (6.500 € netto)",
  examplePlanHighEarnerDesc: "28 Jahre, aggressive 3.000 €/Monat — FIRE in unter 15 Jahren",
  examplePlanLateStarter: "⏰ Spätstarter (3.500 € netto)",
  examplePlanLateStarterDesc: "40 Jahre, 1.200 €/Monat — es ist nie zu spät!",
  examplePlanAggressiveSaver: "🔥 Extrem-Sparer (4.000 € netto)",
  examplePlanAggressiveSaverDesc: "25 Jahre, 2.500 €/Monat (62 % Sparquote) — FIRE in ~10 Jahren",

  // No-investment comparison
  noInvestmentLabel: "Ohne Investment vergleichen",
  noInvestmentTooltip: "Zeigt was passiert wäre, wenn das gleiche Geld nur gespart, aber nie investiert worden wäre (nur Inflation-Erosion)",
  chartLabelNoInvestment: "Ohne Investment (nur Sparen)",

  // Simple / Advanced mode (legacy)
  simpleMode: "Einfach",
  advancedMode: "Erweitert",
  simpleModeHint: "Zeigt nur die wichtigsten Einstellungen",

  // Sidebar section headers
  mainParameters: "📌 Hauptgrößen",
  adjustments: "⚙️ Stellschrauben",

  // Onboarding wizard
  onboardingTitle: "Willkommen beim FIRE Simulator!",
  onboardingSubtitle: "Richten Sie Ihren persönlichen Finanzplan in wenigen Schritten ein.",
  onboardingStep1Title: "Über Sie",
  onboardingStep1Desc: "Alter und monatliches Nettoeinkommen",
  onboardingStep2Title: "Sparphase",
  onboardingStep2Desc: "Startkapital und monatliche Sparrate",
  onboardingStep3Title: "Ruhestandsziel",
  onboardingStep3Desc: "Gewünschtes Einkommen im Ruhestand",
  onboardingStep4Title: "Steuerland",
  onboardingStep4Desc: "Wählen Sie Ihr Land für die Steuerberechnung",
  onboardingNext: "Weiter",
  onboardingBack: "Zurück",
  onboardingFinish: "Simulation starten",
  onboardingSkip: "Überspringen",
  onboardingAgeLabel: "Ihr Alter",
  onboardingIncomeLabel: "Monatl. Nettoeinkommen",
  onboardingSavingsLabel: "Monatl. Sparrate",
  onboardingDesiredIncomeLabel: "Wunsch-Einkommen (Ruhestand)",
  onboardingCountryLabel: "Steuerland",
  onboardingStartCapitalLabel: "Aktuelles Vermögen",

  // Dashboard sections
  sectionFireJourney: "🚀 Ihre FIRE-Reise",
  sectionFireJourneyDesc: "Überblick und Vermögensentwicklung",
  sectionStressTesting: "🎲 Stresstest",
  sectionStressTestingDesc: "Monte-Carlo-Simulationen und Szenarien",
  sectionDrawdownAnalysis: "📉 Entnahmephase",
  sectionDrawdownAnalysisDesc: "Portfolio-Entwicklung nach FIRE",
  sectionPlanning: "📋 Planung",
  sectionPlanningDesc: "Lebensereignisse, Details und Phasen",

  // Undo / Redo
  undo: "Rückgängig",
  redo: "Wiederherstellen",

  // FIRE Progress Gauge
  fireProgressTitle: "FIRE-Fortschritt",
  fireProgressSub: "Aktueller Stand zum Ziel",
  fireProgressComplete: "Ziel erreicht!",
  fireProgressOf: "von",

  // Contextual Guidance Card
  guidanceOnTrack: (fireAge, yearsEarly) => yearsEarly > 0
    ? `🎉 Du bist auf Kurs! Du kannst mit ${fireAge} in den Ruhestand gehen — ${yearsEarly} Jahr${yearsEarly !== 1 ? "e" : ""} vor dem Rentenalter.`
    : `🎉 Du bist auf Kurs! Du kannst mit ${fireAge} in den Ruhestand gehen.`,
  guidanceNeedMore: (amount) => `💡 Du brauchst ${amount}/Monat mehr Sparrate, um dein FIRE-Ziel zu erreichen.`,
  guidanceAlreadyFire: "🏆 Glückwunsch! Du hast dein FIRE-Ziel bereits erreicht.",
  guidanceNoTarget: "⚠️ Mit den aktuellen Einstellungen ist das FIRE-Ziel innerhalb von 50 Jahren nicht erreichbar.",
  guidanceTip: "Tipp",
  guidanceMcWarning: (pct) => `⚠️ Monte-Carlo-Erfolgsrate ist nur ${pct}% — erwäge, dein SWR zu senken oder mehr zu sparen.`,
  guidanceMcGood: (pct) => `✅ Monte-Carlo-Erfolgsrate: ${pct}% — dein Plan ist robust.`,
  guidanceSavingsLow: (current, required) => `Aktuelle Sparrate: ${current}/Monat vs. benötigt: ${required}/Monat`,
  guidanceSavingsGood: "Deine Sparrate ist ausreichend — weiter so!",

  // Nominal/Real Toggle
  showNominal: "Nominal",
  showReal: "Real (inflationsbereinigt)",
  nominalTooltip: "Zwischen nominalen und kaufkraftbereinigten Werten wechseln",

  // Country-Specific Defaults
  applyCountryDefaults: "Landesstandards anwenden",
  countryDefaultsApplied: "Landesstandards angewendet",

  // Onboarding Result Preview
  onboardingPreviewTitle: "Deine Vorschau",
  onboardingPreviewFireAge: (age) => `Geschätztes FIRE-Alter: ${age} Jahre`,
  onboardingPreviewFireNumber: "FIRE-Ziel",
  onboardingPreviewNotReachable: "Mit diesen Werten wird das FIRE-Ziel in 50 Jahren nicht erreicht. Du kannst die Werte nach dem Start anpassen.",

  // --- NEW: Education Hub / Learn modal ---
  learnButton: "📖 Lernen",
  learnTitle: "FIRE-Glossar",
  learnClose: "Schließen",
  learnWhatIsFire: "Was ist FIRE?",
  learnWhatIsFireDesc: "FIRE steht für «Financial Independence, Retire Early» — genug Geld gespart zu haben, dass du nie wieder arbeiten musst. Dein Vermögen erzeugt genug passive Einnahmen, um deine Lebenshaltungskosten zu decken.",
  learnFireNumber: "FIRE-Zahl (Zielvermögen)",
  learnFireNumberDesc: "Der Gesamtbetrag, den du brauchst. Einfache Formel: Wenn du 2.500 €/Monat brauchst, sind das 30.000 €/Jahr. Multipliziere mit 25–30 = dein Ziel (750.000–900.000 €).",
  learnSwr: "Entnahmerate (SWR / 4%-Regel)",
  learnSwrDesc: "Die «Safe Withdrawal Rate» sagt dir, wie viel du jährlich entnehmen kannst, ohne dass dein Geld ausgeht. Bei 4 % entnimmst du 4 % deines Vermögens pro Jahr — das hat historisch über 30+ Jahre funktioniert.",
  learnCoastFire: "Coast FIRE",
  learnCoastFireDesc: "Der Punkt, an dem dein Vermögen alleine genug wächst — selbst wenn du keinen Cent mehr sparst. Ab hier arbeitet die Zeit für dich.",
  learnMonteCarlo: "Stresstest (Monte Carlo)",
  learnMonteCarloDesc: "Wir simulieren 1.000 verschiedene Marktszenarien mit zufälligen Renditen. Je mehr Szenarien erfolgreich sind, desto sicherer ist dein Plan.",
  learnDrawdown: "Entnahmephase",
  learnDrawdownDesc: "Die Zeit NACH dem Ausstieg aus dem Beruf. Hier lebst du von deinem Vermögen. Wir zeigen dir, ob dein Portfolio bis zum Lebensende reicht.",
  learnSavingsRate: "Sparquote",
  learnSavingsRateDesc: "Wie viel Prozent deines Einkommens du sparst. Eine höhere Sparquote bedeutet schneller FIRE. Die meisten FIRE-Erreichenden sparen 30–50 %.",
  learnCompoundInterest: "Zinseszins-Effekt",
  learnCompoundInterestDesc: "Dein Geld verdient Rendite, und die Rendite verdient wiederum Rendite. Je früher du anfängst, desto stärker wirkt dieser Effekt — Zeit ist dein größter Verbündeter.",

  // --- NEW: Education panel (What is FIRE?) on dashboard ---
  fireEducationTitle: "🔥 Was ist FIRE?",
  fireEducationBody: "FIRE bedeutet «Financial Independence, Retire Early» — genug Geld zu haben, dass du von deinen Ersparnissen leben kannst, ohne arbeiten zu müssen. Dieser Simulator zeigt dir, wann du dieses Ziel erreichst und was du tun kannst, um schneller dahin zu kommen.",
  fireEducationDismiss: "Verstanden!",
  fireEducationShowAgain: "Was ist FIRE?",

  // --- NEW: Revamped onboarding (story-driven) ---
  onboardingStep1DescStory: "Lass uns herausfinden, wann du aufhören könntest zu arbeiten. Zuerst: Wo stehst du heute?",
  onboardingStep2DescStory: "Super! Wie viel hast du bereits gespart, und wie viel kannst du monatlich zurücklegen? Selbst kleine Beträge machen einen großen Unterschied — Zeit ist dein größter Vorteil.",
  onboardingStep3DescStory: "Stell dir vor, du müsstest nie wieder arbeiten. Wie viel bräuchtest du monatlich, um komfortabel zu leben? Keine Sorge — du kannst alles später anpassen.",
  onboardingStep4DescStory: "Fast geschafft! Dein Land bestimmt Steuern und Rentenregeln. Den Rest übernehmen wir.",
  onboardingBenchmarkAge: "Durchschnittlich starten FIRE-Planer mit 25–35 Jahren",
  onboardingBenchmarkIncome: (currency) => `Typisch: ${currency} 2.500–5.000 netto`,
  onboardingBenchmarkSavings: (currency) => `Die meisten in deinem Alter sparen ${currency} 300–800/Monat`,
  onboardingBenchmarkDesiredIncome: (currency) => `Typisch: ${currency} 2.000–4.000 monatlich`,
  onboardingUseCountryAvg: "Landesdurchschnitt verwenden",
  onboardingQuickResultTitle: "🎉 Dein Ergebnis",
  onboardingQuickResultBody: (age) => `Du könntest mit ${age} Jahren finanziell frei sein!`,
  onboardingQuickResultCelebrate: "Los geht's!",

  // --- NEW: Beginner-friendly terminology ---
  beginnerFireNumber: "Dein Zielbetrag",
  beginnerCoastFire: "Spar-Autopilot",
  beginnerMonteCarlo: "Wie sicher ist dein Plan?",
  beginnerDrawdown: "Nach dem Ausstieg",
  beginnerSwr: "Jährliche Entnahme",
  beginnerSavingsRate: "Anteil den du sparst",
  beginnerPassiveIncome: "Einkommen ohne Arbeit",
  beginnerWithdrawalPreserve: "Von Erträgen leben",
  beginnerWithdrawalSpend: "Kapital aufbrauchen",

  // --- NEW: Dashboard mode toggle ---
  modeBeginner: "Einsteiger",
  modeStandard: "Standard",
  modeAdvanced: "Erweitert",
  modeLabel: "Ansicht",

  // --- NEW: Beginner Journey Card ---
  beginnerJourneyTitle: "Dein Weg zur finanziellen Freiheit",
  beginnerJourneySavings: (amount) => `Wenn du ${amount}/Monat sparst und investierst…`,
  beginnerJourneyFireAge: (age) => `…kannst du mit ${age} in Rente gehen`,
  beginnerJourneyFireNumber: (amount) => `Du brauchst insgesamt ${amount}`,
  beginnerJourneyProgress: (pct) => `Du bist bereits ${pct}% auf dem Weg`,
  beginnerJourneyTips: "Wie kommst du schneller ans Ziel?",
  beginnerTipSaveMore: "Spare 100 € mehr pro Monat",
  beginnerTipStartEarly: "Je früher du anfängst, desto besser",
  beginnerTipReduceSpending: "Überprüfe deine monatlichen Ausgaben",
  beginnerTipInvest: "Investiere in breit gestreute ETFs",

  // --- NEW: Actionable guidance ---
  guidanceActionRetireEarlier: (amount) => `💡 Um früher in Rente zu gehen, erhöhe deine Sparrate um ${amount}/Monat oder reduziere dein Wunsch-Einkommen.`,
  guidanceActionMcLow: (amount) => `⚠️ Dein Plan hat Risiken. Spare ${amount} mehr pro Monat oder reduziere dein Wunsch-Einkommen leicht.`,
  guidanceActionSavingsLow: "📊 Deine Sparquote ist niedrig. Die meisten FIRE-Erreichenden sparen 30–50 % ihres Einkommens.",
  guidanceActionAlreadyFire: "🎉 Herzlichen Glückwunsch! Du hast bereits finanzielle Unabhängigkeit erreicht. Deine Investments decken deinen gewünschten Lebensstil.",

  // --- NEW: What If? panel ---
  whatIfTitle: "Was wäre wenn…",
  whatIfSaveMore: (amount) => `Ich ${amount} mehr spare?`,
  whatIfRetireLater: "Ich 5 Jahre später in Rente gehe?",
  whatIfLessIncome: "Ich weniger Einkommen brauche?",
  whatIfYearsEarlier: (n) => `${n} ${n === 1 ? "Jahr" : "Jahre"} früher!`,
  whatIfYearsLater: (n) => `${n} ${n === 1 ? "Jahr" : "Jahre"} später`,
  whatIfNoChange: "Keine Änderung",

  // --- NEW: Chart explainers ---
  chartExplainButton: "Was zeigt dieses Diagramm?",
  chartExplainFireChart: "Der grüne Bereich zeigt, wie dein Vermögen über die Zeit wächst. Die gepunktete Linie ist dein Ziel. Wo sie sich treffen = dein FIRE-Datum!",
  chartExplainMonteCarloChart: "Wir haben 1.000 verschiedene Marktszenarien simuliert. Je mehr grün, desto sicherer ist dein Plan.",
  chartExplainDrawdownChart: "Das zeigt, was mit deinem Geld NACH dem Ausstieg passiert. Solange die Linie über null bleibt, bist du sicher!",
  chartExplainLifecycleChart: "Diese Simulation zeigt verschiedene mögliche Verläufe deiner Ansparphase mit zufälligen Renditen.",
  chartSummaryFireChart: (age) => age !== null ? `Basierend auf deinen Eingaben erreichst du dein Ziel mit ${age} Jahren.` : "Mit den aktuellen Eingaben wird das Ziel in 50 Jahren nicht erreicht.",
  chartSummaryMonteCarloChart: (pct) => `In ${pct}% der simulierten Szenarien reicht dein Geld. Über 80% gilt als robust.`,
  chartSummaryDrawdownChart: (survives) => survives ? "Gute Nachrichten: Dein Portfolio überlebt die Entnahmephase!" : "Achtung: Dein Portfolio könnte während der Entnahmephase aufgebraucht werden.",

  // --- NEW: Milestones ---
  milestonesTitle: "Deine Meilensteine",
  milestonesStart: "Start (heute)",
  milestones25: "25% des Ziels",
  milestonesCoast: "Spar-Autopilot",
  milestones75: "75% des Ziels",
  milestonesFire: "FIRE erreicht!",
  milestonesNextTitle: "Dein nächster Meilenstein",
  milestonesNextBody: (amount, months) => `Du bist ${amount} von deinem nächsten Meilenstein entfernt! Bei deiner aktuellen Sparrate erreichst du ihn in ${months} Monaten.`,
  milestonesCompleted: "Erreicht ✓",

  // --- NEW: FIRE Score ---
  fireScoreTitle: "FIRE Score",
  fireScoreSub: "Gesamtbewertung deines Plans",
  fireScoreExcellent: "Ausgezeichnet",
  fireScoreGreat: "Sehr gut",
  fireScoreGood: "Gut",
  fireScoreNeedsWork: "Verbesserbar",
  fireScoreSavingsRate: "Sparquote",
  fireScoreTimeline: "Zeithorizont",
  fireScoreMonteCarlo: "Monte Carlo",
  fireScoreDrawdown: "Entnahmesicherheit",

  // --- NEW: Accessibility ---
  skipToContent: "Zum Inhalt springen",
  chartAltFireChart: "Diagramm der Vermögensentwicklung über die Zeit",
  chartAltMonteCarloChart: "Monte-Carlo-Simulation: Verteilung der Ergebnisse",
  chartAltDrawdownChart: "Diagramm der Portfolio-Entwicklung in der Entnahmephase",
};

export const en: Translations = {
  appTitle: "FIRE Masterplan Simulator",
  appSubtitle: "Family Office Dashboard · Inflation-Adjusted Projection · incl. Taxes & Withdrawal Phase",
  sidebarTitle: "FIRE Masterplan",
  sidebarSubtitle: "Family Office Simulator",
  menuOpen: "Open menu",
  exportImport: "Export / Import",
  xlsxExport: "Excel Export",
  pdfExport: "PDF Export",
  csvExport: "CSV Export",
  jsonExport: "JSON Export",
  jsonImport: "JSON Import",
  exportError: "Export failed. Please try again.",
  importError: "Import failed. The file is invalid or corrupted.",
  importSuccess: "Scenario imported successfully.",
  live: "Live",

  retirementGoals: "🎯 Retirement Goals",
  savingsPhase: "💰 Savings Phase",
  returnMarket: "📈 Returns & Market",
  taxes: "🏛️ Taxes",
  withdrawalStrategy: "📤 Withdrawal Strategy",
  lzkSection: "🔒 Working Time Account",
  manualTarget: "Manual Target Wealth",

  azkEnabled: "Working Time Account",
  azkEnabledTooltip: "Enable the working-time-account model: accumulate hours, get paid leave from Coast FIRE, then coast into Full FIRE.",
  azkHoursPerYear: "Hours / Year",
  azkHoursPerYearSub: "Saved on working time account",
  azkHoursPerYearTooltip: "How many work hours you can accumulate per year on your time account.",
  azkWeeklyHours: "Weekly Hours",
  azkWeeklyHoursSub: "Regular working hours",
  azkWeeklyHoursTooltip: "Your regular weekly working hours — used to convert accumulated hours into years of paid leave.",
  azkFreistellungDuration: "Leave Duration",
  kpiFreistellungStart: "Paid Leave Start",
  kpiFreistellungStartSub: "On paid leave · No new savings",
  kpiFreistellungEnd: "Paid Leave End",
  kpiFreistellungEndSub: "Hours exhausted",
  kpiFreistellungDuration: (years) => `${years} years of paid leave`,

  desiredIncome: "Desired Income",
  desiredIncomeSub: "Net monthly in retirement (today's €)",
  desiredIncomeTooltip: "How much do you want to have available per month in retirement? Your target wealth is automatically calculated from this.",
  statePension: "State Pension",
  statePensionSub: "Expected monthly pension",
  statePensionTooltip: "Your expected state pension reduces the required withdrawal from your portfolio. Find your value in the annual pension information.",
  swr: "Safe Withdrawal Rate",
  swrSub: "Annual safe withdrawal rate",
  swrTooltip: "The withdrawal rate determines what percentage of your wealth you withdraw per year. 3.5% is conservative, 4% is the standard (Trinity Study).",
  startCapital: "Starting Capital",
  startCapitalSub: "Current invested assets",
  startCapitalTooltip: "The total value of your current investments (ETF portfolio, stocks, etc.).",
  monthlySavings: "Monthly Savings",
  monthlySavingsSub: "Monthly ETF savings plan",
  monthlySavingsTooltip: "Your regular monthly investment amount.",
  dynamicSavings: "Savings Growth",
  dynamicSavingsSub: "Annual savings increase",
  dynamicSavingsTooltip: "Percentage increase in savings rate per year, e.g., from salary raises.",
  netIncome: "Net Income",
  netIncomeSub: "For savings rate calculation",
  netIncomeTooltip: "Your monthly net income. Only used to calculate your savings rate.",
  bavContribution: "Employer Pension",
  bavContributionSub: "Occupational pension p.a.",
  bavContributionTooltip: "Annual total of occupational pension including employer contribution.",
  expectedReturn: "Expected ETF Return",
  expectedReturnSub: "Expected annual return (gross)",
  expectedReturnTooltip: "Historical average return of the MSCI World is approx. 7% p.a. before inflation.",
  inflationRate: "Inflation p.a.",
  inflationRateSub: "Inflation rate for purchasing power adjustment",
  inflationRateTooltip: "All values are shown adjusted for purchasing power. The ECB targets 2%, historically it was 2-3%.",
  taxFiling: "Tax Filing",
  taxFilingTooltip: "Determines the tax-free allowance: €1,000 (single) or €2,000 (couple).",
  taxFilingSingle: "Single",
  taxFilingCouple: "Couple",
  churchTax: "Church Tax",
  churchTaxTooltip: "Increases the tax rate on capital gains from 26.375% to approx. 27.82%.",
  withdrawalMode: "Withdrawal Mode",
  withdrawalModeTooltip: "'Preserve Capital' (Perpetual Income): You live only from returns. 'Spend Down': The wealth is completely withdrawn over a defined period.",
  withdrawalPreserve: "Preserve Capital",
  withdrawalSpend: "Spend Down",
  withdrawalDuration: "Withdrawal Duration",
  withdrawalDurationSub: "Spend down capital over X years",
  withdrawalDurationTooltip: "Over how many years should the capital be distributed?",
  lzkPhase: "Sabbatical (Years)",
  lzkPhaseSub: "Paid leave before FIRE exit",
  lzkPhaseTooltip: "Fill up your Langzeitkonto and take a long sabbatical before your final exit. Salary continues to flow, ETF contributions keep going.",
  lzkReturn: "LZK Return",
  lzkReturnSub: "No longer used",
  lzkReturnTooltip: "In the sabbatical model, there is no separate financial account.",
  targetWealth: "Target Wealth",
  targetWealthSub: "Your manual FIRE target",
  targetWealthTooltip: "By default, your target wealth is automatically calculated from desired income and SWR. Enable manual mode to set your own value.",
  targetWealthOverride: "Set manually",
  targetWealthOverrideTooltip: "When active, you can manually set your target wealth using the slider. When off, it is automatically calculated: (Desired Income × 12) ÷ SWR.",
  targetWealthAuto: "Auto-calculated",
  simulationStart: "Simulation start",

  years: "years",
  perYear: "/yr",
  perMonth: "/ month",

  kpiFullFire: "Full FIRE Exit",
  kpiPassiveIncome: "Passive Income",
  kpiCoastFire: "Coast FIRE",
  kpiFireNumber: "FIRE Number",
  kpiDrawdownPhase: "Drawdown Phase",
  kpiTotalTaxes: "Total Taxes",
  kpiRequiredSavings: "Required Savings",
  kpiSavingsRate: "Savings Rate",
  kpiLzkStart: "Sabbatical Start",
  kpiTargetReached: (years, target) => `Target ${target} in ${years} years`,
  kpiTargetNotReached: "Increase savings rate or return",
  kpiYearLabel: (year) => `Year ${year}`,
  kpiAgeLabel: (age) => `Age ${age}`,
  kpiOver30Years: "> 50 years",
  kpiThreshold: (amount) => `Threshold: ${amount} (real)`,
  kpiGapPerMonth: (amount) => `${amount} gap/month`,
  kpiPortfolioSurvives: "✅ Portfolio survives",
  kpiPortfolioDepleted: (year) => `⚠️ Depleted ${year}`,
  kpiCapitalSpend: (years) => `Capital spend-down over ${years} years`,
  kpiPerpetualIncome: "Perpetual income (preserve capital)",
  kpiEffectiveTaxRate: (rate) => `Eff. tax rate: ${rate}%`,
  kpiCurrentSavings: (amount) => `Current: ${amount} / month`,
  kpiSavingsRateSub: (savings, net) => `${savings} of ${net} net`,
  kpiLzkStartSub: "Paid leave begins · No new savings",
  kpiSavingsRateIncrease: "Target > 50 years",

  chartTitle: "Portfolio Growth",
  chartSubtitle: "Inflation-adjusted in today's € (real, after taxes)",
  chartScenarios: "Scenarios ±2%",
  chartScenariosHide: "Hide scenarios",
  chartTarget: (amount) => `Target: ${amount}`,

  drawdownTitle: "Withdrawal Phase (Post-FIRE)",
  drawdownPerpetualSub: (amount) => `Perpetual income · ${amount}/month withdrawal`,
  drawdownSpendSub: (years) => `Capital spend-down over ${years} years`,
  drawdownSurvives40: "✅ Portfolio survives 40 years",
  drawdownDepleted: (year) => `⚠️ Depleted ${year}`,
  drawdownNoTarget: "The FIRE target was not reached within 50 years. Please adjust your parameters.",

  monteCarloTitle: "Monte Carlo Simulation",
  monteCarloSubtitle: "1,000 stochastic scenarios of the withdrawal phase",
  monteCarloSuccess: (rate) => `${rate}% success probability`,
  monteCarloMedian: "Median (50th)",
  monteCarloP10: "10th percentile",
  monteCarloP25: "25th percentile",
  monteCarloP75: "75th percentile",
  monteCarloP90: "90th percentile",
  monteCarloSimulations: "1,000 simulations",

  tableTitle: "Year-by-Year Overview",
  tableSubtitle: "Detailed table of all savings and withdrawal years",
  tableYear: "Year",
  tableAge: "Age",
  tableEtf: "ETF (real)",
  tableLzk: "LZK (real)",
  tableTotal: "Total (real)",
  tableSavingsMonth: "Savings/M",
  tableGains: "Gains",
  tableTaxes: "Taxes",
  tableWithdrawal: "Withdrawal",
  tablePhase: "Phase",
  phaseWithdrawal: "Withdrawal",
  phaseLzk: "Sabbatical",
  phaseSaving: "Saving",
  phaseFreistellung: "Paid Leave",
  phaseCoast: "Coasting",

  phasesTitle: "The 5 Phases of Your FIRE Plan",
  phasesSubtitle: "Strategic roadmap from today to financial exit",
  phase1Title: "Foundation & System Autopilot",
  phase1Subtitle: "Lay the groundwork",
  phase1Desc: "Start ETF savings plan, optimize household, check insurance, set up automated savings. Build budget discipline.",
  phase2Title: "Scaling & Income Growth",
  phase2Subtitle: "Increase income",
  phase2Desc: "Negotiate raises, build side income, optimize tax strategy. Increase savings rate annually.",
  phase3Title: "Sovereignty & Part-Time",
  phase3Subtitle: "Gain freedom",
  phase3Desc: "Evaluate part-time models, expand passive income, balance family and finances. Less stress, more quality of life.",
  phase4Title: "Paid Leave (AZK)",
  phase4Subtitle: "Paid leave from time account",
  phase4Desc: "Working time account is redeemed. You are on fully paid leave. No new ETF contributions, but your portfolio continues to grow through returns.",
  phase5Title: "Exit & Withdrawal",
  phase5Subtitle: "FIRE achieved",
  phase5Desc: (swr) => `Financial retirement. Withdrawal at Safe Withdrawal Rate (${swr}%). ETF covers all living expenses. Work is optional.`,
  phaseCritical: "Critical",

  warnReturnBelowInflation: (ret, inf) => `⚠️ Your expected return (${ret}%) is at or below inflation (${inf}%). Your wealth loses purchasing power in real terms.`,
  warnNoCapitalNoSavings: "⚠️ Without starting capital and without monthly savings, no wealth can be built.",
  warnIncomeAbovePension: "ℹ️ Your desired income is less than the expected pension. No additional wealth needed!",
  warnHighSwr: "⚠️ An SWR of 5% or more is considered risky. Historically, the 4% rule already had a failure probability.",
  warnHighReturn: "ℹ️ A return of 10%+ p.a. is very optimistic. The MSCI World historically averages approx. 7% gross.",
  warnSavingsExceedIncome: "⚠️ Your savings rate exceeds your net income. Please check your inputs.",
  warnPensionAgeTooLow: "⚠️ The pension age is at or below your current age.",
  warnDesiredIncomeHigh: "ℹ️ Your desired retirement income is higher than your current net income.",

  disclaimer: "This simulation is for informational purposes only and does not constitute investment advice. All values are based on simplified assumptions and historical averages. Tax calculation according to German law (Abgeltungssteuer + Teilfreistellung).",

  darkMode: "Dark",
  lightMode: "Light",
  language: "Language",

  chartLabelETF: "ETF",
  chartLabelLZK: "Paid Leave",
  chartLabelTotal: "Total",
  chartLabelOptimistic: "Optimistic (+2%)",
  chartLabelPessimistic: "Pessimistic (−2%)",
  chartLabelRealistic: "Realistic",
  chartLabelPortfolio: "Portfolio (real)",
  chartLabelWithdrawal: "Withdrawal",
  calendarYear: "Calendar Year",

  shareLink: "Share Link",
  linkCopied: "Link copied!",

  resetDefaults: "Reset",
  resetConfirm: "Reset all inputs to default values?",

  currentAge: "Current Age",
  currentAgeSub: "Your current age",
  currentAgeTooltip: "Used for age-based projections and to calculate when state pension begins.",
  retirementAge: "Pension Start Age",
  retirementAgeSub: "When state pension begins",
  retirementAgeTooltip: "The age at which you start receiving your state pension. Before this age, your entire desired income must come from your portfolio. Default: 67.",

  lifeEventSavingsRateChange: "Savings Rate Change",

  kpiInflationAdjustedSpending: "Spending at FIRE",
  kpiInflationAdjustedSpendingSub: (today, atFire, years) => `${today} today = ${atFire} in ${years} years (inflation-adjusted)`,

  reversePlannerTab: "🔄 Reverse Planner",
  forwardSimTab: "📊 Simulation",
  reversePlannerTitle: "Reverse Planner",
  reversePlannerSubtitle: "How much do you need to save monthly to reach your goal?",
  reverseTargetIncome: "Desired Income",
  reverseTargetIncomeSub: "Net monthly in retirement",
  reverseTargetYears: "Target Years",
  reverseTargetYearsSub: "Reach FIRE in X years",
  reverseExitAge: "Exit Age",
  reverseExitAgeSub: "At what age do you want to reach FIRE?",
  reverseResultSavings: "Required Savings",
  reverseResultFireNumber: "FIRE Number",
  reverseResultMonteCarlo: "Success Probability",
  reverseCalculate: "Calculate",
  reverseProjectionTitle: "Savings Projection",
  reverseProjectionSubtitle: "Portfolio growth at required savings rate",
  reverseReturnRate: "Expected Return",
  reverseReturnRateSub: "Annual return p.a.",
  reverseInflation: "Inflation",
  reverseInflationSub: "Annual inflation rate",
  reverseSwr: "Withdrawal Rate (SWR)",
  reverseSwrSub: "Safe withdrawal rate p.a.",
  reverseTotalTaxPaid: "Total Tax Paid",
  reversePassiveIncome: "Passive Income",
  reversePassiveIncomeSub: "Monthly at FIRE",
  reverseCoastFireYear: "Coast FIRE",
  reverseCoastFireYearSub: "Stop saving and coast from here",
  reverseCoastFireNone: "Not reached",
  reverseSavingsRate: "Savings Rate",
  reverseSavingsRateSub: (savings: string, net: string) => `${savings} of ${net} net`,
  reverseDrawdownTitle: "Drawdown Phase",
  reverseDrawdownSubtitle: "Portfolio evolution after FIRE",
  reverseDrawdownSurvives: "Portfolio survives 40 years ✓",
  reverseDrawdownDepleted: (year: number) => `Portfolio depleted in year ${year}`,
  reverseMonteCarloTitle: "Monte Carlo – Drawdown Phase",
  reverseMonteCarloSubtitle: "1,000 simulations with random returns",
  reverseSensitivityTitle: "Sensitivity Analysis",
  reverseSensitivitySubtitle: "How return assumptions affect required savings",
  reverseSensitivityReturn: "Return",
  reverseSensitivitySavings: "Savings/Month",
  reverseSensitivityFireNum: "FIRE Number",
  reverseCurrentVsRequired: "Current vs. Required",
  reverseCurrentLine: "Current Savings",
  reverseRequiredLine: "Required Savings",
  reverseTableTitle: "Year-by-Year Details",
  reverseTableSubtitle: "Detailed projection year by year",

  reverseMcRecommendedSavings: "MC Recommendation",
  reverseMcRecommendedSavingsSub: "75% success probability",
  reverseMcSuccessRate: "MC Success Rate",
  reverseMcSuccessRateSub: "Share of successful simulations",
  reverseDeterministicSavings: "Deterministic",
  reverseDeterministicSavingsSub: "At constant return",
  reverseAccMcTitle: "Monte Carlo – Accumulation Phase",
  reverseAccMcSubtitle: "500 simulations: portfolio growth at recommended savings rate",
  reverseMcConfidenceBadge: (pct: number) => `${pct.toFixed(0)}% confidence`,

  reverseAgeSavingsTitle: "Savings by Exit Age",
  reverseAgeSavingsSubtitle: "Monte Carlo–simulated savings rate for different FIRE ages",
  reverseAgeSavingsAge: "Age",
  reverseAgeSavingsMc: "MC Savings",
  reverseAgeSavingsDet: "Deterministic",
  reverseAgeSavingsFireNum: "FIRE Number",
  reverseAgeSavingsSuccessRate: "MC Success",
  reverseAgeSavingsYears: "Years",
  reverseAgeSavingsChartLabel: "MC Savings (75% Confidence)",
  reverseAgeSavingsDetLabel: "Deterministic",

  presetConservative: "Conservative",
  presetBalanced: "Balanced",
  presetAggressive: "Aggressive",
  presetLabel: "Quick Presets",
  presetConservativeDesc: "5% return · 3% SWR · 3% inflation",
  presetBalancedDesc: "7% return · 3.5% SWR · 2.5% inflation",
  presetAggressiveDesc: "9% return · 4% SWR · 2% inflation",

  errorTitle: "Something went wrong",
  errorMessage: "An unexpected error occurred. Please try refreshing the page.",
  errorRetry: "Try Again",
  coastFireLabel: "Coast FIRE",
  fullFireLabel: "Full FIRE",
  kpiMonteCarlo: "Monte Carlo",
  phaseLabel: (n: number) => `Phase ${n}`,

  // Tax Country
  taxCountry: "Tax Country",
  taxCountryTooltip: "Select your tax country for capital gains taxation.",
  taxCountryDE: "🇩🇪 Germany",
  taxCountryUS: "🇺🇸 USA",
  taxCountryUK: "🇬🇧 United Kingdom",
  taxCountryCH: "🇨🇭 Switzerland",
  taxCountryAT: "🇦🇹 Austria",
  taxCountryNL: "🇳🇱 Netherlands",
  taxCountryCA: "🇨🇦 Canada",
  taxCountryAU: "🇦🇺 Australia",
  taxCountryFR: "🇫🇷 France",

  // Life Events
  lifeEventsSection: "Life Events",
  lifeEventsAdd: "Add Event",
  lifeEventsName: "Name",
  lifeEventsType: "Type",
  lifeEventsStartYear: "Start Year",
  lifeEventsEndYear: "End Year",
  lifeEventsAmount: "Annual Amount",
  lifeEventsInflationAdj: "Inflation Adjusted",
  lifeEventsRemove: "Remove",
  lifeEventHomePurchase: "Home Purchase",
  lifeEventChild: "Child",
  lifeEventCareerChange: "Career Change",
  lifeEventInheritance: "Inheritance",
  lifeEventPensionStart: "Pension Start",
  lifeEventHealthcare: "Healthcare Costs",
  lifeEventOneTimeExpense: "One-Time Expense",
  lifeEventOneTimeIncome: "One-Time Income",
  lifeEventSideIncome: "Side Income",
  lifeEventsEmpty: "No life events planned",

  // Scenarios
  scenariosSection: "Scenarios",
  scenariosSave: "Save",
  scenariosLoad: "Load",
  scenariosDelete: "Delete",
  scenariosName: "Scenario Name",
  scenariosNamePrompt: "Name for this scenario:",
  scenariosCurrent: "Current",
  scenariosEmpty: "No saved scenarios",

  // Lifecycle Monte Carlo
  lifecycleMCTitle: "Lifecycle Monte Carlo",
  lifecycleMCSubtitle: "500 stochastic simulations of the accumulation phase",
  lifecycleMCSuccess: (rate: string) => `${rate}% reach FIRE`,
  lifecycleMCYearsToFire: "FIRE Age",
  lifecycleMCP50Years: (age: string) => `Median: Age ${age}`,
  lifecycleMCRange: (p10: string, p90: string) => `P10–P90: ${p10}–${p90}`,

  // Example Plans
  examplePlansSection: "Example FIRE Plans",
  examplePlansSelect: "Load example plan…",
  examplePlansDescription: "Pre-built, realistic FIRE plans for every income group",
  examplePlanStudentStarter: "🎓 Student / Career Starter (€1,800 net)",
  examplePlanStudentStarterDesc: "Age 22, saving €300/mo — even small amounts compound massively over time",
  examplePlanBlueCollar: "🔧 Blue-Collar Worker (€2,200 net)",
  examplePlanBlueCollarDesc: "Age 25, €400/mo — a solid foundation through an early start",
  examplePlanMedianEarner: "💼 Median Earner (€3,000 net)",
  examplePlanMedianEarnerDesc: "Age 30, €800/mo — the classic FIRE path",
  examplePlanDualIncome: "👫 Dual Income Couple (€5,500 net combined)",
  examplePlanDualIncomeDesc: "Age 32, couple strategy saving €1,800/mo together",
  examplePlanHighEarner: "🚀 High Earner (€6,500 net)",
  examplePlanHighEarnerDesc: "Age 28, aggressive €3,000/mo — FIRE in under 15 years",
  examplePlanLateStarter: "⏰ Late Starter (€3,500 net)",
  examplePlanLateStarterDesc: "Age 40, €1,200/mo — it's never too late!",
  examplePlanAggressiveSaver: "🔥 Extreme Saver (€4,000 net)",
  examplePlanAggressiveSaverDesc: "Age 25, €2,500/mo (62% savings rate) — FIRE in ~10 years",

  // No-investment comparison
  noInvestmentLabel: "Compare without investing",
  noInvestmentTooltip: "Shows what would have happened if the same money was saved but never invested (inflation erosion only)",
  chartLabelNoInvestment: "No Investment (savings only)",

  // Simple / Advanced mode (legacy)
  simpleMode: "Simple",
  advancedMode: "Advanced",
  simpleModeHint: "Shows only the most important settings",

  // Sidebar section headers
  mainParameters: "📌 Key Inputs",
  adjustments: "⚙️ Adjustments",

  // Onboarding wizard
  onboardingTitle: "Welcome to the FIRE Simulator!",
  onboardingSubtitle: "Set up your personal financial plan in just a few steps.",
  onboardingStep1Title: "About You",
  onboardingStep1Desc: "Your age and monthly net income",
  onboardingStep2Title: "Savings",
  onboardingStep2Desc: "Starting capital and monthly savings rate",
  onboardingStep3Title: "Retirement Goal",
  onboardingStep3Desc: "Desired income in retirement",
  onboardingStep4Title: "Tax Country",
  onboardingStep4Desc: "Select your country for tax calculations",
  onboardingNext: "Next",
  onboardingBack: "Back",
  onboardingFinish: "Start Simulation",
  onboardingSkip: "Skip",
  onboardingAgeLabel: "Your Age",
  onboardingIncomeLabel: "Monthly Net Income",
  onboardingSavingsLabel: "Monthly Savings",
  onboardingDesiredIncomeLabel: "Desired Retirement Income",
  onboardingCountryLabel: "Tax Country",
  onboardingStartCapitalLabel: "Current Savings",

  // Dashboard sections
  sectionFireJourney: "🚀 Your FIRE Journey",
  sectionFireJourneyDesc: "Overview and wealth projection",
  sectionStressTesting: "🎲 Stress Testing",
  sectionStressTestingDesc: "Monte Carlo simulations and scenarios",
  sectionDrawdownAnalysis: "📉 Drawdown Analysis",
  sectionDrawdownAnalysisDesc: "Portfolio trajectory after FIRE",
  sectionPlanning: "📋 Planning",
  sectionPlanningDesc: "Life events, details and phases",

  // Undo / Redo
  undo: "Undo",
  redo: "Redo",

  // FIRE Progress Gauge
  fireProgressTitle: "FIRE Progress",
  fireProgressSub: "Current progress towards goal",
  fireProgressComplete: "Goal reached!",
  fireProgressOf: "of",

  // Contextual Guidance Card
  guidanceOnTrack: (fireAge, yearsEarly) => yearsEarly > 0
    ? `🎉 You're on track! You can retire at age ${fireAge} — ${yearsEarly} year${yearsEarly !== 1 ? "s" : ""} before standard retirement age.`
    : `🎉 You're on track! You can retire at age ${fireAge}.`,
  guidanceNeedMore: (amount) => `💡 You need ${amount}/month more savings to reach your FIRE goal.`,
  guidanceAlreadyFire: "🏆 Congratulations! You've already reached your FIRE goal.",
  guidanceNoTarget: "⚠️ With current settings, the FIRE goal is not reachable within 50 years.",
  guidanceTip: "Tip",
  guidanceMcWarning: (pct) => `⚠️ Monte Carlo success rate is only ${pct}% — consider lowering your SWR or saving more.`,
  guidanceMcGood: (pct) => `✅ Monte Carlo success rate: ${pct}% — your plan is robust.`,
  guidanceSavingsLow: (current, required) => `Current savings: ${current}/month vs. required: ${required}/month`,
  guidanceSavingsGood: "Your savings rate is sufficient — keep it up!",

  // Nominal/Real Toggle
  showNominal: "Nominal",
  showReal: "Real (inflation-adjusted)",
  nominalTooltip: "Toggle between nominal and inflation-adjusted values",

  // Country-Specific Defaults
  applyCountryDefaults: "Apply country defaults",
  countryDefaultsApplied: "Country defaults applied",

  // Onboarding Result Preview
  onboardingPreviewTitle: "Your Preview",
  onboardingPreviewFireAge: (age) => `Estimated FIRE age: ${age}`,
  onboardingPreviewFireNumber: "FIRE target",
  onboardingPreviewNotReachable: "With these values, the FIRE goal won't be reached within 50 years. You can adjust the values after starting.",

  // --- NEW: Education Hub / Learn modal ---
  learnButton: "📖 Learn",
  learnTitle: "FIRE Glossary",
  learnClose: "Close",
  learnWhatIsFire: "What is FIRE?",
  learnWhatIsFireDesc: "FIRE stands for «Financial Independence, Retire Early» — having enough money saved that you never need to work again. Your investments generate enough passive income to cover all living expenses.",
  learnFireNumber: "FIRE Number (Target Wealth)",
  learnFireNumberDesc: "The total amount you need. Simple formula: If you need €2,500/month, that's €30,000/year. Multiply by 25–30× = your target (€750,000–€900,000).",
  learnSwr: "Withdrawal Rate (SWR / 4% Rule)",
  learnSwrDesc: "The «Safe Withdrawal Rate» tells you how much you can take out each year without running out of money. At 4%, you withdraw 4% of your savings per year — this has historically worked for 30+ years.",
  learnCoastFire: "Coast FIRE",
  learnCoastFireDesc: "The point where your investments grow enough on their own — even if you stop saving entirely. From here, time works for you.",
  learnMonteCarlo: "Stress Test (Monte Carlo)",
  learnMonteCarloDesc: "We simulate 1,000 different market scenarios with random returns. The more scenarios where your money lasts, the safer your plan.",
  learnDrawdown: "Spending Phase (Drawdown)",
  learnDrawdownDesc: "The period AFTER you stop working. You live off your investments. We show you whether your portfolio lasts through your lifetime.",
  learnSavingsRate: "Savings Rate",
  learnSavingsRateDesc: "What percentage of your income you save. A higher savings rate means faster FIRE. Most FIRE achievers save 30–50%.",
  learnCompoundInterest: "Compound Interest",
  learnCompoundInterestDesc: "Your money earns returns, and those returns earn returns. The earlier you start, the more powerful this effect — time is your greatest ally.",

  // --- NEW: Education panel (What is FIRE?) on dashboard ---
  fireEducationTitle: "🔥 What is FIRE?",
  fireEducationBody: "FIRE means «Financial Independence, Retire Early» — having enough money that you can live off your savings without needing to work. This simulator shows you when you'll reach that goal and what you can do to get there faster.",
  fireEducationDismiss: "Got it!",
  fireEducationShowAgain: "What is FIRE?",

  // --- NEW: Revamped onboarding (story-driven) ---
  onboardingStep1DescStory: "Let's figure out when you could stop working. First, tell us where you are today.",
  onboardingStep2DescStory: "Great! How much have you already saved, and how much can you put aside each month? Even small amounts matter — time is your biggest advantage.",
  onboardingStep3DescStory: "Imagine you never had to work again. How much would you need each month to live comfortably? Don't overthink it — you can always adjust later.",
  onboardingStep4DescStory: "Almost done! Your country determines taxes and pension rules. We'll handle the rest.",
  onboardingBenchmarkAge: "Most FIRE planners start at age 25–35",
  onboardingBenchmarkIncome: (currency) => `Typical: ${currency}2,500–5,000 net`,
  onboardingBenchmarkSavings: (currency) => `Most people your age save ${currency}300–800/month`,
  onboardingBenchmarkDesiredIncome: (currency) => `Typical: ${currency}2,000–4,000 monthly`,
  onboardingUseCountryAvg: "Use country average",
  onboardingQuickResultTitle: "🎉 Your Result",
  onboardingQuickResultBody: (age) => `You could be financially free at age ${age}!`,
  onboardingQuickResultCelebrate: "Let's go!",

  // --- NEW: Beginner-friendly terminology ---
  beginnerFireNumber: "Your Goal Amount",
  beginnerCoastFire: "Savings Autopilot",
  beginnerMonteCarlo: "How Safe Is Your Plan?",
  beginnerDrawdown: "After You Stop Working",
  beginnerSwr: "Annual Withdrawal Rate",
  beginnerSavingsRate: "How Much You're Saving",
  beginnerPassiveIncome: "Income Without Working",
  beginnerWithdrawalPreserve: "Live Off the Earnings",
  beginnerWithdrawalSpend: "Spend It All",

  // --- NEW: Dashboard mode toggle ---
  modeBeginner: "Beginner",
  modeStandard: "Standard",
  modeAdvanced: "Advanced",
  modeLabel: "View",

  // --- NEW: Beginner Journey Card ---
  beginnerJourneyTitle: "Your Path to Financial Freedom",
  beginnerJourneySavings: (amount) => `If you save ${amount}/month and invest it…`,
  beginnerJourneyFireAge: (age) => `…you could retire at age ${age}`,
  beginnerJourneyFireNumber: (amount) => `You need ${amount} total`,
  beginnerJourneyProgress: (pct) => `You're already ${pct}% of the way there`,
  beginnerJourneyTips: "How to get there faster:",
  beginnerTipSaveMore: "Save an extra €100 per month",
  beginnerTipStartEarly: "The earlier you start, the better",
  beginnerTipReduceSpending: "Review your monthly expenses",
  beginnerTipInvest: "Invest in diversified ETFs",

  // --- NEW: Actionable guidance ---
  guidanceActionRetireEarlier: (amount) => `💡 To retire earlier, try increasing your monthly savings by ${amount}, or consider a lower desired income.`,
  guidanceActionMcLow: (amount) => `⚠️ Your plan has some risk. Save ${amount} more per month or target a slightly lower monthly income.`,
  guidanceActionSavingsLow: "📊 Your savings rate is low. Most FIRE achievers save 30–50% of their income.",
  guidanceActionAlreadyFire: "🎉 Congratulations! You've already reached financial independence. Your investments can cover your desired lifestyle.",

  // --- NEW: What If? panel ---
  whatIfTitle: "What if…",
  whatIfSaveMore: (amount) => `I save ${amount} more?`,
  whatIfRetireLater: "I retire 5 years later?",
  whatIfLessIncome: "I need less income?",
  whatIfYearsEarlier: (n) => `${n} ${n === 1 ? "year" : "years"} earlier!`,
  whatIfYearsLater: (n) => `${n} ${n === 1 ? "year" : "years"} later`,
  whatIfNoChange: "No change",

  // --- NEW: Chart explainers ---
  chartExplainButton: "What does this chart show?",
  chartExplainFireChart: "The green area shows your savings growing over time. The dotted line is your goal. Where they meet = your FIRE date!",
  chartExplainMonteCarloChart: "We ran 1,000 different random market scenarios. The more green you see, the safer your plan is.",
  chartExplainDrawdownChart: "This shows what happens to your money AFTER you stop working. As long as the line stays above zero, you're good!",
  chartExplainLifecycleChart: "This simulation shows different possible paths for your savings phase with random market returns.",
  chartSummaryFireChart: (age) => age !== null ? `Based on your inputs, you'll reach your goal at age ${age}.` : "With current inputs, the goal won't be reached within 50 years.",
  chartSummaryMonteCarloChart: (pct) => `In ${pct}% of simulated scenarios, your money lasts. Above 80% is considered robust.`,
  chartSummaryDrawdownChart: (survives) => survives ? "Good news: Your portfolio survives the spending phase!" : "Warning: Your portfolio may run out during the spending phase.",

  // --- NEW: Milestones ---
  milestonesTitle: "Your Milestones",
  milestonesStart: "Start (today)",
  milestones25: "25% of goal",
  milestonesCoast: "Savings autopilot",
  milestones75: "75% of goal",
  milestonesFire: "FIRE reached!",
  milestonesNextTitle: "Your Next Milestone",
  milestonesNextBody: (amount, months) => `You're ${amount} away from your next milestone! At your current savings rate, you'll hit it in ${months} months.`,
  milestonesCompleted: "Completed ✓",

  // --- NEW: FIRE Score ---
  fireScoreTitle: "FIRE Score",
  fireScoreSub: "Overall assessment of your plan",
  fireScoreExcellent: "Excellent",
  fireScoreGreat: "Great",
  fireScoreGood: "Good",
  fireScoreNeedsWork: "Needs Work",
  fireScoreSavingsRate: "Savings Rate",
  fireScoreTimeline: "Timeline",
  fireScoreMonteCarlo: "Monte Carlo",
  fireScoreDrawdown: "Drawdown Safety",

  // --- NEW: Accessibility ---
  skipToContent: "Skip to content",
  chartAltFireChart: "Chart showing wealth growth over time",
  chartAltMonteCarloChart: "Monte Carlo simulation: distribution of outcomes",
  chartAltDrawdownChart: "Chart showing portfolio evolution during the spending phase",
};

const translations: Record<Locale, Translations> = { de, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
