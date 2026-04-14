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
  csvExport: string;
  live: string;

  // Sidebar sections
  retirementGoals: string;
  savingsPhase: string;
  returnMarket: string;
  taxes: string;
  withdrawalStrategy: string;
  lzkSection: string;
  manualTarget: string;

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

  // Reverse Planner
  reversePlannerTab: string;
  forwardSimTab: string;
  reversePlannerTitle: string;
  reversePlannerSubtitle: string;
  reverseTargetIncome: string;
  reverseTargetIncomeSub: string;
  reverseTargetYears: string;
  reverseTargetYearsSub: string;
  reverseResultSavings: string;
  reverseResultFireNumber: string;
  reverseResultMonteCarlo: string;
  reverseCalculate: string;
  reverseProjectionTitle: string;
  reverseProjectionSubtitle: string;

  // Presets
  presetConservative: string;
  presetBalanced: string;
  presetAggressive: string;
  presetLabel: string;

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
  lifecycleMCP50Years: (years: string) => string;
  lifecycleMCRange: (p10: string, p90: string) => string;
}

export const de: Translations = {
  appTitle: "FIRE Masterplan Simulator",
  appSubtitle: "Family Office Dashboard · Kaufkraftbereinigte Projektion · inkl. Steuern & Entnahmephase",
  sidebarTitle: "FIRE Masterplan",
  sidebarSubtitle: "Family Office Simulator",
  menuOpen: "Menü öffnen",
  csvExport: "CSV Export",
  live: "Live",

  retirementGoals: "🎯 Ruhestandsziel",
  savingsPhase: "💰 Sparphase",
  returnMarket: "📈 Rendite & Markt",
  taxes: "🏛️ Steuern",
  withdrawalStrategy: "📤 Entnahme-Strategie",
  lzkSection: "🔒 Langzeitkonto (LZK)",
  manualTarget: "Manuelles Zielvermögen",

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
  lzkPhase: "LZK-Phase (Jahre)",
  lzkPhaseSub: "Endspurt-Dauer vor dem FIRE-Exit",
  lzkPhaseTooltip: "In den letzten Jahren vor dem Exit fließen Ihre Beiträge in ein risikoarmes Langzeitkonto.",
  lzkReturn: "LZK-Rendite",
  lzkReturnSub: "Zinssatz des Langzeitkontos",
  lzkReturnTooltip: "Rendite des LZK (z.B. Festgeld, Tagesgeld). Typisch: 2-4% p.a.",
  targetWealth: "Zielvermögen (Override)",
  targetWealthSub: "Überschreibt die automatische FIRE-Zahl",
  targetWealthTooltip: "Standardmäßig wird Ihr Zielvermögen aus dem Wunsch-Einkommen, der Rente und der SWR berechnet. Hier können Sie es manuell überschreiben.",
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
  kpiLzkStart: "LZK Start",
  kpiTargetReached: (years, target) => `Zielvermögen ${target} in ${years} Jahren`,
  kpiTargetNotReached: "Sparrate oder Rendite erhöhen",
  kpiYearLabel: (year) => `Jahr ${year}`,
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
  kpiLzkStartSub: "ETF-Beiträge enden · Konto läuft weiter",
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
  tableEtf: "ETF (real)",
  tableLzk: "LZK (real)",
  tableTotal: "Gesamt (real)",
  tableSavingsMonth: "Sparrate/M",
  tableGains: "Erträge",
  tableTaxes: "Steuern",
  tableWithdrawal: "Entnahme",
  tablePhase: "Phase",
  phaseWithdrawal: "Entnahme",
  phaseLzk: "LZK",
  phaseSaving: "Sparen",

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
  phase4Title: "Langzeitkonto (LZK) Endspurt",
  phase4Subtitle: "Risiko reduzieren",
  phase4Desc: "ETF-Beiträge stoppen. Monatliche Sparrate fließt in ein risikofreies Langzeitkonto (Festgeld/Tagesgeld). ETF wächst durch Zinseszins weiter.",
  phase5Title: "Exit & Entnahme",
  phase5Subtitle: "FIRE erreicht",
  phase5Desc: (swr) => `Finanzieller Ruhestand. Entnahme nach der Safe Withdrawal Rate (${swr} %). ETF und LZK decken alle Lebenshaltungskosten. Arbeit optional.`,
  phaseCritical: "Kritisch",

  warnReturnBelowInflation: (ret, inf) => `⚠️ Ihre erwartete Rendite (${ret}%) liegt unter oder gleich der Inflation (${inf}%). Ihr Vermögen verliert real an Kaufkraft.`,
  warnNoCapitalNoSavings: "⚠️ Ohne Startkapital und ohne monatliche Sparrate kann kein Vermögen aufgebaut werden.",
  warnIncomeAbovePension: "ℹ️ Ihr Wunsch-Einkommen ist geringer als die erwartete Rente. Kein zusätzliches Vermögen nötig!",
  warnHighSwr: "⚠️ Eine SWR von 5% oder mehr gilt als riskant. Historisch hatte die 4%-Regel bereits eine Ausfallwahrscheinlichkeit.",
  warnHighReturn: "ℹ️ Eine Rendite von 10%+ p.a. ist sehr optimistisch. Der MSCI World liegt historisch bei ca. 7% brutto.",

  disclaimer: "Diese Simulation dient ausschließlich Informationszwecken und stellt keine Anlageberatung dar. Alle Werte basieren auf vereinfachten Annahmen und historischen Durchschnittswerten. Steuerberechnung nach deutschem Recht (Abgeltungssteuer + Teilfreistellung).",

  darkMode: "Dunkel",
  lightMode: "Hell",
  language: "Sprache",

  chartLabelETF: "ETF",
  chartLabelLZK: "LZK",
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
  retirementAge: "Rentenalter",

  reversePlannerTab: "🔄 Rückwärtsrechner",
  forwardSimTab: "📊 Simulation",
  reversePlannerTitle: "Rückwärtsrechner",
  reversePlannerSubtitle: "Wie viel müssen Sie monatlich sparen, um Ihr Ziel zu erreichen?",
  reverseTargetIncome: "Wunsch-Einkommen",
  reverseTargetIncomeSub: "Netto monatlich im Ruhestand",
  reverseTargetYears: "Zieljahre",
  reverseTargetYearsSub: "FIRE in X Jahren erreichen",
  reverseResultSavings: "Benötigte Sparrate",
  reverseResultFireNumber: "FIRE-Zahl",
  reverseResultMonteCarlo: "Erfolgswahrscheinlichkeit",
  reverseCalculate: "Berechnen",
  reverseProjectionTitle: "Spar-Projektion",
  reverseProjectionSubtitle: "Vermögensentwicklung bei benötigter Sparrate",

  presetConservative: "Konservativ",
  presetBalanced: "Ausgewogen",
  presetAggressive: "Aggressiv",
  presetLabel: "Schnellvorlagen",

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
  lifecycleMCYearsToFire: "Jahre bis FIRE",
  lifecycleMCP50Years: (years: string) => `Median: ${years} Jahre`,
  lifecycleMCRange: (p10: string, p90: string) => `P10–P90: ${p10}–${p90} Jahre`,
};

