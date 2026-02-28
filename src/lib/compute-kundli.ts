/**
 * Kundli computation using @fusionstrings/panchangam (Swiss Ephemeris).
 * Builds ChartData (D1) and Dasha from birth date, time, and location.
 */
import type { ChartData, DashaPeriod, GrahaId, RashiId } from './types';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const PLANET_NAME_TO_GRAHA: Record<string, GrahaId> = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
  Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn',
  Rahu: 'Rahu', Ketu: 'Ketu',
};

/** Vimshottari Dasha: years per planet (total 120). Used to derive start from end. */
const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

/** Offset in minutes: local = UTC + offset, so UTC = local - offset. */
function getTimezoneOffsetMinutes(timezone: string | undefined, _date: Date): number {
  if (!timezone) return 0;
  const tz = timezone.trim();
  const known: Record<string, number> = {
    'Asia/Kolkata': 330,
    'Asia/Calcutta': 330,
    'India': 330,
    'America/New_York': -300,
    'America/Los_Angeles': -480,
    'Europe/London': 0,
    'UTC': 0,
  };
  if (known[tz] != null) return known[tz];
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    });
    const parts = fmt.formatToParts(_date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    const value = String(tzPart?.value ?? '');
    const match = value.match(/GMT([+-])(\d+):?(\d*)/) ?? value.match(/UTC([+-])(\d+):?(\d*)/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const h = parseInt(match[2], 10);
      const m = parseInt(match[3] || '0', 10);
      return sign * (h * 60 + m);
    }
  } catch {
    /* fallback 0 */
  }
  return 0;
}

function longitudeToRashi(longitude: number): RashiId {
  const idx = Math.floor(((longitude % 360) + 360) % 360 / 30) % 12;
  return RASHI_ORDER[idx];
}

function longitudeToDegreeInSign(longitude: number): number {
  return ((longitude % 30) + 30) % 30;
}

function longitudeToRashiIndex(longitude: number): number {
  return Math.floor(((longitude % 360) + 360) % 360 / 30) % 12;
}

export interface ComputeKundliInput {
  dob: string; // YYYY-MM-DD
  time?: string; // HH:MM or HH:MM:SS
  lat: number;
  lon: number;
  timezone?: string; // IANA e.g. Asia/Kolkata
}

export interface ComputeKundliResult {
  chartData: ChartData;
  dasha: { periods: DashaPeriod[]; flow: string };
}

/**
 * Compute D1 chart and Vimshottari dasha. Uses Lahiri ayanamsa.
 * If panchangam fails (e.g. WASM in edge), returns null.
 */
