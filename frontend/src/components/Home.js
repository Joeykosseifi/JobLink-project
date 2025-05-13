import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showCtaBanner, setShowCtaBanner] = useState(false);
  const [ctaBannerClosed, setCtaBannerClosed] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [frequencyPreference, setFrequencyPreference] = useState('daily');
  const [alertSuccess, setAlertSuccess] = useState(false);
  
  // Live stats counters
  const [jobsCount, setJobsCount] = useState(0);
  const [seekersCount, setSeekersCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [liveStatsLoading, setLiveStatsLoading] = useState(true);
  const liveStatsRef = useRef(null);
  const countersStarted = useRef(false);
  
  // Ref for tracking scroll position
  const scrollRef = useRef(null);

  // Testimonials
  const testimonials = [
    {
      id: 1,
      text: "JobLink transformed our hiring process. We've found exceptional talent that perfectly fits our restaurant's culture and requirements.",
      name: "Sarah Haddad",
      position: "HR Director",
      company: "Le Bordeaux Restaurant",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      text: "As a chef looking to advance my career, JobLink connected me with opportunities I wouldn't have found elsewhere. The platform is intuitive and effective.",
      name: "Ahmad Khalil",
      position: "Executive Chef",
      company: "Phoenicia Hotel",
      avatar: "https://randomuser.me/api/portraits/men/35.jpg"
    },
    {
      id: 3,
      text: "The quality of candidates we receive through JobLink is consistently high. It's become our primary recruitment channel for hospitality positions.",
      name: "Maya Nassar",
      position: "Talent Acquisition Manager",
      company: "Beirut Luxury Hotels Group",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  // Animate counters with real data - define this first to avoid circular dependencies
  const animateCounters = useCallback((jobsTarget, seekersTarget, companiesTarget) => {
    const duration = 2000; // Animation duration in ms
    let startTime = null;
    
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setJobsCount(Math.floor(progress * jobsTarget));
      setSeekersCount(Math.floor(progress * seekersTarget));
      setCompaniesCount(Math.floor(progress * companiesTarget));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, []);
  
  // Fetch live stats from API - now with proper dependency on animateCounters
  const fetchLiveStats = useCallback(async () => {
    try {
      setLiveStatsLoading(true);
      const response = await axios.get('http://localhost:5000/api/stats');
      
      if (response.data && response.data.success) {
        const stats = response.data.data;
        // Use actual values from API, even if they're zero
        animateCounters(
          stats.jobs || 0, 
          stats.seekers || 0, 
          stats.companies || 0
        );
      } else {
        // If API format is unexpected, show zeros instead of fake data
        animateCounters(0, 0, 0);
      }
    } catch (error) {
      console.error('Error fetching live stats:', error);
      // If API fails, show zeros instead of fake data
      animateCounters(0, 0, 0);
    } finally {
      setLiveStatsLoading(false);
    }
  }, [animateCounters]);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoadingJobs(true);
        const response = await axios.get('http://localhost:5000/api/jobs');
        
        // Filter for featured jobs and limit to 6
        const featured = response.data.data.jobs
          .filter(job => job.featured)
          .slice(0, 6);
        
        // If there are fewer than 6 featured jobs, add some regular jobs
        if (featured.length < 6) {
          const regularJobs = response.data.data.jobs
            .filter(job => !job.featured)
            .slice(0, 6 - featured.length);
          
          setFeaturedJobs([...featured, ...regularJobs]);
        } else {
          setFeaturedJobs(featured);
        }
        
        setLoadingJobs(false);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
        setJobsError('Failed to load featured jobs');
        setLoadingJobs(false);
      }
    };

    fetchFeaturedJobs();
    
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    // Check if user has scrolled past a certain point
    const handleScroll = () => {
      if (ctaBannerClosed) return;
      
      // Show banner after scrolling past 25% of the page
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (scrollPosition > windowHeight * 0.25) {
        setShowCtaBanner(true);
      } else {
        setShowCtaBanner(false);
      }
      
      // Check if live stats section is in view to start counters
      if (liveStatsRef.current && !countersStarted.current) {
        const liveStatsTop = liveStatsRef.current.getBoundingClientRect().top;
        const liveStatsBottom = liveStatsRef.current.getBoundingClientRect().bottom;
        
        if (liveStatsTop < window.innerHeight && liveStatsBottom > 0) {
          fetchLiveStats();
          countersStarted.current = true;
        }
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check for visibility
    handleScroll();
    
    return () => {
      clearInterval(testimonialInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [testimonials.length, ctaBannerClosed, fetchLiveStats]);

  const handleButtonClick = (destination) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/signup');
    } else {
      navigate(destination);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchTerm}&location=${searchLocation}`);
  };
  
  const handleTestimonialDotClick = (index) => {
    setActiveTestimonial(index);
  };
  
  const handleCloseBanner = () => {
    setCtaBannerClosed(true);
    setShowCtaBanner(false);
  };
  
  const handleAlertEmailChange = (e) => {
    setAlertEmail(e.target.value);
  };
  
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const handleFrequencyChange = (e) => {
    setFrequencyPreference(e.target.value);
  };
  
  const handleAlertSignup = (e) => {
    e.preventDefault();
    
    // Here you would typically make an API call to save the alert preferences
    console.log({
      email: alertEmail,
      categories: selectedCategories,
      frequency: frequencyPreference
    });
    
    // Show success message
    setAlertSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setAlertEmail('');
      setSelectedCategories([]);
      setFrequencyPreference('daily');
      setAlertSuccess(false);
    }, 3000);
  };

  // Professional job categories
  const jobCategories = [
    { id: 1, title: 'Kitchen Operations', icon: 'bx bx-restaurant', count: 450 },
    { id: 2, title: 'Guest Services', icon: 'bx bx-user-voice', count: 380 },
    { id: 3, title: 'Hospitality Management', icon: 'bx bx-building-house', count: 320 },
    { id: 4, title: 'Event Planning', icon: 'bx bx-calendar', count: 210 },
    { id: 5, title: 'Food & Beverage', icon: 'bx bx-dish', count: 175 },
    { id: 6, title: 'Hospitality Technology', icon: 'bx bx-devices', count: 140 }
  ];

  // Industry statistics
  const stats = [
    { label: 'Open Positions', value: '2,500+' },
    { label: 'Partner Companies', value: '1,200+' },
    { label: 'Professionals Connected', value: '15,000+' },
    { label: 'Hiring Rate', value: '92%' }
  ];

  return (
    <div className="home-container" ref={scrollRef}>
      {/* Sticky CTA Banner */}
      {showCtaBanner && (
        <div className="sticky-cta-banner">
          <div className="cta-banner-content">
            <div className="cta-banner-text">
              <h3>Ready to advance your hospitality career?</h3>
              <p>Join thousands of professionals finding their perfect job match.</p>
            </div>
            <div className="cta-banner-buttons">
              <button onClick={() => navigate('/signup')} className="cta-button signup-button">
                Create Account
              </button>
              <button onClick={() => navigate('/postjob')} className="cta-button post-job-cta-button">
                Post a Job
              </button>
            </div>
          </div>
          <button className="cta-banner-close" onClick={handleCloseBanner}>
            <i className='bx bx-x'></i>
          </button>
        </div>
      )}
      
      {/* Modern Hero Section with Search */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Connecting Hospitality Professionals</h1>
          <p>Find your next career opportunity in Lebanon's hospitality industry</p>
          
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-inputs">
              <div className="search-input-group">
                <i className='bx bx-search'></i>
                <input 
                  type="text" 
                  placeholder="Job title or keyword" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="search-input-group">
                <i className='bx bx-map'></i>
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="search-button">Find Jobs</button>
            </div>
          </form>
          
          <div className="home-buttons">
            <button 
              onClick={() => handleButtonClick('/postjob')} 
              className="action-button post-job-button"
            >
              Post a Job
            </button>
            <button 
              onClick={() => handleButtonClick('/jobs')} 
              className="action-button search-jobs-button"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Live Job Stats Section */}
      <section className="live-stats-section" ref={liveStatsRef}>
        <div className="live-stats-container">
          <div className="live-stats-header">
            <h2>Platform Activity</h2>
            <div className="live-indicator">
              <span className="pulse-dot"></span>
              Live
            </div>
          </div>
          {liveStatsLoading ? (
            <div className="live-stats-loading">
              <div className="spinner"></div>
              <p>Loading live statistics...</p>
            </div>
          ) : (
            <div className="live-stats-grid">
              <div className="live-stat-card">
                <div className="live-stat-icon">
                  <i className='bx bx-briefcase'></i>
                </div>
                <div className="live-stat-count">{jobsCount}</div>
                <div className="live-stat-label">Jobs Posted</div>
              </div>
              <div className="live-stat-card">
                <div className="live-stat-icon">
                  <i className='bx bx-user-plus'></i>
                </div>
                <div className="live-stat-count">{seekersCount}</div>
                <div className="live-stat-label">Job Seekers</div>
              </div>
              <div className="live-stat-card">
                <div className="live-stat-icon">
                  <i className='bx bx-building-house'></i>
                </div>
                <div className="live-stat-count">{companiesCount}</div>
                <div className="live-stat-label">Companies Hiring</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Key Metrics Section */}
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

      {/* Featured Jobs Section */}
      <section className="featured-jobs-section">
        <div className="section-header">
          <h2>Featured Opportunities</h2>
          <p>Discover top positions in Lebanon's hospitality sector</p>
        </div>
        
        {loadingJobs ? (
          <div className="featured-jobs-loading">
            <div className="spinner"></div>
            <p>Loading featured jobs...</p>
          </div>
        ) : jobsError ? (
          <div className="featured-jobs-error">
            <i className='bx bx-error-circle'></i>
            <p>{jobsError}</p>
          </div>
        ) : (
          <div className="featured-jobs-container">
            {featuredJobs.length > 0 ? (
              featuredJobs.slice(0, 3).map(job => (
                <div key={job._id} className="job-card" onClick={() => handleJobClick(job._id)}>
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    {job.featured && <div className="job-badge featured">Featured</div>}
                    {job.urgent && <div className="job-badge urgent">Urgent</div>}
                  </div>
                  <div className="job-company">{job.company}</div>
                  <div className="job-details">
                    <span className="job-location">
                      <i className='bx bx-map'></i> {job.location}
                    </span>
                    <span className="job-type">
                      <i className='bx bx-briefcase'></i> {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                    </span>
                    {job.salary && (
                      <span className="job-salary">
                        <i className='bx bx-dollar'></i> {job.salary}
                      </span>
                    )}
                  </div>
                  <button className="apply-button">View Details</button>
                </div>
              ))
            ) : (
              <div className="no-jobs-message">
                <i className='bx bx-info-circle'></i>
                <p>No featured jobs available currently.</p>
              </div>
            )}
          </div>
        )}
        
        <button className="see-all-button" onClick={() => handleButtonClick('/jobs')}>
          See All Jobs
        </button>
      </section>

      {/* Job Categories Section */}
      <section className="job-categories-section">
        <div className="section-header">
          <h2>Explore by Category</h2>
          <p>Discover opportunities across major hospitality sectors</p>
        </div>
        <div className="categories-container">
          <div className="categories-scroll-wrapper">
            {jobCategories.map(category => (
              <div key={category.id} className="category-card" onClick={() => handleButtonClick('/jobs')}>
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <h3>{category.title}</h3>
                <div className="category-count">{category.count} jobs</div>
              </div>
            ))}
            {/* Duplicate for seamless infinite scroll */}
            {jobCategories.map(category => (
              <div key={`dup-${category.id}`} className="category-card" onClick={() => handleButtonClick('/jobs')}>
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <h3>{category.title}</h3>
                <div className="category-count">{category.count} jobs</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Job Alerts Signup Section */}
      <section className="job-alerts-section">
        <div className="alerts-container">
          <div className="alerts-content">
            <div className="alerts-header">
              <div className="alerts-icon">
                <i className='bx bx-bell'></i>
              </div>
              <div>
                <h2>Stay Ahead with Job Alerts</h2>
                <p>Get personalized job notifications delivered straight to your inbox</p>
              </div>
            </div>
            
            {alertSuccess ? (
              <div className="alert-success">
                <i className='bx bx-check-circle'></i>
                <p>Thank you! Your job alert preferences have been saved.</p>
              </div>
            ) : (
              <form className="alerts-form" onSubmit={handleAlertSignup}>
                <div className="alerts-form-row">
                  <div className="alert-input-group">
                    <label htmlFor="alertEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="alertEmail"
                      placeholder="Enter your email" 
                      value={alertEmail}
                      onChange={handleAlertEmailChange}
                      required
                    />
                  </div>
                  
                  <div className="alert-input-group">
                    <label>Alert Frequency</label>
                    <select 
                      value={frequencyPreference} 
                      onChange={handleFrequencyChange}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="instant">Instant</option>
                    </select>
                  </div>
                </div>
                
                <div className="alert-categories">
                  <label>Select Job Categories (Choose at least one)</label>
                  <div className="category-checkboxes">
                    {jobCategories.map(category => (
                      <div key={category.id} className="category-checkbox">
                        <input 
                          type="checkbox" 
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                        />
                        <label htmlFor={`category-${category.id}`}>
                          <i className={category.icon}></i>
                          {category.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="alerts-form-footer">
                  <p className="alert-privacy">We respect your privacy and will only send relevant job opportunities.</p>
                  <button type="submit" className="alert-submit-button" disabled={selectedCategories.length === 0 || !alertEmail}>
                    Create Job Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonials Slider Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Hear from employers and job seekers who've found success with JobLink</p>
        </div>
        
        <div className="testimonials-slider">
          <div className="testimonials-wrapper" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-slide">
                <div className="testimonial-content">
                  <div className="testimonial-quote">
                    <i className='bx bxs-quote-alt-left quote-icon'></i>
                    <p>{testimonial.text}</p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img src={testimonial.avatar} alt={testimonial.name} />
                    </div>
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.position}</p>
                      <p className="company">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => handleTestimonialDotClick(index)}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us-section">
        <div className="section-header">
          <h2>Why Choose JobLink</h2>
          <p>The leading hospitality recruitment platform in Lebanon</p>
        </div>
        
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <i className='bx bx-check-shield'></i>
            </div>
            <h3>Verified Employers</h3>
            <p>All employers on our platform are thoroughly vetted to ensure legitimacy and quality.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className='bx bx-time'></i>
            </div>
            <h3>Real-time Updates</h3>
            <p>Receive instant notifications about new opportunities matching your profile.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className='bx bx-trending-up'></i>
            </div>
            <h3>Career Growth</h3>
            <p>Connect with employers who value professional development and advancement.</p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2>Stay Updated on New Opportunities</h2>
            <p>Subscribe to receive job alerts tailored to your professional interests</p>
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

