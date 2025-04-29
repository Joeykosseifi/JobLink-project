import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
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

  // Job categories data
  const jobCategories = [
    { 
      id: 1, 
      title: 'Kitchen Staff', 
      icon: 'bx bx-bowl-hot',
      description: 'Chef, Line Cook, Pastry Chef', 
      count: 450 
    },
    { 
      id: 2, 
      title: 'Restaurant Service', 
      icon: 'bx bx-restaurant',
      description: 'Waiter, Host, Sommelier', 
      count: 380 
    },
    { 
      id: 3, 
      title: 'Hotel Operations', 
      icon: 'bx bx-hotel',
      description: 'Front Desk, Concierge, Housekeeping', 
      count: 320 
    },
    { 
      id: 4, 
      title: 'Catering & Events', 
      icon: 'bx bx-calendar-event',
      description: 'Event Planner, Catering Manager', 
      count: 210 
    },
    { 
      id: 5, 
      title: 'Bar Service', 
      icon: 'bx bx-drink',
      description: 'Bartender, Barista, Barback', 
      count: 175 
    },
    { 
      id: 6, 
      title: 'Food Delivery', 
      icon: 'bx bx-cycling',
      description: 'Driver, Dispatcher, Coordinator', 
      count: 140 
    },
    { 
      id: 7, 
      title: 'Cafe & Coffee Shops', 
      icon: 'bx bx-coffee', 
      description: 'Barista, Counter Staff, Baker',
      count: 165 
    },
    { 
      id: 8, 
      title: 'Resort & Leisure', 
      icon: 'bx bx-spa',
      description: 'Spa Therapist, Recreation Staff', 
      count: 120 
    }
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      id: 1,
      title: 'Create an Account',
      description: 'Sign up as a job seeker or employer with your details',
      icon: 'bx bx-user-plus'
    },
    {
      id: 2,
      title: 'Complete Your Profile',
      description: 'Add your experience, skills, and preferences',
      icon: 'bx bx-edit'
    },
    {
      id: 3,
      title: 'Search & Apply',
      description: 'Browse jobs, or post opportunities, and connect',
      icon: 'bx bx-search-alt'
    },
    {
      id: 4,
      title: 'Get Hired',
      description: 'Interview and land your ideal hospitality position',
      icon: 'bx bx-check-circle'
    }
  ];

  // Top employers
  const topEmployers = [
    { id: 1, name: 'Phoenicia Hotel', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Phoenicia_Hotel_Beirut_Logo.svg/320px-Phoenicia_Hotel_Beirut_Logo.svg.png' },
    { id: 2, name: 'Em Sherif', logo: 'https://emsherif.com/assets/img/logo-dark.png' },
    { id: 3, name: 'Le Gray Hotel', logo: 'https://www.legray.com/images/logo.png' },
    { id: 4, name: 'Babel', logo: 'https://babel.com.lb/images/logo.png' },
    { id: 5, name: 'Beirut Marriott', logo: 'https://www.marriott.com/images/logo.png' },
    { id: 6, name: 'Casper & Gambini\'s', logo: 'https://caspergambinis.com/images/logo.png' }
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

      <section className="job-categories-section">
        <div className="section-header">
          <h2>Explore Job Categories</h2>
          <p>Browse jobs across Lebanon's top hospitality sectors</p>
        </div>
        <div className="categories-container">
          {jobCategories.map(category => (
            <div key={category.id} className="category-card" onClick={() => handleButtonClick('/jobs')}>
              <div className="category-icon">
                <i className={category.icon}></i>
              </div>
              <h3>{category.title}</h3>
              <p className="category-description">{category.description}</p>
              <div className="category-count">{category.count} jobs</div>
            </div>
          ))}
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

      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How JobLink Works</h2>
          <p>Your path to success in Lebanon's hospitality industry</p>
        </div>
        <div className="steps-container">
          {howItWorksSteps.map(step => (
            <div key={step.id} className="step-card">
              <div className="step-icon">
                <i className={step.icon}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
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

      <section className="top-employers-section">
        <div className="section-header">
          <h2>Top Hospitality Employers</h2>
          <p>Leading establishments in Lebanon's food service and accommodation sectors</p>
        </div>
        <div className="employers-container">
          {topEmployers.map(employer => (
            <div key={employer.id} className="employer-card">
              <div className="employer-logo">
                <i className="bx bx-building-house"></i>
              </div>
              <h3>{employer.name}</h3>
            </div>
          ))}
        </div>
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

      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2>Stay Updated on Hospitality Opportunities</h2>
            <p>Subscribe to receive job alerts and industry news from Lebanon's restaurant and hotel sectors</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={handleEmailChange}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

