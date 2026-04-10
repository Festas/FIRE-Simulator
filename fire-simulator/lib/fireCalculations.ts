export interface FireInputs {
  startKapital: number;
  monatlicheSparrate: number;
  dynamikSparrate: number;
  etfRendite: number;
  inflation: number;
  bavJaehrlich: number;
  zielvermoegen: number;
  lzkJahre: number;
  lzkRendite: number;
  startYear: number;
}

export interface YearDataPoint {
  year: number;
  calendarYear: number;
  etfBalanceNominal: number;
  etfBalanceReal: number;
  lzkBalanceNominal: number;
  lzkBalanceReal: number;
  totalReal: number;
  annualETFContrib: number;
  annualLZKContrib: number;
  monthlySavings: number;
  isLZKPhase: boolean;
}

export interface FireResult {
  yearlyData: YearDataPoint[];
  coastFireYear: number | null;
  fullFireYear: number | null;
  coastFireCalendarYear: number | null;
  fullFireCalendarYear: number | null;
  lzkStartYear: number;
  lzkStartCalendarYear: number;
  passiveIncomeAtExit: number;
  swRate: number;
  targetReached: boolean;
}

const MAX_YEARS = 30;
const SWR = 0.035;

export function calculateFIRE(inputs: FireInputs): FireResult {
  const {
    startKapital,
    monatlicheSparrate,
    dynamikSparrate,
    etfRendite,
    inflation,
    bavJaehrlich,
    zielvermoegen,
    lzkJahre,
    lzkRendite,
    startYear,
  } = inputs;

  const roi = etfRendite / 100;
  const inf = inflation / 100;
  const dyn = dynamikSparrate / 100;
  const lzkRoi = lzkRendite / 100;

  // Pass 1: estimate full FIRE year without LZK
  let etfBal = startKapital;
  let estimatedFireYear = MAX_YEARS;
  for (let y = 1; y <= MAX_YEARS; y++) {
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    etfBal = (etfBal + contrib) * (1 + roi);
    const realVal = etfBal / Math.pow(1 + inf, y);
    if (realVal >= zielvermoegen) {
      estimatedFireYear = y;
      break;
    }
  }

  const lzkStartYear = Math.max(1, estimatedFireYear - lzkJahre);

  // Pass 2: full simulation with LZK logic
  etfBal = startKapital;
  let lzkBal = 0;
  const yearlyData: YearDataPoint[] = [];

  yearlyData.push({
    year: 0,
    calendarYear: startYear,
    etfBalanceNominal: startKapital,
    etfBalanceReal: startKapital,
    lzkBalanceNominal: 0,
    lzkBalanceReal: 0,
    totalReal: startKapital,
    annualETFContrib: 0,
    annualLZKContrib: 0,
    monthlySavings: monatlicheSparrate,
    isLZKPhase: false,
  });

  let coastFireYear: number | null = null;
  let fullFireYear: number | null = null;

  if (startKapital >= 1_000_000) coastFireYear = 0;
  if (startKapital >= zielvermoegen) fullFireYear = 0;

  for (let y = 1; y <= MAX_YEARS; y++) {
    const isLZKPhase = y >= lzkStartYear;
    const savings = monatlicheSparrate * Math.pow(1 + dyn, y - 1);
    const contrib = savings * 12 + bavJaehrlich;
    const realFactor = Math.pow(1 + inf, y);

    let annualETFContrib = 0;
    let annualLZKContrib = 0;

    if (isLZKPhase) {
      etfBal = etfBal * (1 + roi);
      lzkBal = (lzkBal + contrib) * (1 + lzkRoi);
      annualLZKContrib = contrib;
    } else {
      etfBal = (etfBal + contrib) * (1 + roi);
      annualETFContrib = contrib;
    }

    const etfReal = etfBal / realFactor;
    const lzkReal = lzkBal / realFactor;
    const totalReal = etfReal + lzkReal;

    yearlyData.push({
      year: y,
      calendarYear: startYear + y,
      etfBalanceNominal: etfBal,
      etfBalanceReal: etfReal,
      lzkBalanceNominal: lzkBal,
      lzkBalanceReal: lzkReal,
      totalReal,
      annualETFContrib,
      annualLZKContrib,
      monthlySavings: savings,
      isLZKPhase,
    });

    if (coastFireYear === null && totalReal >= 1_000_000) coastFireYear = y;
    if (fullFireYear === null && totalReal >= zielvermoegen) fullFireYear = y;
  }

  const exitIdx = fullFireYear !== null ? fullFireYear : MAX_YEARS;
  const exitBalance = yearlyData[exitIdx]?.totalReal ?? 0;
  const passiveIncomeAtExit = (exitBalance * SWR) / 12;

  return {
    yearlyData,
    coastFireYear,
    fullFireYear,
    coastFireCalendarYear:
      coastFireYear !== null ? startYear + coastFireYear : null,
    fullFireCalendarYear:
      fullFireYear !== null ? startYear + fullFireYear : null,
    lzkStartYear,
    lzkStartCalendarYear: startYear + lzkStartYear,
    passiveIncomeAtExit,
    swRate: SWR * 100,
    targetReached: fullFireYear !== null,
  };
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEuroShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mio. €`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("de-DE", { maximumFractionDigits: 0 })}k €`;
  }
  return formatEuro(value);
}
