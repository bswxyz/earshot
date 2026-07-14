/* ============================================================
   EARSHOT — network data + the deterministic waveform model.
   Everything on the site is fiction, but it is consistent
   fiction: episode counts, durations and dates all agree.
   ============================================================ */

export type Chapter = { at: number; label: string }; // at = fraction of duration

export type Episode = {
  id: string;
  show: string;
  tint: 'coral' | 'teal';
  num: number;
  title: string;
  date: string; // mono display date
  dur: number; // seconds
  seed: number; // waveform identity
  blurb: string;
  chapters: Chapter[];
};

export type Show = {
  id: string;
  name: string;
  host: string;
  tag: string;
  cadence: string;
  eps: number;
  tint: 'coral' | 'teal';
  seed: number;
};

export type Host = {
  name: string;
  show: string;
  line: string;
  seed: number;
  tint: 'coral' | 'teal';
};

export const shows: Show[] = [
  {
    id: 'signal-path',
    name: 'Signal Path',
    host: 'Mara Quist',
    tag: 'How recorded sound actually works — one gain stage at a time.',
    cadence: 'weekly · ~40 min',
    eps: 84,
    tint: 'coral',
    seed: 11,
  },
  {
    id: 'dead-air',
    name: 'Dead Air',
    host: 'Errol Fane',
    tag: 'Histories of radio stations that signed off and never came back.',
    cadence: 'fortnightly · ~55 min',
    eps: 52,
    tint: 'teal',
    seed: 23,
  },
  {
    id: 'the-b-side',
    name: 'The B-Side',
    host: 'Juno Reyes',
    tag: 'Musicians on the song that almost made the record.',
    cadence: 'weekly · ~35 min',
    eps: 121,
    tint: 'coral',
    seed: 37,
  },
  {
    id: 'night-bus',
    name: 'Night Bus',
    host: 'Sam Okafor',
    tag: 'Quiet documentaries, recorded after midnight, mixed for headphones.',
    cadence: 'monthly · ~30 min',
    eps: 33,
    tint: 'teal',
    seed: 41,
  },
  {
    id: 'patch-notes',
    name: 'Patch Notes',
    host: 'Lena Vogl',
    tag: 'Synth builders, bedroom producers, and the machines between them.',
    cadence: 'weekly · ~45 min',
    eps: 97,
    tint: 'coral',
    seed: 53,
  },
  {
    id: 'foley',
    name: 'Foley',
    host: 'Dot Marsh & Iggy Brand',
    tag: 'The people who make movies make noise. Celery, gloves, gravel.',
    cadence: 'fortnightly · ~30 min',
    eps: 61,
    tint: 'teal',
    seed: 67,
  },
];

// 84+52+121+33+97+61
export const totalEpisodes = shows.reduce((n, s) => n + s.eps, 0);

