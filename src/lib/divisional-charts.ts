/**
 * Divisional chart (Varga) computations.
 * Each divisional chart subdivides the 30° of a sign into D parts.
 * The planet's position in the sub-division maps to a new sign.
 */
import type { ChartData, GrahaId, RashiId } from './types';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

export interface VargaChartDef {
  division: number;
  id: string;
  purpose: string;
  name: string;
  sanskrit: string;
  description: string;
}

export const VARGA_DEFS: VargaChartDef[] = [
  { division: 1,  id: 'D1',  purpose: 'Overall Life & Personality',   name: 'Rasi',              sanskrit: 'राशि',        description: 'Your core identity — who you are, how you look, your health, temperament, and the overall direction your life takes. This is the foundation everything else builds on.' },
  { division: 2,  id: 'D2',  purpose: 'Wealth & Family Resources',    name: 'Hora',              sanskrit: 'होरा',        description: 'How easily you attract and hold onto money, your relationship with family wealth, financial stability, and whether resources flow to you or away from you.' },
  { division: 3,  id: 'D3',  purpose: 'Siblings & Courage',           name: 'Drekkana',          sanskrit: 'द्रेक्काण',    description: 'Your bond with siblings, your inner courage and willpower, how boldly you pursue goals, and your capacity to take initiative when life demands it.' },
  { division: 4,  id: 'D4',  purpose: 'Property & Fortune',           name: 'Chaturthamsa',      sanskrit: 'चतुर्थांश',    description: 'Your luck with property, land, homes, and real estate. Shows whether you\'ll own assets, how you accumulate fixed wealth, and your overall material security.' },
  { division: 7,  id: 'D7',  purpose: 'Children & Progeny',           name: 'Saptamsa',          sanskrit: 'सप्तांश',      description: 'Everything about your children — how many, your relationship with them, their well-being, and your creative and procreative energy in life.' },
  { division: 9,  id: 'D9',  purpose: 'Marriage & Dharma',            name: 'Navamsa',           sanskrit: 'नवांश',        description: 'The single most important chart after your birth chart. Reveals your marriage quality, your spouse\'s nature, your life purpose (dharma), and the hidden strength of your planets. Astrologers often check D9 before making any major prediction.' },
  { division: 10, id: 'D10', purpose: 'Career & Profession',          name: 'Dasamsa',           sanskrit: 'दशांश',        description: 'Your professional life — career path, reputation, achievements, power in your field, and how the world sees your work. Key chart for understanding career timing and success.' },
  { division: 12, id: 'D12', purpose: 'Parents & Ancestry',           name: 'Dwadasamsa',        sanskrit: 'द्वादशांश',    description: 'Your relationship with your parents, the influence of your family lineage, inherited traits and patterns, and the karmic bonds you carry from your ancestry.' },
  { division: 16, id: 'D16', purpose: 'Vehicles & Comforts',          name: 'Shodasamsa',        sanskrit: 'षोडशांश',      description: 'Your enjoyment of material comforts — vehicles, luxuries, and the pleasures that make life comfortable. Shows how much ease and convenience you experience.' },
  { division: 20, id: 'D20', purpose: 'Spiritual Progress',           name: 'Vimsamsa',          sanskrit: 'विंशांश',      description: 'Your spiritual inclination — devotion, meditation, inner growth, connection with the divine, and how far you progress on your spiritual journey in this lifetime.' },
  { division: 24, id: 'D24', purpose: 'Education & Learning',         name: 'Chaturvimsamsa',    sanskrit: 'चतुर्विंशांश',  description: 'Your learning abilities, academic success, areas of knowledge you naturally excel in, and how education shapes your life and opportunities.' },
  { division: 27, id: 'D27', purpose: 'Strengths & Weaknesses',       name: 'Bhamsa',            sanskrit: 'भांश',          description: 'Your core physical and mental strengths, stamina, resilience, and the hidden weaknesses that may hold you back. Reveals where you\'re naturally powerful and where you need to be careful.' },
  { division: 30, id: 'D30', purpose: 'Misfortunes & Challenges',     name: 'Trimsamsa',         sanskrit: 'त्रिंशांश',    description: 'The difficult side of life — potential health troubles, setbacks, obstacles, and areas where you\'re vulnerable. Understanding this helps you prepare and protect yourself.' },
  { division: 40, id: 'D40', purpose: 'Auspicious Effects',           name: 'Khavedamsa',        sanskrit: 'खवेदांश',      description: 'The good fortune baked into your chart — lucky periods, fortunate events, and the hidden blessings that activate at specific times in your life.' },
  { division: 45, id: 'D45', purpose: 'Character & Conduct',          name: 'Akshavedamsa',      sanskrit: 'अक्षवेदांश',    description: 'Your moral fiber — ethical tendencies, personal conduct, integrity, and the deeper values that guide how you behave and make decisions in life.' },
  { division: 60, id: 'D60', purpose: 'Past Life Karma',              name: 'Shashtiamsa',       sanskrit: 'षष्ट्यंश',    description: 'The most precise chart — reveals your past-life karma and what you\'re carrying into this lifetime. When this chart aligns with your birth chart, predictions become remarkably accurate.' },
];

