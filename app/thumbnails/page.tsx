'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Thumbnails() {
  const [projects, setProjects] = useState<any[]>([]);
  const [allSlides, setAllSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNav, setShowNav] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [showArrowHint, setShowArrowHint] = useState(false);
  const [arrowHoverTimeout, setArrowHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const handleArrowHover = () => {
    setShowArrowHint(true);
    
    // Show for 1 second, hide for 1 second, show for 1 second, then hide
    const timer1 = setTimeout(() => {
      setShowArrowHint(false);
      
      const timer2 = setTimeout(() => {
        setShowArrowHint(true);
        
        const timer3 = setTimeout(() => {
          setShowArrowHint(false);
        }, 1000);
        
        setArrowHoverTimeout(timer3);
      }, 1000);
      
      setArrowHoverTimeout(timer2);
    }, 1000);
    
    setArrowHoverTimeout(timer1);
  };

  const handleArrowLeave = () => {
    if (arrowHoverTimeout) {
      clearTimeout(arrowHoverTimeout);
    }
    setShowArrowHint(false);
  };

  const cyclePages = () => {
    // Trigger fade out
    setFadeOut(true);
    
    // Wait for fade out animation to complete, then navigate
    setTimeout(() => {
      // Current page is thumbnails (1), next is information (2)
      router.push('/information');
    }, 1500);
  };

  useEffect(() => {
    // Reset fade states
    setFadeOut(false);
    
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadAllSlides();
    
    // Trigger fade-in
    setFadeIn(true);
    
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        cyclePages();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const loadAllSlides = async () => {
    try {
      // Use the optimized single-call endpoint
      const response = await fetch(`${API_URL}/all-data`);
      const data = await response.json();

      // Flatten all slides from all projects
      const flattenedSlides = data.projects.flatMap((project: any) =>  
        project.slides.map((slide: any) => ({
          ...slide,
          projectTitle: project.title,
          projectSlug: project.title.toLowerCase().replace(/\s+/g, '-')
        }))
      );
      
      setAllSlides(flattenedSlides);
      setLoading(false);
    } catch (error) {
      console.error('Error loading slides:', error);
      setLoading(false);
    }
  };

  const handleSlideClick = (slide) => {
    // Trigger fade out
    setFadeOut(true);
    
    // Wait for fade out animation to complete, then navigate
    setTimeout(() => {
      // Navigate to project with slide position (0-indexed)
      router.push(`/${slide.projectSlug}?slide=${slide.position}`);
    }, 1500);
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
        
        {/* Persistent background underlay */}
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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#999',
          backgroundColor: '#fff',
          opacity: fadeIn ? 1 : 0,
          
        }}>
          Loading...
        </div>
      </>
    );
  }

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
        
        .thumbnails-header {
          display: flex;
          align-items: flex-start;
          left: 4rem;
          right: 4rem;
        }
        
        .header-dash {
          display: inline;
        }
        
        .header-arrow {
          display: block;
          right: 4rem;
        }
        
        .header-nav {
          display: inline-block;
          min-width: 30rem;
        }
        
        .thumbnails-grid {
          padding-top: 6rem;
          padding-left: 4rem;
          padding-right: 4rem;
          padding-bottom: 4rem;
        }
        
        .thumbnail-item {
          padding: 3rem;
        }
        
        .thumbnail-img {
          height: 18rem;
          width: auto;
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          html {
            font-size: 50%;
          }
          
          body {
            font-size: 1.8em;
          }
          
          .thumbnails-header {
            justify-content: space-between;
            left: 2rem;
            right: 2rem;
          }
          
          .header-dash {
            display: none;
          }
          
          .header-arrow {
            display: none;
          }
          
          .header-nav {
            min-width: auto;
            text-align: right;
            white-space: nowrap;
            font-size: 1.2rem;
          }
          
          .thumbnails-grid {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          
          .thumbnail-item {
            padding: 1.5rem;
          }
          
          .thumbnail-img {
            height: 12rem;
          }
        }
      `}</style>
      
      {/* Persistent background underlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: -1
      }} />
      
      {/* Transition overlay - covers screen during page transitions */}
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
        zIndex: 1000
      }} />
      
      {/* Header - always visible, outside fading content */}
      <div 
        className="thumbnails-header"
        style={{
          position: 'fixed',
          top: '2.1rem',
          zIndex: 1001,
          fontSize: '1.4rem',
          fontFamily: '"Maison Neue", Arial, sans-serif'
        }}
        onMouseEnter={() => { setShowNav(true); setHoveredNav('container'); }}
        onMouseLeave={() => { setShowNav(false); setHoveredNav(null); }}
      >
          <span 
            onClick={() => {
              if (window.location.pathname !== "/") {
                router.push("/");
              }
            }}
            style={{ 
              color: "#333",
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Ayo Akinsete
          </span>
        <span className="header-dash" style={{ 
          color: '#666', 
          cursor: 'pointer',
          padding: '0 15px',
          transition: 'opacity 250ms ease-in-out',
          letterSpacing: '-0.23em'
        }}>——</span>
        <span 
          className="header-nav"
          style={{ 
            color: '#999',
            cursor: 'pointer',
            transition: 'color 250ms ease-in-out'
          }}
        >
          {(!showNav && !isMobile) ? (
            'Thumbnails'
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
                style={{ 
                  color: hoveredNav ? '#333' : '#999',
                  transition: 'color 0.2s ease'
                }}
              >
                Thumbnails
              </span>
              {'; '}
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
              {'.'}
            </>
          )}
        </span>
      </div>

      {/* Arrow - always visible */}
      <div
        className="header-arrow"
        onMouseEnter={handleArrowHover}
        onMouseLeave={handleArrowLeave}
        style={{
          position: 'fixed',
          top: '2.1rem',
          fontSize: '1.3rem',
          fontFamily: '"Maison Neue", Arial, sans-serif',
          color: '#999',
          cursor: 'default',
          zIndex: 1001,
          minWidth: '20rem',
          textAlign: 'right'
        }}
      >
        {showArrowHint ? 'Use keyboard for navigation' : '↑'}
      </div>
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        position: 'relative',
        fontFamily: 'Canela, Georgia, serif'
      }}>
      {/* Content - fades in/out */}

      {/* Thumbnails Grid - Natural Flow Like Reference */}
      <div className="thumbnails-grid" style={{
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}>
          {allSlides.map((slide) => {
            return (
              slide.images.map((img) => (
                <div
                  key={img.id}
                  className="thumbnail-item"
                  onClick={() => handleSlideClick(slide)}
                  style={{
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <img
                    className="thumbnail-img"
                    src={img.url}
                    alt={slide.title}
                    style={{
                      display: 'block'
                    }}
                  />
                </div>
              ))
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}