/**
 * Mock Kundli report data for development (Prompt 14).
 * Used until the computation engine is connected.
 */
import type { ChartData, DashaPeriod, Panchang, PlanetPosition, RashiId } from './types';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

function rashiInHouse(houseNum: number, lagna: RashiId): RashiId {
  const lagnaIndex = RASHI_ORDER.indexOf(lagna);
  const index = (lagnaIndex + houseNum - 1) % 12;
  return RASHI_ORDER[index];
}

/** D1 Rashi chart – Dhanu Lagna (North Indian style), planetary positions matching sample UI */
export const mockChartD1: ChartData = {
  lagna: 'Dhanu',
  chartName: 'D1',
  chartType: 'Rashi',
  houses: (() => {
    const houses: ChartData['houses'] = {} as ChartData['houses'];
    for (let i = 1; i <= 12; i++) {
      houses[i as keyof typeof houses] = {
        rashi: rashiInHouse(i, 'Dhanu'),
        planets: [],
      };
    }
    const placements: Array<{ house: number; graha: PlanetPosition['graha']; degree: number; retrograde?: boolean }> = [
      { house: 2, graha: 'Ketu', degree: 10, retrograde: true },
      { house: 5, graha: 'Moon', degree: 20 },
      { house: 6, graha: 'Sun', degree: 16 },
      { house: 6, graha: 'Mars', degree: 3 },
      { house: 7, graha: 'Mercury', degree: 8 },
      { house: 7, graha: 'Venus', degree: 0 },
      { house: 8, graha: 'Rahu', degree: 10, retrograde: true },
      { house: 10, graha: 'Jupiter', degree: 6 },
      { house: 10, graha: 'Saturn', degree: 9 },
    ];
    placements.forEach(({ house, graha, degree, retrograde }) => {
      houses[house as keyof typeof houses].planets.push({ graha, degree, retrograde });
    });
    return houses;
  })(),
};

/** D9 Navamsa – simplified mock */
export const mockChartD9: ChartData = {
  lagna: 'Kanya',
  chartName: 'D9',
  chartType: 'Navamsa',
  houses: (() => {
    const houses: ChartData['houses'] = {} as ChartData['houses'];
    for (let i = 1; i <= 12; i++) {
      houses[i as keyof typeof houses] = {
        rashi: rashiInHouse(i, 'Kanya'),
        planets: [],
      };
    }
    houses[1].planets.push({ graha: 'Moon', degree: 5 });
    houses[2].planets.push({ graha: 'Sun', degree: 12 });
    houses[5].planets.push({ graha: 'Mars', degree: 20 });
    houses[7].planets.push({ graha: 'Mercury', degree: 8 });
    return houses;
  })(),
};

export const mockPanchang: Panchang = {
  lagna: 'Dhanu',
  lagnaEnglish: 'Sagittarius',
  tithi: 'Krishna Trayodashi',
  nakshatra: 'Bharani',
  nakshatraPada: 'Pada 3',
  yoga: 'Atiganda',
  karana: 'Vanija',
  vara: 'Ravivara',
  varaEnglish: 'Sunday',
};

/** Current Dasha periods (Maha, Antar, Pratyantar) for birth chart */
export const mockDasha: { periods: DashaPeriod[]; flow: string } = {
  periods: [
    { label: 'MAHA DASHA', planet: 'Rahu', duration: '18.0y', start: '31 May 2013', end: '31 May 2031' },
    { label: 'ANTARDASHA', planet: 'Venus', duration: '3.0y', start: '18 Dec 2024', end: '18 Dec 2027' },
    { label: 'PRATYANTARDASHA', planet: 'Rahu', duration: '5m', start: '14 Jan 2026', end: '27 Jun 2026' },
  ],
  flow: 'Rahu → Venus → Rahu',
};

export const mockPlanetPositions: PlanetPosition[] = [
  { graha: 'Sun', rashi: 'Vrishabha', degree: 18.2, nakshatra: 'Rohini', pada: 2, house: 6, isRetrograde: false },
  { graha: 'Moon', rashi: 'Makara', degree: 8.5, nakshatra: 'Uttara Ashadha', pada: 1, house: 2, isRetrograde: false },
  { graha: 'Mars', rashi: 'Simha', degree: 4.1, nakshatra: 'Magha', pada: 1, house: 5, isRetrograde: false },
  { graha: 'Mercury', rashi: 'Meena', degree: 15.3, nakshatra: 'Uttara Bhadra', pada: 2, house: 4, isRetrograde: false },
  { graha: 'Jupiter', rashi: 'Makara', degree: 22.8, nakshatra: 'Dhanishta', pada: 4, house: 2, isRetrograde: false },
  { graha: 'Venus', rashi: 'Simha', degree: 28.0, nakshatra: 'Uttara Phalguni', pada: 4, house: 5, isRetrograde: false },
  { graha: 'Saturn', rashi: 'Vrishabha', degree: 6.4, nakshatra: 'Krittika', pada: 2, house: 6, isRetrograde: true },
  { graha: 'Rahu', rashi: 'Dhanu', degree: 12.0, nakshatra: 'Mula', pada: 1, house: 1, isRetrograde: true },
  { graha: 'Ketu', rashi: 'Mithuna', degree: 12.0, nakshatra: 'Ardra', pada: 3, house: 7, isRetrograde: true },
];

/** All charts for divisional section */
export const mockCharts: Record<string, ChartData> = {
  D1: mockChartD1,
  D9: mockChartD9,
};