export const en: Translations = {
  appTitle: "FIRE Masterplan Simulator",
  appSubtitle: "Family Office Dashboard · Inflation-Adjusted Projection · incl. Taxes & Withdrawal Phase",
  sidebarTitle: "FIRE Masterplan",
  sidebarSubtitle: "Family Office Simulator",
  menuOpen: "Open menu",
  csvExport: "CSV Export",
  live: "Live",

  retirementGoals: "🎯 Retirement Goals",
  savingsPhase: "💰 Savings Phase",
  returnMarket: "📈 Returns & Market",
  taxes: "🏛️ Taxes",
  withdrawalStrategy: "📤 Withdrawal Strategy",
  lzkSection: "🔒 Safe Account (LZK)",
  manualTarget: "Manual Target Wealth",

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
  lzkPhase: "LZK Phase (Years)",
  lzkPhaseSub: "Final sprint before FIRE exit",
  lzkPhaseTooltip: "In the last years before exit, your contributions flow into a low-risk safe account.",
  lzkReturn: "LZK Return",
  lzkReturnSub: "Interest rate of safe account",
  lzkReturnTooltip: "Return on the LZK (e.g., fixed deposit). Typical: 2-4% p.a.",
  targetWealth: "Target Wealth (Override)",
  targetWealthSub: "Overrides the automatic FIRE number",
  targetWealthTooltip: "By default, your target wealth is calculated from desired income, pension, and SWR. Here you can override it manually.",
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
  kpiLzkStart: "LZK Start",
  kpiTargetReached: (years, target) => `Target ${target} in ${years} years`,
  kpiTargetNotReached: "Increase savings rate or return",
  kpiYearLabel: (year) => `Year ${year}`,
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
  kpiLzkStartSub: "ETF contributions end · Account continues",
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
  tableEtf: "ETF (real)",
  tableLzk: "LZK (real)",
  tableTotal: "Total (real)",
  tableSavingsMonth: "Savings/M",
  tableGains: "Gains",
  tableTaxes: "Taxes",
  tableWithdrawal: "Withdrawal",
  tablePhase: "Phase",
  phaseWithdrawal: "Withdrawal",
  phaseLzk: "LZK",
  phaseSaving: "Saving",

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
  phase4Title: "Safe Account (LZK) Final Sprint",
  phase4Subtitle: "Reduce risk",
  phase4Desc: "Stop ETF contributions. Monthly savings flow into a risk-free safe account (fixed/call deposit). ETF continues to grow through compound interest.",
  phase5Title: "Exit & Withdrawal",
  phase5Subtitle: "FIRE achieved",
  phase5Desc: (swr) => `Financial retirement. Withdrawal at Safe Withdrawal Rate (${swr}%). ETF and LZK cover all living expenses. Work is optional.`,
  phaseCritical: "Critical",

  warnReturnBelowInflation: (ret, inf) => `⚠️ Your expected return (${ret}%) is at or below inflation (${inf}%). Your wealth loses purchasing power in real terms.`,
  warnNoCapitalNoSavings: "⚠️ Without starting capital and without monthly savings, no wealth can be built.",
  warnIncomeAbovePension: "ℹ️ Your desired income is less than the expected pension. No additional wealth needed!",
  warnHighSwr: "⚠️ An SWR of 5% or more is considered risky. Historically, the 4% rule already had a failure probability.",
  warnHighReturn: "ℹ️ A return of 10%+ p.a. is very optimistic. The MSCI World historically averages approx. 7% gross.",

  disclaimer: "This simulation is for informational purposes only and does not constitute investment advice. All values are based on simplified assumptions and historical averages. Tax calculation according to German law (Abgeltungssteuer + Teilfreistellung).",

  darkMode: "Dark",
  lightMode: "Light",
  language: "Language",

  chartLabelETF: "ETF",
  chartLabelLZK: "LZK",
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
  retirementAge: "Retirement age",

  reversePlannerTab: "🔄 Reverse Planner",
  forwardSimTab: "📊 Simulation",
  reversePlannerTitle: "Reverse Planner",
  reversePlannerSubtitle: "How much do you need to save monthly to reach your goal?",
  reverseTargetIncome: "Desired Income",
  reverseTargetIncomeSub: "Net monthly in retirement",
  reverseTargetYears: "Target Years",
  reverseTargetYearsSub: "Reach FIRE in X years",
  reverseResultSavings: "Required Savings",
  reverseResultFireNumber: "FIRE Number",
  reverseResultMonteCarlo: "Success Probability",
  reverseCalculate: "Calculate",
  reverseProjectionTitle: "Savings Projection",
  reverseProjectionSubtitle: "Portfolio growth at required savings rate",

  presetConservative: "Conservative",
  presetBalanced: "Balanced",
  presetAggressive: "Aggressive",
  presetLabel: "Quick Presets",

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
  lifecycleMCYearsToFire: "Years to FIRE",
  lifecycleMCP50Years: (years: string) => `Median: ${years} years`,
  lifecycleMCRange: (p10: string, p90: string) => `P10–P90: ${p10}–${p90} years`,
};

const translations: Record<Locale, Translations> = { de, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
