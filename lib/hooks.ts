'use client';

import { useEffect, useRef, useState } from 'react';

/** True when the visitor prefers reduced motion. SSR-safe (false on server). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** IntersectionObserver — returns [ref, inView]. Fires once by default. */
export function useInView<T extends Element>(
  options: IntersectionObserverInit = { threshold: 0.2 },
  once = true,
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) io.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once]);
  return [ref, inView];
}

/** Earshot's signature "tape" ease as a JS curve (matches --ease-tape). */
export const tape = (t: number) => 1 - Math.pow(1 - t, 3.6);

/**
 * Count-up for the hero facts: renders the final value on the server
 * (SEO / no-JS), then counts 0 → value once scrolled into view.
 */
export function useCountUp(target: number, run: boolean, duration = 1300): number {
  const [value, setValue] = useState(target);
  const reduced = useReducedMotion();
  const started = useRef(false);
  useEffect(() => {
    if (!run || started.current) return;
    started.current = true;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let done = false;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = tape(Math.min(1, (now - t0) / duration));
      setValue(target * k);
      if (k < 1) raf = requestAnimationFrame(step);
      else done = true;
    };
    raf = requestAnimationFrame(step);
    // if rAF is throttled (hidden tab), snap to the real number
    const snap = window.setTimeout(() => {
      if (!done) {
        cancelAnimationFrame(raf);
        setValue(target);
      }
    }, duration + 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snap);
    };
  }, [run, target, duration, reduced]);
  return value;
}
