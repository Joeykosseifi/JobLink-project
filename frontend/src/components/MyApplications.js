import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyApplications.css';
import { useNotification } from './NotificationContext';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view your applications');
          showNotification('Authentication required. Please log in.', 'error');
          setLoading(false);
          return;
        }

        // Fetch applications from API
        const response = await axios.get('http://localhost:5000/api/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.status !== 'success') {
          throw new Error(response.data.message || 'Failed to load applications');
        }

        setApplications(response.data.data.applications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load your applications. Please try again later.');
        showNotification('Failed to load your applications', 'error');
        setLoading(false);
      }
    };

    fetchApplications();
  }, [showNotification]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'reviewed':
        return 'status-reviewed';
      case 'interviewed':
        return 'status-interviewed';
      case 'rejected':
        return 'status-rejected';
      case 'offered':
        return 'status-offered';
      case 'hired':
        return 'status-hired';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-applications-container">
        <div className="my-applications-loading">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-applications-container">
        <div className="my-applications-error">
          <i className='bx bx-error-circle'></i>
          <h2>Error Loading Applications</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            <i className='bx bx-refresh'></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-applications-container">
      <h1 className="page-title">My Applications</h1>
      
      {applications.length === 0 ? (
        <div className="no-applications">
          <i className='bx bx-search-alt'></i>
          <h2>No Applications Found</h2>
          <p>You haven't applied to any jobs yet. Browse jobs and start applying!</p>
          <a href="/jobs" className="browse-jobs-btn">
            <i className='bx bx-briefcase'></i> Browse Jobs
          </a>
        </div>
      ) : (
        <>
          <div className="applications-summary">
            <p>You have applied to <strong>{applications.length}</strong> job{applications.length !== 1 ? 's' : ''}.</p>
          </div>
          
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <div className="job-info">
                    <h2 className="job-title">{application.jobId && application.jobId.title ? application.jobId.title : 'N/A'}</h2>
                    <p className="company-name">{application.jobId && application.jobId.company ? application.jobId.company : 'N/A'}</p>
                  </div>
                  <div className={`application-status ${getStatusClass(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </div>
                </div>
                
                <div className="application-details">
                  <div className="detail-item">
                    <i className='bx bx-calendar'></i>
                    <div>
                      <h3>Applied On</h3>
                      <p>{formatDate(application.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <i className='bx bx-map'></i>
                    <div>
                      <h3>Location</h3>
                      <p>{application.jobId && application.jobId.location ? application.jobId.location : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <i className='bx bx-file'></i>
                    <div>
                      <h3>Documents</h3>
                      <p className="documents-list">
                        <span className="document-item">CV/Resume</span>
                        {application.coverLetter && (
                          <span className="document-item">Cover Letter</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="application-footer">
                  <a 
                    href={application.jobId && application.jobId._id ? `/jobs/${application.jobId._id}` : '#'} 
                    className="view-job-btn"
                  >
                    View Job
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyApplications; 