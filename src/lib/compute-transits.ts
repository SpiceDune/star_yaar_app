/**
 * Compute current planetary transits (Gochar).
 * Uses Swiss Ephemeris to get today's planetary positions,
 * then maps them onto the natal chart's house system.
 */
import type { ChartData, GrahaId, RashiId } from './types';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const PLANET_NAME_TO_GRAHA: Record<string, GrahaId> = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
  Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn',
  Rahu: 'Rahu', Ketu: 'Ketu',
};

const TRANSIT_EFFECTS: Record<string, Record<number, { quality: 'good' | 'neutral' | 'challenging'; brief: string }>> = {
  Sun:     { 1: { quality: 'challenging', brief: 'Health and ego challenges' }, 2: { quality: 'challenging', brief: 'Financial stress' }, 3: { quality: 'good', brief: 'Courage and victory' }, 4: { quality: 'challenging', brief: 'Domestic unrest' }, 5: { quality: 'neutral', brief: 'Mixed results for children' }, 6: { quality: 'good', brief: 'Victory over enemies' }, 7: { quality: 'challenging', brief: 'Partnership friction' }, 8: { quality: 'challenging', brief: 'Health concerns' }, 9: { quality: 'neutral', brief: 'Spiritual introspection' }, 10: { quality: 'good', brief: 'Career recognition' }, 11: { quality: 'good', brief: 'Financial gains' }, 12: { quality: 'challenging', brief: 'Expenses and isolation' } },
  Moon:    { 1: { quality: 'good', brief: 'Emotional well-being' }, 2: { quality: 'challenging', brief: 'Financial fluctuations' }, 3: { quality: 'good', brief: 'Social connections' }, 4: { quality: 'challenging', brief: 'Mental restlessness' }, 5: { quality: 'neutral', brief: 'Creative thinking' }, 6: { quality: 'challenging', brief: 'Health awareness' }, 7: { quality: 'good', brief: 'Relationship harmony' }, 8: { quality: 'challenging', brief: 'Emotional turbulence' }, 9: { quality: 'good', brief: 'Spiritual inclination' }, 10: { quality: 'good', brief: 'Public recognition' }, 11: { quality: 'good', brief: 'Gains and happiness' }, 12: { quality: 'challenging', brief: 'Expenses, need for rest' } },
  Mars:    { 1: { quality: 'challenging', brief: 'Aggression and accidents' }, 2: { quality: 'challenging', brief: 'Financial conflicts' }, 3: { quality: 'good', brief: 'Courage and initiative' }, 4: { quality: 'challenging', brief: 'Property disputes' }, 5: { quality: 'challenging', brief: 'Risky decisions' }, 6: { quality: 'good', brief: 'Victory over competition' }, 7: { quality: 'challenging', brief: 'Relationship conflicts' }, 8: { quality: 'challenging', brief: 'Accidents, surgeries' }, 9: { quality: 'neutral', brief: 'Active pursuits' }, 10: { quality: 'good', brief: 'Career drive' }, 11: { quality: 'good', brief: 'Financial gains' }, 12: { quality: 'challenging', brief: 'Hidden enemies active' } },
  Mercury: { 1: { quality: 'good', brief: 'Sharp communication' }, 2: { quality: 'good', brief: 'Financial intelligence' }, 3: { quality: 'good', brief: 'Learning and travel' }, 4: { quality: 'neutral', brief: 'Domestic discussions' }, 5: { quality: 'good', brief: 'Creative expression' }, 6: { quality: 'good', brief: 'Problem-solving ability' }, 7: { quality: 'good', brief: 'Business partnerships' }, 8: { quality: 'neutral', brief: 'Research and investigation' }, 9: { quality: 'good', brief: 'Higher learning' }, 10: { quality: 'good', brief: 'Professional communication' }, 11: { quality: 'good', brief: 'Networking gains' }, 12: { quality: 'neutral', brief: 'Introspective thinking' } },
  Jupiter: { 1: { quality: 'challenging', brief: 'Overconfidence, weight gain' }, 2: { quality: 'good', brief: 'Wealth accumulation' }, 3: { quality: 'neutral', brief: 'Steady progress' }, 4: { quality: 'neutral', brief: 'Domestic changes' }, 5: { quality: 'good', brief: 'Children, wisdom, fortune' }, 6: { quality: 'challenging', brief: 'Debt or health issues' }, 7: { quality: 'good', brief: 'Marriage and partnerships' }, 8: { quality: 'challenging', brief: 'Obstacles and delays' }, 9: { quality: 'good', brief: 'Fortune, spirituality, travel' }, 10: { quality: 'neutral', brief: 'Career shifts' }, 11: { quality: 'good', brief: 'Major gains and success' }, 12: { quality: 'challenging', brief: 'Expenses, spiritual growth' } },
  Venus:   { 1: { quality: 'good', brief: 'Charm and attractiveness' }, 2: { quality: 'good', brief: 'Financial prosperity' }, 3: { quality: 'good', brief: 'Social enjoyment' }, 4: { quality: 'good', brief: 'Domestic happiness' }, 5: { quality: 'good', brief: 'Romance and creativity' }, 6: { quality: 'challenging', brief: 'Relationship stress' }, 7: { quality: 'good', brief: 'Love and harmony' }, 8: { quality: 'neutral', brief: 'Hidden attractions' }, 9: { quality: 'good', brief: 'Cultural pursuits' }, 10: { quality: 'good', brief: 'Career through charm' }, 11: { quality: 'good', brief: 'Financial gains' }, 12: { quality: 'neutral', brief: 'Private pleasures' } },
  Saturn:  { 1: { quality: 'challenging', brief: 'Hard work, discipline needed' }, 2: { quality: 'challenging', brief: 'Financial pressure' }, 3: { quality: 'good', brief: 'Determination pays off' }, 4: { quality: 'challenging', brief: 'Domestic burdens' }, 5: { quality: 'challenging', brief: 'Delayed results' }, 6: { quality: 'good', brief: 'Overcoming obstacles' }, 7: { quality: 'challenging', brief: 'Relationship tests' }, 8: { quality: 'challenging', brief: 'Major life lessons' }, 9: { quality: 'challenging', brief: 'Faith tested' }, 10: { quality: 'neutral', brief: 'Career responsibility' }, 11: { quality: 'good', brief: 'Steady long-term gains' }, 12: { quality: 'challenging', brief: 'Isolation, spiritual depth' } },
  Rahu:    { 1: { quality: 'challenging', brief: 'Identity confusion' }, 2: { quality: 'challenging', brief: 'Unconventional finances' }, 3: { quality: 'good', brief: 'Bold communication' }, 4: { quality: 'challenging', brief: 'Domestic disruption' }, 5: { quality: 'challenging', brief: 'Risky speculation' }, 6: { quality: 'good', brief: 'Victory over enemies' }, 7: { quality: 'challenging', brief: 'Unusual relationships' }, 8: { quality: 'challenging', brief: 'Sudden transformations' }, 9: { quality: 'neutral', brief: 'Unconventional beliefs' }, 10: { quality: 'good', brief: 'Ambitious career moves' }, 11: { quality: 'good', brief: 'Unexpected gains' }, 12: { quality: 'challenging', brief: 'Hidden anxieties' } },
  Ketu:    { 1: { quality: 'challenging', brief: 'Spiritual seeking' }, 2: { quality: 'challenging', brief: 'Detachment from wealth' }, 3: { quality: 'good', brief: 'Intuitive insights' }, 4: { quality: 'neutral', brief: 'Inner searching' }, 5: { quality: 'challenging', brief: 'Unconventional thinking' }, 6: { quality: 'good', brief: 'Mystical healing' }, 7: { quality: 'challenging', brief: 'Relationship detachment' }, 8: { quality: 'neutral', brief: 'Occult interests' }, 9: { quality: 'good', brief: 'Spiritual breakthroughs' }, 10: { quality: 'challenging', brief: 'Career uncertainty' }, 11: { quality: 'good', brief: 'Spiritual gains' }, 12: { quality: 'good', brief: 'Liberation, moksha' } },
};

