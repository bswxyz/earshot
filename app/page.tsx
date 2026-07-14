import Link from 'next/link';
import { shows, hosts } from '@/lib/data';
import { TransportProvider } from '@/components/TransportContext';
import WaveformPlayer from '@/components/WaveformPlayer';
import EpisodeTimeline from '@/components/EpisodeTimeline';
import ThemeToggle from '@/components/ThemeToggle';
import Reveal from '@/components/Reveal';
import Facts from '@/components/Facts';
import ShowArt from '@/components/ShowArt';
import Voiceprint from '@/components/Voiceprint';
import SubscribeForm from '@/components/SubscribeForm';

function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <circle cx="8" cy="14" r="2.8" fill="currentColor" />
      <path
        d="M13.5 8.5 a7.5 7.5 0 0 1 0 11 M18 5 a13 13 0 0 1 0 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SectionHead({
  kicker,
  title,
  lede,
  fire = false,
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  fire?: boolean;
}) {
  return (
    <div className="sec-head">
      <Reveal as="p" className={`kicker mono${fire ? ' kicker--hot' : ''}`}>
        {kicker}
      </Reveal>
      <Reveal as="h2">{title}</Reveal>
      {lede && (
        <Reveal as="p" className="lede">
          {lede}
        </Reveal>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Earshot home">
          <Mark />
          <span className="brand-word">Earshot</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#shows">The shows</a>
          <a href="#episodes">Episodes</a>
          <a href="#hosts">The hosts</a>
          <a className="nav-cta" href="#plus">
            Earshot+
          </a>
          <Link className="nav-guide" href="/guide/">
            Guide
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main id="main">
        <TransportProvider>
          {/* ============ hero — the waveform deck ============ */}
          <section className="hero" id="top" aria-labelledby="hero-title">
            <div className="wrap">
              <p className="eyebrow mono">[ Independent since 2019 · six shows · listener-funded ]</p>
              <h1 id="hero-title" className="hero-title">
                <span className="line">
                  <span>Made for</span>
                </span>
                <span className="line">
                  <span>
                    the <em>good</em>
                  </span>
                </span>
                <span className="line">
                  <span>headphones.</span>
                </span>
              </h1>
              <div className="hero-fade">
                <p className="hero-sub">
                  Earshot is an independent podcast network — six shows about sound, music and the
                  people who make them, produced slowly, mixed properly, and released when
                  they&rsquo;re ready. No algorithm in the signal chain.
                </p>
                <div className="hero-actions">
                  <a className="btn btn-solid" href="#shows">
                    Browse the shows
                  </a>
                  <a className="btn btn-ghost" href="#episodes">
                    Latest episodes →
                  </a>
                </div>
                <Facts />
              </div>
            </div>
            <div className="wrap hero-deck hero-fade">
              <WaveformPlayer />
              <p className="deck-note mono">
                Drag the wave to scrub — space toggles play while it&rsquo;s focused. The transport
                is simulated: this demo ships no audio files.
              </p>
            </div>
          </section>

          {/* ============ the shows ============ */}
          <section id="shows" className="shows">
            <div className="wrap">
              <SectionHead
                kicker="[ The shows ]"
                title="Six shows. One rule: it has to sound like somewhere."
                lede={
                  <>
                    Every show on the network is made by the person whose name is on it — no content
                    calendar, no house style. If an episode isn&rsquo;t ready, the feed waits.
                  </>
                }
              />
              <div className="show-grid">
                {shows.map((s, i) => (
                  <Reveal as="article" className="show" key={s.id} delay={(i % 3) * 80}>
                    <div className={`show-art tint-${s.tint}`}>
                      <ShowArt id={s.id} seed={s.seed} />
                    </div>
                    <div className="show-info">
                      <h3>{s.name}</h3>
                      <p className="show-host mono">w/ {s.host}</p>
                      <p className="show-tag">{s.tag}</p>
                      <p className="show-meta mono">
                        <span>{s.cadence}</span>
                        <span>{s.eps} eps</span>
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ============ latest episodes — the broadcast log ============ */}
          <section id="episodes" className="episodes">
            <span className="wm" aria-hidden="true">
              ON AIR
            </span>
            <div className="wrap">
              <SectionHead
                kicker="[ Latest episodes ]"
                title="The broadcast log."
                lede={
                  <>
                    Fresh from the mix bus. Hit <strong>cue it up</strong> on anything below and the
                    deck at the top of the page will load it, wave and all.
                  </>
                }
              />
              <EpisodeTimeline />
            </div>
          </section>

          {/* ============ the hosts ============ */}
          <section id="hosts" className="hosts">
            <div className="wrap">
              <SectionHead
                kicker="[ The hosts ]"
                title="No headshots. Voiceprints."
                lede={
                  <>
                    You&rsquo;ll never see their faces on this site — you&rsquo;re here for their
                    ears. Each portrait below is the host&rsquo;s waveform, nothing else.
                  </>
                }
              />
              <div className="host-grid">
                {hosts.map((h, i) => (
                  <Reveal as="article" className="host" key={h.name} delay={(i % 3) * 80}>
                    <Voiceprint seed={h.seed} tint={h.tint} />
                    <h3>{h.name}</h3>
                    <p className={`host-show mono tint-${h.tint}`}>{h.show}</p>
                    <p className="host-line">{h.line}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ============ subscribe / premium ============ */}
          <section id="plus" className="plus">
            <div className="wrap">
              <SectionHead
                fire
                kicker="[ Subscribe ]"
                title="Free to hear. Cheap to love."
                lede={
                  <>
                    Every episode is free, forever, in any app — that&rsquo;s non-negotiable.
                    Earshot+ exists for people who want the network to still be here in ten years.
                  </>
                }
              />
              <div className="tiers">
                <Reveal as="article" className="tier">
                  <p className="tier-name">The Open Feed</p>
                  <p className="tier-price mono">
                    $0<small> · forever</small>
                  </p>
                  <ul>
                    <li>Every show, every episode</li>
                    <li>Any app — the RSS never breaks</li>
                    <li>Full archives, no paywall creep</li>
                    <li>Chapters &amp; transcripts included</li>
                  </ul>
                  <a className="btn btn-ghost btn-block" href="#episodes">
                    Just start listening
                  </a>
                </Reveal>
                <Reveal as="article" className="tier tier--hot" delay={90}>
                  <p className="tier-flag mono">most loved</p>
                  <p className="tier-name">Earshot+</p>
                  <p className="tier-price mono">
                    $6<small> / month</small>
                  </p>
                  <ul>
                    <li>Everything, ad-free</li>
                    <li>The off-cuts — a bonus feed per show</li>
                    <li>Hi-fi 320kbps masters</li>
                    <li>Episodes a week early</li>
                    <li>Member AMAs with the hosts</li>
                  </ul>
                  <a className="btn btn-solid btn-block" href="#plus">
                    Join Earshot+
                  </a>
                </Reveal>
                <Reveal as="article" className="tier" delay={180}>
                  <p className="tier-name">The Studio Tier</p>
                  <p className="tier-price mono">
                    $120<small> / year</small>
                  </p>
                  <ul>
                    <li>Everything in Earshot+</li>
                    <li>Annual live-session invite</li>
                    <li>Your name in the credits — read once, properly</li>
                    <li>A vote on the next pilot</li>
                  </ul>
                  <a className="btn btn-ghost btn-block" href="#plus">
                    Back the studio
                  </a>
                </Reveal>
              </div>
              <Reveal className="cue-wrap">
                <SubscribeForm />
              </Reveal>
            </div>
          </section>
        </TransportProvider>
      </main>

      {/* ============ footer ============ */}
      <footer className="footer">
        <div className="wrap foot-top">
          <div className="foot-brand">
            <a href="#top" className="brand" aria-label="Back to top">
              <Mark size={20} />
              <span className="brand-word">Earshot</span>
            </a>
            <p>
              An independent podcast network. Six shows about sound, made slowly, funded by the
              people who listen to them.
            </p>
          </div>
          <nav className="foot-links" aria-label="Footer">
            <a href="#shows">The shows</a>
            <a href="#episodes">Episodes</a>
            <a href="#hosts">The hosts</a>
            <a href="#plus">Earshot+</a>
            <Link href="/guide/">How this was built</Link>
          </nav>
          <p className="foot-listen mono">
            Listen anywhere · <span>RSS</span> · <span>Apple Podcasts</span> · <span>Spotify</span>{' '}
            · <span>Overcast</span> · <span>Pocket Casts</span>
          </p>
        </div>
        <div className="wrap foot-bottom mono">
          <span>
            © 2026 Earshot — a design-showcase concept, not a real network. Shows, hosts and
            numbers are fiction.
          </span>
          <span>
            Designed &amp; built by Parable · <Link href="/guide/">How this was built →</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
