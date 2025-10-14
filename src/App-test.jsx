import React from 'react';

function AppTest() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    }}>
      <div>
        <h1>✅ React is Working!</h1>
        <p>If you see this, React is loaded correctly.</p>
      </div>
    </div>
  );
}

export default AppTest;
