'use client';

import { useState } from 'react';

/**
 * Demo newsletter form. Validates, then confirms in place.
 * Nothing is sent anywhere — see the README's demo-vs-real notes.
 */
export default function SubscribeForm() {
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="cue-done" role="status">
        <strong>You&rsquo;re on the sheet.</strong>
        <span className="mono">
          demo only — nothing was sent. the real one arrives thursdays, before the drops.
        </span>
      </div>
    );
  }

  return (
    <form className="cue-form" onSubmit={onSubmit} noValidate>
      <label className="mono" htmlFor="cueEmail">
        The Cue Sheet — our weekly dispatch
      </label>
      <div className="cue-row">
        <input
          id="cueEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <button type="submit" className="btn btn-solid">
          Subscribe
        </button>
      </div>
      <p className="cue-fine mono">One email a week. What dropped, what&rsquo;s next, no filler. Demo form — nothing is sent.</p>
    </form>
  );
}