export async function computeKundli(input: ComputeKundliInput): Promise<ComputeKundliResult | null> {
  const { dob, time = '12:00', lat, lon, timezone } = input;
  const [y, m, d] = dob.split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hr = 12, min = 0] = (time || '12:00').split(':').map(Number);

  try {
    const panchangam = await import('@fusionstrings/panchangam');
    const { p_julday, calculate_houses, calculate_planets, calculate_vimshottari } = panchangam;

    // Birth time is in user's local (city) timezone → convert to UTC for Swiss Ephemeris
    const localAsIfUTC = Date.UTC(y, m - 1, d, hr, min, 0);
    const probe = new Date(localAsIfUTC);
    const offsetMin = getTimezoneOffsetMinutes(timezone, probe);
    const birthTimeMs = localAsIfUTC - offsetMin * 60 * 1000;
    const birthUtc = new Date(birthTimeMs);
    const utcY = birthUtc.getUTCFullYear();
    const utcM = birthUtc.getUTCMonth() + 1;
    const utcD = birthUtc.getUTCDate();
    const utcH = birthUtc.getUTCHours() + birthUtc.getUTCMinutes() / 60 + birthUtc.getUTCSeconds() / 3600;
    const jd = p_julday(utcY, utcM, utcD, utcH, 1);
    const nowMs = Date.now();

    // Get ascendant from house calculation
    const houseInfo = calculate_houses(jd, lat, lon, 'W', 1);
    const ascendantLon = houseInfo.ascendant;
    const lagnaIdx = longitudeToRashiIndex(ascendantLon);
    const lagna = RASHI_ORDER[lagnaIdx];

    const planetsRaw = calculate_planets(jd, 1);
    const planetList = Array.isArray(planetsRaw) ? planetsRaw : [];

    // Whole Sign Houses: house 1 = lagna rashi, house 2 = next rashi, etc.
    const housesOut: ChartData['houses'] = {} as ChartData['houses'];
    for (let i = 1; i <= 12; i++) {
      const rashiIdx = (lagnaIdx + i - 1) % 12;
      housesOut[i as keyof ChartData['houses']] = {
        rashi: RASHI_ORDER[rashiIdx],
        planets: [],
      };
    }

    let moonLongitude = 0;
    for (const p of planetList) {
      const name = (p as { name?: string }).name;
      const longitude = Number((p as { longitude?: number }).longitude ?? 0);
      const isRetrograde = Boolean((p as { is_retrograde?: boolean }).is_retrograde);
      const graha = name ? PLANET_NAME_TO_GRAHA[name] : undefined;
      if (!graha) continue;
      if (name === 'Moon') moonLongitude = longitude;
      // Whole sign: planet's sign index → house number relative to lagna
      const planetSignIdx = longitudeToRashiIndex(longitude);
      const houseNum = ((planetSignIdx - lagnaIdx + 12) % 12) + 1;
      const degree = Math.round(longitudeToDegreeInSign(longitude));
      housesOut[houseNum as keyof ChartData['houses']].planets.push({
        graha,
        degree,
        retrograde: isRetrograde,
      });
    }

    const chartData: ChartData = {
      lagna,
      chartName: 'D1',
      chartType: 'Rashi',
      houses: housesOut,
    };

    const dashaInfo = calculate_vimshottari(moonLongitude, birthTimeMs, nowMs);
    const formatDate = (ms: number) => {
      const dt = new Date(ms);
      const day = dt.getUTCDate();
      const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getUTCMonth()];
      const year = dt.getUTCFullYear();
      return `${day} ${month} ${year}`;
    };
    const formatDurationYears = (years: number) => {
      if (years >= 1) return `${years.toFixed(1)}y`;
      const months = years * 12;
      if (months >= 1) return `${Math.round(months)}m`;
      return `${Math.round(years * 365)}d`;
    };
    const mahadasha = String(dashaInfo.mahadasha ?? '');
    const antardasha = String(dashaInfo.antardasha ?? '');
    const pratyantardasha = String(dashaInfo.pratyantardasha ?? '');
    const mahaEnd = Number(dashaInfo.mahadasha_end_date);
    const antarEnd = Number(dashaInfo.antardasha_end_date);
    const pratyantarEnd = Number(dashaInfo.pratyantardasha_end_date);

    // Vimshottari: each planet has fixed years. Derive start from end for correct dates.
    const mahaYears = VIMSHOTTARI_YEARS[mahadasha] ?? 18;
    const antarYears = VIMSHOTTARI_YEARS[antardasha] ?? 18;
    const pratyantarYears = VIMSHOTTARI_YEARS[pratyantardasha] ?? 18;
    const mahaStart = mahaEnd - mahaYears * MS_PER_YEAR;
    const antarDurationYears = (mahaYears * antarYears) / 120;
    const antarStart = antarEnd - antarDurationYears * MS_PER_YEAR;
    const pratyantarDurationYears = (mahaYears * antarYears * pratyantarYears) / (120 * 120);
    const pratyantarStart = pratyantarEnd - pratyantarDurationYears * MS_PER_YEAR;

    const periods: DashaPeriod[] = [
      { label: 'MAHA DASHA', planet: mahadasha, duration: formatDurationYears(mahaYears), start: formatDate(mahaStart), end: formatDate(mahaEnd) },
      { label: 'ANTARDASHA', planet: antardasha, duration: formatDurationYears(antarDurationYears), start: formatDate(antarStart), end: formatDate(antarEnd) },
      { label: 'PRATYANTARDASHA', planet: pratyantardasha, duration: formatDurationYears(pratyantarDurationYears), start: formatDate(pratyantarStart), end: formatDate(pratyantarEnd) },
    ];
    const flow = `${mahadasha} → ${antardasha} → ${pratyantardasha}`;

    return { chartData, dasha: { periods, flow } };
  } catch (err) {
    console.error('[compute-kundli]', err);
    return null;
  }
}
