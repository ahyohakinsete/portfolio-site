'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useHeader } from './HeaderContext';


const LINKS = [
  { key: 'index', label: 'Index', href: '/' },
  { key: 'thumbnails', label: 'Thumbnails', href: '/thumbnails' },
  { key: 'information', label: 'Information', href: '/information' },
];

const BIO = 'is a Nigerian-American photographer born and raised between two continents. He currently resides and works between Oslo, Norway and the US.';

type Phase = 'idle' | 'arrowHint' | 'arrowOff' | 'counterHint' | 'counterArrows';

export default function SiteHeader() {
  const pathname = usePathname();
  const { projectTitle, counter, leaving, coverColor, navigate } = useHeader();
  const [showNav, setShowNav] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const clearTimers = () => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
  };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // On every page change: stop any running hint and close the menu,
  // so it doesn't stay open on the new page
  useEffect(() => {
    clearTimers();
    setPhase('idle');
  }, [pathname]);

  // Clear timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Arrow hint: show, hide, show, hide
  const arrowEnter = () => {
    clearTimers();
    setPhase('arrowHint');
    later(() => setPhase('arrowOff'), 1000);
    later(() => setPhase('arrowHint'), 2000);
    later(() => setPhase('idle'), 3000);
  };

  // Counter hint on the project page: hint, then arrows, then counter
  const counterEnter = () => {
    clearTimers();
    setPhase('counterHint');
    later(() => setPhase('counterArrows'), 1000);
    later(() => setPhase('idle'), 2000);
  };

  const rightLeave = () => {
    clearTimers();
    setPhase('idle');
  };

  const currentKey =
    pathname === '/' ? 'index'
    : pathname === '/thumbnails' ? 'thumbnails'
    : pathname === '/information' ? 'information'
    : 'project';

  const isInfo = currentKey === 'information';
  const isProject = currentKey === 'project';

  const currentLabel =
    isProject
      ? projectTitle ?? ''
      : LINKS.find(l => l.key === currentKey)?.label ?? '';

  // Information page is dark; everything else is light
  const nameColor = isInfo ? '#fff' : '#333';
  const dashColor = isInfo ? '#fff' : '#666';
  const labelColor = isInfo ? '#fff' : '#999';
  const linkColor = isInfo ? '#fff' : '#333';
  const currentColor = '#999';
  const rightColor = isInfo ? '#fff' : '#999';

  let rightContent: string;
  if (isProject) {
    rightContent =
      phase === 'counterHint' ? 'Use keyboard for navigation'
      : phase === 'counterArrows' ? '←↑→'
      : counter ?? '↑';
  } else {
    rightContent = phase === 'arrowHint' ? 'Use keyboard for navigation' : '↑';
  }

  return (
    <>
      {/* Transition cover; sits under the header */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: coverColor,
        opacity: leaving ? 1 : 0,
        pointerEvents: leaving ? 'auto' : 'none',
        transition: 'opacity 1.5s ease-in-out',
        zIndex: 9000,
      }} />

      <div
        
        style={{
          position: 'fixed',
          top: '2.2rem',
          left: '4rem',
          right: '4rem',
          zIndex: 10000,
          fontSize: '1.4rem',
          fontFamily: 'var(--font-maison), Arial, sans-serif',
          display: 'flex',
          transition: 'opacity 0.2s ease',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
  onMouseEnter={() => setShowNav(true)}
  onMouseLeave={() => setShowNav(false)}
  style={{ whiteSpace: 'nowrap' }}
>
          <span
            onClick={() => navigate('/')}
            style={{ color: nameColor, cursor: 'pointer' }}
          >
            Ayo Akinsete
          </span>
          <span style={{ padding: '0 15px', color: dashColor, letterSpacing: '-0.23em' }}>——</span>
          <span style={{ color: labelColor, minWidth: '20rem', display: 'inline-block', whiteSpace: 'normal' }}>
            {showNav ? (
              <>
                {LINKS.map((link, i) => (
  <span key={link.key}>
    {i > 0 && (i === 2 ? '; ' : ', ')}
    <span
      onClick={() => navigate(link.href)}
      onMouseEnter={() => setHoverKey(link.key)}
      onMouseLeave={() => setHoverKey(null)}
      style={{
        cursor: 'pointer',
        color: link.key === hoverKey ? currentColor : linkColor,
      }}
    >
      {link.label}
    </span>
  </span>
))}
{'.'}
              </>
            ) : isInfo ? (
              BIO
            ) : (
              currentLabel
            )}
          </span>
        </div>

        <div
          onMouseEnter={isProject ? counterEnter : arrowEnter}
          onMouseLeave={rightLeave}
          style={{
            color: rightColor,
            textAlign: 'right',
            minWidth: isProject ? '12rem' : '20rem',
            whiteSpace: 'nowrap',
            cursor: 'default',
            letterSpacing: phase === 'counterArrows' ? '0.35em' : undefined,
          }}
        >
          {rightContent}
        </div>
      </div>
    </>
  );
}