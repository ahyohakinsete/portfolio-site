'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type HeaderCtx = {
  projectTitle: string | null;
  counter: string | null;
  setProject: (title: string | null, counter: string | null) => void;
  leaving: boolean;
  coverColor: string;
  navigate: (href: string) => void;
};

const Ctx = createContext<HeaderCtx | null>(null);

// Information is dark; everything else is light
const colorFor = (path: string) => (path === '/information' ? '#0d0c0b' : '#fff');

export function HeaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [counter, setCounter] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [coverColor, setCoverColor] = useState(() => colorFor(pathname));

  // A new page has arrived: lift the cover, then give it the new page's colour
  // once it has faded out, so the colour never changes while it's visible
  useEffect(() => {
    setLeaving(false);
    const t = window.setTimeout(() => setCoverColor(colorFor(pathname)), 1500);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    if (href === pathname) return;
    // Keep the cover in the colour of the page being left
    setCoverColor(colorFor(pathname));
    setLeaving(true);
    window.setTimeout(() => router.push(href), 1500);
  }, [pathname, router]);

  const setProject = useCallback((title: string | null, c: string | null) => {
    setProjectTitle(title);
    setCounter(c);
  }, []);

  return (
    <Ctx.Provider value={{ projectTitle, counter, setProject, leaving, coverColor, navigate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useHeader() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHeader must be used inside HeaderProvider');
  return ctx;
}