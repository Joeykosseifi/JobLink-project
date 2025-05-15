import React, { useEffect, useState } from 'react';
import './SubscriptionNotification.css';

const SubscriptionNotification = () => {
  const [visible, setVisible] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: null,
    expiryDate: null
  });

  useEffect(() => {
    // Check if we need to show the notification
    const checkSubscriptionNotification = () => {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      // If user is not logged in or is an admin, hide notification
      if (!token || !userData || !userData.subscriptionPlan || userData.role === 'admin') {
        setVisible(false);
        // Clear notification data when logged out
        localStorage.removeItem('subscriptionNotification');
        return;
      }
      
      // Get the current plan from user data (this ensures we always show the current plan)
      const currentPlan = userData.subscriptionPlan;
      
      // Get any stored notification data
      const storedNotification = JSON.parse(localStorage.getItem('subscriptionNotification') || 'null');
      const currentTime = new Date().getTime();
      
      // If the stored notification is for a different plan, update it
      if (!storedNotification || storedNotification.plan !== currentPlan) {
        console.log(`Updating subscription notification: ${currentPlan} plan`);
        
        // Create a new notification with 1 month expiry
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        const newNotification = {
          plan: currentPlan,
          expiryDate: expiryDate.getTime(),
          userId: userData.id || userData._id // Store user ID to detect user changes
        };
        
        // Store in localStorage and state
        localStorage.setItem('subscriptionNotification', JSON.stringify(newNotification));
        setSubscriptionData(newNotification);
        setVisible(true);
      } 
      // If we have a valid notification for the same user and plan that hasn't expired
      else if (storedNotification.expiryDate > currentTime) {
        // Check if user has changed
        const currentUserId = userData.id || userData._id;
        if (storedNotification.userId !== currentUserId) {
          // Different user, update the notification
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          
          const newNotification = {
            plan: currentPlan,
            expiryDate: expiryDate.getTime(),
            userId: currentUserId
          };
          
          localStorage.setItem('subscriptionNotification', JSON.stringify(newNotification));
          setSubscriptionData(newNotification);
        } else {
          // Same user, use stored notification
          setSubscriptionData(storedNotification);
        }
        setVisible(true);
      }
    };
    
    // Check on component mount and whenever localStorage 'user' changes
    checkSubscriptionNotification();
    
    // Setup event listener for storage changes (if user logs in in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkSubscriptionNotification();
      }
    };
    
    // Custom event for when user logs in, out, or changes subscription
    const handleUserStateChanged = () => {
      // Short timeout to ensure localStorage is updated first
      setTimeout(checkSubscriptionNotification, 50);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStateChanged', handleUserStateChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStateChanged', handleUserStateChanged);
    };
  }, []);
  
  const handleClose = () => {
    setVisible(false);
  };
  
  if (!visible) return null;
  
  const getNotificationContent = () => {
    switch(subscriptionData.plan) {
      case 'free':
        return {
          text: 'Upgrade your plan',
          className: 'subscription-free',
          linkTo: '/pricing'
        };
      case 'premium':
        return {
          text: 'Premium Plan',
          className: 'subscription-premium',
          linkTo: null
        };
      case 'business':
        return {
          text: 'Business Plan',
          className: 'subscription-business',
          linkTo: null
        };
      default:
        return {
          text: 'Upgrade your plan',
          className: 'subscription-free',
          linkTo: '/pricing'
        };
    }
  };
  
  const content = getNotificationContent();
  
  return (
    <div className={`subscription-notification ${content.className}`}>
      {content.linkTo ? (
        <a href={content.linkTo} className="subscription-text">{content.text}</a>
      ) : (
        <span className="subscription-text">{content.text}</span>
      )}
      <button className="subscription-close" onClick={handleClose}>
        <i className="bx bx-x"></i>
      </button>
    </div>
  );
};

export default SubscriptionNotification; 