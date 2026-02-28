/**
 * Vedic Yoga computation engine.
 * Evaluates chart data against classical yoga rules from Brihat Parashara Hora Shastra.
 */
import type { ChartData, GrahaId, RashiId } from './types';

// ─── Foundational Data ───

const RASHI_ORDER: RashiId[] = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
];

const SIGN_LORD: Record<RashiId, GrahaId> = {
  Mesha: 'Mars', Vrishabha: 'Venus', Mithuna: 'Mercury', Karka: 'Moon',
  Simha: 'Sun', Kanya: 'Mercury', Tula: 'Venus', Vrishchika: 'Mars',
  Dhanu: 'Jupiter', Makara: 'Saturn', Kumbha: 'Saturn', Meena: 'Jupiter',
};

const OWN_SIGNS: Record<GrahaId, RashiId[]> = {
  Sun: ['Simha'],
  Moon: ['Karka'],
  Mars: ['Mesha', 'Vrishchika'],
  Mercury: ['Mithuna', 'Kanya'],
  Jupiter: ['Dhanu', 'Meena'],
  Venus: ['Vrishabha', 'Tula'],
  Saturn: ['Makara', 'Kumbha'],
  Rahu: [],
  Ketu: [],
};

const EXALTED_SIGN: Partial<Record<GrahaId, RashiId>> = {
  Sun: 'Mesha', Moon: 'Vrishabha', Mars: 'Makara', Mercury: 'Kanya',
  Jupiter: 'Karka', Venus: 'Meena', Saturn: 'Tula',
  Rahu: 'Mithuna', Ketu: 'Dhanu',
};

const DEBILITATED_SIGN: Partial<Record<GrahaId, RashiId>> = {
  Sun: 'Tula', Moon: 'Vrishchika', Mars: 'Karka', Mercury: 'Meena',
  Jupiter: 'Makara', Venus: 'Kanya', Saturn: 'Mesha',
  Rahu: 'Dhanu', Ketu: 'Mithuna',
};

