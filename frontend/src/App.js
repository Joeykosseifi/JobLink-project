import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/login';
import SignUp from './components/SignUp';
import AboutUs from './components/AboutUs';
import Jobs from './components/Jobs';
import JobDetail from './components/JobDetail';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import MyNetwork from './components/MyNetwork';
import ProtectedRoute from './components/ProtectedRoute';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

import PostJob from './components/PostJob';
import AdminDashboard from './components/AdminDashboard';
import AdminMessages from './components/AdminMessages';
import AdminAnalytics from './components/AdminAnalytics';
import AdminApplications from './components/AdminApplications';
import UserAccount from './components/UserAccount';
import Settings from './components/Settings';
import './App.css';
import ScrollToTop from './components/ScrollToTop';

// Helper component to conditionally render footer
const AppContent = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Don't show footer on admin, signup, or login pages
  const hideFooter = 
    path.includes('/admin') || 
    path === '/signup' || 
    path === '/login';

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        {/* Network route is now protected and not accessible to admins */}
        <Route path="/network" element={
          <ProtectedRoute 
            element={<MyNetwork />} 
            adminAllowed={false} 
          />
        } />
        <Route path="/postjob" element={<PostJob />} />
        {/* Admin routes are only accessible to admins */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute 
            element={<AdminDashboard />} 
            nonAdminAllowed={false} 
          />
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute 
            element={<AdminDashboard activeTab="users" />} 
            nonAdminAllowed={false} 
          />
        } />
        <Route path="/admin/jobs" element={
          <ProtectedRoute 
            element={<AdminDashboard activeTab="jobs" />} 
            nonAdminAllowed={false} 
          />
        } />
        <Route path="/admin/messages" element={
          <ProtectedRoute 
            element={<AdminMessages />} 
            nonAdminAllowed={false} 
          />
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute 
            element={<AdminAnalytics />} 
            nonAdminAllowed={false} 
          />
        } />
        <Route path="/admin/applications" element={
          <ProtectedRoute 
            element={<AdminApplications />} 
            nonAdminAllowed={false} 
          />
        } />
        <Route path="/user/account" element={<UserAccount />} />
        <Route path="/settings" element={<Settings />} />
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
