import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './JobManagement.css';
import { useNotification } from './NotificationContext';
import { useDialog } from './DialogContext';

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const { showNotification } = useNotification();
  const { showConfirmDialog } = useDialog();
  const jobsPerPage = 10;

  // Job categories for filter
  const jobCategories = [
    { value: 'all', label: 'All Categories' },
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
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'temporary', label: 'Temporary' }
  ];

  // Get current user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const allJobs = response.data.data.jobs;
      console.log('All jobs fetched:', allJobs.length);
      
      // Get current user ID from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        console.log('Current user ID:', userId);
        
        // Filter jobs to only show those posted by the current user
        const userJobs = allJobs.filter(job => {
          // postedBy might be an object with _id or a string ID
          if (job.postedBy) {
            console.log('Job ID:', job._id, 'Posted by:', job.postedBy);
            
            if (typeof job.postedBy === 'object' && job.postedBy._id) {
              return job.postedBy._id === userId;
            } else if (typeof job.postedBy === 'string') {
              return job.postedBy === userId;
            } else {
              return String(job.postedBy) === String(userId);
            }
          }
          return false;
        });
        console.log('Filtered jobs for current user:', userJobs.length);
        setJobs(userJobs);
        
        // If the user is an admin, show all jobs
        if (user.role === 'admin') {
          console.log('User is admin, showing all jobs');
          setJobs(allJobs);
        }
      } else {
        setJobs([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = useCallback(async (jobId) => {
    showConfirmDialog({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Remove the deleted job from the state
          setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
          showNotification('Job deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting job:', error);
          showNotification(error.response?.data?.message || 'Failed to delete job', 'error');
        }
      }
    });
  }, [showConfirmDialog, showNotification]);

  const navigateToJobEdit = (jobId) => {
    window.location.href = `/jobs/${jobId}`;
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    // Search filter
    const searchMatch = 
      search === '' || 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(search.toLowerCase()));
    
    // Category filter
    const categoryMatch = 
      categoryFilter === 'all' || 
      job.category === categoryFilter;
    
    // Type filter
    const typeMatch = 
      typeFilter === 'all' || 
      job.type === typeFilter;
    
    return searchMatch && categoryMatch && typeMatch;
  });

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="job-management">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-management">
        <div className="error-message">
          <i className='bx bx-error-circle'></i>
          <p>{error}</p>
          <button onClick={fetchJobs} className="retry-btn">
            <i className='bx bx-refresh'></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-management">
      <div className="job-management-header">
        <h2>Job Management</h2>
        <div className="actions">
          <button className="btn btn-secondary">
            <i className='bx bx-download'></i> Export
          </button>
          <a href="/postjob" className="btn btn-primary">
            <i className='bx bx-plus'></i> Post New Job
          </a>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-and-filter">
        <div className="search-input">
          <i className='bx bx-search'></i>
          <input 
            type="text" 
            placeholder="Search jobs by title, company, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        <div className="filter-group">
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            {jobCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            {jobTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <div className="no-jobs">
          <i className='bx bx-search-alt'></i>
          <p>No jobs found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
              setTypeFilter('all');
            }} 
            className="reset-filters-btn"
          >
            <i className='bx bx-reset'></i> Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Posted On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>
                      <span className={`job-type-badge ${job.type}`}>
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                      </span>
                    </td>
                    <td>{job.category}</td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td>
                      <span className={`job-status-badge ${job.featured ? 'featured' : job.urgent ? 'urgent' : 'active'}`}>
                        {job.featured ? 'Featured' : job.urgent ? 'Urgent' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <a 
                          href={`/jobs/${job._id}`}
                          className="action-btn view"
                          title="View Details"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className='bx bx-show'></i>
                        </a>
                        <button 
                          className="action-btn edit"
                          onClick={() => navigateToJobEdit(job._id)}
                          title="Edit Job"
                        >
                          <i className='bx bx-edit'></i>
                        </button>
                        {/* Show delete button for jobs posted by the current user */}
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteJob(job._id)}
                          title="Delete Job"
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className='bx bx-chevron-left'></i>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
            
            <button 
              className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className='bx bx-chevron-right'></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default JobManagement; 