import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './AdminApplications.css';
import { useNotification } from './NotificationContext';
import { useDialog } from './DialogContext';

function AdminApplications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;

  const { showNotification } = useNotification();
  const { showConfirmDialog } = useDialog();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        showNotification('Authentication required. Please log in again.', 'error');
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
        // Don't use mock data, just set an empty array to show the no applications message
        setApplications([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications. Please try again later.');
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (id, newStatus) => {
    showConfirmDialog({
      title: 'Update Application Status',
      message: `Are you sure you want to change the application status to "${newStatus}"?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-primary',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            showNotification('Authentication required', 'error');
            return;
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

          // Show a success notification
          showNotification(`Application status updated to ${newStatus}`, 'success');
        } catch (error) {
          console.error('Error updating application status:', error);
          showNotification(error.message, 'error');
        }
      }
    });
  };

  const handleDeleteApplication = async (id) => {
    showConfirmDialog({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            showNotification('Authentication required', 'error');
            return;
          }
          
          const response = await fetch(`http://localhost:5000/api/admin/applications/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete application');
          }
          
          // Update the local state
          setApplications(applications.filter(app => app._id !== id));

          // Show a success notification
          showNotification('Application has been deleted successfully', 'success');
        } catch (error) {
          console.error('Error deleting application:', error);
          showNotification(error.message, 'error');
        }
      }
    });
  };

  // Filter applications based on search and status filter
  const filteredApplications = applications.filter(app => {
    // Search filter (search by applicant name, email, phone, job title, or company)
    const searchMatch = 
      search === '' || 
      (app.fullName && app.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (app.email && app.email.toLowerCase().includes(search.toLowerCase())) ||
      (app.phone && app.phone.toLowerCase().includes(search.toLowerCase())) ||
      (app.applicantId && app.applicantId.name && app.applicantId.name.toLowerCase().includes(search.toLowerCase())) ||
      (app.applicantId && app.applicantId.email && app.applicantId.email.toLowerCase().includes(search.toLowerCase())) ||
      (app.jobId && app.jobId.title && app.jobId.title.toLowerCase().includes(search.toLowerCase())) ||
      (app.jobId && app.jobId.company && app.jobId.company.toLowerCase().includes(search.toLowerCase()));
    
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
            <Link to="/admin/activities" className="menu-item">
              <i className="fas fa-history"></i>
              <span>Recent Activities</span>
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
            <Link to="/admin/activities" className="menu-item">
              <i className="fas fa-history"></i>
              <span>Recent Activities</span>
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
          <Link to="/admin/activities" className="menu-item">
            <i className="fas fa-history"></i>
            <span>Recent Activities</span>
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
            <h2>No applications in the system</h2>
            <p>There are currently no job applications in the database. Applications will appear here when job seekers apply for positions.</p>
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
                        <span className="applicant-name">{app.fullName || (app.applicantId && app.applicantId.name) || 'N/A'}</span>
                        <span className="applicant-email">{app.email || (app.applicantId && app.applicantId.email) || 'N/A'}</span>
                        {app.phone && <span className="applicant-phone">{app.phone}</span>}
                      </div>
                    </td>
                    <td>{app.jobId && app.jobId.title ? app.jobId.title : 'N/A'}</td>
                    <td>
                      <div className="company-info">
                        <span className="company-name">{app.jobId && app.jobId.company ? app.jobId.company : 'N/A'}</span>
                        <span className="company-location">{app.jobId && app.jobId.location ? app.jobId.location : 'N/A'}</span>
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
                        <button 
                          className="action-btn delete-btn"
                          title="Delete Application"
                          onClick={() => handleDeleteApplication(app._id)}
                        >
                          <i className="fas fa-trash-alt"></i>
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