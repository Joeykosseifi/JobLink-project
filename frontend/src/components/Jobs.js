import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Jobs.css';
import { useNotification } from './NotificationContext';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    location: '',
    experience: '',
    remote: false
  });
  const [savedJobs, setSavedJobs] = useState([]);
  const { showNotification } = useNotification();
  const [showSaved, setShowSaved] = useState(false);

  // Job categories for filter
  const jobCategories = [
    { value: '', label: 'All Categories' },
    { value: 'kitchen-staff', label: 'Kitchen Staff' },
    { value: 'restaurant-service', label: 'Restaurant Service' },
    { value: 'hotel-operations', label: 'Hotel Operations' },
    { value: 'catering-events', label: 'Catering & Events' },
    { value: 'bar-service', label: 'Bar Service' },
    { value: 'food-delivery', label: 'Food Delivery' },
    { value: 'cafe-coffee', label: 'Cafe & Coffee Shops' },
    { value: 'resort-leisure', label: 'Resort & Leisure' }
  ];

  // Job types for filter
  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'temporary', label: 'Temporary' }
  ];

  // Experience levels for filter
  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'manager', label: 'Manager/Director' },
    { value: 'executive', label: 'Executive' }
  ];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.experience) queryParams.append('experience', filters.experience);
      if (filters.remote) queryParams.append('remote', 'true');

      const response = await axios.get(`http://localhost:5000/api/jobs?${queryParams}`);
      setJobs(response.data.data.jobs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Fetch saved jobs for the logged-in user
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/users/saved-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setSavedJobs(res.data.savedJobs.map(job => job._id));
        })
        .catch(() => setSavedJobs([]));
    }
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSaveJob = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to save jobs.', 'warning');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/users/save-job', { jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(prev => [...prev, jobId]);
    } catch (err) {
      showNotification('Failed to save job.', 'error');
    }
  };

  const handleUnsaveJob = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to unsave jobs.', 'warning');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/users/unsave-job', { jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(prev => prev.filter(id => id !== jobId));
    } catch (err) {
      showNotification('Failed to unsave job.', 'error');
    }
  };

  return (
    <div className="jobs-container">
      <h1>{showSaved ? 'Saved Jobs' : 'Available Jobs'}</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        {!showSaved ? (
          <button className="job-view-saved-btn" onClick={() => setShowSaved(true)}>
            <i className="fas fa-bookmark"></i> View Saved Jobs
          </button>
        ) : (
          <button className="job-view-saved-btn" onClick={() => setShowSaved(false)}>
            <i className="fas fa-arrow-left"></i> Back to All Jobs
          </button>
        )}
      </div>
      <div className="jobs-filter-bar" style={{ display: showSaved ? 'none' : undefined }}>
        <div className="filter-group">
          <select 
            name="category" 
            value={filters.category} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            {jobCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            name="type" 
            value={filters.type} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            {jobTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            name="experience" 
            value={filters.experience} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            {experienceLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-checkbox">
          <input
            type="checkbox"
            id="remote"
            name="remote"
            checked={filters.remote}
            onChange={handleFilterChange}
          />
          <label htmlFor="remote">Remote Jobs</label>
        </div>

        <div className="filter-group filter-search">
          <input
            type="text"
            name="location"
            placeholder="Location..."
            value={filters.location}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="jobs-loading">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : error ? (
        <div className="jobs-error">
          <i className='bx bx-error-circle'></i>
          <p>{error}</p>
        </div>
      ) : (showSaved ? (
        <div className="jobs-grid">
          {jobs.filter(job => savedJobs.includes(job._id)).length === 0 ? (
        <div className="jobs-empty">
              <i className='fas fa-bookmark'></i>
              <p>You have no saved jobs.</p>
            </div>
          ) : (
            jobs.filter(job => savedJobs.includes(job._id)).map(job => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  {job.companyLogo ? (
                    <div className="job-logo">
                      <img src={job.companyLogo} alt={job.company} />
                    </div>
                  ) : (
                    <div className="job-logo job-logo-placeholder">
                      <span>{job.company.charAt(0)}</span>
                    </div>
                  )}
                  <div className="job-meta">
                    {job.urgent && <span className="job-tag urgent">Urgent</span>}
                    {job.featured && <span className="job-tag featured">Featured</span>}
                    {job.remote && <span className="job-tag remote">Remote</span>}
                  </div>
                </div>
                <div className="job-card-body">
                  <h2 className="job-title">{job.title}</h2>
                  <p className="job-company">{job.company}</p>
                  <div className="job-details">
                    <div className="job-detail">
                      <i className='bx bx-map'></i>
                      <span>{job.location}</span>
                    </div>
                    <div className="job-detail">
                      <i className='bx bx-briefcase'></i>
                      <span>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</span>
                    </div>
                    {job.salary && (
                      <div className="job-detail">
                        <i className='bx bx-money'></i>
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="job-skills">
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="job-skill">{skill}</span>
                      ))}
                      {job.skills.length > 4 && <span className="job-skill-more">+{job.skills.length - 4}</span>}
                    </div>
                  )}
                </div>
                <div className="job-card-footer">
                  <div className="job-posted">
                    <i className='bx bx-calendar'></i>
                    <span>{formatDate(job.createdAt)}</span>
                  </div>
                  <a href={`/jobs/${job._id}`} className="job-view-btn">View Details</a>
                  <button className="job-save-btn saved" onClick={() => handleUnsaveJob(job._id)} title="Unsave Job" aria-label="Unsave Job">
                    <i className="fas fa-bookmark"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                {job.companyLogo ? (
                  <div className="job-logo">
                    <img src={job.companyLogo} alt={job.company} />
                  </div>
                ) : (
                  <div className="job-logo job-logo-placeholder">
                    <span>{job.company.charAt(0)}</span>
                  </div>
                )}
                <div className="job-meta">
                  {job.urgent && <span className="job-tag urgent">Urgent</span>}
                  {job.featured && <span className="job-tag featured">Featured</span>}
                  {job.remote && <span className="job-tag remote">Remote</span>}
                </div>
              </div>
              
              <div className="job-card-body">
                <h2 className="job-title">{job.title}</h2>
                <p className="job-company">{job.company}</p>
                
                <div className="job-details">
                  <div className="job-detail">
                    <i className='bx bx-map'></i>
                    <span>{job.location}</span>
                  </div>
                  <div className="job-detail">
                    <i className='bx bx-briefcase'></i>
                    <span>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</span>
                  </div>
                  {job.salary && (
                    <div className="job-detail">
                      <i className='bx bx-money'></i>
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
                
                {job.skills && job.skills.length > 0 && (
                  <div className="job-skills">
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className="job-skill">{skill}</span>
                    ))}
                    {job.skills.length > 4 && <span className="job-skill-more">+{job.skills.length - 4}</span>}
                  </div>
                )}
              </div>
              
              <div className="job-card-footer">
                <div className="job-posted">
                  <i className='bx bx-calendar'></i>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
                <a href={`/jobs/${job._id}`} className="job-view-btn">View Details</a>
                {savedJobs.includes(job._id) ? (
                  <button className="job-save-btn saved" onClick={() => handleUnsaveJob(job._id)} title="Unsave Job" aria-label="Unsave Job">
                    <i className="fas fa-bookmark"></i>
                  </button>
                ) : (
                  <button className="job-save-btn" onClick={() => handleSaveJob(job._id)} title="Save Job" aria-label="Save Job">
                    <i className="far fa-bookmark"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Jobs; 