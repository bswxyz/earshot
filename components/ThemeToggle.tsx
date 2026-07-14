'use client';

import { useEffect, useState } from 'react';

const KEY = 'earshot-theme';

/**
 * Light/dark toggle. The inline <head> script has already applied the
 * saved theme before paint; this component just keeps the button state,
 * localStorage and the theme-color meta in sync.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
  }, []);

  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — theme still flips for the session */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#141416' : '#f3f0e9');
    setDark(next === 'dark');
  };

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title="Toggle light / dark"
    >
      <svg className="ico-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" />
        <g strokeLinecap="round">
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
        </g>
      </svg>
      <svg className="ico-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
