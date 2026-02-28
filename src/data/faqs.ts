export interface FaqEntry {
  question: string;
  answer: string;
  category: FaqCategory;
}

export type FaqCategory =
  | 'general'
  | 'birth-chart'
  | 'dasha'
  | 'yogas'
  | 'transits'
  | 'celebrity'
  | 'privacy'
  | 'technical';

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  general: 'General',
  'birth-chart': 'Birth Chart & Calculations',
  dasha: 'Dasha & Predictions',
  yogas: 'Yogas',
  transits: 'Transits',
  celebrity: 'Celebrity Charts',
  privacy: 'Privacy & Data',
  technical: 'Technical & Features',
};

export const FAQ_CATEGORY_ORDER: FaqCategory[] = [
  'general',
  'birth-chart',
  'dasha',
  'yogas',
  'transits',
  'celebrity',
  'privacy',
  'technical',
];

export const faqs: FaqEntry[] = [
  // ── General ──
  {
    category: 'general',
    question: 'What is StarYaar?',
    answer: 'StarYaar is a free online Vedic astrology platform that generates detailed birth charts (Kundli) using the Swiss Ephemeris with Lahiri Ayanamsa. It provides planetary positions, Vimshottari Dasha timelines, Yoga analysis, transit predictions, and 16 divisional charts — all computed with astronomical precision.',
  },
  {
    category: 'general',
    question: 'What is a Kundli (birth chart)?',
    answer: 'A Kundli, also known as a Janam Kundli or birth chart, is a map of the sky at the exact moment and location of your birth. It shows the positions of the Sun, Moon, and planets across the 12 houses of the zodiac. In Vedic astrology, the Kundli is the foundation for understanding personality traits, life events, career prospects, relationships, and spiritual growth.',
  },
  {
    category: 'general',
    question: 'Is StarYaar completely free?',
    answer: 'Yes, StarYaar is completely free to use. You can generate unlimited birth charts, view all sections including Dasha timelines, Yogas, Transits, and Divisional Charts, share your chart via a unique link, and download a PDF report — all at no cost.',
  },
  {
    category: 'general',
    question: 'Do I need to create an account?',
    answer: 'No account or registration is required. Simply enter your birth details and your chart is generated instantly. Each chart gets a unique shareable link so you can always come back to it.',
  },
  {
    category: 'general',
    question: 'What makes StarYaar different from other astrology websites?',
    answer: 'StarYaar uses the Swiss Ephemeris (Moshier mode) for astronomical calculations — the same engine used by professional astrology software. We compute all data server-side with high precision rather than using simplified lookup tables. The interface is designed to be modern, clean, and easy to read, even for astrology beginners.',
  },

  // ── Birth Chart & Calculations ──
  {
    category: 'birth-chart',
    question: 'How accurate are the planetary positions?',
    answer: 'StarYaar uses the Swiss Ephemeris in Moshier mode, which provides planetary positions accurate to a fraction of an arc-second. This is the same computational engine trusted by professional astrologers and astronomical software worldwide. The accuracy of your specific chart depends primarily on how precisely you know your birth time.',
  },
  {
    category: 'birth-chart',
    question: 'What Ayanamsa does StarYaar use?',
    answer: 'StarYaar uses the Lahiri (Chitrapaksha) Ayanamsa, which is the most widely used Ayanamsa in Vedic astrology and is officially adopted by the Indian government\'s calendar reform committee. The Lahiri Ayanamsa defines the starting point of the sidereal zodiac based on the star Spica (Chitra).',
  },
  {
    category: 'birth-chart',
    question: 'Why is my birth time important?',
    answer: 'Birth time determines your Ascendant (Lagna), which is the foundation of your entire chart. Even a few minutes of difference can change the Lagna, which shifts all 12 houses and significantly alters the chart interpretation. If you don\'t know your exact birth time, you can use an approximate time, but keep in mind that the Lagna-dependent sections (houses, some Yogas, Dasha starting point) may not be fully accurate.',
  },
  {
    category: 'birth-chart',
    question: 'What if I don\'t know my exact birth time?',
    answer: 'If you don\'t know your exact birth time, you can still generate a chart. Check the "I don\'t know my exact birth time" option on the form, and a default time of 12:00 noon will be used. The planetary sign positions will still be largely accurate, but house placements, Lagna, and Dasha start dates should be taken as approximate.',
  },
  {
    category: 'birth-chart',
    question: 'What chart system does StarYaar use?',
    answer: 'StarYaar uses the North Indian diamond-style chart format with the Whole Sign house system, which is traditional in Vedic astrology. Each house corresponds to one complete sign (Rashi), starting from the Ascendant sign in the first house.',
  },
  {
    category: 'birth-chart',
    question: 'Can I enter coordinates manually if my city isn\'t found?',
    answer: 'Yes. If the city search doesn\'t return your location, click "Can\'t find your city? Enter coordinates manually" below the city field. You can then enter your latitude, longitude, and timezone directly.',
  },
  {
    category: 'birth-chart',
    question: 'What are the 12 houses in a birth chart?',
    answer: 'The 12 houses represent different areas of life: 1st (Self/Personality), 2nd (Wealth/Speech), 3rd (Siblings/Courage), 4th (Mother/Home), 5th (Children/Education), 6th (Enemies/Health), 7th (Marriage/Partnerships), 8th (Longevity/Transformation), 9th (Luck/Dharma), 10th (Career/Status), 11th (Gains/Friends), and 12th (Losses/Spirituality). The sign and planets in each house influence that area of life.',
  },

  // ── Dasha & Predictions ──
  {
    category: 'dasha',
    question: 'What is the Vimshottari Dasha system?',
    answer: 'Vimshottari Dasha is the most widely used predictive timing system in Vedic astrology. It divides a person\'s life into planetary periods (Mahadasha) totaling 120 years, with each period ruled by a specific planet. The starting Dasha is determined by the Moon\'s Nakshatra at birth. Each Mahadasha is further divided into sub-periods (Antardasha) and sub-sub-periods (Pratyantardasha).',
  },
  {
    category: 'dasha',
    question: 'How do I read the Dasha timeline?',
    answer: 'The Dasha timeline shows your life divided into major planetary periods. Click on any Mahadasha period to see its Antardasha (sub-period) breakdown. The currently active period is highlighted. Each period is colored by the ruling planet. The timeline shows the start date, end date, and duration of each period. Look for connections between the Dasha planet and your birth chart to understand what themes that period activates.',
  },
  {
    category: 'dasha',
    question: 'What is a Mahadasha vs Antardasha?',
    answer: 'A Mahadasha is the major planetary period lasting several years (e.g., Venus Mahadasha lasts 20 years, Sun lasts 6 years). Within each Mahadasha, there are 9 Antardashas (sub-periods) ruled by each of the 9 planets in sequence. The Antardasha modifies the effects of the Mahadasha — for example, during Jupiter Mahadasha / Venus Antardasha, you experience Jupiter\'s main themes colored by Venus\'s influence.',
  },
  {
    category: 'dasha',
    question: 'Why are my Dasha dates different from another website?',
    answer: 'Dasha dates depend on the precise Moon longitude at birth, which varies based on the ephemeris used, the Ayanamsa applied, and the birth time accuracy. StarYaar uses the Swiss Ephemeris with Lahiri Ayanamsa. Minor differences of a few days to weeks between websites are normal and usually due to different Ayanamsa values or ephemeris precision.',
  },

  // ── Yogas ──
  {
    category: 'yogas',
    question: 'What are Yogas in Vedic astrology?',
    answer: 'Yogas are specific planetary combinations in a birth chart that produce particular results — positive or challenging. They are formed when planets occupy certain houses, signs, or relationships to each other. StarYaar checks for dozens of classical Yogas including Mahapurusha Yogas, Raja Yogas, Dhana Yogas, Lunar Yogas, and Doshas.',
  },
  {
    category: 'yogas',
    question: 'What are Mahapurusha Yogas?',
    answer: 'Mahapurusha Yogas are five powerful Yogas formed when Mars, Mercury, Jupiter, Venus, or Saturn is in its own sign or exaltation sign AND placed in a Kendra house (1st, 4th, 7th, or 10th). They are: Ruchaka (Mars), Bhadra (Mercury), Hamsa (Jupiter), Malavya (Venus), and Shasha (Saturn). These Yogas indicate exceptional qualities related to the forming planet.',
  },
  {
    category: 'yogas',
    question: 'What is a Raja Yoga?',
    answer: 'Raja Yoga is formed when the lord of a Kendra house (1, 4, 7, 10) connects with the lord of a Trikona house (1, 5, 9) through conjunction, mutual aspect, or exchange. Raja Yogas indicate power, authority, success, and social elevation. The strength depends on which houses are involved and the condition of the participating planets.',
  },
  {
    category: 'yogas',
    question: 'What is Mangal Dosha (Manglik)?',
    answer: 'Mangal Dosha occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Lagna. It is traditionally associated with challenges in marriage and partnerships. However, many astrologers note that the Dosha is cancelled or reduced under certain conditions, such as Mars being in its own sign, or both partners having the Dosha. StarYaar indicates the strength of the Dosha when detected.',
  },
  {
    category: 'yogas',
    question: 'Why does my chart show a Yoga as "Mild" vs "Very Powerful"?',
    answer: 'StarYaar evaluates Yoga strength based on multiple factors: whether the forming planets are in their own sign, exaltation, or debilitation; whether they are retrograde; the houses involved; and whether there are modifying aspects from benefic or malefic planets. A "Very Powerful" Yoga has strong supporting conditions, while a "Mild" one meets the basic formation criteria but has weakening factors.',
  },

  // ── Transits ──
  {
    category: 'transits',
    question: 'What are Transits (Gochar)?',
    answer: 'Transits show where the planets are currently positioned in the sky and how they interact with your natal (birth) chart. As planets move through the zodiac, they activate different houses in your chart, triggering events and experiences related to those life areas. Slow-moving planets (Saturn, Jupiter, Rahu/Ketu) produce the most significant transit effects.',
  },
  {
    category: 'transits',
    question: 'How often are transits updated?',
    answer: 'Transit positions are computed in real-time using the Swiss Ephemeris whenever you view your chart. You can also change the transit date to see planetary positions for any date — past or future — to plan ahead or analyze past events.',
  },
  {
    category: 'transits',
    question: 'What is Saturn\'s Sade Sati?',
    answer: 'Sade Sati is a 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from your natal Moon sign. It is considered one of the most significant transit periods in Vedic astrology, often bringing challenges that ultimately lead to maturity, discipline, and transformation. StarYaar\'s transit section helps you track Saturn\'s current position relative to your Moon.',
  },

  // ── Celebrity Charts ──
  {
    category: 'celebrity',
    question: 'Where does the celebrity birth data come from?',
    answer: 'All celebrity birth data is sourced from publicly available records including Wikipedia, Astro-Databank, published biographies, and established astrology databases. Each chart includes a time accuracy rating (AA to DD) indicating how reliable the birth time is. Dates and places are typically well-documented public information.',
  },
  {
    category: 'celebrity',
    question: 'How accurate are celebrity birth charts?',
    answer: 'The accuracy depends primarily on the birth time. Charts rated AA (from birth certificate) or A (from memory or biography) are highly reliable. Ratings of B (approximate) or C (uncertain) mean the birth time is less precise, which may affect the Lagna and house placements. The planetary sign positions remain accurate regardless of birth time precision.',
  },
  {
    category: 'celebrity',
    question: 'Can a celebrity request removal of their birth chart?',
    answer: 'Yes, absolutely. While we use only publicly available birth data, we respect the wishes of any individual who prefers not to have their chart displayed. If you are a public figure (or their authorized representative) and would like your birth chart removed from StarYaar, please contact us at staryaar@gmail.com with your name and the URL of the chart page. We will remove it promptly, typically within 48 hours.',
  },
  {
    category: 'celebrity',
    question: 'Can I suggest a celebrity to add?',
    answer: 'We welcome suggestions. If you would like a specific public figure\'s chart added to StarYaar, email us at staryaar@gmail.com with the person\'s name and, if available, their birth date, time, and place. We will verify the data against reliable sources before publishing.',
  },
  {
    category: 'celebrity',
    question: 'Are celebrity charts any different from regular charts?',
    answer: 'No. Celebrity charts use the exact same computation engine, algorithms, and display format as any chart you generate for yourself. The only difference is that celebrity charts include a brief biography and are accessible via a permanent SEO-friendly URL.',
  },

  // ── Privacy & Data ──
  {
    category: 'privacy',
    question: 'Is my birth data stored? Who can see it?',
    answer: 'When you generate a chart, your birth details and computed chart data are saved in our database so you can access it again via the unique chart link. This data is not publicly listed or searchable — only someone with the direct link can view it. We do not sell, share, or use your birth data for any purpose other than generating your chart.',
  },
  {
    category: 'privacy',
    question: 'Can I delete my chart data?',
    answer: 'If you would like your chart removed from our database, please email staryaar@gmail.com with the chart URL (the /kundli/... link). We will delete it from our servers within 48 hours.',
  },
  {
    category: 'privacy',
    question: 'What happens when I share my chart link?',
    answer: 'When you share your chart\'s unique link, anyone with that link can view the chart — including your name, birth details, and all chart sections. The link is not discoverable through search engines or listed publicly. Only share it with people you trust.',
  },
  {
    category: 'privacy',
    question: 'Does StarYaar use cookies or track me?',
    answer: 'StarYaar uses minimal localStorage to remember your theme preference (orange or yellow color scheme). We do not use advertising cookies, third-party trackers, or analytics that identify individual users.',
  },

  // ── Technical & Features ──
  {
    category: 'technical',
    question: 'What is the PDF report and how do I download it?',
    answer: 'The PDF report is a printable version of your full birth chart, generated server-side using Puppeteer. Click the "Download PDF" button on any chart page, select which sections you want included (Yogas, Dasha, Divisional Charts), and the report will be generated and downloaded. The PDF features a cover page, modern styling, and all selected chart sections.',
  },
  {
    category: 'technical',
    question: 'What are Divisional Charts (Varga)?',
    answer: 'Divisional Charts are derived charts created by subdividing each sign of the birth chart. StarYaar computes 16 divisional charts (D1 through D60), each revealing deeper details about a specific area of life. For example, D9 (Navamsa) shows marriage and spiritual life, D10 (Dasamsa) shows career, D7 (Saptamsa) shows children, and D60 (Shashtiamsa) reveals past-life karma. Click any divisional chart card to see its chart and planetary positions.',
  },
  {
    category: 'technical',
    question: 'What is the Panchang section?',
    answer: 'Panchang means "five limbs" and shows five key elements for your birth date: Tithi (lunar day), Nakshatra (lunar mansion), Yoga (Sun-Moon angle), Karana (half of Tithi), and Vara (day of the week). These are fundamental elements in Vedic astrology and Hindu calendar systems, used for muhurta (auspicious timing) and personality analysis.',
  },
  {
    category: 'technical',
    question: 'Which browsers does StarYaar support?',
    answer: 'StarYaar works on all modern browsers including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices. The interface is fully responsive and optimized for screens of all sizes.',
  },
  {
    category: 'technical',
    question: 'Can I use StarYaar on my phone?',
    answer: 'Yes. StarYaar is fully responsive and works well on mobile devices. You can generate charts, view all sections, share links, and download PDFs from your phone or tablet.',
  },
  {
    category: 'technical',
    question: 'What is the Swiss Ephemeris?',
    answer: 'The Swiss Ephemeris is a high-precision astronomical calculation library developed by Astrodienst AG (astro.com). It computes planetary positions with an accuracy of less than 0.001 arc-seconds for recent centuries. StarYaar uses it in Moshier mode, which performs all calculations analytically without requiring separate data files, while maintaining excellent accuracy.',
  },
];
