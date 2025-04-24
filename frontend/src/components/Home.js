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

  // Sample featured jobs data
  const featuredJobs = [
    {
      id: 1,
      title: 'Executive Chef',
      company: 'Gastronomy Heights Restaurant',
      location: 'Beirut, Lebanon',
      type: 'Full-time'
    },
    {
      id: 2,
      title: 'Restaurant Manager',
      company: 'The Golden Fork Bistro',
      location: 'Jounieh, Lebanon',
      type: 'Full-time'
    },
    {
      id: 3,
      title: 'Hotel Concierge',
      company: 'Grand Plaza Hotel',
      location: 'Byblos, Lebanon',
      type: 'Full-time'
    },
    {
      id: 4,
      title: 'Sous Chef',
      company: 'Ocean Breeze Restaurant',
      location: 'Tripoli, Lebanon',
      type: 'Full-time'
    },
    {
      id: 5,
      title: 'Bartender',
      company: 'Urban Cocktail Lounge',
      location: 'Batroun, Lebanon',
      type: 'Part-time'
    },
    {
      id: 6,
      title: 'Event Coordinator',
      company: 'Luxury Resort & Spa',
      location: 'Sidon, Lebanon',
      type: 'Full-time'
    }
  ];

  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Software Developer',
      text: 'JobLink helped me find my dream job within weeks! The platform is intuitive and connects you with quality employers.',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      role: 'HR Manager',
      text: 'As a recruiter, JobLink makes it easy to find qualified candidates. The filtering options save us so much time!',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  ];

  // Statistics data
  const stats = [
    { label: 'Active Jobs', value: '2,500+' },
    { label: 'Companies', value: '1,200+' },
    { label: 'Job Seekers', value: '15,000+' },
    { label: 'Success Rate', value: '92%' }
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
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
      </section>

      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-jobs-section">
        <h2>Featured Hospitality & Restaurant Jobs</h2>
        <div className="featured-jobs-container">
          {featuredJobs.map(job => (
            <div key={job.id} className="job-card" onClick={() => handleButtonClick('/jobs')}>
              <h3>{job.title}</h3>
              <div className="job-company">{job.company}</div>
              <div className="job-details">
                <span className="job-location">
                  <i className='bx bx-map'></i> {job.location}
                </span>
                <span className="job-type">
                  <i className='bx bx-briefcase'></i> {job.type}
                </span>
              </div>
              <button className="apply-button">View Details</button>
            </div>
          ))}
        </div>
        <button className="see-all-button" onClick={() => handleButtonClick('/jobs')}>
          See All Jobs
        </button>
      </section>

      <section className="testimonials-section">
        <h2>What People Say</h2>
        <div className="testimonials-container">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-avatar">
                <img src={testimonial.avatar} alt={testimonial.name} />
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

