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
  const { showNotification } = useNotification();

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