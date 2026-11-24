'use client';

import { useEffect, useState } from 'react';
import { useHeader } from '../../components/HeaderContext';
import { getAllData, flattenThumbnails } from '../../lib/slidesCache';

export default function Thumbnails() {
  const { navigate } = useHeader();

  // Render straight from the cache when it's there, so nothing waits on a fetch
  const [allSlides, setAllSlides] = useState<any[]>(() =>
    typeof window === 'undefined' ? [] : flattenThumbnails(window.globalSlidesCache)
  );

  useEffect(() => {
    getAllData()
      .then(cache => setAllSlides(flattenThumbnails(cache)))
      .catch(error => console.error('Error loading slides:', error));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigate('/information');
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

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        position: 'relative',
        fontFamily: 'Canela, Georgia, serif'
      }}>
        {/* Thumbnails Grid */}
        <div className="thumbnails-grid">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start'
          }}>
            {allSlides.map((slide: any) =>
              slide.images.map((img: any) => (
                <div
                  key={img.id}
                  className="thumbnail-item"
                  onClick={() => navigate(`/${slide.projectSlug}/${slide.slideNumber}`)}
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
                    style={{ display: 'block' }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}