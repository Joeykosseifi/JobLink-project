import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container" style={{ 
      textAlign: 'center', 
      padding: '50px 20px',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ marginBottom: '30px' }}>
        We're sorry, the page you requested could not be found.
      </p>
      <Link 
        to="/" 
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound; 