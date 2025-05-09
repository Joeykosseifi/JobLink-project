import React, { createContext, useState, useContext } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // 'success', 'error', 'warning', 'info'
  });

  // Function to show a notification
  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-hide the notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Function to hide notification
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification 
        notification={notification} 
        hideNotification={hideNotification} 
      />
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 