export const episodes: Episode[] = [
  {
    id: 'sp-84',
    show: 'Signal Path',
    tint: 'coral',
    num: 84,
    title: 'The loudness wars are over (we lost)',
    date: 'JUL 10',
    dur: 2467, // 41:07
    seed: 8412,
    blurb:
      'Two masters of the same song, fourteen years apart, and a meter that refuses to lie. Mara walks the whole arms race — and what streaming normalization quietly did to it.',
    chapters: [
      { at: 0.0, label: 'Cold open' },
      { at: 0.14, label: 'The race to −6 LUFS' },
      { at: 0.44, label: 'Normalization wins' },
      { at: 0.72, label: 'Mastering now' },
      { at: 0.93, label: 'Outro' },
    ],
  },
  {
    id: 'bs-121',
    show: 'The B-Side',
    tint: 'coral',
    num: 121,
    title: 'Three chords, wrong order',
    date: 'JUL 08',
    dur: 2292, // 38:12
    seed: 12121,
    blurb:
      'A demo that sat on a hard drive for nine years because the bridge arrived before the verse did. Juno gets the band to play both versions back to back.',
    chapters: [
      { at: 0.0, label: 'The demo' },
      { at: 0.31, label: 'Both versions' },
      { at: 0.68, label: 'Why it waited' },
    ],
  },
  {
    id: 'pn-97',
    show: 'Patch Notes',
    tint: 'coral',
    num: 97,
    title: 'A filter you can hear smiling',
    date: 'JUL 03',
    dur: 2875, // 47:55
    seed: 9797,
    blurb:
      'Lena visits a two-person workshop in Tallinn that hand-matches transistors for a ladder filter clone — and asks whether “character” is just tolerance drift with good PR.',
    chapters: [
      { at: 0.0, label: 'The workshop' },
      { at: 0.26, label: 'Matching transistors' },
      { at: 0.58, label: 'Blind test' },
      { at: 0.85, label: 'Verdict' },
    ],
  },
  {
    id: 'da-52',
    show: 'Dead Air',
    tint: 'teal',
    num: 52,
    title: 'The transmitter in the corn',
    date: 'JUN 27',
    dur: 3340, // 55:40
    seed: 5252,
    blurb:
      'For 31 years, WKRN-AM broadcast crop prices, tornado warnings and one very strange overnight jazz show to four counties. Then the license lapsed on a Tuesday.',
    chapters: [
      { at: 0.0, label: 'Sign-on, 1961' },
      { at: 0.29, label: 'The overnight shift' },
      { at: 0.61, label: 'The lapse' },
      { at: 0.88, label: 'What remains' },
    ],
  },
  {
    id: 'nb-33',
    show: 'Night Bus',
    tint: 'teal',
    num: 33,
    title: 'Last stop, Harbor Road',
    date: 'JUN 24',
    dur: 1743, // 29:03
    seed: 3333,
    blurb:
      'One route, one driver, one binaural rig taped to the luggage rack. Recorded between 1 and 4 a.m. Best heard the same way.',
    chapters: [
      { at: 0.0, label: 'Depot' },
      { at: 0.4, label: 'Regulars' },
      { at: 0.78, label: 'Harbor Road' },
    ],
  },
];

export const hosts: Host[] = [
  {
    name: 'Mara Quist',
    show: 'Signal Path',
    line: 'Mixed live radio for twelve years. Owns three loudness meters, trusts none of them.',
    seed: 101,
    tint: 'coral',
  },
  {
    name: 'Errol Fane',
    show: 'Dead Air',
    line: 'Keeps a shelf of reel-to-reel tape rescued from station skips. Digitizes on Sundays.',
    seed: 202,
    tint: 'teal',
  },
  {
    name: 'Juno Reyes',
    show: 'The B-Side',
    line: 'Session bassist turned interviewer. Asks the question the liner notes never answered.',
    seed: 303,
    tint: 'coral',
  },
  {
    name: 'Sam Okafor',
    show: 'Night Bus',
    line: 'Records everything at 4 a.m. because, quote, “the city finally stops lying to the mic.”',
    seed: 404,
    tint: 'teal',
  },
  {
    name: 'Lena Vogl',
    show: 'Patch Notes',
    line: 'Built her first synth from a kit at fourteen. It still drifts sharp. She calls that a feature.',
    seed: 505,
    tint: 'coral',
  },
];

/* ---------- deterministic waveform model ---------- */

/** Small fast seeded PRNG — same sequence on server and client. */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Procedural "spoken word" peaks: phrase-level energy shifts,
 * syllable ripple, and occasional near-silent breaths. Deterministic
 * per seed, so a given episode always has the same waveform.
 * Values are quantized to 3 decimals: Math.sin can differ by 1 ulp
 * between engines, and the SVG fallbacks render on server AND client.
 */
export function buildPeaks(seed: number, n = 720): number[] {
  const rnd = mulberry32(seed);
  const q = (v: number) => Math.round(v * 1000) / 1000;
  const peaks: number[] = [];
  let energy = 0.55 + rnd() * 0.25;
  let pause = 0;
  for (let i = 0; i < n; i++) {
    if (pause > 0) {
      pause--;
      peaks.push(q(0.05 + rnd() * 0.05));
      continue;
    }
    if (rnd() < 0.014) pause = 3 + Math.floor(rnd() * 12); // breaths, beats
    if (rnd() < 0.06) energy = 0.35 + rnd() * 0.6; // a new phrase lands
    const syllable = 0.55 + 0.45 * Math.sin(i * 0.9 + rnd() * 2);
    const v = energy * syllable * (0.72 + rnd() * 0.28);
    peaks.push(q(Math.max(0.06, Math.min(1, v))));
  }
  return peaks;
}

/** Round for SVG attributes so server and client markup match exactly. */
export function r2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** mm:ss (episodes here are under an hour). */
export function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
