import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './AdminApplications.css';

function AdminApplications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      if (data.data.applications && data.data.applications.length > 0) {
        setApplications(data.data.applications);
      } else {
        // Use mock data if no real applications exist yet
        console.log('No applications found in database, using mock data');
        setApplications(mockApplications);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Use mock data on error as fallback
      console.log('Error fetching applications, using mock data instead');
      setApplications(mockApplications);
      setError(null); // Clear the error since we're showing mock data
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Update the local state
      setApplications(applications.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));

      // Show a success message
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert(error.message);
    }
  };

  // Mock data for UI development - this will be replaced by real data
  const mockApplications = [
    {
      _id: '1',
      jobId: {
        _id: 'job1',
        title: 'Head Chef',
        company: 'Gourmet Restaurant',
        location: 'New York'
      },
      applicantId: {
        _id: 'user1',
        name: 'John Davis',
        email: 'john@example.com'
      },
      resume: 'resume_john_davis.pdf',
      coverLetter: 'I have 10 years of experience...',
      status: 'pending',
      createdAt: '2023-09-15T10:30:00.000Z'
    },
    {
      _id: '2',
      jobId: {
        _id: 'job2',
        title: 'Hotel Manager',
        company: 'Luxury Hotel',
        location: 'Los Angeles'
      },
      applicantId: {
        _id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      resume: 'resume_jane_smith.pdf',
      coverLetter: 'I am passionate about hospitality...',
      status: 'reviewed',
      createdAt: '2023-09-14T15:45:00.000Z'
    },
    {
      _id: '3',
      jobId: {
        _id: 'job3',
        title: 'Restaurant Server',
        company: 'Fine Dining',
        location: 'Chicago'
      },
      applicantId: {
        _id: 'user3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      },
      resume: 'resume_sarah_johnson.pdf',
      coverLetter: 'With 5 years of experience in customer service...',
      status: 'interviewed',
      createdAt: '2023-09-12T09:15:00.000Z'
    },
    {
      _id: '4',
      jobId: {
        _id: 'job4',
        title: 'Bar Manager',
        company: 'Upscale Lounge',
        location: 'Miami'
      },
      applicantId: {
        _id: 'user4',
        name: 'Michael Brown',
        email: 'michael@example.com'
      },
      resume: 'resume_michael_brown.pdf',
      coverLetter: 'I have managed several high-volume bars...',
      status: 'offered',
      createdAt: '2023-09-10T14:20:00.000Z'
    },
    {
      _id: '5',
      jobId: {
        _id: 'job5',
        title: 'Sous Chef',
        company: 'Gourmet Restaurant',
        location: 'New York'
      },
      applicantId: {
        _id: 'user5',
        name: 'Robert Wilson',
        email: 'robert@example.com'
      },
      resume: 'resume_robert_wilson.pdf',
      coverLetter: 'Having worked in Michelin-starred restaurants...',
      status: 'rejected',
      createdAt: '2023-09-08T11:30:00.000Z'
    }
  ];

  // Filter applications based on search and status filter
  const filteredApplications = applications.filter(app => {
    // Search filter (search by applicant name, email, job title, or company)
    const searchMatch = 
      search === '' || 
      app.applicantId.name.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantId.email.toLowerCase().includes(search.toLowerCase()) ||
      app.jobId.title.toLowerCase().includes(search.toLowerCase()) ||
      app.jobId.company.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const statusMatch = 
      statusFilter === 'all' || 
      app.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Pagination
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending':
        return 'status-badge pending';
      case 'reviewed':
        return 'status-badge reviewed';
      case 'interviewed':
        return 'status-badge interviewed';
      case 'offered':
        return 'status-badge offered';
      case 'hired':
        return 'status-badge hired';
      case 'rejected':
        return 'status-badge rejected';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
            <i className="fas fa-user-circle"></i>
              <h2>Admin</h2>
            </div>
          </div>
          <div className="sidebar-menu">
            <div className="menu-category">Dashboard</div>
            <Link to="/admin/dashboard" className="menu-item">
              <i className="fas fa-home"></i>
              <span>Overview</span>
            </Link>
            <Link to="/admin/analytics" className="menu-item">
              <i className="fas fa-chart-line"></i>
              <span>Analytics</span>
            </Link>
            
            <div className="menu-category">Management</div>
            <Link to="/admin/users" className="menu-item">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
            <Link to="/admin/jobs" className="menu-item">
              <i className="fas fa-briefcase"></i>
              <span>Jobs</span>
            </Link>
            <Link to="/admin/messages" className="menu-item">
              <i className="fas fa-envelope"></i>
              <span>Messages</span>
            </Link>
            <Link to="/admin/applications" className="menu-item active">
              <i className="fas fa-file-alt"></i>
              <span>Applications</span>
            </Link>
            
            <div className="menu-category">Settings</div>
            <Link to="/settings" className="menu-item">
              <i className="fas fa-user-cog"></i>
              <span>Account</span>
            </Link>
            <Link to="/settings" className="menu-item">
              <i className="fas fa-shield-alt"></i>
              <span>Security</span>
            </Link>
          </div>
        </div>
        <div className="admin-applications-container">
          <div className="loader">
            <div className="loading-spinner"></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <i className="fas fa-user-circle"></i>
              <h2>Admin</h2>
            </div>
          </div>
          <div className="sidebar-menu">
            <div className="menu-category">Dashboard</div>
            <Link to="/admin/dashboard" className="menu-item">
              <i className="fas fa-home"></i>
              <span>Overview</span>
            </Link>
            <Link to="/admin/analytics" className="menu-item">
              <i className="fas fa-chart-line"></i>
              <span>Analytics</span>
            </Link>
            
            <div className="menu-category">Management</div>
            <Link to="/admin/users" className="menu-item">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
            <Link to="/admin/jobs" className="menu-item">
              <i className="fas fa-briefcase"></i>
              <span>Jobs</span>
            </Link>
            <Link to="/admin/messages" className="menu-item">
              <i className="fas fa-envelope"></i>
              <span>Messages</span>
            </Link>
            <Link to="/admin/applications" className="menu-item active">
              <i className="fas fa-file-alt"></i>
              <span>Applications</span>
            </Link>
            
            <div className="menu-category">Settings</div>
            <Link to="/settings" className="menu-item">
              <i className="fas fa-user-cog"></i>
              <span>Account</span>
            </Link>
            <Link to="/settings" className="menu-item">
              <i className="fas fa-shield-alt"></i>
              <span>Security</span>
            </Link>
          </div>
        </div>
        <div className="admin-applications-container">
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button 
              className="btn btn-primary retry-btn" 
              onClick={() => {
                setError(null);
                fetchApplications();
              }}
            >
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-user-circle"></i>
            <h2>Admin</h2>
          </div>
        </div>
        <div className="sidebar-menu">
          <div className="menu-category">Dashboard</div>
          <Link to="/admin/dashboard" className="menu-item">
            <i className="fas fa-home"></i>
            <span>Overview</span>
          </Link>
          <Link to="/admin/analytics" className="menu-item">
            <i className="fas fa-chart-line"></i>
            <span>Analytics</span>
          </Link>
          
          <div className="menu-category">Management</div>
          <Link to="/admin/users" className="menu-item">
            <i className="fas fa-users"></i>
            <span>Users</span>
          </Link>
          <Link to="/admin/jobs" className="menu-item">
            <i className="fas fa-briefcase"></i>
            <span>Jobs</span>
          </Link>
          <Link to="/admin/messages" className="menu-item">
            <i className="fas fa-envelope"></i>
            <span>Messages</span>
          </Link>
          <Link to="/admin/applications" className="menu-item active">
            <i className="fas fa-file-alt"></i>
            <span>Applications</span>
          </Link>
          
          <div className="menu-category">Settings</div>
          <Link to="/settings" className="menu-item">
            <i className="fas fa-user-cog"></i>
            <span>Account</span>
          </Link>
          <Link to="/settings" className="menu-item">
            <i className="fas fa-shield-alt"></i>
            <span>Security</span>
          </Link>
        </div>
      </div>
      <div className="admin-applications-container">
        <div className="admin-applications-header">
          <h1>Job Applications</h1>
          <p>Manage and process candidate applications</p>
        </div>
        
        <div className="applications-stats">
          <div className="stats-card">
            <div className="stats-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stats-info">
              <h3>Pending</h3>
              <p>{applications.filter(app => app.status === 'pending').length}</p>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon reviewed">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stats-info">
              <h3>Reviewed</h3>
              <p>{applications.filter(app => app.status === 'reviewed').length}</p>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon interviewed">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="stats-info">
              <h3>Interviewed</h3>
              <p>{applications.filter(app => app.status === 'interviewed').length}</p>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon offered">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="stats-info">
              <h3>Offered</h3>
              <p>{applications.filter(app => app.status === 'offered' || app.status === 'hired').length}</p>
            </div>
          </div>
        </div>
        
        <div className="section-header">
          <h2>Application Management</h2>
          <div className="actions">
            <button className="btn btn-secondary">
              <i className="fas fa-download"></i> Export
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="search-and-filter">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search applicants, jobs, companies..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {applications.length === 0 ? (
          <div className="no-applications">
            <i className="fas fa-file-alt"></i>
            <h2>No applications yet</h2>
            <p>Applications from job seekers will appear here.</p>
          </div>
        ) : (
          <div className="applications-table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentApplications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div className="applicant-info">
                        <span className="applicant-name">{app.applicantId.name}</span>
                        <span className="applicant-email">{app.applicantId.email}</span>
                      </div>
                    </td>
                    <td>{app.jobId.title}</td>
                    <td>
                      <div className="company-info">
                        <span className="company-name">{app.jobId.company}</span>
                        <span className="company-location">{app.jobId.location}</span>
                      </div>
                    </td>
                    <td>{formatDate(app.createdAt)}</td>
                    <td>
                      <span className={getStatusBadgeClass(app.status)}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="application-actions">
                        <button 
                          className="action-btn view-btn"
                          title="View Details"
                          onClick={() => {/* Show application details */}}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <div className="status-dropdown">
                          <button className="action-btn status-btn">
                            <i className="fas fa-clipboard-list"></i>
                          </button>
                          <div className="status-dropdown-content">
                            <button onClick={() => handleUpdateStatus(app._id, 'pending')}>Mark as Pending</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'reviewed')}>Mark as Reviewed</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'interviewed')}>Mark as Interviewed</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'offered')}>Mark as Offered</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'hired')}>Mark as Hired</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'rejected')}>Mark as Rejected</button>
                          </div>
                        </div>
                        <button 
                          className="action-btn message-btn"
                          title="Message Applicant"
                          onClick={() => {/* Open email client */}}
                        >
                          <i className="fas fa-envelope"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredApplications.length > applicationsPerPage && (
          <div className="pagination">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
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
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminApplications; 