import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from './NotificationContext';

const NotFound = ({ customMessage }) => {
  const { showNotification } = useNotification();
  const notificationShown = useRef(false);

  useEffect(() => {
    // Only show the notification if it hasn't been shown already
    if (!notificationShown.current) {
      const notificationMessage = customMessage || 
        'Page not found. The URL you are trying to access does not exist.';
      
      showNotification(notificationMessage, 'error');
      
      // Mark that we've shown the notification
      notificationShown.current = true;
    }
  }, [showNotification, customMessage]);

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
        {customMessage || "We're sorry, the page you requested could not be found."}
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