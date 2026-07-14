'use client';

import React from 'react';
import { useInView } from '@/lib/hooks';

/**
 * Scroll-in reveal. Children arrive in the server HTML; the observer adds
 * `.in` on entry. The hidden initial state only exists under `html.js`,
 * and prefers-reduced-motion disables the whole thing in CSS.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
  const El = Tag as any;
  return (
    <El
      ref={ref}
      className={`reveal ${inView ? 'in' : ''} ${className}`.trim()}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </El>
  );
}
