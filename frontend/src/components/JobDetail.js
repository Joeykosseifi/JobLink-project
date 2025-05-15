import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './JobDetail.css';
import { useNotification } from './NotificationContext';

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [cv, setCv] = useState(null);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentCompany: '',
    linkedInProfile: '',
    coverLetter: ''
  });

  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(response.data.data.job);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details. Please try again later.');
      showNotification('Failed to load job details. Please try again later.', 'error');
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleShareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href
      })
        .then(() => showNotification('Job shared successfully!', 'success'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => showNotification('Job URL copied to clipboard!', 'info'))
        .catch(() => showNotification('Failed to copy URL', 'error'));
    }
  };
  
  const handleShowApplicationForm = () => {
    setShowApplicationForm(true);
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.getElementById('application-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleApply = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !cv) {
      showNotification('Please fill all required fields and upload your CV', 'error');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }
    
    // Simple phone validation (allow digits, spaces, and some special chars)
    const phoneRegex = /^[0-9\s\-+()]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      showNotification('Please enter a valid phone number', 'error');
      return;
    }
    
    setIsApplying(true);
    
    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      
      // Check that ID is valid
      if (!id) {
        throw new Error('Job ID is missing');
      }
      
      // Add required fields
      formDataToSend.append('jobId', id);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      // Validate CV file
      if (!cv || !cv.name) {
        throw new Error('Please select a valid CV file');
      }
      
      // Check file size before uploading
      if (cv.size > 5 * 1024 * 1024) {
        throw new Error('CV file size exceeds 5MB limit');
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(cv.type)) {
        throw new Error('Only PDF and Word documents are accepted');
      }
      
      formDataToSend.append('cv', cv);
      formDataToSend.append('coverLetter', formData.coverLetter || '');
      
      // Add optional fields
      if (formData.currentCompany) formDataToSend.append('currentCompany', formData.currentCompany);
      if (formData.linkedInProfile) formDataToSend.append('linkedInProfile', formData.linkedInProfile);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('You must be logged in to apply for jobs', 'error');
        setIsApplying(false);
        return;
      }
      
      // Debug data being sent
      console.log('Submitting application with data:', {
        jobId: id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cvFileName: cv.name,
        cvFileSize: cv.size,
        cvFileType: cv.type
      });
      
      // Submit application to the backend API
      const response = await axios.post('http://localhost:5000/api/applications', 
        formDataToSend, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to submit application');
      }
      
      showNotification('Application submitted successfully!', 'success');
      setIsApplying(false);
      setCv(null);
      setShowApplicationForm(false);
      
      // Reset the form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        currentCompany: '',
        linkedInProfile: '',
        coverLetter: ''
      });
      
      // Find and reset the file input if it exists
      try {
      const fileInput = document.getElementById('cv-upload');
      if (fileInput) fileInput.value = '';
      } catch (err) {
        console.log('Could not reset file input:', err.message);
      }
      
    } catch (error) {
      console.error('Error submitting application:', error);
      // Extract the most useful error message
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      setIsApplying(false);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('File size exceeds 5MB limit', 'error');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Only PDF and Word documents are accepted', 'error');
        return;
      }
      
      setCv(file);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="job-detail-loading">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container">
        <div className="job-detail-error">
          <i className='bx bx-error-circle'></i>
          <h2>Error Loading Job</h2>
          <p>{error}</p>
          <button onClick={fetchJob} className="retry-btn">
            <i className='bx bx-refresh'></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="job-detail-not-found">
          <i className='bx bx-search-alt'></i>
          <h2>Job Not Found</h2>
          <p>The job you're looking for doesn't exist or has been removed.</p>
          <a href="/jobs" className="back-to-jobs-btn">
            <i className='bx bx-arrow-back'></i> Back to Jobs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      <div className="job-detail-card">
        <div className="job-detail-header">
          <div className="job-detail-company-info">
            {job.companyLogo ? (
              <div className="job-detail-logo">
                <img src={job.companyLogo} alt={job.company} />
              </div>
            ) : (
              <div className="job-detail-logo job-detail-logo-placeholder">
                <span>{job.company.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="job-detail-title">{job.title}</h1>
              <p className="job-detail-company">{job.company}</p>
            </div>
          </div>
          <div className="job-detail-meta">
            {job.urgent && <span className="job-detail-tag urgent">Urgent</span>}
            {job.featured && <span className="job-detail-tag featured">Featured</span>}
            {job.remote && <span className="job-detail-tag remote">Remote Option</span>}
          </div>
        </div>

        <div className="job-detail-info">
          <div className="job-info-block">
            <div className="job-info-item">
              <i className='bx bx-map'></i>
              <div>
                <h3>Location</h3>
                <p>{job.location}</p>
              </div>
            </div>
            <div className="job-info-item">
              <i className='bx bx-briefcase'></i>
              <div>
                <h3>Job Type</h3>
                <p>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</p>
              </div>
            </div>
            <div className="job-info-item">
              <i className='bx bx-category'></i>
              <div>
                <h3>Category</h3>
                <p>{job.category}</p>
              </div>
            </div>
            <div className="job-info-item">
              <i className='bx bx-user'></i>
              <div>
                <h3>Experience</h3>
                <p>{job.experience}</p>
              </div>
            </div>
            {job.salary && (
              <div className="job-info-item">
                <i className='bx bx-money'></i>
                <div>
                  <h3>Salary Range</h3>
                  <p>{job.salary}</p>
                </div>
              </div>
            )}
            {job.deadline && (
              <div className="job-info-item">
                <i className='bx bx-calendar'></i>
                <div>
                  <h3>Application Deadline</h3>
                  <p>{new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            <div className="job-info-item">
              <i className='bx bx-time'></i>
              <div>
                <h3>Posted On</h3>
                <p>{formatDate(job.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-content">
          <div className="job-detail-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </div>

          <div className="job-detail-section">
            <h2>Responsibilities</h2>
            <div className="job-detail-list">
              {job.responsibilities.split('\n').map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </div>

          <div className="job-detail-section">
            <h2>Requirements & Qualifications</h2>
            <div className="job-detail-list">
              {job.requirements.split('\n').map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </div>

          {job.benefits && (
            <div className="job-detail-section">
              <h2>Benefits & Perks</h2>
              <div className="job-detail-list">
                {job.benefits.split('\n').map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="job-detail-section">
              <h2>Skills & Keywords</h2>
              <div className="job-detail-skills">
                {job.skills.map((skill, index) => (
                  <span key={index} className="job-detail-skill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {(job.companyDescription || job.companyWebsite) && (
            <div className="job-detail-section company-section">
              <h2>About {job.company}</h2>
              {job.companyDescription && <p>{job.companyDescription}</p>}
              {job.companyWebsite && (
                <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="company-website-link">
                  <i className='bx bx-globe'></i> Visit Company Website
                </a>
              )}
            </div>
          )}
        </div>

        <div className="job-detail-application">
          <h2>How to Apply</h2>
          <div className="application-info">
            <div className="application-method">
              <i className='bx bx-envelope'></i>
              <div>
                <h3>Email</h3>
                <p><a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a></p>
              </div>
            </div>
            {job.contactPhone && (
              <div className="application-method">
                <i className='bx bx-phone'></i>
                <div>
                  <h3>Phone</h3>
                  <p><a href={`tel:${job.contactPhone}`}>{job.contactPhone}</a></p>
                </div>
              </div>
            )}
          </div>
          
          <div className="apply-online-section">
            {!showApplicationForm ? (
              <div className="apply-online-button-container">
                <h3>Quick Apply</h3>
                <p>Apply directly through our platform to get a faster response.</p>
                <button 
                  className="apply-now-btn"
                  onClick={handleShowApplicationForm}
                >
                  <i className='bx bx-send'></i> Apply Now
                </button>
              </div>
            ) : (
              <div id="application-form" className="application-form">
                <h3>Apply for {job.title} at {job.company}</h3>
                <form onSubmit={handleApply}>
                  <div className="form-section">
                    <h4>Personal Information</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input 
                          type="text" 
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input 
                          type="email" 
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input 
                          type="tel" 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="currentCompany">Current Company</label>
                        <input 
                          type="text" 
                          id="currentCompany"
                          name="currentCompany"
                          value={formData.currentCompany}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="linkedInProfile">LinkedIn Profile URL</label>
                      <input 
                        type="url" 
                        id="linkedInProfile"
                        name="linkedInProfile"
                        value={formData.linkedInProfile}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4>Application Materials</h4>
                    
                    <div className="form-group">
                      <label htmlFor="cv-upload" className="required-field">CV/Resume</label>
                      <div className="cv-upload-container">
                        <input
                          type="file"
                          id="cv-upload"
                          name="cv"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="cv-upload-input"
                          required
                        />
                        <div className="cv-upload-button">
                          <i className='bx bx-upload'></i>
                          <span>Choose File</span>
                        </div>
                        <span className="cv-file-name">{cv ? cv.name : 'No file chosen'}</span>
                      </div>
                      <small className="form-text">Max file size: 5MB. Accepted formats: PDF, DOC, DOCX</small>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="coverLetter">Cover Letter</label>
                      <textarea 
                        id="coverLetter"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="Explain why you are a good fit for this position..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="form-footer">
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={() => setShowApplicationForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="submit-application-btn" 
                        disabled={isApplying || !cv}
                      >
                        {isApplying ? (
                          <>
                            <div className="spinner-small"></div>
                            Applying...
                          </>
                        ) : (
                          <>
                            <i className='bx bx-send'></i> Submit Application
                          </>
                        )}
                      </button>
                    </div>
                    <p className="required-fields">* Required fields</p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="job-detail-actions">
          <a href="/jobs" className="back-to-jobs-btn">
            <i className='bx bx-arrow-back'></i> Back to Jobs
          </a>
          <button className="share-job-btn" onClick={handleShareJob}>
            <i className='bx bx-share-alt'></i> Share Job
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDetail; 