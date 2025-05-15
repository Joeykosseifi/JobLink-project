import React from 'react';
import { Navigate } from 'react-router-dom';
import NotFound from './NotFound';

// Create a custom AccessDenied component with specific error messages
const AccessDenied = ({ message }) => {
  return <NotFound customMessage={message} />;
};

// Component to handle route protection based on user roles
const ProtectedRoute = ({ 
  element, 
  adminAllowed = true, 
  nonAdminAllowed = true,
  requiredRole = null,
  allowNoRole = false
}) => {
  // Check if user is logged in by looking for token
  const token = localStorage.getItem('token');
  if (!token) {
    // If not logged in, redirect to login
    return <Navigate to="/login" />;
  }

  // Get user data from localStorage
  try {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    const isAdmin = user.role === 'admin';
    
    // If user is admin and admin is not allowed for this route
    if (isAdmin && !adminAllowed) {
      // Show 404 with custom message for admin trying to access non-admin routes
      return <AccessDenied message="Administrators don't have access to this page" />;
    }
    
    // If user is not admin and non-admin is not allowed for this route
    if (!isAdmin && !nonAdminAllowed) {
      // Show 404 with custom message for non-admin trying to access admin-only routes
      return <AccessDenied message="You don't have permission to access this admin area" />;
    }
    
    // Check for required role if specified
    if (requiredRole && !isAdmin) {
      // If role matches or no role is allowed and user has no role
      const hasRequiredRole = user.jobRole === requiredRole;
      const hasNoRoleAndAllowed = !user.jobRole && allowNoRole;
      
      if (!hasRequiredRole && !hasNoRoleAndAllowed) {
        return <AccessDenied message={`This page is only accessible to users with ${requiredRole} role`} />;
      }
    }
    
    // Otherwise, render the requested component
    return element;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute; 