interface PlanetLongitude {
  graha: GrahaId;
  longitude: number;
  retrograde: boolean;
}

function extractPlanetLongitudes(chart: ChartData): PlanetLongitude[] {
  const lagnaIdx = RASHI_ORDER.indexOf(chart.lagna);
  const result: PlanetLongitude[] = [];

  for (let h = 1; h <= 12; h++) {
    const house = chart.houses[h];
    if (!house?.planets) continue;
    const rashiIdx = RASHI_ORDER.indexOf(house.rashi);
    for (const p of house.planets) {
      const longitude = rashiIdx * 30 + p.degree;
      result.push({ graha: p.graha, longitude, retrograde: p.retrograde ?? false });
    }
  }
  return result;
}

/**
 * Standard equal-division Varga computation.
 * For D-N: divide 30° into N parts, each part = 30/N degrees.
 * The sub-part index maps to a sign starting from a base sign.
 *
 * Different Vargas use different starting-sign rules.
 */
function computeVargaSign(longitude: number, division: number): { rashi: RashiId; degree: number } {
  const signIdx = Math.floor(((longitude % 360) + 360) % 360 / 30);
  const degInSign = ((longitude % 30) + 30) % 30;
  const partSize = 30 / division;
  const partIdx = Math.floor(degInSign / partSize);
  const degInPart = ((degInSign % partSize) / partSize) * 30;

  let targetSignIdx: number;

  switch (division) {
    case 1:
      targetSignIdx = signIdx;
      break;
    case 2:
      // Hora: odd signs → Sun (Simha=4), even signs → Moon (Karka=3)
      if (signIdx % 2 === 0) { // odd sign (0-indexed, Mesha=0 is odd sign)
        targetSignIdx = partIdx === 0 ? 4 : 3; // Simha : Karka
      } else {
        targetSignIdx = partIdx === 0 ? 3 : 4;
      }
      break;
    case 3:
      // Drekkana: 1st part = same sign, 2nd = 5th from it, 3rd = 9th from it
      targetSignIdx = (signIdx + partIdx * 4) % 12;
      break;
    case 7:
      // Saptamsa: odd signs start from same sign, even signs start from 7th
      if (signIdx % 2 === 0) {
        targetSignIdx = (signIdx + partIdx) % 12;
      } else {
        targetSignIdx = (signIdx + 6 + partIdx) % 12;
      }
      break;
    case 9:
      // Navamsa: fire signs start from Mesha, earth from Makara, air from Tula, water from Karka
      const element = signIdx % 4; // 0=fire, 1=earth, 2=air, 3=water
      const navStart = [0, 9, 6, 3][element];
      targetSignIdx = (navStart + partIdx) % 12;
      break;
    case 10:
      // Dasamsa: odd signs start from same sign, even signs start from 9th
      if (signIdx % 2 === 0) {
        targetSignIdx = (signIdx + partIdx) % 12;
      } else {
        targetSignIdx = (signIdx + 8 + partIdx) % 12;
      }
      break;
    case 12:
      // Dwadasamsa: starts from same sign and goes sequentially
      targetSignIdx = (signIdx + partIdx) % 12;
      break;
    case 16:
      // Shodasamsa: movable signs from Mesha, fixed from Simha, dual from Dhanu
      const quality16 = signIdx % 3; // 0=movable, 1=fixed, 2=dual
      const start16 = [0, 4, 8][quality16];
      targetSignIdx = (start16 + partIdx) % 12;
      break;
    case 20:
      // Vimsamsa: movable from Mesha, fixed from Dhanu, dual from Simha
      const quality20 = signIdx % 3;
      const start20 = [0, 8, 4][quality20];
      targetSignIdx = (start20 + partIdx) % 12;
      break;
    case 24:
      // Chaturvimsamsa: odd signs from Simha, even signs from Karka
      if (signIdx % 2 === 0) {
        targetSignIdx = (4 + partIdx) % 12; // Simha
      } else {
        targetSignIdx = (3 + partIdx) % 12; // Karka
      }
      break;
    case 27:
      // Bhamsa: fire from Mesha, earth from Karka, air from Tula, water from Makara
      const elem27 = signIdx % 4;
      const start27 = [0, 3, 6, 9][elem27];
      targetSignIdx = (start27 + partIdx) % 12;
      break;
    case 30:
      // Trimsamsa: uses unequal divisions based on Parashara's rules
      // Simplified: Mars(5°), Saturn(5°), Jupiter(8°), Mercury(7°), Venus(5°) for odd
      // Reversed for even signs
      targetSignIdx = computeTrimsamsaSign(signIdx, degInSign);
      break;
    case 40:
      // Khavedamsa: odd signs from Mesha, even signs from Tula
      if (signIdx % 2 === 0) {
        targetSignIdx = (0 + partIdx) % 12;
      } else {
        targetSignIdx = (6 + partIdx) % 12;
      }
      break;
    case 45:
      // Akshavedamsa: movable from Mesha, fixed from Simha, dual from Dhanu
      const quality45 = signIdx % 3;
      const start45 = [0, 4, 8][quality45];
      targetSignIdx = (start45 + partIdx) % 12;
      break;
    case 60:
      // Shashtiamsa: starts from same sign
      targetSignIdx = (signIdx + partIdx) % 12;
      break;
    default:
      // Generic: cycle from the sign itself
      targetSignIdx = (signIdx + partIdx) % 12;
      break;
  }

  return { rashi: RASHI_ORDER[targetSignIdx], degree: Math.round(degInPart) };
}

