import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bswxyz.github.io/earshot/'),
  title: 'Earshot — an independent podcast network',
  description:
    'Earshot is an independent podcast network: six shows about sound, music and the people who make them — produced slowly, mixed properly, listener-funded. Scrub the featured episode right on the page.',
  applicationName: 'Earshot',
  authors: [{ name: 'Parable' }],
  keywords: [
    'podcast network',
    'independent podcasts',
    'audio',
    'radio',
    'waveform',
    'listener-supported',
  ],
  openGraph: {
    title: 'Earshot — an independent podcast network',
    description:
      'Six shows about sound, music and the people who make them. Produced slowly, mixed properly, released when they’re ready.',
    type: 'website',
    url: 'https://bswxyz.github.io/earshot/',
  },
};

export const viewport: Viewport = {
  themeColor: '#f3f0e9',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* progressive enhancement + theme, before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{var t=localStorage.getItem('earshot-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}m.setAttribute('content',t==='dark'?'#141416':'#f3f0e9');}}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {/* layered fixed background: a warm wash + ruled "tape log" hairlines */}
        <div className="bg-layer bg-wash" aria-hidden="true" />
        <div className="bg-layer bg-rule" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
