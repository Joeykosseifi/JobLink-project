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
        <Route path="/network" element={<MyNetwork />} />
        <Route path="/postjob" element={<PostJob />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard activeTab="users" />} />
        <Route path="/admin/jobs" element={<AdminDashboard activeTab="jobs" />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
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