const NATURAL_BENEFICS: GrahaId[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const KENDRA_HOUSES = [1, 4, 7, 10];
const TRIKONA_HOUSES = [1, 5, 9];
const DUSTHANA_HOUSES = [6, 8, 12];

// ─── Yoga Output Types ───

export type YogaCategory = 'mahapurusha' | 'raja' | 'dhana' | 'lunar' | 'special' | 'dosha';

export interface YogaResult {
  name: string;
  sanskrit?: string;
  category: YogaCategory;
  isPresent: boolean;
  isBenefic: boolean;
  strength: 'strong' | 'moderate' | 'weak';
  planets: GrahaId[];
  houses: number[];
  description: string;
  effect: string;
  detail: string;
}

// ─── Helpers ───

interface PlanetInfo {
  graha: GrahaId;
  house: number;
  rashi: RashiId;
  degree: number;
  retrograde: boolean;
}

function buildPlanetMap(chart: ChartData): PlanetInfo[] {
  const planets: PlanetInfo[] = [];
  for (let h = 1; h <= 12; h++) {
    const house = chart.houses[h];
    if (!house) continue;
    for (const p of house.planets) {
      planets.push({
        graha: p.graha,
        house: h,
        rashi: house.rashi,
        degree: p.degree,
        retrograde: p.retrograde ?? false,
      });
    }
  }
  return planets;
}

function getPlanet(planets: PlanetInfo[], graha: GrahaId): PlanetInfo | undefined {
  return planets.find(p => p.graha === graha);
}

function getPlanetsInHouse(planets: PlanetInfo[], house: number): PlanetInfo[] {
  return planets.filter(p => p.house === house);
}

function houseOfPlanet(planets: PlanetInfo[], graha: GrahaId): number {
  return getPlanet(planets, graha)?.house ?? 0;
}

function isInOwnSign(graha: GrahaId, rashi: RashiId): boolean {
  return OWN_SIGNS[graha]?.includes(rashi) ?? false;
}

function isExalted(graha: GrahaId, rashi: RashiId): boolean {
  return EXALTED_SIGN[graha] === rashi;
}

function isDebilitated(graha: GrahaId, rashi: RashiId): boolean {
  return DEBILITATED_SIGN[graha] === rashi;
}

function isStrong(graha: GrahaId, rashi: RashiId): boolean {
  return isExalted(graha, rashi) || isInOwnSign(graha, rashi);
}

function isInKendra(house: number): boolean {
  return KENDRA_HOUSES.includes(house);
}

function isInTrikona(house: number): boolean {
  return TRIKONA_HOUSES.includes(house);
}

function rashiIdx(rashi: RashiId): number {
  return RASHI_ORDER.indexOf(rashi);
}

function getLagnaIdx(chart: ChartData): number {
  return rashiIdx(chart.lagna);
}

/**
 * Vedic house counting: 1st from a house is the house itself.
 * Moon in H3, Jupiter in H3 → distance = 1 (same house = 1st from).
 * Moon in H3, Jupiter in H6 → distance = 4 (4th from).
 */
function houseDistance(from: number, to: number): number {
  return ((to - from + 12) % 12) + 1;
}

function lordOfHouse(chart: ChartData, house: number): GrahaId {
  const lagnaI = getLagnaIdx(chart);
  const signIdx = (lagnaI + house - 1) % 12;
  return SIGN_LORD[RASHI_ORDER[signIdx]];
}

function signOfHouse(chart: ChartData, house: number): RashiId {
  const lagnaI = getLagnaIdx(chart);
  const signIdx = (lagnaI + house - 1) % 12;
  return RASHI_ORDER[signIdx];
}

function areSameHouse(planets: PlanetInfo[], g1: GrahaId, g2: GrahaId): boolean {
  const h1 = houseOfPlanet(planets, g1);
  const h2 = houseOfPlanet(planets, g2);
  return h1 > 0 && h1 === h2;
}

/** Check if two lords exchange signs (Parivartana Yoga / sign exchange). */
function areInSignExchange(chart: ChartData, planets: PlanetInfo[], lord1: GrahaId, house1: number, lord2: GrahaId, house2: number): boolean {
  const p1 = getPlanet(planets, lord1);
  const p2 = getPlanet(planets, lord2);
  if (!p1 || !p2) return false;
  const sign1 = signOfHouse(chart, house1);
  const sign2 = signOfHouse(chart, house2);
  return p1.rashi === sign2 && p2.rashi === sign1;
}

// ─── Yoga Evaluators ───

function evaluateMahapurushaYogas(chart: ChartData, planets: PlanetInfo[]): YogaResult[] {
  const defs: { name: string; sanskrit: string; graha: GrahaId; effect: string; detail: string }[] = [
    { name: 'Ruchaka Yoga', sanskrit: 'रुचक', graha: 'Mars',
      effect: 'Valorous, wealthy, famous, strong leadership qualities',
      detail: 'Ruchaka Yoga is one of the five Pancha Mahapurusha Yogas described in Brihat Parashara Hora Shastra. It forms when Mars occupies a Kendra house (1st, 4th, 7th, or 10th) while simultaneously being in its own sign (Aries or Scorpio) or exalted sign (Capricorn). Natives with this yoga possess exceptional courage, physical strength, and commanding presence. They often rise to positions of authority in military, sports, law enforcement, or competitive fields. Mars being the planet of action and energy, this yoga bestows a fierce determination to overcome obstacles.' },
    { name: 'Bhadra Yoga', sanskrit: 'भद्र', graha: 'Mercury',
      effect: 'Eloquent, intelligent, authority in communication and trade',
      detail: 'Bhadra Yoga forms when Mercury is placed in a Kendra house (1st, 4th, 7th, or 10th) in its own sign (Gemini or Virgo) or exalted sign (Virgo). This is one of the five Pancha Mahapurusha Yogas. Natives blessed with Bhadra Yoga possess extraordinary intellectual abilities, sharp wit, and exceptional communication skills. They excel in fields requiring analytical thinking — business, writing, teaching, technology, and finance. Mercury governs speech and commerce, so these individuals often become successful entrepreneurs, scholars, or influential speakers.' },
    { name: 'Hamsa Yoga', sanskrit: 'हंस', graha: 'Jupiter',
      effect: 'Scholarly, spiritual, ethical, respected among learned people',
      detail: 'Hamsa Yoga is considered the most auspicious of the five Pancha Mahapurusha Yogas. It forms when Jupiter occupies a Kendra house (1st, 4th, 7th, or 10th) in its own sign (Sagittarius or Pisces) or exalted sign (Cancer). The word "Hamsa" means swan — symbolizing the ability to discern right from wrong, like a swan separating milk from water. Natives with this yoga are naturally drawn to wisdom, spirituality, and higher learning. They become respected teachers, judges, counselors, or spiritual leaders. Jupiter\'s benevolent nature ensures they use their influence for the greater good.' },
    { name: 'Malavya Yoga', sanskrit: 'मालव्य', graha: 'Venus',
      effect: 'Prosperous, charming, artistic, marital happiness, luxuries',
      detail: 'Malavya Yoga forms when Venus is placed in a Kendra house (1st, 4th, 7th, or 10th) in its own sign (Taurus or Libra) or exalted sign (Pisces). As one of the five Pancha Mahapurusha Yogas, it endows the native with physical beauty, artistic sensibility, and a refined taste for luxury. These individuals often accumulate wealth through creative or aesthetic pursuits — art, music, fashion, design, or entertainment. Venus governs love and relationships, so Malavya Yoga also indicates a harmonious marriage and strong romantic connections.' },
    { name: 'Shasha Yoga', sanskrit: 'शश', graha: 'Saturn',
      effect: 'Powerful, successful in politics/law, disciplined, long-lived',
      detail: 'Shasha Yoga forms when Saturn occupies a Kendra house (1st, 4th, 7th, or 10th) in its own sign (Capricorn or Aquarius) or exalted sign (Libra). This Pancha Mahapurusha Yoga creates individuals of immense discipline, patience, and organizational ability. They rise slowly but surely to positions of great authority — often in politics, judiciary, administration, or large organizations. Saturn represents structure and justice, so natives with Shasha Yoga become pillars of their community. They tend to have long, productive lives and earn deep respect through persistent effort.' },
  ];

  return defs.map(def => {
    const p = getPlanet(planets, def.graha);
    const present = !!p && isInKendra(p.house) && isStrong(p.graha, p.rashi);
    const strength = present && p ? (isExalted(p.graha, p.rashi) ? 'strong' : 'moderate') : 'weak';
    return {
      name: def.name,
      sanskrit: def.sanskrit,
      category: 'mahapurusha' as YogaCategory,
      isPresent: present,
      isBenefic: true,
      strength: present ? strength : 'weak',
      planets: present && p ? [p.graha] : [],
      houses: present && p ? [p.house] : [],
      description: `${def.graha} in Kendra (H${p?.house ?? '?'}) in ${p && isExalted(p.graha, p.rashi) ? 'exalted' : 'own'} sign`,
      effect: def.effect,
      detail: def.detail,
    };
  });
}

function evaluateRajYogas(chart: ChartData, planets: PlanetInfo[]): YogaResult[] {
  const results: YogaResult[] = [];
  const seen = new Set<string>();

  const kendraLords = KENDRA_HOUSES.map(h => ({ house: h, lord: lordOfHouse(chart, h) }));
  const trikonaLords = TRIKONA_HOUSES.map(h => ({ house: h, lord: lordOfHouse(chart, h) }));

  // Yogakaraka: single planet that lords both a Kendra and a Trikona
  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl.house === tl.house) continue; // same house (H1 is both Kendra and Trikona)
      if (kl.lord !== tl.lord) continue;

      const pi = getPlanet(planets, kl.lord);
      if (!pi) continue;
      const key = `yogakaraka-${kl.lord}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const strong = isStrong(kl.lord, pi.rashi);
      const wellPlaced = isInKendra(pi.house) || isInTrikona(pi.house);
      results.push({
        name: 'Raj Yoga (Yogakaraka)',
        sanskrit: 'योगकारक',
        category: 'raja',
        isPresent: true,
        isBenefic: true,
        strength: strong && wellPlaced ? 'strong' : 'moderate',
        planets: [kl.lord],
        houses: [pi.house],
        description: `${kl.lord} lords both H${kl.house} (Kendra) and H${tl.house} (Trikona) — placed in H${pi.house}`,
        effect: 'Extremely powerful Raj Yoga — authority, fame, success in career and life purpose',
        detail: `A Yogakaraka planet is one that simultaneously rules both a Kendra (angular) house and a Trikona (trinal) house from the Lagna. This is the most concentrated form of Raj Yoga because a single planet carries the combined power of both house types. In classical texts like Brihat Parashara Hora Shastra, Kendra houses (1, 4, 7, 10) represent the pillars of life — self, home, partnerships, and career — while Trikona houses (1, 5, 9) represent dharma, intelligence, and fortune. When one planet controls both, it becomes an exceptionally auspicious force in the chart. The Dasha period of a Yogakaraka planet typically brings significant career advancement, public recognition, and alignment between personal purpose and worldly success.`,
      });
    }
  }

  // Conjunction-based Raj Yoga: different Kendra lord + Trikona lord in same house
  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl.lord === tl.lord) continue;
      if (kl.house === 1 && tl.house === 1) continue;

      const klInfo = getPlanet(planets, kl.lord);
      const tlInfo = getPlanet(planets, tl.lord);
      if (!klInfo || !tlInfo) continue;

      const conjunct = klInfo.house === tlInfo.house;
      const exchange = areInSignExchange(chart, planets, kl.lord, kl.house, tl.lord, tl.house);

      if (!conjunct && !exchange) continue;

      const key = [kl.lord, tl.lord].sort().join('-') + (conjunct ? '-conj' : '-exch');
      if (seen.has(key)) continue;
      seen.add(key);

      const anyStrong = isStrong(kl.lord, klInfo.rashi) || isStrong(tl.lord, tlInfo.rashi);
      const method = conjunct ? 'conjunct' : 'in sign exchange';

      results.push({
        name: 'Raj Yoga',
        sanskrit: 'राज',
        category: 'raja',
        isPresent: true,
        isBenefic: true,
        strength: anyStrong ? 'strong' : 'moderate',
        planets: [kl.lord, tl.lord],
        houses: conjunct ? [klInfo.house] : [klInfo.house, tlInfo.house],
        description: `${kl.lord} (H${kl.house} lord) ${method} with ${tl.lord} (H${tl.house} lord)${conjunct ? ` in H${klInfo.house}` : ''}`,
        effect: 'Authority, fame, power, rise in status and career',
        detail: `Raj Yoga forms when the lord of a Kendra house (1, 4, 7, or 10) connects with the lord of a Trikona house (1, 5, or 9) through conjunction in the same sign or mutual sign exchange (Parivartana). This connection merges the structural power of Kendra houses with the auspicious fortune of Trikona houses. Parashara states that such a combination elevates the native to positions of authority and respect. The yoga is stronger when the planets involved are in dignified signs (own, exalted, or friendly) and when they occupy Kendra or Trikona houses themselves. Multiple Raj Yogas in a chart amplify each other. Results manifest most prominently during the Dasha or Antardasha of the planets forming this yoga.`,
      });
    }
  }

  return results;
}

function evaluateDhanaYogas(chart: ChartData, planets: PlanetInfo[]): YogaResult[] {
  const results: YogaResult[] = [];

  // Lakshmi Yoga (BPHS): Lagna lord strong + 9th lord strong in Kendra
  const lagnaLord = lordOfHouse(chart, 1);
  const llInfo = getPlanet(planets, lagnaLord);
  const lord9 = lordOfHouse(chart, 9);
  const l9Info = getPlanet(planets, lord9);
  if (l9Info && llInfo && isInKendra(l9Info.house) && isStrong(lord9, l9Info.rashi) && isStrong(lagnaLord, llInfo.rashi)) {
    results.push({
      name: 'Lakshmi Yoga',
      sanskrit: 'लक्ष्मी',
      category: 'dhana',
      isPresent: true,
      isBenefic: true,
      strength: 'strong',
      planets: [lord9, lagnaLord],
      houses: [l9Info.house, llInfo.house],
      description: `9th lord ${lord9} strong in Kendra (H${l9Info.house}), Lagna lord ${lagnaLord} also strong`,
      effect: 'Great wealth, prosperity, fortune, and spiritual blessings',
      detail: 'Lakshmi Yoga is named after the Hindu goddess of wealth and prosperity. According to Brihat Parashara Hora Shastra, it forms when the lord of the 9th house (the house of fortune, dharma, and past-life merit) is strong (in own or exalted sign) and placed in a Kendra house, while the Lagna lord is also dignified. The 9th house represents bhagya (luck) — when its lord is powerful and angular, the native attracts wealth, opportunities, and fortunate circumstances seemingly effortlessly. This yoga indicates that the person\'s good karma from past lives is ripening in this lifetime, bringing material and spiritual abundance.',
    });
  }

  // Dhana Yoga: Lords of 2nd and 11th conjunct or in exchange
  const lord2 = lordOfHouse(chart, 2);
  const lord11 = lordOfHouse(chart, 11);
  if (lord2 !== lord11) {
    const conjunct = areSameHouse(planets, lord2, lord11);
    const exchange = areInSignExchange(chart, planets, lord2, 2, lord11, 11);
    if (conjunct || exchange) {
      const l2Info = getPlanet(planets, lord2)!;
      const l11Info = getPlanet(planets, lord11)!;
      results.push({
        name: 'Dhana Yoga',
        sanskrit: 'धन',
        category: 'dhana',
        isPresent: true,
        isBenefic: true,
        strength: 'moderate',
        planets: [lord2, lord11],
        houses: conjunct ? [l2Info.house] : [l2Info.house, l11Info.house],
        description: `2nd lord ${lord2} ${conjunct ? 'conjunct' : 'in sign exchange with'} 11th lord ${lord11}`,
        effect: 'Accumulation of wealth, financial gains, material abundance',
        detail: 'Dhana Yoga forms when the lords of wealth-related houses connect. The 2nd house governs accumulated wealth, family assets, and earning capacity, while the 11th house represents gains, income, and fulfillment of desires. When their lords are conjunct in the same house or in mutual sign exchange (Parivartana), it creates a powerful channel for wealth accumulation. The strength of this yoga depends on the dignity of the planets involved and the house they occupy. If placed in Kendra or Trikona houses, the wealth potential is amplified. This yoga often manifests as multiple income streams, successful investments, or inherited wealth.',
      });
    }
  }

  // Chandra-Mangala Yoga: Moon and Mars conjunct
  if (areSameHouse(planets, 'Moon', 'Mars')) {
    const moonInfo = getPlanet(planets, 'Moon')!;
    results.push({
      name: 'Chandra-Mangala Yoga',
      sanskrit: 'चन्द्र-मंगल',
      category: 'dhana',
      isPresent: true,
      isBenefic: true,
      strength: isInKendra(moonInfo.house) ? 'strong' : 'moderate',
      planets: ['Moon', 'Mars'],
      houses: [moonInfo.house],
      description: `Moon and Mars conjunct in H${moonInfo.house}`,
      effect: 'Wealth through enterprise, courage, determination',
      detail: 'Chandra-Mangala Yoga forms when the Moon and Mars are conjunct (in the same house). The Moon represents the mind, emotions, and public perception, while Mars represents action, courage, and enterprise. Their conjunction creates a dynamic personality that combines emotional intelligence with bold action. Natives with this yoga often earn wealth through their own efforts, particularly in fields requiring courage, quick decision-making, or competitive drive — such as business, real estate, sports, or the military. The yoga is strongest when the conjunction occurs in a Kendra house or in signs where either planet is dignified.',
    });
  }

  return results;
}

function evaluateLunarYogas(chart: ChartData, planets: PlanetInfo[]): YogaResult[] {
  const results: YogaResult[] = [];
  const moon = getPlanet(planets, 'Moon');
  if (!moon) return results;

  const moonH = moon.house;
  const jupiter = getPlanet(planets, 'Jupiter');

  // Gajakesari: Jupiter in Kendra (1st, 4th, 7th, 10th) from Moon
  if (jupiter) {
    const dist = houseDistance(moonH, jupiter.house);
    if ([1, 4, 7, 10].includes(dist)) {
      results.push({
        name: 'Gajakesari Yoga',
        sanskrit: 'गजकेसरी',
        category: 'lunar',
        isPresent: true,
        isBenefic: true,
        strength: isStrong('Jupiter', jupiter.rashi) ? 'strong' : 'moderate',
        planets: ['Moon', 'Jupiter'],
        houses: [moonH, jupiter.house],
        description: `Jupiter ${dist === 1 ? 'conjunct Moon' : `in ${dist}th from Moon`} (H${jupiter.house})`,
        effect: 'Wisdom, reputation, intelligence, wealth, lasting fame',
        detail: 'Gajakesari Yoga is one of the most celebrated yogas in Vedic astrology. The name translates to "elephant-lion" — symbolizing a person who commands respect like a lion and possesses the wisdom and memory of an elephant. It forms when Jupiter is in a Kendra position (1st, 4th, 7th, or 10th house) from the Moon. Jupiter amplifies the Moon\'s qualities of emotional intelligence, while the Moon enhances Jupiter\'s wisdom with intuitive understanding. Natives with this yoga are naturally respected in their communities, possess good judgment, and often achieve positions where they guide or teach others. The yoga is strongest when Jupiter is in its own or exalted sign and not afflicted by malefics.',
      });
    }
  }

  // Sunapha / Anapha / Durudhara / Kemadruma
  // Valid planets: Mars, Mercury, Jupiter, Venus, Saturn (NOT Sun, Rahu, Ketu)
  const validGrahas: GrahaId[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const h2FromMoon = (moonH % 12) + 1; // 2nd from Moon
  const h12FromMoon = ((moonH - 2 + 12) % 12) + 1; // 12th from Moon
  const planetsIn2 = getPlanetsInHouse(planets, h2FromMoon).filter(p => validGrahas.includes(p.graha));
  const planetsIn12 = getPlanetsInHouse(planets, h12FromMoon).filter(p => validGrahas.includes(p.graha));

  if (planetsIn2.length > 0 && planetsIn12.length > 0) {
    results.push({
      name: 'Durudhara Yoga',
      sanskrit: 'दुरुधरा',
      category: 'lunar',
      isPresent: true,
      isBenefic: true,
      strength: 'strong',
      planets: ['Moon', ...planetsIn2.map(p => p.graha), ...planetsIn12.map(p => p.graha)],
      houses: [moonH, h2FromMoon, h12FromMoon],
      description: `Planets flanking Moon — 2nd (H${h2FromMoon}): ${planetsIn2.map(p => p.graha).join(', ')}; 12th (H${h12FromMoon}): ${planetsIn12.map(p => p.graha).join(', ')}`,
      effect: 'Wealth, eloquence, charitable nature, enjoyment of comforts',
      detail: 'Durudhara Yoga forms when planets (excluding Sun, Rahu, and Ketu) occupy both the 2nd and 12th houses from the Moon — effectively flanking it on both sides. This "guarded" position provides the Moon (mind) with strong support and stability. The native enjoys a balanced life with both material comforts (2nd house — wealth, speech) and spiritual inclinations (12th house — liberation, foreign lands). Durudhara is considered superior to both Sunapha and Anapha because support comes from both directions. The nature of the flanking planets determines the specific areas of prosperity — benefics bring more harmonious results while malefics add resilience and determination.',
    });
  } else if (planetsIn2.length > 0) {
    results.push({
      name: 'Sunapha Yoga',
      sanskrit: 'सुनफा',
      category: 'lunar',
      isPresent: true,
      isBenefic: true,
      strength: 'moderate',
      planets: ['Moon', ...planetsIn2.map(p => p.graha)],
      houses: [moonH, h2FromMoon],
      description: `${planetsIn2.map(p => p.graha).join(', ')} in 2nd from Moon (H${h2FromMoon})`,
      effect: 'Self-made wealth, intelligence, fame through own efforts',
      detail: 'Sunapha Yoga forms when one or more planets (excluding Sun, Rahu, and Ketu) occupy the 2nd house from the Moon. The 2nd house from the Moon relates to accumulated resources, speech, and sustenance of the mind. Planets here support the Moon by providing material stability and strong communicative abilities. Natives with Sunapha Yoga typically build wealth through their own intelligence and effort rather than inheritance. The specific planet in the 2nd from Moon colors the results — Mars gives courage and enterprise, Mercury gives intellectual earnings, Jupiter gives wisdom-based wealth, Venus gives artistic income, and Saturn gives wealth through discipline and hard work.',
    });
  } else if (planetsIn12.length > 0) {
    results.push({
      name: 'Anapha Yoga',
      sanskrit: 'अनफा',
      category: 'lunar',
      isPresent: true,
      isBenefic: true,
      strength: 'moderate',
      planets: ['Moon', ...planetsIn12.map(p => p.graha)],
      houses: [moonH, h12FromMoon],
      description: `${planetsIn12.map(p => p.graha).join(', ')} in 12th from Moon (H${h12FromMoon})`,
      effect: 'Good health, magnetic personality, fame, respected in society',
      detail: 'Anapha Yoga forms when one or more planets (excluding Sun, Rahu, and Ketu) occupy the 12th house from the Moon. The 12th from Moon represents the subconscious mind, intuition, and the deeper layers of emotional experience. Planets here give the native a rich inner world, strong intuition, and often a magnetic personality that attracts others. Unlike Sunapha which emphasizes self-made material wealth, Anapha emphasizes personal charisma, good health, and social respect. The native tends to be independent, self-reliant, and comfortable with solitude. The quality of results depends on which planets occupy this position.',
    });
  } else {
    // Kemadruma Yoga — but check for cancellation conditions
    const moonInKendra = isInKendra(moonH);
    const moonConjunctPlanet = getPlanetsInHouse(planets, moonH).some(p => p.graha !== 'Moon' && validGrahas.includes(p.graha));
    const cancelled = moonInKendra || moonConjunctPlanet;

    if (!cancelled) {
      results.push({
        name: 'Kemadruma Yoga',
        sanskrit: 'केमद्रुम',
        category: 'dosha',
        isPresent: true,
        isBenefic: false,
        strength: 'moderate',
        planets: ['Moon'],
        houses: [moonH],
        description: 'No planets in 2nd or 12th from Moon, and Moon not in Kendra or conjunct benefics',
        effect: 'Financial instability, periods of loneliness — remedied by strong Moon aspects',
        detail: 'Kemadruma Yoga forms when the Moon has no planets in either the 2nd or 12th house from it (excluding Sun, Rahu, and Ketu), leaving it isolated without planetary support. An unsupported Moon can indicate periods of emotional vulnerability, financial fluctuations, and feelings of isolation. However, this yoga is frequently cancelled — if the Moon is in a Kendra house, conjunct a benefic planet, or receives strong aspects, the negative effects are greatly reduced or eliminated. Many successful people have technical Kemadruma that is cancelled. Remedies include strengthening the Moon through meditation, spending time near water, wearing pearls, and developing emotional resilience through mindfulness practices.',
      });
    }
  }

  return results;
}

function evaluateSpecialYogas(chart: ChartData, planets: PlanetInfo[]): YogaResult[] {
  const results: YogaResult[] = [];

  // Budhaditya Yoga: Sun + Mercury conjunct in Kendra or Trikona, Mercury NOT combust
  if (areSameHouse(planets, 'Sun', 'Mercury')) {
    const sunInfo = getPlanet(planets, 'Sun')!;
    const mercInfo = getPlanet(planets, 'Mercury')!;
    const inGoodHouse = isInKendra(sunInfo.house) || isInTrikona(sunInfo.house);
    const degreeGap = Math.abs(sunInfo.degree - mercInfo.degree);
    const isCombust = degreeGap < 14; // Mercury combust within ~14° of Sun
    if (inGoodHouse && !isCombust) {
      results.push({
        name: 'Budhaditya Yoga',
        sanskrit: 'बुधादित्य',
        category: 'special',
        isPresent: true,
        isBenefic: true,
        strength: isStrong('Mercury', mercInfo.rashi) ? 'strong' : 'moderate',
        planets: ['Sun', 'Mercury'],
        houses: [sunInfo.house],
        description: `Sun and Mercury conjunct in H${sunInfo.house} (${degreeGap}° apart — not combust)`,
        effect: 'Sharp intellect, success in education, eloquence, analytical ability',
        detail: 'Budhaditya Yoga forms when the Sun (Aditya) and Mercury (Budha) are conjunct in the same house, particularly in a Kendra or Trikona. The Sun represents authority, soul purpose, and vitality, while Mercury represents intellect, communication, and analytical ability. Their combination creates a sharp, authoritative mind capable of clear expression and leadership through knowledge. However, this yoga is only truly effective when Mercury is NOT combust (too close to the Sun). When Mercury is within approximately 14 degrees of the Sun, it becomes "burnt" and loses its intellectual sharpness. A non-combust Mercury maintaining sufficient distance from the Sun while still conjunct is the key to a strong Budhaditya Yoga.',
      });
    }
  }

  // Amala Yoga (Phaladeepika): A natural benefic in the 10th house from Lagna or Moon
  const moonHAmala = houseOfPlanet(planets, 'Moon');
  const amalaRefs: { label: string; h10: number }[] = [{ label: 'Lagna', h10: 10 }];
  if (moonHAmala) amalaRefs.push({ label: 'Moon', h10: ((moonHAmala + 8) % 12) + 1 });

  for (const ref of amalaRefs) {
    const h10p = getPlanetsInHouse(planets, ref.h10);
    const beneficsIn10 = h10p.filter(p => NATURAL_BENEFICS.includes(p.graha));
    if (beneficsIn10.length > 0) {
      const onlyBenefics = h10p.every(p => NATURAL_BENEFICS.includes(p.graha));
      results.push({
        name: 'Amala Yoga',
        sanskrit: 'अमल',
        category: 'special',
        isPresent: true,
        isBenefic: true,
        strength: onlyBenefics ? 'strong' : 'moderate',
        planets: beneficsIn10.map(p => p.graha),
        houses: [ref.h10],
        description: `${beneficsIn10.map(p => p.graha).join(', ')} in 10th from ${ref.label} (H${ref.h10})`,
        effect: 'Lasting fame, virtuous character, charitable, respected in society',
        detail: 'Amala Yoga (meaning "spotless" or "pure") forms when a natural benefic planet (Jupiter, Venus, Mercury, or Moon) occupies the 10th house from the Lagna or Moon. The 10th house governs career, public reputation, and one\'s contribution to society. When a benefic occupies this house, the native tends to build a clean public image through virtuous actions and ethical conduct. The yoga is strongest when only benefics occupy the 10th house without malefic influence, but even a single benefic present alongside malefics confers some of its positive effects. These individuals are known for their integrity, charitable nature, and professional success through righteous means.',
      });
      break;
    }
  }

  // Adhi Yoga: Natural benefics (Jupiter, Venus, Mercury) in 6th, 7th, 8th from Moon or Lagna
  const moonHAdhi = houseOfPlanet(planets, 'Moon');
  const adhiBenefics: GrahaId[] = ['Jupiter', 'Venus', 'Mercury'];
  const adhiRefs: { label: string; baseH: number }[] = [];
  if (moonHAdhi) adhiRefs.push({ label: 'Moon', baseH: moonHAdhi });
  adhiRefs.push({ label: 'Lagna', baseH: 1 });

  for (const ref of adhiRefs) {
    const ah6 = ((ref.baseH + 4) % 12) + 1;
    const ah7 = ((ref.baseH + 5) % 12) + 1;
    const ah8 = ((ref.baseH + 6) % 12) + 1;
    const found = [ah6, ah7, ah8].flatMap(h =>
      getPlanetsInHouse(planets, h).filter(p => adhiBenefics.includes(p.graha))
    );
    if (found.length >= 2) {
      results.push({
        name: 'Adhi Yoga',
        sanskrit: 'अधि',
        category: 'special',
        isPresent: true,
        isBenefic: true,
        strength: found.length >= 3 ? 'strong' : 'moderate',
        planets: found.map(p => p.graha),
        houses: [...new Set([ah6, ah7, ah8].filter(h => getPlanetsInHouse(planets, h).some(p => adhiBenefics.includes(p.graha))))],
        description: `Benefics (${found.map(p => p.graha).join(', ')}) in 6/7/8th from ${ref.label}`,
        effect: 'Leadership, trustworthy, commands authority, wealthy',
        detail: 'Adhi Yoga forms when natural benefic planets (Jupiter, Venus, or Mercury) occupy the 6th, 7th, and/or 8th houses from the Moon or Lagna. At least two of these three positions must be filled by benefics. The 6th house represents overcoming obstacles, the 7th represents partnerships and public dealings, and the 8th represents hidden resources and transformation. When benefics occupy these positions, they create a powerful support structure for the native\'s material and emotional life. Adhi Yoga produces individuals who naturally rise to leadership positions, command trust and authority, and accumulate wealth. It is considered a yoga of ministers and administrators — people who wield significant influence.',
      });
      break;
    }
  }

  // Saraswati Yoga: Jupiter, Venus, Mercury in Kendra/Trikona/2nd AND Jupiter in own/exalted sign
  const jupInfo = getPlanet(planets, 'Jupiter');
  const venInfo = getPlanet(planets, 'Venus');
  const merInfo = getPlanet(planets, 'Mercury');
  const goodHouses = [...KENDRA_HOUSES, ...TRIKONA_HOUSES, 2];
  if (jupInfo && venInfo && merInfo) {
    const allInGood = goodHouses.includes(jupInfo.house) && goodHouses.includes(venInfo.house) && goodHouses.includes(merInfo.house);
    const jupStrong = isStrong('Jupiter', jupInfo.rashi);
    if (allInGood && jupStrong) {
      results.push({
        name: 'Saraswati Yoga',
        sanskrit: 'सरस्वती',
        category: 'special',
        isPresent: true,
        isBenefic: true,
        strength: 'strong',
        planets: ['Jupiter', 'Venus', 'Mercury'],
        houses: [jupInfo.house, venInfo.house, merInfo.house],
        description: `Jupiter (strong, H${jupInfo.house}), Venus (H${venInfo.house}), Mercury (H${merInfo.house}) all in Kendra/Trikona/2nd`,
        effect: 'Exceptional knowledge, mastery of arts and sciences, eloquence, literary fame',
        detail: 'Saraswati Yoga is named after the Hindu goddess of knowledge, music, and learning. It forms when Jupiter, Venus, and Mercury — the three planets most associated with wisdom, arts, and communication — are all placed in Kendra, Trikona, or the 2nd house, with Jupiter being in its own or exalted sign. This rare combination creates individuals of extraordinary intellectual and artistic ability. They often become renowned scholars, writers, musicians, or educators. The requirement for Jupiter to be strong ensures that knowledge is paired with wisdom and ethical application. Natives with Saraswati Yoga have a natural gift for expression and are often multilingual or exceptionally articulate.',
      });
    }
  }

  // Viparita Raja Yoga: dusthana lord placed in a dusthana
  const viparitaDefs = [
    { name: 'Harsha', houseFrom: 6,
      detail: 'Harsha Viparita Raja Yoga forms when the 6th house lord is placed in a dusthana house (6th, 8th, or 12th). The 6th house governs enemies, diseases, debts, and obstacles. When its lord goes to another difficult house, it creates a "negation of negation" — the difficulties destroy each other. Natives with Harsha Yoga overcome their enemies and rivals with surprising ease. Health issues that arise tend to resolve quickly. They may gain through competitive situations, legal victories, or the downfall of opponents. This yoga is particularly powerful for people in law, medicine, defense, or any field involving conflict resolution.' },
    { name: 'Sarala', houseFrom: 8,
      detail: 'Sarala Viparita Raja Yoga forms when the 8th house lord is placed in a dusthana house (6th, 8th, or 12th). The 8th house governs sudden events, inheritance, hidden matters, longevity, and transformation. When its lord occupies another dusthana, the challenging significations neutralize each other. Natives with Sarala Yoga often experience remarkable resilience — they survive and thrive through crises that would defeat others. They may receive unexpected inheritances, insurance benefits, or research breakthroughs. This yoga grants psychological strength, fearlessness, and the ability to navigate life\'s most difficult transitions with grace.' },
    { name: 'Vimala', houseFrom: 12,
      detail: 'Vimala Viparita Raja Yoga forms when the 12th house lord is placed in a dusthana house (6th, 8th, or 12th). The 12th house governs losses, expenses, foreign lands, isolation, and spiritual liberation. When its lord goes to another difficult house, losses and expenditures are contained or transformed into gains. Natives with Vimala Yoga tend to spend wisely, avoid wasteful expenditure, and often benefit from foreign connections or spiritual practices. They may gain through charitable work or institutions. This yoga also supports peaceful sleep, spiritual growth, and eventual moksha (liberation).' },
  ];
  for (const vd of viparitaDefs) {
    const lord = lordOfHouse(chart, vd.houseFrom);
    const lInfo = getPlanet(planets, lord);
    if (lInfo && DUSTHANA_HOUSES.includes(lInfo.house)) {
      const inOwnDusthana = lInfo.house === vd.houseFrom;
      results.push({
        name: `Viparita Raja (${vd.name})`,
        sanskrit: 'विपरीत राज',
        category: 'special',
        isPresent: true,
        isBenefic: true,
        strength: inOwnDusthana ? 'strong' : 'moderate',
        planets: [lord],
        houses: [lInfo.house],
        description: `${vd.houseFrom}th lord ${lord} placed in H${lInfo.house} (dusthana)`,
        effect: 'Success through adversity, gains from enemies\' losses, unexpected fortune',
        detail: vd.detail,
      });
    }
  }

  // Neechabhanga Raja Yoga: debilitated planet with cancellation conditions
  for (const pi of planets) {
    if (!isDebilitated(pi.graha, pi.rashi)) continue;

    const dispositor = SIGN_LORD[pi.rashi];
    const dispInfo = getPlanet(planets, dispositor);

    // Find which planet gets exalted in the sign where our planet is debilitated
    const exaltLord = Object.entries(EXALTED_SIGN).find(([, s]) => s === pi.rashi)?.[0] as GrahaId | undefined;
    const exaltInfo = exaltLord ? getPlanet(planets, exaltLord) : undefined;

    let cancelled = false;
    let reason = '';

    // Rule 1: Dispositor of debilitated planet is in a Kendra from Lagna
    if (dispInfo && isInKendra(dispInfo.house)) {
      cancelled = true;
      reason = `Dispositor ${dispositor} in Kendra (H${dispInfo.house})`;
    }
    // Rule 2: Planet that gets exalted in the debilitation sign is in a Kendra from Lagna
    if (!cancelled && exaltInfo && isInKendra(exaltInfo.house)) {
      cancelled = true;
      reason = `${exaltLord} (exalted in ${pi.rashi}) in Kendra (H${exaltInfo.house})`;
    }
    // Rule 3: Dispositor is conjunct the debilitated planet
    if (!cancelled && dispInfo && dispInfo.house === pi.house) {
      cancelled = true;
      reason = `Dispositor ${dispositor} conjunct in H${pi.house}`;
    }
    // Rule 4: Debilitated planet is in a Kendra (some texts accept this)
    if (!cancelled && isInKendra(pi.house)) {
      cancelled = true;
      reason = `Debilitated planet in Kendra (H${pi.house})`;
    }

    if (cancelled) {
      results.push({
        name: 'Neechabhanga Raja Yoga',
        sanskrit: 'नीचभंग राज',
        category: 'special',
        isPresent: true,
        isBenefic: true,
        strength: 'strong',
        planets: [pi.graha, dispositor],
        houses: [pi.house],
        description: `${pi.graha} debilitated in ${pi.rashi} — cancelled: ${reason}`,
        effect: 'Rise from humble beginnings, overcoming obstacles leads to great success',
        detail: 'Neechabhanga Raja Yoga is one of the most powerful yogas in Vedic astrology, forming when a debilitated planet\'s weakness is "cancelled" by specific conditions. A planet in its debilitation sign is at its weakest — but when cancellation occurs, this weakness transforms into extraordinary strength, much like a compressed spring releasing with great force. Classical texts describe four main cancellation conditions: (1) the dispositor of the debilitated planet is in a Kendra from Lagna, (2) the planet that gets exalted in the same sign is in a Kendra, (3) the dispositor is conjunct with the debilitated planet, or (4) the debilitated planet itself occupies a Kendra. Natives with this yoga often start life with significant challenges but achieve remarkable success precisely because of — not despite — their early struggles.',
      });
    }
  }

  return results;
}

function evaluateDoshas(chart: ChartData, planets: PlanetInfo[]): YogaResult[] {
  const results: YogaResult[] = [];

  // Manglik Dosha: Mars in 1st, 4th, 7th, 8th, or 12th house from Lagna
  const mars = getPlanet(planets, 'Mars');
  if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
    // Check mitigation: Mars in own/exalted sign, or aspected by Jupiter/Venus
    const marsStrong = isInOwnSign('Mars', mars.rashi) || isExalted('Mars', mars.rashi);
    const jupiterAspects = (() => {
      const jup = getPlanet(planets, 'Jupiter');
      if (!jup) return false;
      const dist = houseDistance(jup.house, mars.house);
      return [1, 5, 7, 9].includes(dist); // Jupiter aspects 5th, 7th, 9th from itself
    })();
    const mitigated = marsStrong || jupiterAspects;

    results.push({
      name: 'Manglik Dosha',
      sanskrit: 'मांगलिक दोष',
      category: 'dosha',
      isPresent: true,
      isBenefic: false,
      strength: mitigated ? 'weak' : 'moderate',
      planets: ['Mars'],
      houses: [mars.house],
      description: `Mars in H${mars.house}${mitigated ? ` (mitigated — ${marsStrong ? 'Mars in own/exalted sign' : 'Jupiter aspect'})` : ''}`,
      effect: 'Challenges in marriage and partnerships — severity depends on other chart factors and mitigations',
      detail: 'Manglik Dosha (also called Kuja Dosha or Mangal Dosha) is one of the most discussed conditions in Vedic astrology, particularly for marriage compatibility. It forms when Mars occupies the 1st, 4th, 7th, 8th, or 12th house from the Lagna. Mars is a fierce, aggressive planet — when placed in houses related to self (1st), domestic happiness (4th), marriage (7th), longevity of spouse (8th), or marital bed (12th), it can bring arguments, dominance issues, or turbulence in partnerships. However, the severity varies greatly. Several conditions mitigate or cancel the dosha: Mars in its own sign (Aries, Scorpio) or exalted sign (Capricorn) behaves more constructively; Jupiter\'s aspect on Mars brings wisdom and restraint; matching two Manglik charts neutralizes the effect; and Mars in certain signs (like Cancer in the 4th for debilitation) modifies results. Many astrologers consider this dosha overly feared — its effects are rarely as severe as traditionally described.',
    });
  }

  // Kaal Sarp Yoga: All 7 planets hemmed between Rahu and Ketu
  const rahu = getPlanet(planets, 'Rahu');
  const ketu = getPlanet(planets, 'Ketu');
  if (rahu && ketu) {
    const rahuH = rahu.house;
    const ketuH = ketu.house;
    const others = planets.filter(p => p.graha !== 'Rahu' && p.graha !== 'Ketu');

    // Check direction: all planets between Rahu→Ketu (forward) or Ketu→Rahu (forward)
    const distRK = ((ketuH - rahuH + 12) % 12);
    const distKR = ((rahuH - ketuH + 12) % 12);

    let allForward = distRK > 0;
    let allBackward = distKR > 0;

    for (const p of others) {
      const dR = ((p.house - rahuH + 12) % 12);
      if (dR === 0 || dR >= distRK) allForward = false;
      const dK = ((p.house - ketuH + 12) % 12);
      if (dK === 0 || dK >= distKR) allBackward = false;
    }

    if (allForward || allBackward) {
      results.push({
        name: 'Kaal Sarp Yoga',
        sanskrit: 'काल सर्प',
        category: 'dosha',
        isPresent: true,
        isBenefic: false,
        strength: 'strong',
        planets: ['Rahu', 'Ketu'],
        houses: [rahuH, ketuH],
        description: `All planets hemmed between Rahu (H${rahuH}) and Ketu (H${ketuH})`,
        effect: 'Karmic obstacles, struggles, delays — but also potential for transformation and spiritual growth',
        detail: 'Kaal Sarp Yoga forms when all seven visible planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are hemmed between Rahu and Ketu — the north and south lunar nodes. Rahu and Ketu represent the karmic axis of past-life patterns and future destiny. When all planets are confined within this axis, the native\'s life experiences become intensely karmic — they may face recurring obstacles, delays, or feelings of being "stuck" in patterns. However, Kaal Sarp Yoga is not purely negative. Many highly successful individuals have this yoga — it creates intense focus, determination, and an almost obsessive drive to succeed. The yoga often manifests as a life of extremes — either great success or significant struggles, rarely mediocrity. Remedies include Rahu-Ketu balancing rituals, Naga Puja, and developing spiritual awareness about one\'s karmic patterns.',
      });
    }
  }

  return results;
}

// ─── Main API ───

export function computeYogas(chart: ChartData): YogaResult[] {
  const planets = buildPlanetMap(chart);
  const all: YogaResult[] = [];

  all.push(...evaluateMahapurushaYogas(chart, planets));
  all.push(...evaluateRajYogas(chart, planets));
  all.push(...evaluateDhanaYogas(chart, planets));
  all.push(...evaluateLunarYogas(chart, planets));
  all.push(...evaluateSpecialYogas(chart, planets));
  all.push(...evaluateDoshas(chart, planets));

  return all.filter(y => y.isPresent);
}

export const YOGA_CATEGORY_LABELS: Record<YogaCategory, string> = {
  mahapurusha: 'Pancha Mahapurusha',
  raja: 'Raj Yoga',
  dhana: 'Wealth (Dhana)',
  lunar: 'Lunar Yogas',
  special: 'Special Yogas',
  dosha: 'Doshas',
};
