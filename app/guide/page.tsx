import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How Earshot was built — the guide',
  description:
    'Build notes for Earshot: a Next.js static-export podcast network concept with a seekable canvas waveform scrubber, a simulated transport, and an opt-in WebAudio cue tone.',
};

export default function Guide() {
  return (
    <main id="main" className="guide-wrap">
      <div className="guide-top">
        <Link href="/">← Earshot</Link>
        <span>The guide · how it was built</span>
      </div>

      <span className="guide-ey">Design showcase · build notes</span>
      <h1>
        A player with <em>no audio.</em>
      </h1>
      <p className="guide-sub">
        Earshot is a podcast-network concept built as a Next.js static export. The whole identity
        hangs on one object — a seekable waveform deck that behaves like a real player without
        shipping a single audio file. These are the notes on how it works.
      </p>

      <h2>The idea</h2>
      <p>
        A podcast network sells something you can&rsquo;t see, so most podcast sites fall back on
        cover-art grids and app-store badges. Earshot&rsquo;s bet is the opposite:{' '}
        <strong>draw the sound.</strong> The hero is a waveform you can grab. The episode list is a
        broadcast log that feeds it. Even the hosts are rendered as their voiceprints instead of
        headshots — you&rsquo;re here for their ears, not their faces.
      </p>
      <p>
        The visual language follows the audio-nerd voice: paper and studio-ink flipped between
        themes, broadcast-coral for the hot side of the signal, teal for the monitoring side,
        Archivo set heavy like a flight-case stencil, and Space Mono for anything that behaves
        like a meter — timestamps, chapter labels, cadence tags.
      </p>

      <h2>The stack</h2>
      <ul>
        <li>
          <strong>
            Next.js 14 (App Router) with <code>output: &lsquo;export&rsquo;</code>.
          </strong>{' '}
          GitHub Pages serves static files only, so the build emits plain HTML into{' '}
          <code>out/</code>. React earns its keep here: the timeline and the deck share one
          transport context, so &ldquo;cue it up&rdquo; anywhere loads the player everywhere.
        </li>
        <li>
          <strong>The Pages recipe:</strong> <code>basePath: &lsquo;/earshot&rsquo;</code> +{' '}
          <code>assetPrefix</code> + <code>trailingSlash: true</code> in{' '}
          <code>next.config.mjs</code>, copy <code>out/</code> to <code>docs/</code>, point Pages
          at it, and drop a <code>.nojekyll</code> so Jekyll leaves <code>_next/</code> alone.
        </li>
        <li>
          <strong>Zero media files.</strong> Every visual is canvas, inline SVG or CSS. The
          waveform is procedural; the show art and voiceprints are deterministic SVG seeded per
          show and host.
        </li>
        <li>
          <strong>Archivo / Inter / Space Mono</strong> from Google Fonts with preconnect — display
          set at 800–900, meters in mono, everything else in Inter.
        </li>
      </ul>

      <h2>Signature technique — the waveform deck</h2>
      <p>
        There is no MP3. The waveform is a procedural model of spoken word: phrase-level energy
        shifts, a syllable-rate ripple, and occasional near-silent breaths, all driven by a seeded
        PRNG so each episode always renders the same &ldquo;recording&rdquo; — on the server, on
        the client, and in the tiny SVG thumbnails on the timeline:
      </p>
      <pre>
        <code>{`// lib/data.ts — deterministic "spoken word" peaks
export function buildPeaks(seed: number, n = 720): number[] {
  const rnd = mulberry32(seed);
  const peaks: number[] = [];
  let energy = 0.55 + rnd() * 0.25;
  let pause = 0;
  for (let i = 0; i < n; i++) {
    if (pause > 0) { pause--; peaks.push(0.05 + rnd() * 0.05); continue; }
    if (rnd() < 0.014) pause = 3 + Math.floor(rnd() * 12); // breaths
    if (rnd() < 0.06) energy = 0.35 + rnd() * 0.6;         // new phrase
    const syllable = 0.55 + 0.45 * Math.sin(i * 0.9 + rnd() * 2);
    peaks.push(Math.max(0.06, Math.min(1, energy * syllable * (0.72 + rnd() * 0.28))));
  }
  return peaks;
}`}</code>
      </pre>
      <p>
        The canvas draws mirrored bars — played side in coral, the rest in a theme-aware grey —
        plus chapter ticks and a playhead with a grab handle. Seeking is one projection: pointer
        x → fraction of width → seconds. The same element is a real{' '}
        <code>role=&quot;slider&quot;</code>, so arrow keys, Home/End and PageUp/Down scrub too,
        and <code>aria-valuetext</code> reads &ldquo;12:34 of 41:07&rdquo; to screen readers:
      </p>
      <pre>
        <code>{`// components/WaveformPlayer.tsx — the whole seek model
const seekFromPointer = (clientX: number) => {
  const rect = canvas.getBoundingClientRect();
  const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
  seekTo(frac * durRef.current);
};

// the simulated transport: real time in, playhead out (~30fps draw)
const loop = (now: number) => {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(100, now - last); last = now;
  if (playingRef.current) {
    elapsedRef.current = Math.min(dur, elapsedRef.current + dt / 1000);
    acc += dt;
    if (acc >= 33 && visibleRef.current) { acc = 0; draw(now / 1000); }
  }
};`}</code>
      </pre>
      <p>
        Play/pause drives that loop like a tape machine — a 41-minute episode really takes 41
        minutes, which is exactly why the wave is so satisfying to grab instead. An opt-in
        &ldquo;cue tone&rdquo; goes one step further: a single WebAudio sine oscillator whose gain
        and pitch follow the peak under the playhead, so you can <em>hear</em> the waveform&rsquo;s
        shape without any audio asset. It only exists after a click, and it dies with the pause
        button.
      </p>

      <h2>Details that matter</h2>
      <ul>
        <li>
          <strong>Honest reduced motion.</strong> With{' '}
          <code>prefers-reduced-motion: reduce</code> there is no rAF loop at all: the wave renders
          as one static frame, the play button yields to a plain instruction, and scrubbing —
          pointer or keyboard — still works. Motion is the garnish, not the interface.
        </li>
        <li>
          <strong>Progressive enhancement.</strong> A synchronous script adds <code>.js</code> to{' '}
          <code>&lt;html&gt;</code>; hero clip-lines and reveals only hide under that class. Before
          hydration (or without JS) the deck shows a static SVG wave, so the page never renders a
          hole where the flourish should be.
        </li>
        <li>
          <strong>One transport, whole page.</strong> The timeline&rsquo;s &ldquo;cue it up&rdquo;
          buttons and the hero deck share a context. Cueing scrolls the deck into view (instantly
          under reduced motion), loads that episode&rsquo;s seed, chapters and duration, and starts
          the playhead.
        </li>
        <li>
          <strong>Theme-aware canvas.</strong> The deck reads its colors from the same CSS custom
          properties as everything else, and a <code>MutationObserver</code> on{' '}
          <code>data-theme</code> repaints the frame the moment you flip the toggle — the stored
          key is <code>earshot-theme</code>, applied inline in <code>&lt;head&gt;</code> before
          first paint.
        </li>
        <li>
          <strong>Performance manners.</strong> DPR is capped at 1.5, the draw is throttled to
          ~30fps, and an <code>IntersectionObserver</code> skips painting while the deck is
          off-screen.
        </li>
      </ul>

      <h2>Ship it on GitHub Pages</h2>
      <p>Once the export is configured, the deploy is four commands:</p>
      <pre>
        <code>{`npm run build                 # next build → out/ (static export)
rm -rf docs && cp -r out docs # Pages serves /docs on main
touch docs/.nojekyll          # keep _next/ out of Jekyll's mouth
gh api --method POST /repos/bswxyz/earshot/pages \\
  -f 'source[branch]=main' -f 'source[path]=/docs'`}</code>
      </pre>
      <p>
        With <code>trailingSlash: true</code> this page exports as <code>/guide/index.html</code>,
        so the URL resolves with no server-side routing. Local dev is <code>npm run dev</code> —
        note the <code>basePath</code> means the site serves at{' '}
        <code>localhost:3000/earshot</code>.
      </p>

      <p style={{ marginTop: '3rem' }}>
        <Link href="/" className="guide-back mono">
          ← Back to Earshot
        </Link>
      </p>
    </main>
  );
}
