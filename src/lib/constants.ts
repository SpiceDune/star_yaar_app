// StarYaar – constants (Prompt 2; used by shared components and charts)

import type { GrahaId } from './types';

/** Planet colors (hex) – design system */
export const PLANET_COLORS: Record<GrahaId, string> = {
  Sun: '#ea580c',
  Moon: '#7c3aed',
  Mars: '#e11d48',
  Mercury: '#059669',
  Jupiter: '#d97706',
  Venus: '#ec4899',
  Saturn: '#475569',
  Rahu: '#2563eb',
  Ketu: '#6366f1',
};

/** Planet abbreviations for chart */
export const GRAHA_ABBREV: Record<GrahaId, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

/** Human-readable planet names */
export const GRAHA_NAMES: Record<GrahaId, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mars: 'Mars',
  Mercury: 'Mercury',
  Jupiter: 'Jupiter',
  Venus: 'Venus',
  Saturn: 'Saturn',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
};

/** Rashi (sign) to English name */
export const RASHI_ENGLISH: Record<string, string> = {
  Mesha: 'Aries',
  Vrishabha: 'Taurus',
  Mithuna: 'Gemini',
  Karka: 'Cancer',
  Simha: 'Leo',
  Kanya: 'Virgo',
  Tula: 'Libra',
  Vrishchika: 'Scorpio',
  Dhanu: 'Sagittarius',
  Makara: 'Capricorn',
  Kumbha: 'Aquarius',
  Meena: 'Pisces',
};
