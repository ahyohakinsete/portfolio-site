'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Information() {
  const [showNav, setShowNav] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [showArrowHint, setShowArrowHint] = useState(false);
  const [arrowHoverTimeout, setArrowHoverTimeout] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Keyboard navigation
  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Trigger fade-in
    setFadeIn(true);
    
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

  const handleArrowHover = () => {
    setShowArrowHint(true);
    
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
    setFadeOut(true);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  useEffect(() => {
    setFadeOut(false);
    setFadeIn(true);
  }, []);

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Maison Neue';
          font-weight: 300;
          src: url('/fonts/MaisonNeue-Light.woff2') format('woff2'),
               url('/fonts/MaisonNeue-Light.woff') format('woff');
        }
        
        html {
          font-size: 62.5%;
        }
        
        html, body {
          background: #0d0c0b;
          margin: 0;
          padding: 0;
        }
        
        body {
          line-height: 2.0em;
          font-size: 1.3em;
          letter-spacing: 0.05em;
        }
        
        .info-header {
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
        
        .info-content {
          padding: 15rem 4rem 8rem 4rem;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20rem;
          font-size: 1.06em;
          line-height: 1.8em;
          color: #fff;
          max-width: 1600px;
        }
        
        .contact-column {
          text-align: right;
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          html {
            font-size: 50%;
          }
          
          body {
            font-size: 1.6em;
            line-height: 1.8em;
          }
          
          .info-header {
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
          
          .info-content {
            padding: 10rem 2rem 4rem 2rem;
            text-align: center;
            font-size: 0.9em;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .contact-column {
            text-align: center;
            display: none;
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
        backgroundColor: '#0d0c0b',
        zIndex: -1
      }} />
      
      {/* Transition overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0d0c0b',
        opacity: fadeOut ? 1 : 0,
        pointerEvents: fadeOut ? 'auto' : 'none',
        transition: 'opacity 1.5s ease-in-out',
        zIndex: 1000
      }} />
      
      {/* Header */}
      <div 
        className="info-header"
        style={{
          position: 'fixed',
          top: '2.1rem',
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
            if (window.location.pathname !== '/') {
              setFadeOut(true);
              setTimeout(() => router.push('/'), 1500);
            }
          }}
          style={{ 
            color: '#fff',
            textDecoration: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          Ayo Akinsete
        </span>
        <span className="header-dash" style={{ 
          color: '#fff', 
          cursor: 'pointer',
          padding: '0 15px',
          transition: 'opacity 250ms ease-in-out',
          letterSpacing: '-0.23em',
          flexShrink: 0
        }}>——</span>
        <span 
          className="header-nav"
          style={{ 
            color: '#fff',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            display: 'inline-block'
          }}
        >
          {(!showNav && !isMobile) ? (
            'is a Nigerian-American photographer born and raised between two continents. He currently resides and works between Oslo, Norway and the US.'
          ) : (
            <>
              <span 
                onClick={() => { setFadeOut(true); setTimeout(() => router.push('/'), 1500); }} 
                onMouseEnter={() => setHoveredNav('index')}
                onMouseLeave={() => setHoveredNav(null)}
                style={{ 
                  textDecoration: 'none', 
                  color: hoveredNav && hoveredNav !== 'container' && hoveredNav !== 'index' ? '#fff' : '#999',
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
                  color: hoveredNav && hoveredNav !== 'container' && hoveredNav !== 'thumbnails' ? '#fff' : '#999',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
              >
                Thumbnails
              </span>
              {'; '}
              <span 
                onMouseEnter={() => setHoveredNav('information')}
                onMouseLeave={() => setHoveredNav(null)}
                style={{ 
                  color: hoveredNav && hoveredNav !== 'container' && hoveredNav !== 'information' ? '#fff' : '#999',
                  transition: 'color 0.2s ease',
                  cursor: 'default'
                }}
              >
                Information
              </span>
              {'.'}
            </>
          )}
        </span>
      </div>

      {/* Arrow */}
      <div
        className="header-arrow"
        onMouseEnter={handleArrowHover}
        onMouseLeave={handleArrowLeave}
        style={{
          position: 'fixed',
          top: '2.1rem',
          fontSize: '1.3rem',
          fontFamily: '"Maison Neue", Arial, sans-serif',
          color: '#fff',
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
        backgroundColor: '#0d0c0b',
        position: 'relative',
        fontFamily: '"Maison Neue", Arial, sans-serif',
        color: '#fff'
      }}>
        {/* Content */}
        <div className="info-content">
          {/* Bio - Mobile only */}
          <p style={{ 
            display: isMobile ? 'block' : 'none',
            marginBottom: '4rem',
            fontSize: '1.06em',
            lineHeight: '1.8em'
          }}>
            Ayo Akinsete is a Nigerian-American photographer born and raised between two continents. He currently resides and works between Oslo, Norway and the US.
          </p>
          
          <div className="info-grid">
            {/* Left Column - Clients & Info */}
            <div>
              <p style={{ marginBottom: '25px' }}>
                Selected editorial clients include Interview, The New York Times Magazine, The New Yorker, Konfekt — Monocle, Gossamer, Khaos Magazine, Ambivalence Magazine, Sucré Paper, and Objektiv Press.
              </p>

              <p style={{ marginBottom: '25px' }}>
                Selected commercial clients include brands and publications across Oslo, Norway and the US.
              </p>

              <p style={{ marginBottom: '4rem' }}>
                Works have been exhibited in Høstutstillingen, Bomuldsfabriken Kunsthall, and Kunstnernes Hus.
              </p>

              {/* Contact Info - Mobile only, before Besties */}
              {isMobile && (
                <div style={{ 
                  marginTop: '4rem',
                  marginBottom: '6rem'
                }}>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <a 
                      href="mailto:aakinsete@gmail.com"
                      style={{ 
                        color: '#fff',
                        textDecoration: 'none'
                      }}
                    >
                      aakinsete@gmail.com
                    </a>
                  </div>
                  <div style={{ marginBottom: '3rem', color: '#fff' }}>
                    +47 94870313
                  </div>
                  <div>
                    <a 
                      href="https://instagram.com/ayoakinsete"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#999',
                        textDecoration: 'none'
                      }}
                    >
                      Instagram ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Besties Section */}
              <div style={{ marginTop: '8rem' }}>
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 'normal',
                  marginBottom: '1.5rem',
                  color: '#fff'
                }}>
                  Besties
                </h3>
                
                <div style={{ lineHeight: '1.6', color: '#fff' }}>
                  <div>
                    <a href="https://www.andreasbjorseth.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Andreas Bjørseth
                    </a>
                  </div>
                  <div>
                    <a href="https://devdhunsi.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Dev Dhunsi
                    </a>
                  </div>
                  <div>
                    <a href="https://www.vitaboy.net/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Duy Nguyen
                    </a>
                  </div>
                  <div>
                    <a href="https://www.elisetobiasson.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Elise Tobiasson
                    </a>
                  </div>
                  <div>
                    <a href="https://helenkorpak.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Helen Korpak
                    </a>
                  </div>
                  <div>
                    <a href="https://iosivertsen.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Io Sivertsen
                    </a>
                  </div>
                  <div>
                    <a href="https://jelsenjelsenjelsen.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Jelsen Lee Innocent
                    </a>
                  </div>
                  <div>
                    <a href="https://www.jessie.no/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Jessie Jones
                    </a>
                  </div>
                  <div>
                    <a href="https://www.malinlongva.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Malin Longva
                    </a>
                  </div>
                  <div>
                    <a href="https://mariodelaossa.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Mario de la Ossa
                    </a>
                  </div>
                  <div>
                    <a href="https://www.danmariner.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Dan Mariner
                    </a>
                  </div>
                  <div>
                    <a href="https://www.tonjethilesen.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      Tonje Thilesen
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact */}
            <div className="contact-column">
              <div style={{ marginBottom: '0.8rem' }}>
                <a 
                  href="mailto:aakinsete@gmail.com"
                  style={{ 
                    color: '#fff',
                    textDecoration: 'none'
                  }}
                >
                  aakinsete@gmail.com
                </a>
              </div>
              <div style={{ marginBottom: '3rem', color: '#fff' }}>
                +47 94870313
              </div>
              <div>
                <a 
                  href="https://instagram.com/ayoakinsete"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#999',
                    textDecoration: 'none'
                  }}
                >
                  Instagram ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}