function computeTrimsamsaSign(signIdx: number, degInSign: number): number {
  // Parashara's unequal division for odd signs:
  // 0-5° Mars(Mesha=0), 5-10° Saturn(Kumbha=10), 10-18° Jupiter(Dhanu=8),
  // 18-25° Mercury(Mithuna=2), 25-30° Venus(Tula=6)
  // For even signs: reverse order
  const oddRulers = [
    { end: 5,  sign: 0 },   // Mars → Mesha
    { end: 10, sign: 10 },  // Saturn → Kumbha
    { end: 18, sign: 8 },   // Jupiter → Dhanu
    { end: 25, sign: 2 },   // Mercury → Mithuna
    { end: 30, sign: 6 },   // Venus → Tula
  ];
  const evenRulers = [
    { end: 5,  sign: 6 },   // Venus → Tula
    { end: 10, sign: 2 },   // Mercury → Mithuna
    { end: 18, sign: 8 },   // Jupiter → Dhanu
    { end: 25, sign: 10 },  // Saturn → Kumbha
    { end: 30, sign: 0 },   // Mars → Mesha
  ];

  const rulers = signIdx % 2 === 0 ? oddRulers : evenRulers;
  for (const r of rulers) {
    if (degInSign < r.end) return r.sign;
  }
  return rulers[rulers.length - 1].sign;
}

export interface VargaPlanetEntry {
  graha: GrahaId;
  rashi: RashiId;
  degree: number;
  retrograde: boolean;
  house: number;
}

export interface VargaChartResult {
  def: VargaChartDef;
  lagna: RashiId;
  planets: VargaPlanetEntry[];
}

/**
 * Compute a divisional chart from the D1 chart data.
 */
export function computeVargaChart(d1: ChartData, division: number): VargaChartResult {
  const def = VARGA_DEFS.find(v => v.division === division) ?? VARGA_DEFS[0];
  const longitudes = extractPlanetLongitudes(d1);

  // Compute Lagna in Varga chart
  const lagnaD1Idx = RASHI_ORDER.indexOf(d1.lagna);
  const lagnaLon = lagnaD1Idx * 30; // approximate lagna longitude (start of sign)
  const lagnaVarga = computeVargaSign(lagnaLon, division);
  const lagnaVargaIdx = RASHI_ORDER.indexOf(lagnaVarga.rashi);

  const planets: VargaPlanetEntry[] = longitudes.map(pl => {
    const varga = computeVargaSign(pl.longitude, division);
    const vargaSignIdx = RASHI_ORDER.indexOf(varga.rashi);
    const house = ((vargaSignIdx - lagnaVargaIdx + 12) % 12) + 1;
    return {
      graha: pl.graha,
      rashi: varga.rashi,
      degree: varga.degree,
      retrograde: pl.retrograde,
      house,
    };
  });

  return { def, lagna: lagnaVarga.rashi, planets };
}

/**
 * Compute all standard Varga charts (excluding D1).
 */
export function computeAllVargaCharts(d1: ChartData): VargaChartResult[] {
  return VARGA_DEFS.filter(v => v.division > 1).map(v => computeVargaChart(d1, v.division));
}
