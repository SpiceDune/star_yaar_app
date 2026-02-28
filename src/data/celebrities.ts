export interface CelebrityEntry {
  slug: string;
  name: string;
  dob: string;        // YYYY-MM-DD
  time: string;        // HH:MM (24h)
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  category: CelebrityCategory;
  bio: string;
  timeSource: 'AA' | 'A' | 'B' | 'C' | 'DD';
  timeNote?: string;
}

export type CelebrityCategory =
  | 'bollywood'
  | 'cricket'
  | 'politics'
  | 'business'
  | 'music'
  | 'sports';

export const CATEGORY_LABELS: Record<CelebrityCategory, string> = {
  bollywood: 'Bollywood',
  cricket: 'Cricket',
  politics: 'Politics',
  business: 'Business',
  music: 'Music',
  sports: 'Sports',
};

export const celebrities: CelebrityEntry[] = [
  // ── Bollywood ──
  {
    slug: 'shah-rukh-khan-birth-chart',
    name: 'Shah Rukh Khan',
    dob: '1965-11-02',
    time: '02:30',
    city: 'New Delhi, India',
    lat: 28.6353,
    lon: 77.2250,
    timezone: 'Asia/Kolkata',
    category: 'bollywood',
    bio: 'Known as the "King of Bollywood", Shah Rukh Khan is one of the most successful film stars in the world with over 80 Hindi films spanning three decades.',
    timeSource: 'A',
    timeNote: 'Most cited by Vedic astrologers',
  },
  {
    slug: 'amitabh-bachchan-birth-chart',
    name: 'Amitabh Bachchan',
    dob: '1942-10-11',
    time: '16:00',
    city: 'Allahabad, India',
    lat: 25.4358,
    lon: 81.8463,
    timezone: 'Asia/Kolkata',
    category: 'bollywood',
    bio: 'The "Shahenshah" of Indian cinema, Amitabh Bachchan has been a dominant figure in Bollywood for over five decades, known for his roles in Sholay, Deewar, and many more.',
    timeSource: 'A',
  },
  {
    slug: 'deepika-padukone-birth-chart',
    name: 'Deepika Padukone',
    dob: '1986-01-05',
    time: '02:26',
    city: 'Copenhagen, Denmark',
    lat: 55.6761,
    lon: 12.5683,
    timezone: 'Europe/Copenhagen',
    category: 'bollywood',
    bio: 'One of the highest-paid actresses in India, Deepika Padukone gained international recognition with films like Om Shanti Om, Padmaavat, and her Hollywood debut in xXx: Return of Xander Cage.',
    timeSource: 'B',
    timeNote: 'Approximate, from astrology forums',
  },
  {
    slug: 'salman-khan-birth-chart',
    name: 'Salman Khan',
    dob: '1965-12-27',
    time: '02:30',
    city: 'Indore, India',
    lat: 22.7196,
    lon: 75.8577,
    timezone: 'Asia/Kolkata',
    category: 'bollywood',
    bio: 'Salman Khan, known as "Bhaijaan", is one of the most commercially successful actors in Hindi cinema with blockbusters like Bajrangi Bhaijaan, Tiger Zinda Hai, and the Dabangg franchise.',
    timeSource: 'B',
  },
  {
    slug: 'rajinikanth-birth-chart',
    name: 'Rajinikanth',
    dob: '1950-12-12',
    time: '00:10',
    city: 'Bangalore, India',
    lat: 12.9716,
    lon: 77.5946,
    timezone: 'Asia/Kolkata',
    category: 'bollywood',
    bio: 'The "Thalaiva" of Indian cinema, Rajinikanth is a cultural icon whose influence extends far beyond Tamil Nadu. His style, dialogue delivery, and larger-than-life screen presence are legendary.',
    timeSource: 'B',
    timeNote: 'Widely cited in South Indian astrology circles',
  },

  // ── Cricket ──
  {
    slug: 'sachin-tendulkar-birth-chart',
    name: 'Sachin Tendulkar',
    dob: '1973-04-24',
    time: '16:00',
    city: 'Mumbai, India',
    lat: 19.0760,
    lon: 72.8777,
    timezone: 'Asia/Kolkata',
    category: 'cricket',
    bio: 'The "God of Cricket" and India\'s greatest batsman. Sachin Tendulkar holds virtually every batting record in international cricket, including 100 international centuries.',
    timeSource: 'A',
  },
  {
    slug: 'virat-kohli-birth-chart',
    name: 'Virat Kohli',
    dob: '1988-11-05',
    time: '02:29',
    city: 'New Delhi, India',
    lat: 28.6353,
    lon: 77.2250,
    timezone: 'Asia/Kolkata',
    category: 'cricket',
    bio: 'One of the greatest batsmen in cricket history, Virat Kohli is known for his aggressive batting style, fitness standards, and passionate captaincy of the Indian cricket team.',
    timeSource: 'B',
  },
  {
    slug: 'ms-dhoni-birth-chart',
    name: 'Mahendra Singh Dhoni',
    dob: '1981-07-07',
    time: '23:36',
    city: 'Ranchi, India',
    lat: 23.3441,
    lon: 85.3096,
    timezone: 'Asia/Kolkata',
    category: 'cricket',
    bio: 'Captain Cool — MS Dhoni led India to victories in all three ICC trophies (T20 World Cup, ODI World Cup, Champions Trophy). Known for his calm demeanor and helicopter shot.',
    timeSource: 'A',
    timeNote: 'Frequently cited in Vedic astrology analyses',
  },

  // ── Politics ──
  {
    slug: 'narendra-modi-birth-chart',
    name: 'Narendra Modi',
    dob: '1950-09-17',
    time: '10:00',
    city: 'Vadnagar, India',
    lat: 23.7869,
    lon: 72.6381,
    timezone: 'Asia/Kolkata',
    category: 'politics',
    bio: 'The 14th Prime Minister of India, Narendra Modi has been one of the most transformative political leaders in Indian history, known for initiatives like Digital India and Make in India.',
    timeSource: 'B',
    timeNote: 'Commonly used time in political astrology',
  },
  {
    slug: 'mahatma-gandhi-birth-chart',
    name: 'Mahatma Gandhi',
    dob: '1869-10-02',
    time: '07:45',
    city: 'Porbandar, India',
    lat: 21.6417,
    lon: 69.6293,
    timezone: 'Asia/Kolkata',
    category: 'politics',
    bio: 'Father of the Nation — Mohandas Karamchand Gandhi led India\'s non-violent independence movement against British colonial rule and inspired civil rights movements worldwide.',
    timeSource: 'AA',
    timeNote: 'From autobiography and birth records',
  },
  {
    slug: 'jawaharlal-nehru-birth-chart',
    name: 'Jawaharlal Nehru',
    dob: '1889-11-14',
    time: '23:00',
    city: 'Allahabad, India',
    lat: 25.4358,
    lon: 81.8463,
    timezone: 'Asia/Kolkata',
    category: 'politics',
    bio: 'The first Prime Minister of independent India, Jawaharlal Nehru was a central figure in Indian politics before and after independence, shaping India\'s modern democratic republic.',
    timeSource: 'A',
  },
  {
    slug: 'indira-gandhi-birth-chart',
    name: 'Indira Gandhi',
    dob: '1917-11-19',
    time: '23:07',
    city: 'Allahabad, India',
    lat: 25.4358,
    lon: 81.8463,
    timezone: 'Asia/Kolkata',
    category: 'politics',
    bio: 'The first and only female Prime Minister of India, Indira Gandhi served for a total of fifteen years across two terms. She was known for her strong political will and decisive leadership.',
    timeSource: 'A',
  },

  // ── Business ──
  {
    slug: 'mukesh-ambani-birth-chart',
    name: 'Mukesh Ambani',
    dob: '1957-04-19',
    time: '06:00',
    city: 'Aden, Yemen',
    lat: 12.7855,
    lon: 45.0187,
    timezone: 'Asia/Aden',
    category: 'business',
    bio: 'Chairman of Reliance Industries and consistently ranked among Asia\'s wealthiest individuals. Mukesh Ambani transformed India\'s telecom landscape with Jio and leads one of the world\'s most valuable conglomerates.',
    timeSource: 'B',
  },
  {
    slug: 'ratan-tata-birth-chart',
    name: 'Ratan Tata',
    dob: '1937-12-28',
    time: '03:30',
    city: 'Mumbai, India',
    lat: 19.0760,
    lon: 72.8777,
    timezone: 'Asia/Kolkata',
    category: 'business',
    bio: 'Former chairman of Tata Sons and one of India\'s most respected industrialists. Ratan Tata is known for his visionary leadership, humility, and extensive philanthropic work.',
    timeSource: 'B',
  },

  // ── Music ──
  {
    slug: 'lata-mangeshkar-birth-chart',
    name: 'Lata Mangeshkar',
    dob: '1929-09-28',
    time: '22:30',
    city: 'Indore, India',
    lat: 22.7196,
    lon: 75.8577,
    timezone: 'Asia/Kolkata',
    category: 'music',
    bio: 'The "Nightingale of India", Lata Mangeshkar recorded songs in over 36 languages during a career spanning seven decades. Her voice defined the golden era of Hindi film music.',
    timeSource: 'A',
  },
  {
    slug: 'ar-rahman-birth-chart',
    name: 'A.R. Rahman',
    dob: '1967-01-06',
    time: '00:00',
    city: 'Chennai, India',
    lat: 13.0827,
    lon: 80.2707,
    timezone: 'Asia/Kolkata',
    category: 'music',
    bio: 'Oscar and Grammy-winning composer A.R. Rahman revolutionized Indian film music. Known as the "Mozart of Madras", his work on Roja, Dil Se, and Slumdog Millionaire has earned him global acclaim.',
    timeSource: 'C',
    timeNote: 'Exact time uncertain; midnight used as approximation',
  },

  // ── Sports ──
  {
    slug: 'apj-abdul-kalam-birth-chart',
    name: 'A.P.J. Abdul Kalam',
    dob: '1931-10-15',
    time: '01:00',
    city: 'Rameswaram, India',
    lat: 9.2876,
    lon: 79.3129,
    timezone: 'Asia/Kolkata',
    category: 'politics',
    bio: 'The "Missile Man of India" and 11th President. A.P.J. Abdul Kalam was a scientist, visionary, and beloved teacher who inspired millions of young Indians with his book Wings of Fire.',
    timeSource: 'B',
  },
  {
    slug: 'neeraj-chopra-birth-chart',
    name: 'Neeraj Chopra',
    dob: '1997-12-24',
    time: '08:00',
    city: 'Panipat, India',
    lat: 29.3909,
    lon: 76.9635,
    timezone: 'Asia/Kolkata',
    category: 'sports',
    bio: 'India\'s first Olympic gold medalist in athletics, Neeraj Chopra won the javelin throw at the 2020 Tokyo Olympics, becoming one of the most celebrated Indian athletes of the modern era.',
    timeSource: 'C',
    timeNote: 'Approximate',
  },
  {
    slug: 'atal-bihari-vajpayee-birth-chart',
    name: 'Atal Bihari Vajpayee',
    dob: '1924-12-25',
    time: '05:15',
    city: 'Gwalior, India',
    lat: 26.2183,
    lon: 78.1828,
    timezone: 'Asia/Kolkata',
    category: 'politics',
    bio: 'The 10th Prime Minister of India and a towering statesman. Atal Bihari Vajpayee was a poet, orator, and leader who shaped India\'s nuclear policy and infrastructure development.',
    timeSource: 'A',
  },
];

export function getCelebrityBySlug(slug: string): CelebrityEntry | undefined {
  return celebrities.find(c => c.slug === slug);
}

export function getCelebritiesByCategory(category: CelebrityCategory): CelebrityEntry[] {
  return celebrities.filter(c => c.category === category);
}
