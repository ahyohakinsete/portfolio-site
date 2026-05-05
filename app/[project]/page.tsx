'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const GRID_COLUMNS = 16;

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoverState, setHoverState] = useState('counter'); // 'counter', 'hint', 'arrows'
  const [hoverTimeout, setHoverTimeout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorDirection, setCursorDirection] = useState('right');
  const [projectTitleFade, setProjectTitleFade] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadAllData();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [params.project]);
  
  const loadAllData = async () => {
    try {
      if (window.globalSlidesCache) {
        console.log('Using cached data');
        setCurrentProjectFromCache();
        return;
      }
      
      console.log('Fetching all data from API...');
      const response = await fetch(`${API_URL}/all-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
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
      
      console.log(`Cached ${allSlides.length} total slides from ${data.projects.length} projects`);
      
      window.globalSlidesCache = {
        projects: data.projects,
        allSlides,
        totalSlides: allSlides.length
      };
      
      setCurrentProjectFromCache();
      preloadAllImages();
      
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
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
    
    const projectSlug = params.project;
    const foundProject = window.globalSlidesCache.projects.find((p: any) => 
      p.title.toLowerCase().replace(/\s+/g, '-') === projectSlug
    );

    if (!foundProject) {
      router.push('/');
      return;
    }

    if (project && project.id !== foundProject.id) {
      setProjectTitleFade(false);
      setTimeout(() => {
        setProject(foundProject);
        setProjectTitleFade(true);
      }, 150);
    } else {
      setProject(foundProject);
    }
    
    setSlides(foundProject.slides);
    
    const currentSlideGlobalIndex = window.globalSlidesCache?.allSlides.findIndex((s: any) => 
      s.projectId === foundProject.id && s.id === foundProject.slides[0]?.id
    ) ?? -1;
    
    if (window.globalSlidesCache) {
      window.allSlidesData = {
        allSlides: window.globalSlidesCache.allSlides,
        totalSlides: window.globalSlidesCache.totalSlides,
        currentProjectStartIndex: currentSlideGlobalIndex,
        currentGlobalIndex: currentSlideGlobalIndex
      };
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    if (slides.length > 0 && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const slideParam = urlParams.get('slide');
      if (slideParam) {
        const slideIndex = parseInt(slideParam);
        if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < slides.length) {
          setCurrentSlideIndex(slideIndex);
        }
      }
    }
  }, [slides.length]);

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
        setFadeOut(true);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, currentSlideIndex, router]);
  
  const navigateToNextSlide = () => {
    if (!window.allSlidesData) return;
    const { allSlides, currentProjectStartIndex, totalSlides } = window.allSlidesData;
    const currentGlobalIndex = currentProjectStartIndex + currentSlideIndex;
    
    if (currentSlideIndex === slides.length - 1) {
      if (currentGlobalIndex + 1 < totalSlides) {
        const nextSlide = allSlides[currentGlobalIndex + 1];
        const nextProjectSlug = nextSlide.projectTitle?.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${nextProjectSlug}`);
      } else {
        router.push('/thumbnails');
      }
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };
  
  const navigateToPreviousSlide = () => {
    if (!window.allSlidesData) return;
    const { allSlides, currentProjectStartIndex } = window.allSlidesData;
    const currentGlobalIndex = currentProjectStartIndex + currentSlideIndex;
    
    if (currentSlideIndex === 0) {
      if (currentGlobalIndex > 0) {
        const prevSlide = allSlides[currentGlobalIndex - 1];
        const prevProjectSlug = prevSlide.projectTitle?.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${prevProjectSlug}?slide=${prevSlide.orderInProject}`);
      }
    } else {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleCounterHoverEnter = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  setHoverState('hint');
  
  const timer1 = setTimeout(() => {
    setHoverState('arrows');
    
    const timer2 = setTimeout(() => {
      setHoverState('counter');
    }, 1000);
    
    setHoverTimeout(timer2);
  }, 1000);
  
  setHoverTimeout(timer1);
};

  const handleCounterHoverLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setHoverState('counter');
  };

  const handleSlideMouseMove = (e: React.MouseEvent) => {
    const windowWidth = window.innerWidth;
    const mouseX = e.clientX;
    
    setCursorPosition({ x: mouseX, y: e.clientY });
    
    if (mouseX < windowWidth / 3) {
      setCursorDirection('left');
    } else {
      setCursorDirection('right');
    }
  };

  const handleSlideMouseEnter = () => {
    setCursorVisible(true);
  };

  const handleSlideMouseLeave = () => {
    setCursorVisible(false);
  };

  const handleSlideClick = (e: React.MouseEvent) => {
    const windowWidth = window.innerWidth;
    const mouseX = e.clientX;
    
    if (mouseX < windowWidth / 3) {
      navigateToPreviousSlide();
    } else {
      navigateToNextSlide();
    }
  };

  if (loading) {
    return (
      <>
        <style>{`
          html, body {
            background: #fff;
            margin: 0;
            padding: 0;
          }
        `}</style>
        
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff',
          zIndex: -1
        }} />
        
        <div style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: '#fff',
          position: 'fixed',
          top: 0,
          left: 0
        }}>
          <div 
            style={{
              position: 'fixed',
              top: '2.2rem',
              left: '4rem',
              zIndex: 1001,
              fontSize: '1.4rem',
              fontFamily: '"Maison Neue", Arial, sans-serif'
            }}
          >
            <span 
              onClick={() => {
                if (window.location.pathname !== '/') {
                  router.push('/');
                }
              }}
              style={{ 
                color: '#333',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              Ayo Akinsete
            </span>
            <span style={{ padding: '0 15px', color: '#666', letterSpacing: '-0.23em' }}>——</span>
            <span style={{ color: '#999' }}>
              {project?.title || 'Loading...'}
            </span>
          </div>
        </div>
      </>
    );
  }

  if (!project || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Maison Neue';
          font-weight: 300;
          src: url('/fonts/MaisonNeue-Light.woff2') format('woff2'),
               url('/fonts/MaisonNeue-Light.woff') format('woff');
        }
        
        @font-face {
          font-family: 'Canela';
          font-style: normal;
          font-weight: 300;
          src: url('/fonts/Canela-Thin-Web.woff2') format('woff2'),
               url('/fonts/Canela-Thin-Web.woff') format('woff');
        }
        
        @font-face {
          font-family: 'Canela';
          font-style: italic;
          font-weight: 300;
          src: url('/fonts/Canela-ThinItalic-Web.woff2') format('woff2'),
               url('/fonts/Canela-ThinItalic-Web.woff') format('woff');
        }
        
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
        
        .project-header {
          left: 4rem;
          right: 4rem;
        }
        
        .header-dash {
          display: inline;
        }
        
        .project-title-header {
          display: inline-block;
        }
        
        .project-counter {
          display: flex;
          right: 4rem;
        }
        
        .custom-cursor {
          display: block;
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          html {
            font-size: 50%;
          }
          
          body {
            font-size: 1.8em;
          }
          
          .project-header {
            left: 2rem;
            right: 2rem;
          }
          
          .header-dash {
            display: none;
          }
          
          .project-title-header {
            display: none;
          }
          
          .project-counter {
            display: none;
          }
          
          .custom-cursor {
            display: none;
          }
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: -1
      }} />
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        opacity: fadeOut ? 1 : 0,
        pointerEvents: fadeOut ? 'auto' : 'none',
        transition: 'opacity 1.5s ease-in-out',
        zIndex: 40
      }} />
      
      {/* Top Left Navigation */}
      <div 
        className="project-header"
        style={{
          position: 'fixed',
          top: '2.2rem',
          zIndex: 1001,
          fontSize: '1.4rem',
          fontFamily: '"Maison Neue", Arial, sans-serif',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <div>
          <span 
            onClick={() => {
              if (window.location.pathname !== '/') {
                setFadeOut(true);
                setTimeout(() => router.push('/'), 1500);
              }
            }}
            style={{ 
              color: '#333',
              textDecoration: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Ayo Akinsete
          </span>
          <span className="header-dash" style={{ padding: '0 15px', color: '#666', letterSpacing: '-0.23em' }}>——</span>
          <span 
            className="project-title-header"
            style={{ 
              color: '#999', 
              cursor: 'default',
              minWidth: isMobile ? 'auto' : '20rem',
              opacity: projectTitleFade ? 1 : 0,
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={() => { if (!isMobile) { setShowNav(true); setHoveredNav('container'); }}}
            onMouseLeave={() => { if (!isMobile) { setShowNav(false); setHoveredNav(null); }}}
          >
            {(!showNav || isMobile) ? (
              project.title
            ) : (
              <>
                <span 
                  onClick={() => { setFadeOut(true); setTimeout(() => router.push('/'), 1500); }} 
                  onMouseEnter={() => setHoveredNav('index')}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{ 
                    textDecoration: 'none', 
                    color: hoveredNav && hoveredNav !== 'index' ? '#333' : '#999', 
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  Index
                </span>
                {', '}
                <span 
                  onClick={() => { setFadeOut(true); setTimeout(() => router.push('/thumbnails'), 1500); }} 
                  onMouseEnter={() => setHoveredNav('thumbnails')}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{ 
                    textDecoration: 'none', 
                    color: hoveredNav && hoveredNav !== 'thumbnails' ? '#333' : '#999', 
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  Thumbnails
                </span>
                {', '}
                <span 
                  onClick={() => { setFadeOut(true); setTimeout(() => router.push('/information'), 1500); }} 
                  onMouseEnter={() => setHoveredNav('information')}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{ 
                    textDecoration: 'none', 
                    color: hoveredNav && hoveredNav !== 'information' ? '#333' : '#999', 
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  Information
                </span>
              </>
            )}
          </span>
        </div>

        {/* Mobile Nav - Right Side */}
        {isMobile && (
          <div style={{
            color: '#999',
            fontSize: '1.2rem',
            textAlign: 'right',
            whiteSpace: 'nowrap'
          }}>
            <span 
              onClick={() => { setFadeOut(true); setTimeout(() => router.push('/'), 1500); }} 
              style={{ 
                textDecoration: 'none', 
                color: '#999', 
                cursor: 'pointer'
              }}
            >
              Index
            </span>
            {', '}
            <span 
              onClick={() => { setFadeOut(true); setTimeout(() => router.push('/thumbnails'), 1500); }} 
              style={{ 
                textDecoration: 'none', 
                color: '#999', 
                cursor: 'pointer'
              }}
            >
              Thumbnails
            </span>
            {'; '}
            <span 
              onClick={() => { setFadeOut(true); setTimeout(() => router.push('/information'), 1500); }} 
              style={{ 
                textDecoration: 'none', 
                color: '#999', 
                cursor: 'pointer'
              }}
            >
              Information
            </span>
            {'.'}
          </div>
        )}
      </div>

      {/* Top Right Counter - Desktop Only */}
      <div className="project-counter" style={{
        position: 'fixed',
        top: '2rem',
        zIndex: 1001,
        alignItems: 'center',
        gap: '0.8rem',
        fontSize: '1.3rem',
        fontFamily: '"Maison Neue", Arial, sans-serif',
        color: '#999'
      }}>
        <div
          style={{
            minWidth: '12rem',
            textAlign: 'right',
            cursor: 'default'
          }}
          onMouseEnter={handleCounterHoverEnter}
          onMouseLeave={handleCounterHoverLeave}
        >
          {hoverState === 'counter' && (
            <span>
              {(window.allSlidesData?.currentProjectStartIndex || 0) + currentSlideIndex + 1} of {window.allSlidesData?.totalSlides || slides.length}
            </span>
          )}
          
          {hoverState === 'hint' && (
            <span>Use keyboard for navigation</span>
          )}
          {hoverState === 'arrows' && (
            <span style={{ letterSpacing: '0.35em' }}>
              ←↑→
            </span>
          )}
        </div>
      </div>

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
        left: 0,
        opacity: fadeOut ? 0 : (fadeIn ? 1 : 0),
        transition: 'opacity 1.5s ease'
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
        {/* Custom Cursor - Desktop Only */}
        <div className="custom-cursor" style={{
          position: 'fixed',
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: '1.5rem',
          height: '1.4rem',
          pointerEvents: 'none',
          zIndex: 1001,
          opacity: 0,
          transition: 'opacity 250ms ease-in-out',
          letterSpacing: '-0.23em',
          transform: 'translate(-7.5px, -7px)',
          display: 'none'
        }}>
          {cursorDirection === 'left' ? (
            <svg width="12" height="11" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 7H2M2 7L8 1M2 7L8 13" stroke="black" strokeWidth="1"/>
            </svg>
          ) : (
            <svg width="12" height="11" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 7H13M13 7L7 1M13 7L7 13" stroke="black" strokeWidth="1"/>
            </svg>
          )}
        </div>

        {/* Click Area Overlay - Both Desktop and Mobile */}
        <div 
          style={{
            position: 'absolute',
            top: '5em',
            left: 0,
            right: 0,
            bottom: '5em',
            cursor: 'default',
            zIndex: 10
          }}
          onMouseMove={!isMobile ? handleSlideMouseMove : undefined}
          onMouseEnter={!isMobile ? handleSlideMouseEnter : undefined}
          onMouseLeave={!isMobile ? handleSlideMouseLeave : undefined}
          onClick={handleSlideClick}
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
            /* MOBILE: 2-column grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              width: '100%'
            }}>
              {currentSlide.images.map((img: any) => {
                const isSingleImage = currentSlide.images.length === 1;
                const mobileColumnsLeft = isSingleImage ? 0 : Math.floor(img.columnsLeft / 8);
                const mobileColumnsWide = isSingleImage ? 2 : Math.max(1, Math.ceil(img.columnsWide / 8));
                
                return (
                  <div
                    key={img.id}
                    style={{
                      gridColumn: `${mobileColumnsLeft + 1} / span ${mobileColumnsWide}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={img.url}
                      alt={currentSlide.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* DESKTOP: 16-column grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(16, 1fr)',
              gap: '1rem',
              width: '100%'
            }}>
              {currentSlide.images.map((img: any) => (
                <div
                  key={img.id}
                  style={{
                    gridColumn: `${img.columnsLeft + 1} / span ${img.columnsWide}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={img.url}
                    alt={currentSlide.title}
                    style={{
                      width: '100%',
                      height: 'auto',
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
