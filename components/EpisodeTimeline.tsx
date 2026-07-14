'use client';

import { useMemo } from 'react';
import { buildPeaks, episodes, fmtTime, r2, type Episode } from '@/lib/data';
import { useTransport } from '@/components/TransportContext';
import Reveal from '@/components/Reveal';

/** A tiny static waveform — the episode's actual peaks, downsampled. */
function MiniWave({ seed, tint }: { seed: number; tint: 'coral' | 'teal' }) {
  const bars = useMemo(() => {
    const raw = buildPeaks(seed, 132);
    const out: number[] = [];
    for (let i = 0; i < 44; i++) out.push(r2((raw[i * 3] + raw[i * 3 + 1] + raw[i * 3 + 2]) / 3));
    return out;
  }, [seed]);
  return (
    <svg
      className={`mini-wave tint-${tint}`}
      viewBox="0 0 176 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {bars.map((a, i) => {
        const h = r2(Math.max(2, a * 30));
        return <rect key={i} x={i * 4} y={r2((36 - h) / 2)} width={2.6} height={h} rx={1} />;
      })}
    </svg>
  );
}

function TimelineItem({ ep, index }: { ep: Episode; index: number }) {
  const { cue } = useTransport();
  return (
    <Reveal as="li" className="tl-item" delay={index * 70}>
      <div className="tl-date mono">
        <span>{ep.date}</span>
      </div>
      <div className="tl-node" aria-hidden="true" />
      <article className="tl-card">
        <header className="tl-top">
          <span className={`tl-show mono tint-${ep.tint}`}>
            {ep.show} · #{ep.num}
          </span>
          <span className="tl-dur mono">{fmtTime(ep.dur)}</span>
        </header>
        <h3 className="tl-title">{ep.title}</h3>
        <p className="tl-blurb">{ep.blurb}</p>
        <footer className="tl-foot">
          <MiniWave seed={ep.seed} tint={ep.tint} />
          <button type="button" className="cue-btn mono" onClick={() => cue(ep)}>
            Cue it up
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 3.2v9.6a.7.7 0 0 0 1.07.6l7.6-4.8a.7.7 0 0 0 0-1.2l-7.6-4.8A.7.7 0 0 0 4 3.2Z" />
            </svg>
            <span className="visually-hidden"> — load {ep.title} into the player</span>
          </button>
        </footer>
      </article>
    </Reveal>
  );
}

/** Latest episodes as a broadcast log: rail, dates, and cue buttons that feed the hero deck. */
export default function EpisodeTimeline() {
  return (
    <ol className="timeline" aria-label="Latest episodes">
      {episodes.map((ep, i) => (
        <TimelineItem key={ep.id} ep={ep} index={i} />
      ))}
    </ol>
  );
}