export interface TransitPlanet {
  graha: GrahaId;
  transitRashi: RashiId;
  transitDegree: number;
  retrograde: boolean;
  natalHouse: number;
  quality: 'good' | 'neutral' | 'challenging';
  brief: string;
}

export interface TransitResult {
  date: string;
  planets: TransitPlanet[];
}

export async function computeTransits(natalChart: ChartData, targetDate?: Date): Promise<TransitResult | null> {
  try {
    const panchangam = await import('@fusionstrings/panchangam');
    const { p_julday, calculate_planets } = panchangam;

    const now = targetDate ?? new Date();
    const utcY = now.getUTCFullYear();
    const utcM = now.getUTCMonth() + 1;
    const utcD = now.getUTCDate();
    const utcH = now.getUTCHours() + now.getUTCMinutes() / 60;

    const jd = p_julday(utcY, utcM, utcD, utcH, 1);
    const planetsRaw = calculate_planets(jd, 1);
    const planetList = Array.isArray(planetsRaw) ? planetsRaw : [];

    const lagnaIdx = RASHI_ORDER.indexOf(natalChart.lagna);
    const planets: TransitPlanet[] = [];

    for (const p of planetList) {
      const name = (p as { name?: string }).name;
      const longitude = Number((p as { longitude?: number }).longitude ?? 0);
      const isRetrograde = Boolean((p as { is_retrograde?: boolean }).is_retrograde);
      const graha = name ? PLANET_NAME_TO_GRAHA[name] : undefined;
      if (!graha) continue;

      const signIdx = Math.floor(((longitude % 360) + 360) % 360 / 30);
      const degInSign = Math.round(((longitude % 30) + 30) % 30);
      const rashi = RASHI_ORDER[signIdx];
      const natalHouse = ((signIdx - lagnaIdx + 12) % 12) + 1;
      const effect = TRANSIT_EFFECTS[graha]?.[natalHouse] ?? { quality: 'neutral' as const, brief: 'Transit in progress' };

      planets.push({
        graha,
        transitRashi: rashi,
        transitDegree: degInSign,
        retrograde: isRetrograde,
        natalHouse,
        quality: effect.quality,
        brief: effect.brief,
      });
    }

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

    return { date, planets };
  } catch (err) {
    console.error('[compute-transits]', err);
    return null;
  }
}
