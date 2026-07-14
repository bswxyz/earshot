import { buildPeaks, r2 } from '@/lib/data';

/**
 * Host "portraits": nobody at Earshot gets a headshot — every host is
 * rendered as their voiceprint. Deterministic per host, tinted per show.
 */
export default function Voiceprint({ seed, tint }: { seed: number; tint: 'coral' | 'teal' }) {
  const raw = buildPeaks(seed, 96);
  const bars: number[] = [];
  for (let i = 0; i < 32; i++) bars.push(r2((raw[i * 3] + raw[i * 3 + 1] + raw[i * 3 + 2]) / 3));
  return (
    <svg
      className={`voiceprint tint-${tint}`}
      viewBox="0 0 128 128"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="64" cy="64" r="58" fill="none" stroke="var(--line-strong)" strokeWidth="1.6" />
      <circle cx="64" cy="64" r="47" fill="none" stroke="var(--line-soft)" strokeWidth="1" />
      {bars.map((a, i) => {
        const h = r2(Math.max(3, a * 52));
        return (
          <rect
            key={i}
            x={r2(22 + i * 2.7)}
            y={r2(64 - h / 2)}
            width={1.8}
            height={h}
            rx={0.9}
          />
        );
      })}
    </svg>
  );
}
