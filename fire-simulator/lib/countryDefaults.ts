// ---------------------------------------------------------------------------
// Country-specific default values
// ---------------------------------------------------------------------------
// When a user selects a tax country, these defaults are suggested as starting
// values. They represent rough median / typical values for each country.
// ---------------------------------------------------------------------------

import type { TaxCountry } from "@/lib/tax";

export interface CountryDefaults {
  monatlichesNetto: number;
  monatlicheSparrate: number;
  monatlichesWunschEinkommen: number;
  gesetzlicheRente: number;
  renteneintrittsalter: number;
  etfRendite: number;
  inflation: number;
  swr: number;
}

export const COUNTRY_DEFAULTS: Record<TaxCountry, CountryDefaults> = {
  DE: {
    monatlichesNetto: 3_500,
    monatlicheSparrate: 800,
    monatlichesWunschEinkommen: 2_500,
    gesetzlicheRente: 1_200,
    renteneintrittsalter: 67,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 3.5,
  },
  US: {
    monatlichesNetto: 5_000,
    monatlicheSparrate: 1_200,
    monatlichesWunschEinkommen: 4_000,
    gesetzlicheRente: 1_800,
    renteneintrittsalter: 67,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 4.0,
  },
  UK: {
    monatlichesNetto: 3_000,
    monatlicheSparrate: 700,
    monatlichesWunschEinkommen: 2_500,
    gesetzlicheRente: 900,
    renteneintrittsalter: 66,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 3.5,
  },
  CH: {
    monatlichesNetto: 6_000,
    monatlicheSparrate: 1_500,
    monatlichesWunschEinkommen: 4_500,
    gesetzlicheRente: 2_000,
    renteneintrittsalter: 65,
    etfRendite: 6.0,
    inflation: 1.5,
    swr: 3.5,
  },
  AT: {
    monatlichesNetto: 3_000,
    monatlicheSparrate: 700,
    monatlichesWunschEinkommen: 2_300,
    gesetzlicheRente: 1_400,
    renteneintrittsalter: 65,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 3.5,
  },
  NL: {
    monatlichesNetto: 3_500,
    monatlicheSparrate: 800,
    monatlichesWunschEinkommen: 2_500,
    gesetzlicheRente: 1_100,
    renteneintrittsalter: 67,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 3.5,
  },
  CA: {
    monatlichesNetto: 4_500,
    monatlicheSparrate: 1_000,
    monatlichesWunschEinkommen: 3_500,
    gesetzlicheRente: 1_200,
    renteneintrittsalter: 65,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 4.0,
  },
  AU: {
    monatlichesNetto: 5_000,
    monatlicheSparrate: 1_200,
    monatlichesWunschEinkommen: 3_500,
    gesetzlicheRente: 1_500,
    renteneintrittsalter: 67,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 4.0,
  },
  FR: {
    monatlichesNetto: 3_000,
    monatlicheSparrate: 600,
    monatlichesWunschEinkommen: 2_300,
    gesetzlicheRente: 1_300,
    renteneintrittsalter: 64,
    etfRendite: 7.0,
    inflation: 2.5,
    swr: 3.5,
  },
};
