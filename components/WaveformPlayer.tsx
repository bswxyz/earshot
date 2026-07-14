'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildPeaks, fmtTime, r2 } from '@/lib/data';
import { useReducedMotion } from '@/lib/hooks';
import { useTransport } from '@/components/TransportContext';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Colors = { hot: string; rest: string; tick: string; head: string; bg: string };

/**
 * The signature flourish: a seekable waveform scrubber on canvas.
 * Procedural peaks stand in for a real audio file; a simulated transport
 * moves the playhead in real time; click/drag/arrow-keys seek; an opt-in
 * WebAudio "cue tone" hums along with the waveform's energy.
 *
 * Reduced motion: no rAF loop, no auto-advancing playhead — the wave
 * renders as one static frame and scrubbing still works.
 */
export default function WaveformPlayer() {
  const { ep, cueCount, cue } = useTransport();
  const reduced = useReducedMotion();

  const deckRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [playing, setPlaying] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [monitor, setMonitor] = useState(false);
  const [mounted, setMounted] = useState(false);

  const playingRef = useRef(false);
  const monitorRef = useRef(false);
  const elapsedRef = useRef(0);
  const durRef = useRef(ep.dur);
  const peaksRef = useRef<number[]>([]);
  const visibleRef = useRef(true);
  const draggingRef = useRef(false);
  const colorsRef = useRef<Colors>({
    hot: '#ff5a52',
    rest: '#b9b4a8',
    tick: '#8a857b',
    head: '#141416',
    bg: '#f3f0e9',
  });
  const epRef = useRef(ep);
  epRef.current = ep;

  /* ---------- colors from the live theme tokens ---------- */
  const cacheColors = useCallback(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (name: string, fall: string) => cs.getPropertyValue(name).trim() || fall;
    colorsRef.current = {
      hot: read('--wave-hot', '#ff5a52'),
      rest: read('--wave-rest', '#b9b4a8'),
      tick: read('--wave-tick', '#8a857b'),
      head: read('--ink', '#141416'),
      bg: read('--bg', '#f3f0e9'),
    };
  }, []);

  /* ---------- the canvas ---------- */
  const draw = useCallback(
    (tSec = 0) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const c = colorsRef.current;
      const peaks = peaksRef.current;
      const dur = durRef.current;
      const progress = dur > 0 ? elapsedRef.current / dur : 0;
      const playedX = progress * w;

      const barW = 3;
      const gap = 2;
      const count = Math.max(24, Math.floor(w / (barW + gap)));
      const mid = h * 0.56;
      const up = h * 0.42;
      const down = h * 0.32;
      const headBar = playedX / (barW + gap);

      for (let i = 0; i < count; i++) {
        // average the peak window this bar covers
        const a0 = Math.floor((i / count) * peaks.length);
        const a1 = Math.max(a0 + 1, Math.floor(((i + 1) / count) * peaks.length));
        let amp = 0;
        for (let j = a0; j < a1; j++) amp += peaks[j];
        amp /= a1 - a0;

        // while playing, bars near the playhead shimmer slightly
        if (playingRef.current && tSec > 0) {
          const d = i - headBar;
          amp *= 1 + 0.16 * Math.exp((-d * d) / 42) * Math.sin(tSec * 7 + i * 0.8);
        }

        const x = i * (barW + gap);
        const hUp = Math.max(1.5, amp * up);
        const hDn = Math.max(1, amp * down);
        ctx.fillStyle = x + barW <= playedX ? c.hot : c.rest;
        ctx.fillRect(x, mid - hUp, barW, hUp + hDn);
      }

      // chapter ticks along the top edge
      ctx.fillStyle = c.tick;
      for (const ch of epRef.current.chapters) {
        const x = Math.round(ch.at * w);
        ctx.fillRect(x, 0, 1.5, 7);
      }

      // playhead: hairline + a small grab handle on the midline
      ctx.fillStyle = c.hot;
      ctx.fillRect(playedX - 0.75, 0, 1.5, h);
      ctx.beginPath();
      ctx.arc(playedX, mid, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = c.bg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = c.hot;
      ctx.stroke();
    },
    [],
  );
  const drawRef = useRef(draw);
  drawRef.current = draw;

  /* ---------- opt-in cue tone (WebAudio) ---------- */
  const audioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  const audioMute = useCallback(() => {
    const a = audioRef.current;
    if (a) a.gain.gain.setTargetAtTime(0.00001, a.ctx.currentTime, 0.05);
  }, []);
  const audioTick = useCallback(() => {
    const a = audioRef.current;
    if (!a || !monitorRef.current || !playingRef.current) return;
    const peaks = peaksRef.current;
    const i = Math.floor((elapsedRef.current / durRef.current) * (peaks.length - 1));
    const p = peaks[i] ?? 0.1;
    const t = a.ctx.currentTime;
    a.gain.gain.setTargetAtTime(0.026 * p, t, 0.06);
    a.osc.frequency.setTargetAtTime(72 + p * 150, t, 0.09);
  }, []);
  const toggleMonitor = () => {
    const next = !monitor;
    if (next && !audioRef.current) {
      try {
        const AC: typeof AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const actx = new AC();
        const osc = actx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 88;
        const gain = actx.createGain();
        gain.gain.value = 0;
        osc.connect(gain).connect(actx.destination);
        osc.start();
        audioRef.current = { ctx: actx, osc, gain };
      } catch {
        return; // no WebAudio — the toggle simply doesn't engage
      }
    }
    setMonitor(next);
    monitorRef.current = next;
    if (!next) audioMute();
    else audioRef.current?.ctx.resume().catch(() => {});
  };
  useEffect(
    () => () => {
      const a = audioRef.current;
      if (a) {
        try {
          a.osc.stop();
          void a.ctx.close();
        } catch {}
      }
    },
    [],
  );

  /* ---------- episode load / cue ---------- */
  useEffect(() => {
    peaksRef.current = buildPeaks(ep.seed);
    durRef.current = ep.dur;
    elapsedRef.current = 0;
    setElapsedSec(0);
    drawRef.current(0);
  }, [ep.id, ep.seed, ep.dur]);

  useEffect(() => {
    if (cueCount === 0) return;
    elapsedRef.current = 0;
    setElapsedSec(0);
    if (!reduced) {
      playingRef.current = true;
      setPlaying(true);
    }
    drawRef.current(0);
    const deck = deckRef.current;
    deck?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    // confirmation flash (a no-op under reduced motion — the CSS kills it)
    deck?.classList.remove('cued');
    // force a reflow so re-cueing the same episode restarts the flash
    void deck?.offsetWidth;
    deck?.classList.add('cued');
    const t = window.setTimeout(() => deck?.classList.remove('cued'), 950);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cueCount]);

  /* ---------- mount: colors, observers, first frame ---------- */
  useEffect(() => {
    setMounted(true);
    cacheColors();
    drawRef.current(0);

    const mo = new MutationObserver(() => {
      cacheColors();
      drawRef.current(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const ro = new ResizeObserver(() => drawRef.current(0));
    if (canvasRef.current) ro.observe(canvasRef.current);

    let io: IntersectionObserver | undefined;
    if (deckRef.current) {
      io = new IntersectionObserver(([e]) => {
        visibleRef.current = e.isIntersecting;
      });
      io.observe(deckRef.current);
    }
    return () => {
      mo.disconnect();
      ro.disconnect();
      io?.disconnect();
    };
  }, [cacheColors]);

  /* ---------- the transport loop (~30fps, runs only while playing; skipped entirely under reduced motion) ---------- */
  useEffect(() => {
    if (reduced) {
      playingRef.current = false;
      setPlaying(false);
      audioMute();
      drawRef.current(0);
      return;
    }
    if (!playing) return; // no rAF while paused — the loop starts on play and is cancelled below
    let raf = 0;
    let last = performance.now();
    let acc = 99;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(100, now - last);
      last = now;
      if (playingRef.current) {
        elapsedRef.current = Math.min(durRef.current, elapsedRef.current + dt / 1000);
        if (elapsedRef.current >= durRef.current) {
          playingRef.current = false;
          setPlaying(false);
          audioMute();
          drawRef.current(0); // land the final frame exactly at the end
          setElapsedSec(Math.floor(elapsedRef.current));
        }
        audioTick();
        acc += dt;
        if (acc >= 33 && visibleRef.current) {
          acc = 0;
          drawRef.current(now / 1000);
          setElapsedSec(Math.floor(elapsedRef.current));
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, playing, audioMute, audioTick]);

  /* ---------- seeking ---------- */
  const seekTo = useCallback((sec: number) => {
    elapsedRef.current = clamp(sec, 0, durRef.current);
    setElapsedSec(Math.floor(elapsedRef.current));
    drawRef.current(0);
  }, []);

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
      seekTo(frac * durRef.current);
    },
    [seekTo],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* pointer already gone (NotFoundError) — the click-seek below still lands */
    }
    seekFromPointer(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) seekFromPointer(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 30 : 5;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = elapsedRef.current + step;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = elapsedRef.current - step;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = durRef.current;
    else if (e.key === 'PageUp') next = elapsedRef.current + 60;
    else if (e.key === 'PageDown') next = elapsedRef.current - 60;
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!reduced) togglePlay();
      return;
    }
    if (next !== null) {
      e.preventDefault();
      seekTo(next);
    }
  };

  const togglePlay = () => {
    if (elapsedRef.current >= durRef.current) {
      elapsedRef.current = 0;
      setElapsedSec(0);
    }
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    if (!next) audioMute();
  };

  /* ---------- derived readout ---------- */
  const chapterIdx = useMemo(() => {
    let idx = 0;
    ep.chapters.forEach((ch, i) => {
      if (ch.at * ep.dur <= elapsedSec + 0.5) idx = i;
    });
    return idx;
  }, [ep, elapsedSec]);

  /* no-JS / pre-hydration fallback wave (hidden once the canvas paints) */
  const fallbackBars = useMemo(() => {
    const raw = buildPeaks(ep.seed, 216);
    const bars: number[] = [];
    for (let i = 0; i < 72; i++) {
      bars.push(r2((raw[i * 3] + raw[i * 3 + 1] + raw[i * 3 + 2]) / 3));
    }
    return bars;
  }, [ep.seed]);

  return (
    <div className="deck" ref={deckRef} id="player">
      <div className="deck-head">
        <div className="deck-now">
          <span className={`deck-lamp${playing ? ' on' : ''}`} aria-hidden="true" />
          <span className="deck-status mono">{playing ? 'ON AIR' : 'CUED'}</span>
          <span className={`deck-show mono tint-${ep.tint}`}>
            {ep.show} · #{ep.num}
          </span>
        </div>
        <h3 className="deck-title">{ep.title}</h3>
      </div>

      <div
        className="wf-stage"
        role="slider"
        tabIndex={0}
        aria-label={`Seek within ${ep.title}`}
        aria-valuemin={0}
        aria-valuemax={ep.dur}
        aria-valuenow={elapsedSec}
        aria-valuetext={`${fmtTime(elapsedSec)} of ${fmtTime(ep.dur)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <svg
          className={`wf-fallback${mounted ? ' is-hidden' : ''}`}
          viewBox="0 0 720 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {fallbackBars.map((a, i) => {
            const hUp = r2(Math.max(2, a * 50));
            const hDn = r2(Math.max(1.5, a * 38));
            return (
              <rect key={i} x={i * 10} y={r2(67 - hUp)} width={6} height={r2(hUp + hDn)} fill="currentColor" />
            );
          })}
        </svg>
        <canvas ref={canvasRef} className="wf-canvas" aria-hidden="true" />
      </div>

      <div className="deck-transport">
        {reduced ? (
          <p className="wf-hint mono">
            Motion is off — the playhead won&rsquo;t auto-advance. Drag the wave or use arrow keys
            to scrub.
          </p>
        ) : (
          <div className="deck-btns">
            <button
              type="button"
              className="play-btn"
              onClick={togglePlay}
              aria-pressed={playing}
              aria-label={playing ? `Pause ${ep.title}` : `Play ${ep.title}`}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="5" width="4.5" height="14" rx="1" />
                  <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5.5v13a1 1 0 0 0 1.52.86l10.2-6.5a1 1 0 0 0 0-1.7L9.52 4.63A1 1 0 0 0 8 5.5Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className={`monitor-btn mono${monitor ? ' on' : ''}`}
              onClick={toggleMonitor}
              aria-pressed={monitor}
              title="A quiet sine tone follows the waveform while playing — this demo ships no audio files"
            >
              cue tone: {monitor ? 'on' : 'off'}
            </button>
          </div>
        )}
        <div className="deck-clock mono" aria-live="off">
          <span className="deck-elapsed">{fmtTime(elapsedSec)}</span>
          <span className="deck-chapter">
            CH {String(chapterIdx + 1).padStart(2, '0')} — {ep.chapters[chapterIdx].label}
          </span>
          <span className="deck-dur">{fmtTime(ep.dur)}</span>
        </div>
      </div>

      <ol className="deck-chapters" aria-label="Chapters">
        {ep.chapters.map((ch, i) => (
          <li key={i}>
            <button
              type="button"
              className={`chip mono${i === chapterIdx ? ' now' : ''}`}
              onClick={() => seekTo(ch.at * ep.dur)}
            >
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span> {ch.label}
              <span className="visually-hidden"> — jump to {fmtTime(ch.at * ep.dur)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
