import { useEffect } from 'react';

const HtmlLandingRedirect = () => {
  useEffect(() => {
    // Redirect to the HTML landing page
    window.location.href = '/landing.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h2>טוען...</h2>
        <p>מעביר אותך לדף הבית</p>
      </div>
    </div>
  );
};

export default HtmlLandingRedirect;
