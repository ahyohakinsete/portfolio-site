'use client';

import { useEffect, useState } from 'react';
import { useHeader } from '../components/HeaderContext';

const slugOf = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const { navigate } = useHeader();
  const [projects, setProjects] = useState<any[]>([]);
  const [hoveredProject, setHoveredProject] = useState<any>(null);
  const [previewSlide, setPreviewSlide] = useState<any>(null);
  const [previewFadeIn, setPreviewFadeIn] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    loadProjects();
    setFadeIn(true);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigate('/thumbnails');
      }
    };

    // Prevent overscroll bounce at top
    let lastScrollY = 0;
    const preventOverscroll = (e: Event) => {
      const currentScrollY = window.scrollY;
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
    };
  }, [navigate]);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/all-data`);
      const data = await response.json();

      const projectsWithPreviews = data.projects.map((project: any) => ({
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

    if (previewSlide) {
      setPreviewFadeIn(false);
      setTimeout(() => {
        setPreviewSlide(project.previewSlide);
        setTimeout(() => setPreviewFadeIn(true), 10);
      }, 1500);
    } else {
      setPreviewSlide(project.previewSlide);
      setTimeout(() => setPreviewFadeIn(true), 10);
    }
  };

  const handleProjectClick = (project: any) => {
    navigate(`/${slugOf(project.title)}/1`);
  };

  return (
    <>
      <style>{`
       

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

        /* Mobile styles */
        @media (max-width: 768px) {
          html {
            font-size: 50%;
          }

          .project-titles {
            font-size: 180%;
            line-height: 1.404em;
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
        backgroundColor: '#fff',
        minHeight: '100vh'
      }}>
        {/* Index - Project Titles */}
        <div className="titles-container" style={{
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 1.5s ease',
          position: 'relative',
          zIndex: 100
        }}>
          <div className="project-titles">
            {projects.map((project: any, index: number) => (
              <span key={project.id} className="project-title-item">
                <span
                  onMouseEnter={() => handleProjectHover(project)}
                  onMouseLeave={() => {
                    setHoveredProject(null);
                    setPreviewFadeIn(false);
                    setPreviewSlide(null);
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
                  {project.title.split('.').map((part: string, i: number, arr: string[]) => (
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
            <div style={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '1400px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(64, 1fr)',
                gap: '0',
                width: '100%'
              }}>
                {previewSlide.images.map((img: any) => (
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
                      alt={previewSlide.title}
                      style={{
                        height: img.heightVh ? '100%' : 'auto',
                        width: img.heightVh ? 'auto' : '100%',
                        display: 'block'
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