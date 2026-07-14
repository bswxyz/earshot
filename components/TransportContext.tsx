'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { episodes, type Episode } from '@/lib/data';

/**
 * One transport for the whole page: the hero deck plays whatever the
 * timeline cues up. `cueCount` increments on every cue so the player can
 * distinguish "a cue happened" from "same episode, initial render".
 */
type Transport = {
  ep: Episode;
  cueCount: number;
  cue: (ep: Episode) => void;
};

const Ctx = createContext<Transport | null>(null);

export function TransportProvider({ children }: { children: React.ReactNode }) {
  const [ep, setEp] = useState<Episode>(episodes[0]);
  const [cueCount, setCueCount] = useState(0);

  const cue = useCallback((next: Episode) => {
    setEp(next);
    setCueCount((c) => c + 1);
  }, []);

  const value = useMemo(() => ({ ep, cueCount, cue }), [ep, cueCount, cue]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTransport(): Transport {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTransport must be used inside TransportProvider');
  return ctx;
}
