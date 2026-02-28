// StarYaar – shared types (Prompt 1; expanded as needed)

export type GrahaId =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type RashiId =
  | 'Mesha' | 'Vrishabha' | 'Mithuna' | 'Karka' | 'Simha' | 'Kanya'
  | 'Tula' | 'Vrishchika' | 'Dhanu' | 'Makara' | 'Kumbha' | 'Meena';

export interface ChartData {
  houses: Record<number, { rashi: RashiId; planets: Array<{ graha: GrahaId; degree: number; retrograde?: boolean }> }>;
  lagna: RashiId;
  chartType?: string;
  chartName?: string;
}

// Panchang (day view) for report header
export interface Panchang {
  lagna: string;
  lagnaEnglish?: string;
  tithi: string;
  nakshatra: string;
  nakshatraPada?: string;
  yoga: string;
  karana: string;
  vara: string;
  varaEnglish?: string;
}

export interface PlanetPosition {
  graha: GrahaId;
  rashi: RashiId;
  degree: number;
  nakshatra?: string;
  pada?: number;
  house: number;
  isRetrograde?: boolean;
}

/** Dasha period (Maha / Antar / Pratyantar) for birth chart */
export interface DashaPeriod {
  label: string;
  planet: string;
  duration: string;
  start: string;
  end: string;
}
