import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleButtonClick = (destination) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If not logged in, redirect to sign up
      navigate('/signup');
    } else {
      // If logged in, navigate to the respective component
      navigate(destination);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to JobLink</h1>
      <p>Connect with opportunities</p>
      <div className="home-buttons">
        <button 
          onClick={() => handleButtonClick('/postjob')} 
          className="action-button post-job-button"
        >
          Post a Job
        </button>
        <button 
          onClick={() => handleButtonClick('/jobseeker')} 
          className="action-button search-jobs-button"
        >
          Search for Jobs
        </button>
      </div>
    </div>
  );
}

export default Home;

