'use client';

import { useEffect, useState } from 'react';
import { useHeader } from '../../components/HeaderContext';

export default function Information() {
  const { navigate } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      <style>{`
       

        html {
          font-size: 62.5%;
        }

        body {
          line-height: 2.0em;
          font-size: 1.3em;
          letter-spacing: 0.05em;
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

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0d0c0b',
        position: 'relative',
        fontFamily: '"Maison Neue", Arial, sans-serif',
        color: '#fff'
      }}>
        <div className="info-content">
          {/* Bio - Mobile only (desktop shows it in the header) */}
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
                <div style={{ marginTop: '4rem', marginBottom: '6rem' }}>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <a href="mailto:aakinsete@gmail.com" style={{ color: '#fff', textDecoration: 'none' }}>
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
                      style={{ color: '#999', textDecoration: 'none' }}
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
                <a href="mailto:aakinsete@gmail.com" style={{ color: '#fff', textDecoration: 'none' }}>
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
                  style={{ color: '#999', textDecoration: 'none' }}
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