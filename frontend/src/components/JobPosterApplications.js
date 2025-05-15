import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext';
import './JobPosterApplications.css';

function JobPosterApplications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const { showNotification } = useNotification();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Verify user has correct role
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.jobRole !== 'job-poster' && user.role !== 'admin') {
          throw new Error('You do not have permission to view job applications');
        }
      }

      const response = await axios.get('http://localhost:5000/api/applications/posted-jobs-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJobsWithApplications(response.data.data.jobsWithApplications || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error.message || 'Failed to fetch applications');
      showNotification(error.message || 'Failed to fetch applications', 'error');
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleJobExpand = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'status-badge pending';
      case 'reviewed': return 'status-badge reviewed';
      case 'interviewed': return 'status-badge interviewed';
      case 'offered': return 'status-badge offered';
      case 'hired': return 'status-badge hired';
      case 'rejected': return 'status-badge rejected';
      default: return 'status-badge';
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.patch(`http://localhost:5000/api/admin/applications/${applicationId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state
      const updatedJobs = jobsWithApplications.map(jobItem => ({
        ...jobItem,
        applications: jobItem.applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      }));

      setJobsWithApplications(updatedJobs);
      showNotification(`Application status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating application status:', error);
      showNotification(error.message || 'Failed to update application status', 'error');
    }
  };

  const downloadResume = (resumePath, applicantName) => {
    try {
      // Create a safe filename
      const safeName = applicantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const downloadUrl = `http://localhost:5000/${resumePath}`;
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${safeName}_resume`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      showNotification('Could not download resume', 'error');
    }
  };

  const contactApplicant = (email) => {
    window.location.href = `mailto:${email}`;
  };

  if (loading) {
    return (
      <div className="job-poster-applications-container">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-poster-applications-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchApplications} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-poster-applications-container">
      <h2 className="section-title">
        Applications for Your Job Postings
      </h2>

      {jobsWithApplications.length === 0 ? (
        <div className="no-applications-message">
          <p>No applications have been submitted to your job postings yet.</p>
          <a href="/post-job" className="post-job-link">Post a New Job</a>
        </div>
      ) : (
        <div className="jobs-list">
          {jobsWithApplications.map((jobItem) => (
            <div key={jobItem.job.id} className="job-applications-card">
              <div 
                className="job-header" 
                onClick={() => toggleJobExpand(jobItem.job.id)}
              >
                <div className="job-info">
                  <h3>{jobItem.job.title}</h3>
                  <p>{jobItem.job.company}</p>
                </div>
                <div className="job-applications-count">
                  <span className="count">{jobItem.count}</span>
                  <span className="label">{jobItem.count === 1 ? 'Application' : 'Applications'}</span>
                  <span className={`expand-icon ${expandedJobId === jobItem.job.id ? 'expanded' : ''}`}>
                    &#9662;
                  </span>
                </div>
              </div>

              {expandedJobId === jobItem.job.id && (
                <div className="applications-list">
                  {jobItem.applications.length === 0 ? (
                    <div className="no-applications">
                      <p>No applications received yet for this job.</p>
                    </div>
                  ) : (
                    jobItem.applications.map((application) => (
                      <div key={application._id} className="application-item">
                        <div className="applicant-info">
                          <h4>{application.fullName}</h4>
                          <div className="contact-details">
                            <p><strong>Email:</strong> {application.email}</p>
                            <p><strong>Phone:</strong> {application.phone}</p>
                            {application.currentCompany && (
                              <p><strong>Current Company:</strong> {application.currentCompany}</p>
                            )}
                            {application.linkedInProfile && (
                              <p>
                                <strong>LinkedIn:</strong> 
                                <a href={application.linkedInProfile} target="_blank" rel="noopener noreferrer">
                                  {application.linkedInProfile}
                                </a>
                              </p>
                            )}
                          </div>
                          <p><strong>Applied on:</strong> {formatDate(application.createdAt)}</p>
                          <div className="status-label">
                            <span className={getStatusBadgeClass(application.status)}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {application.coverLetter && (
                          <div className="cover-letter">
                            <h5>Cover Letter</h5>
                            <p>{application.coverLetter}</p>
                          </div>
                        )}
                        
                        <div className="application-actions">
                          <button 
                            className="resume-btn" 
                            onClick={() => downloadResume(application.resume, application.fullName)}
                          >
                            Download Resume
                          </button>
                          <button 
                            className="contact-btn"
                            onClick={() => contactApplicant(application.email)}
                          >
                            Contact
                          </button>
                          <div className="status-dropdown">
                            <button className="status-btn">
                              Update Status
                            </button>
                            <div className="status-dropdown-content">
                              <button onClick={() => handleStatusChange(application._id, 'pending')}>Mark as Pending</button>
                              <button onClick={() => handleStatusChange(application._id, 'reviewed')}>Mark as Reviewed</button>
                              <button onClick={() => handleStatusChange(application._id, 'interviewed')}>Mark as Interviewed</button>
                              <button onClick={() => handleStatusChange(application._id, 'offered')}>Mark as Offered</button>
                              <button onClick={() => handleStatusChange(application._id, 'hired')}>Mark as Hired</button>
                              <button onClick={() => handleStatusChange(application._id, 'rejected')}>Mark as Rejected</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobPosterApplications; 