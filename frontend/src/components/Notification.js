import React from 'react';
import './Notification.css';

const Notification = ({ notification, hideNotification }) => {
  if (!notification.show) return null;
  
  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
          {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
          {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
          {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
        </div>
        <div className="notification-message">{notification.message}</div>
      </div>
      <button className="notification-close" onClick={hideNotification}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification; 