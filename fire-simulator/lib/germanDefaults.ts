// ---------------------------------------------------------------------------
// German default assumptions
// ---------------------------------------------------------------------------
// Rough median / typical starting values for Germany, used by the onboarding
// wizard and "use average" helpers.
// ---------------------------------------------------------------------------

export interface GermanDefaults {
  monatlichesNetto: number;
  monatlicheSparrate: number;
  monatlichesWunschEinkommen: number;
  gesetzlicheRente: number;
  renteneintrittsalter: number;
  etfRendite: number;
  inflation: number;
  swr: number;
  basiszins: number;
}

export const GERMAN_DEFAULTS: GermanDefaults = {
  monatlichesNetto: 3_500,
  monatlicheSparrate: 800,
  monatlichesWunschEinkommen: 2_500,
  gesetzlicheRente: 1_200,
  renteneintrittsalter: 67,
  etfRendite: 7.0,
  inflation: 2.5,
  swr: 3.5,
  basiszins: 2.53,
};
