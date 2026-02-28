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

/** Planet SVG icon inner content (viewBox 0 0 24 24, stroke-based) */
export const GRAHA_ICON_SVG: Record<GrahaId, string> = {
  Sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.73-12.73l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  Moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Mars: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Mercury: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Jupiter: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Venus: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Saturn: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Rahu: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 12-4-4-4 4m4-4v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Ketu: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l4 4 4-4m-4 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

/** Wraps SVG inner content into a full inline SVG tag */
export function planetIconSvg(planet: GrahaId, sizePx = 16): string {
  const inner = GRAHA_ICON_SVG[planet] ?? '';
  return `<svg width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle">${inner}</svg>`;
}

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
