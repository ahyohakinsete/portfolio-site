'use client';

export default function UnderConstruction() {
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
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Maison Neue', Arial, sans-serif;
          background: #fff;
          color: #333;
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '300',
          marginBottom: '1rem',
          letterSpacing: '-0.5px'
        }}>
          Site Under Construction
        </h1>
        <p style={{
          fontSize: '1.6rem',
          color: '#666',
          maxWidth: '500px',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          This site is currently being built. Check back soon.
        </p>
      </div>
    </>
  );
}
