import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/login';
import SignUp from './components/SignUp';
import AboutUs from './components/AboutUs';
import Jobs from './components/Jobs';
import ContactUs from './components/ContactUs';
import JobSeeker from './components/JobSeeker';
import PostJob from './components/PostJob';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/jobseeker" element={<JobSeeker />} />
          <Route path="/postjob" element={<PostJob />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
