'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '../../components/HeaderContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function MobileSlideRow({ images, title }: { images: any[]; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const gap = 16;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setViewport({ width: el.clientWidth, height: window.innerHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoad = (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setAspects(prev => ({ ...prev, [id]: naturalWidth / naturalHeight }));
  };

  const ready = images.every(img => aspects[img.id]);
  const totalAspect = images.reduce((sum, img) => sum + (aspects[img.id] || 1), 0);
  const availableWidth = Math.max(0, viewport.width - gap * (images.length - 1));
  const fitHeight = availableWidth / totalAspect;
  const lockedHeight = images[0]?.heightVh && viewport.height
    ? (images[0].heightVh / 100) * viewport.height
    : Infinity;
  const height = Math.min(fitHeight, lockedHeight);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: `${gap}px`,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      {images.map((img: any) => (
        <img
          key={img.id}
          src={img.url}
          alt={title}
          onLoad={e => onLoad(img.id, e)}
          style={{
            height: `${height}px`,
            width: 'auto',
            display: 'block',
            flexShrink: 0
          }}
        />
      ))}
    </div>
  );
}

const slugOf = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getCachedProject = (slug: any) => {
  if (typeof window === 'undefined' || !window.globalSlidesCache) return null;
  return window.globalSlidesCache.projects.find((p: any) =>
    slugOf(p.title) === slug
  ) || null;
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { setProject: setHeaderProject, navigate } = useHeader();

  const [project, setProject] = useState<any>(() => getCachedProject(params.project));
  const [slides, setSlides] = useState<any[]>(() => getCachedProject(params.project)?.slides ?? []);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const initialised = useRef(false);

  // Send the project title and counter to the shared header
  useEffect(() => {
    if (!project) return;
    const start = window.allSlidesData?.currentProjectStartIndex ?? 0;
    const total = window.allSlidesData?.totalSlides ?? slides.length;
    setHeaderProject(project.title, `${start + currentSlideIndex + 1} of ${total}`);
  }, [project, slides, currentSlideIndex]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    loadAllData();
    return () => window.removeEventListener('resize', checkMobile);
  }, [params.project]);

  const loadAllData = async () => {
    try {
      if (window.globalSlidesCache) {
        setCurrentProjectFromCache();
        return;
      }

      const response = await fetch(`${API_URL}/all-data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const allSlides: any[] = [];
      data.projects.forEach((project: any) => {
        project.slides.forEach((slide: any, idx: number) => {
          allSlides.push({
            ...slide,
            projectId: project.id,
            projectTitle: project.title,
            projectOrder: project.order,
            orderInProject: idx
          });
        });
      });

      window.globalSlidesCache = {
        projects: data.projects,
        allSlides,
        totalSlides: allSlides.length
      };

      setCurrentProjectFromCache();
      preloadAllImages();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const preloadAllImages = () => {
    if (!window.globalSlidesCache) return;

    const { allSlides } = window.globalSlidesCache;
    let imageIndex = 0;

    const loadNextImage = () => {
      if (imageIndex >= allSlides.length) return;

      const slide = allSlides[imageIndex];
      imageIndex++;

      if (slide.images && slide.images.length > 0) {
        slide.images.forEach((img: any) => {
          const image = new Image();
          image.src = img.url;
        });
      }

      setTimeout(loadNextImage, 100);
    };

    loadNextImage();
  };

  const setCurrentProjectFromCache = () => {
    if (!window.globalSlidesCache) return;

    const foundProject = window.globalSlidesCache.projects.find((p: any) =>
      slugOf(p.title) === params.project
    );

    if (!foundProject) {
      router.push('/');
      return;
    }

    setProject(foundProject);
    setSlides(foundProject.slides);

    const currentSlideGlobalIndex = window.globalSlidesCache.allSlides.findIndex((s: any) =>
      s.projectId === foundProject.id && s.id === foundProject.slides[0]?.id
    );

    window.allSlidesData = {
      allSlides: window.globalSlidesCache.allSlides,
      totalSlides: window.globalSlidesCache.totalSlides,
      currentProjectStartIndex: currentSlideGlobalIndex,
      currentGlobalIndex: currentSlideGlobalIndex
    };
  };

  // Load the slide from the URL (/project/3 shows slide 3) once, on first load
  useEffect(() => {
    if (initialised.current || slides.length === 0) return;
    initialised.current = true;
    const n = parseInt(params.slide as string, 10);
    const index = !isNaN(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
    setCurrentSlideIndex(index);
    window.history.replaceState(null, '', `/${params.project}/${index + 1}`);
  }, [slides, params.project, params.slide]);

  // Change slide within the project and keep the URL in step
  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    window.history.replaceState(null, '', `/${params.project}/${index + 1}`);
  };

  // Move to another project without remounting the page or the header
  const switchToSlide = (projectSlug: string, slideNumber: number) => {
    const cache = window.globalSlidesCache;
    if (!cache) return;
    const found = cache.projects.find((p: any) => slugOf(p.title) === projectSlug);
    if (!found || found.slides.length === 0) return;
    const n = Math.min(Math.max(slideNumber, 1), found.slides.length);
    const startIdx = cache.allSlides.findIndex((s: any) =>
      s.projectId === found.id && s.id === found.slides[0]?.id
    );
    window.allSlidesData = {
      allSlides: cache.allSlides,
      totalSlides: cache.totalSlides,
      currentProjectStartIndex: startIdx,
      currentGlobalIndex: startIdx + n - 1
    };
    setProject(found);
    setSlides(found.slides);
    setCurrentSlideIndex(n - 1);
    window.history.replaceState(null, '', `/${projectSlug}/${n}`);
  };

  const navigateToNextSlide = () => {
    if (!window.allSlidesData) return;
    const { allSlides, currentProjectStartIndex, totalSlides } = window.allSlidesData;
    const currentGlobalIndex = currentProjectStartIndex + currentSlideIndex;

    if (currentSlideIndex === slides.length - 1) {
      if (currentGlobalIndex + 1 < totalSlides) {
        const nextSlide = allSlides[currentGlobalIndex + 1];
        const nextProjectSlug = slugOf(nextSlide.projectTitle);
        switchToSlide(nextProjectSlug, 1);
      } else {
        navigate('/thumbnails');
      }
    } else {
      goToSlide(currentSlideIndex + 1);
    }
  };

  const navigateToPreviousSlide = () => {
    if (!window.allSlidesData) return;
    const { allSlides, currentProjectStartIndex } = window.allSlidesData;
    const currentGlobalIndex = currentProjectStartIndex + currentSlideIndex;

    if (currentSlideIndex === 0) {
      if (currentGlobalIndex > 0) {
        const prevSlide = allSlides[currentGlobalIndex - 1];
        const prevProjectSlug = slugOf(prevSlide.projectTitle);
        switchToSlide(prevProjectSlug, prevSlide.orderInProject + 1);
      }
    } else {
      goToSlide(currentSlideIndex - 1);
    }
  };

  const handleSlideClick = (e: React.MouseEvent) => {
    if (e.clientX < window.innerWidth / 3) {
      navigateToPreviousSlide();
    } else {
      navigateToNextSlide();
    }
  };

  useEffect(() => {
    if (slides.length === 0 || !window.allSlidesData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToNextSlide();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, currentSlideIndex, router, navigate]);

  if (!project || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <>
      <style>{`
       
        html {
          font-size: 62.5%;
        }

        html, body {
          background: #fff;
          margin: 0;
          padding: 0;
        }

        body {
          line-height: 2.0em;
          font-size: 1.3em;
          letter-spacing: 0.05em;
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @media (max-width: 768px) {
          html {
            font-size: 50%;
          }

          body {
            font-size: 1.8em;
          }
        }
      `}</style>

      {/* Slide Title - Bottom Left */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: isMobile ? '2rem' : '4rem',
        zIndex: 1001,
        fontSize: '1.4rem',
        fontFamily: '"Maison Neue", Arial, sans-serif',
        color: '#999'
      }}>
        {currentSlide.title}
      </div>

      <div style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#fff',
        fontFamily: 'Canela, Georgia, serif',
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          height: '100%',
          padding: isMobile ? '5em 5%' : '5em 4%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Click area: left third goes back, the rest goes forward */}
          <div
            onClick={handleSlideClick}
            style={{
              position: 'absolute',
              top: '5em',
              left: 0,
              right: 0,
              bottom: '5em',
              cursor: 'default',
              zIndex: 10
            }}
          />

          <div style={{
            position: 'relative',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '1400px'
          }}>
            {isMobile ? (
              <MobileSlideRow images={currentSlide.images} title={currentSlide.title} />
            ) : (
              /* DESKTOP: 64 quarter-column grid */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(64, 1fr)',
                gap: '0',
                width: '100%'
              }}>
                {currentSlide.images.map((img: any) => (
                  <div
                    key={img.id}
                    style={{
                      gridColumn: `${Math.round(img.columnsLeft * 4) + 1} / span ${Math.round(img.columnsWide * 4)}`,
                      gridRow: 1,
                      alignSelf: 'center',
                      height: img.heightVh ? `${img.heightVh}vh` : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={img.url}
                      alt={currentSlide.title}
                      style={{
                        height: img.heightVh ? '100%' : 'auto',
                        width: img.heightVh ? 'auto' : '100%',
                        display: 'block'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}