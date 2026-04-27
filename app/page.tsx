'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [hoveredProject, setHoveredProject] = useState<any>(null);
  const [previewSlide, setPreviewSlide] = useState<any>(null);
  const [previewFadeIn, setPreviewFadeIn] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showArrowHint, setShowArrowHint] = useState(false);
  const [arrowHoverTimeout, setArrowHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fullPageFade, setFullPageFade] = useState(false);
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
    // Trigger full page fade out
    setFullPageFade(true);
    
    // Wait for fade out animation to complete, then navigate
    setTimeout(() => {
      // Current page is home (0), next is thumbnails (1)
      router.push('/thumbnails');
    }, 1500); // Match the transition duration
  };

  useEffect(() => {
    // Reset fade states
    setFadeOut(false);
    setFullPageFade(false);
    
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadProjects();
    
    // Trigger fade-in
    setFadeIn(true);
    
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        cyclePages();
      }
    };

    // Prevent overscroll bounce at top
    let lastScrollY = 0;
    const preventOverscroll = (e) => {
      const currentScrollY = window.scrollY;
      
      // If at the top and trying to scroll up
      if (currentScrollY <= 0 && lastScrollY <= 0) {
        e.preventDefault();
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', preventOverscroll, { passive: false });
    window.addEventListener('touchmove', preventOverscroll, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', preventOverscroll);
      window.removeEventListener('touchmove', preventOverscroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const loadProjects = async () => {
    try {
      // ONLY CHANGE: Use /all-data endpoint instead of /projects
      const response = await fetch(`${API_URL}/all-data`);
      const data = await response.json();

      const projectsWithPreviews = data.projects.map(project => ({
        ...project,
        previewSlide: project.slides[0] || null
      }));

      setProjects(projectsWithPreviews);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleProjectHover = (project: any) => {
    setHoveredProject(project);
    
    // If there's already a preview showing, fade it out first
    if (previewSlide) {
      setPreviewFadeIn(false);
      setTimeout(() => {
        setPreviewSlide(project.previewSlide);
        setTimeout(() => setPreviewFadeIn(true), 10);
      }, 1500); // Half of 3s for fade out
    } else {
      // No preview showing, just fade in
      setPreviewSlide(project.previewSlide);
      setTimeout(() => setPreviewFadeIn(true), 10);
    }
  };

  const handleProjectClick = (project) => {
    // Keep the preview visible and fade out only the project titles
    setFadeOut(true);
    // Don't clear previewSlide here - let it stay visible during transition
    
    // Wait for fade out animation to complete, then navigate
    setTimeout(() => {
      router.push(`/${project.title.toLowerCase().replace(/\s+/g, '-')}`);
    }, 1500); // Match the transition duration
  };

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
          overscroll-behavior-y: contain;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        
        body {
          line-height: 2.0em;
          font-size: 1.3em;
          letter-spacing: 0.05em;
        }
        
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        ::selection {
          background: #b3d4fc;
          text-shadow: none;
        }
        
        .project-titles {
          font-size: 420%;
          line-height: 1.296em;
          letter-spacing: -0.5px;
          font-family: Canela, Georgia, serif;
        }
        
        .project-title-item {
          display: inline-block;
          white-space: nowrap;
        }
        
        .title-separator {
          display: inline;
        }
        
        .hollow-period {
          width: 6px;
          height: 6px;
        }
        
        .titles-container {
          padding-top: 7.5rem;
          padding-left: 4rem;
          padding-right: 4rem;
          padding-bottom: 4rem;
        }
        
        .home-header {
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
        
        /* Mobile styles */
        @media (max-width: 768px) {
          html {
            font-size: 50%;
          }
          
          .project-titles {
            font-size: 180%;
            line-height: 1.404em;
          }
          
          .project-title-item {
            display: inline-block;
            white-space: nowrap;
          }
          
          .title-separator {
            display: inline;
          }
          
          .hollow-period {
            width: 3px;
            height: 3px;
          }
          
          .titles-container {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          
          body {
            font-size: 1.8em;
          }
          
          .home-header {
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
            white-space: nowrap;
            font-size: 1.2rem;
            text-align: right;
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
        zIndex: 40
      }} />
      
      {/* Header - always visible, outside fading content */}
      <div 
        className="home-header"
        style={{
          position: 'fixed',
          top: '2.2rem',
          zIndex: 1001,
          fontSize: '1.4rem',
          fontFamily: '"Maison Neue", Arial, sans-serif'
        }}
        onMouseEnter={() => {
          setShowNav(true);
          setHoveredNav('container');
        }}
        onMouseLeave={() => {
          setShowNav(false);
          setHoveredNav(null);
        }}
      >
        <span 
          onClick={() => {
            // Only navigate if not already on homepage
            if (window.location.pathname !== '/') {
              router.push('/');
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
        <span className="header-dash" style={{ margin: '0 15px' }}>
          <span style={{ 
            color: '#666', 
            cursor: 'pointer',
            letterSpacing: '-0.23em'
          }}>——</span>
        </span>
        <span 
          className="header-nav"
          style={{ 
            color: '#999', 
            cursor: 'pointer'
          }}
        >
          <span 
            onClick={() => router.push('/')} 
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
          {(showNav || isMobile) && (
            <>
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
          top: '2.2rem',
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
        backgroundColor: '#fff', 
        minHeight: '100vh',
        opacity: fullPageFade ? 0 : 1,
        transition: 'opacity 1.5s ease'
      }}>
        {/* Index - Project Titles */}
        <div className="titles-container" style={{
          opacity: fadeOut ? 0 : (fadeIn ? 1 : 0),
          transition: 'opacity 1.5s ease',
          position: 'relative',
          zIndex: 100
        }}>
          <div className="project-titles">
            {projects.map((project, index) => (
              <span key={project.id} className="project-title-item">
                <span
                  onMouseEnter={() => handleProjectHover(project)}
                  onMouseLeave={() => {
                    // Don't clear preview if we're navigating
                    if (!fadeOut) {
                      setHoveredProject(null);
                      setPreviewFadeIn(false);
                      setPreviewSlide(null);
                    }
                  }}
                  onClick={() => handleProjectClick(project)}
                  style={{
                    cursor: 'pointer',
                    fontStyle: index % 3 === 0 ? 'normal' : 'italic',
                    fontWeight: '300',
                    transition: 'opacity 0.3s ease',
                    opacity: hoveredProject && hoveredProject.id !== project.id ? 0.7 : 1,
                    color: 'black'
                  }}
                >
                  {project.title.split('.').map((part, i, arr) => (
                    i === arr.length - 1 ? part : (
                      <span key={i}>
                        {part}
                        <svg 
                          width="6" 
                          height="6" 
                          viewBox="0 0 6 6" 
                          className="hollow-period"
                          style={{ 
                            display: 'inline-block',
                            verticalAlign: 'baseline'
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle 
                            cx="3" 
                            cy="3" 
                            r="2.5" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="0.5"
                          />
                        </svg>
                      </span>
                    )
                  ))}
                </span>
                <span className="title-separator" style={{ 
                  color: 'rgba(0, 0, 0, 0.3)',
                  margin: '0 16px',
                  fontWeight: '300'
                }}>
                  /
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Preview Slide Overlay - Matches Project Page Layout - Desktop Only */}
        {previewSlide && !isMobile && (
          <div style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            height: '100%',
            padding: '5em 4%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 50,
            pointerEvents: 'none',
            opacity: previewFadeIn ? 1 : 0,
            transition: 'opacity 1.5s ease'
          }}>
            {/* Slide Inner - Centered Container */}
            <div style={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '1400px'
            }}>
              {/* Slide Grid - 16 columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(16, 1fr)',
                gap: '1rem',
                width: '100%'
              }}>
                {previewSlide.images.map((img) => (
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
                      alt={previewSlide.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}