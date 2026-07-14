'use client';

import { useInView, useCountUp } from '@/lib/hooks';

function Fact({
  to,
  label,
  suffix = '',
  run,
}: {
  to: number;
  label: string;
  suffix?: string;
  run: boolean;
}) {
  const v = useCountUp(to, run);
  return (
    <div className="fact">
      <dt className="mono">{label}</dt>
      <dd className="mono">
        {Math.round(v)}
        {suffix}
      </dd>
    </div>
  );
}

/** Hero facts — server-renders the real numbers, counts up on first view. */
export default function Facts() {
  const [ref, inView] = useInView<HTMLDListElement>({ threshold: 0.5 });
  return (
    <dl className="hero-facts" ref={ref} aria-label="Network facts">
      <Fact to={6} label="Shows" run={inView} />
      <Fact to={448} label="Episodes" run={inView} />
      <Fact to={214} suffix="k" label="Listeners / mo" run={inView} />
    </dl>
  );
}
