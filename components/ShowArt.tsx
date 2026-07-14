import { mulberry32 } from '@/lib/data';

/**
 * Bespoke cover art per show — all inline SVG, all theme tokens.
 * Each piece is a different reading of "sound drawn on paper".
 */
export default function ShowArt({ id, seed }: { id: string; seed: number }) {
  const rnd = mulberry32(seed);

  if (id === 'signal-path') {
    // a signal chain: source → stages → speaker
    const pts = [14, 38, 22, 52, 30, 44, 58, 36];
    let d = `M 10 ${pts[0]}`;
    pts.slice(1).forEach((y, i) => {
      d += ` L ${10 + (i + 1) * 22} ${y}`;
    });
    return (
      <svg viewBox="0 0 176 88" aria-hidden="true" focusable="false">
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinejoin="round" />
        {pts.map((y, i) => (
          <circle key={i} cx={10 + i * 22} cy={y} r={i % 3 === 0 ? 4 : 2.6} fill="var(--art-ink)" />
        ))}
        <rect x="150" y="26" width="16" height="20" rx="2" fill="none" stroke="var(--art-ink)" strokeWidth="2" />
        <path d="M150 31h-6l-5 5v0l5 5h6" fill="none" stroke="var(--art-ink)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (id === 'dead-air') {
    // a tuning dial gone quiet, static hanging around it
    const dots = Array.from({ length: 26 }, () => ({
      x: 10 + rnd() * 156,
      y: 8 + rnd() * 70,
      r: 0.8 + rnd() * 1.6,
    }));
    return (
      <svg viewBox="0 0 176 88" aria-hidden="true" focusable="false">
        {dots.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--art-faint)" />
        ))}
        <path d="M 34 70 A 54 54 0 0 1 142 70" fill="none" stroke="var(--art-ink)" strokeWidth="2.4" />
        <path d="M 52 70 A 36 36 0 0 1 124 70" fill="none" stroke="var(--art-faint)" strokeWidth="1.6" />
        <line x1="88" y1="70" x2="120" y2="30" stroke="var(--teal-art)" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="88" cy="70" r="4.5" fill="var(--art-ink)" />
      </svg>
    );
  }

  if (id === 'the-b-side') {
    // the record, flipped: grooves on one half only
    return (
      <svg viewBox="0 0 176 88" aria-hidden="true" focusable="false">
        <circle cx="88" cy="44" r="36" fill="none" stroke="var(--art-ink)" strokeWidth="2.4" />
        <path d="M 88 16 A 28 28 0 0 0 88 72" fill="none" stroke="var(--art-faint)" strokeWidth="1.6" />
        <path d="M 88 24 A 20 20 0 0 0 88 64" fill="none" stroke="var(--art-faint)" strokeWidth="1.6" />
        <path d="M 88 32 A 12 12 0 0 0 88 56" fill="none" stroke="var(--art-faint)" strokeWidth="1.6" />
        <circle cx="88" cy="44" r="4.5" fill="var(--accent)" />
        <text
          x="112"
          y="49"
          fontFamily="var(--font-m)"
          fontSize="13"
          fill="var(--art-ink)"
          textAnchor="middle"
        >
          B
        </text>
      </svg>
    );
  }

  if (id === 'night-bus') {
    // a route line through the dark, stops lit
    const stops = [18, 52, 92, 128, 158];
    return (
      <svg viewBox="0 0 176 88" aria-hidden="true" focusable="false">
        <rect x="8" y="10" width="160" height="68" rx="6" fill="none" stroke="var(--art-faint)" strokeWidth="1.6" />
        <path
          d="M 18 62 C 44 58 52 34 82 40 S 132 60 158 30"
          fill="none"
          stroke="var(--art-ink)"
          strokeWidth="2.2"
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
        {stops.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={i === 0 ? 62 : i === 1 ? 46 : i === 2 ? 41 : i === 3 ? 53 : 30}
            r={i === stops.length - 1 ? 4.5 : 3}
            fill={i === stops.length - 1 ? 'var(--teal-art)' : 'var(--art-ink)'}
          />
        ))}
      </svg>
    );
  }

  if (id === 'patch-notes') {
    // patch cables between jacks
    const jacks = [
      [20, 18],
      [64, 14],
      [112, 18],
      [156, 16],
      [20, 72],
      [64, 74],
      [112, 70],
      [156, 72],
    ];
    return (
      <svg viewBox="0 0 176 88" aria-hidden="true" focusable="false">
        <path d="M 20 18 C 30 66 54 60 64 74" fill="none" stroke="var(--accent)" strokeWidth="2.4" />
        <path d="M 64 14 C 90 60 96 40 112 70" fill="none" stroke="var(--teal-art)" strokeWidth="2.4" />
        <path d="M 112 18 C 130 52 146 44 156 72" fill="none" stroke="var(--art-faint)" strokeWidth="2" />
        {jacks.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5.5" fill="none" stroke="var(--art-ink)" strokeWidth="2" />
            <circle cx={x} cy={y} r="1.8" fill="var(--art-ink)" />
          </g>
        ))}
      </svg>
    );
  }

  // foley — footsteps and the arcs they make
  return (
    <svg viewBox="0 0 176 88" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${30 + i * 44} 66 A ${16 + i * 4} ${16 + i * 4} 0 0 1 ${62 + i * 44} 66`}
          fill="none"
          stroke="var(--art-faint)"
          strokeWidth="1.6"
        />
      ))}
      <ellipse cx="38" cy="70" rx="7" ry="4" fill="var(--art-ink)" transform="rotate(-14 38 70)" />
      <ellipse cx="82" cy="72" rx="7" ry="4" fill="var(--art-ink)" transform="rotate(10 82 72)" />
      <ellipse cx="126" cy="70" rx="7" ry="4" fill="var(--accent)" transform="rotate(-8 126 70)" />
    </svg>
  );
}
