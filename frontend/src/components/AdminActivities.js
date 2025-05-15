import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css'; // Reuse dashboard styles

function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('regular_users'); // Default: show only regular user activities
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/activities?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.activities) {
        setActivities(response.data.data.activities);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to fetch activities. Please try again.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Handle delete all activities
  const handleDeleteAllActivities = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError('');
      setDeleteSuccess('');
      
      const token = localStorage.getItem('token');
      // Pass type filter if it's not 'all'
      const queryParams = filter !== 'all' ? `?type=${filter}` : '';
      
      const response = await axios.delete(`http://localhost:5000/api/admin/activities${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeleteLoading(false);
      setShowConfirmModal(false);
      setDeleteSuccess(response.data.message || 'Activities deleted successfully');
      
      // Refresh activities list
      fetchActivities();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Error deleting activities:', err);
      setDeleteLoading(false);
      setDeleteError(err.response?.data?.message || 'Failed to delete activities. Please try again.');
    }
  };

  // Filter activities based on selected type and exclude admin activities
  const filteredActivities = activities
    .filter(activity => {
      // First check if we need to filter by activity type
      const typeMatch = filter === 'all' || activity.type === filter;
      
      // Then filter by user role
      let roleMatch = true;
      if (userRoleFilter === 'regular_users') {
        roleMatch = !(activity.user && activity.user.role === 'admin');
      } else if (userRoleFilter === 'admin_users') {
        roleMatch = activity.user && activity.user.role === 'admin';
      }
      // If userRoleFilter is 'all_users', we show all activities regardless of user role
      
      return typeMatch && roleMatch;
    });

  // Confirmation Modal Component
  const ConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirm Deletion</h3>
          <button className="modal-close" onClick={() => setShowConfirmModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete {filter === 'all' ? 'all' : `all ${filter}`} activities?</p>
          <p className="warning-text">This action cannot be undone!</p>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleDeleteAllActivities}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

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
            <Link to="/admin/activities" className="menu-item active">
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
            <Link to="/admin/applications" className="menu-item">
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
        <div className="admin-main">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading activities...</p>
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
            <Link to="/admin/activities" className="menu-item active">
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
            <Link to="/admin/applications" className="menu-item">
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
        <div className="admin-main">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchActivities}>
              <i className="fas fa-sync-alt"></i> Try Again
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
          <Link to="/admin/activities" className="menu-item active">
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
          <Link to="/admin/applications" className="menu-item">
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
      <div className="admin-main">
        <div className="admin-header">
          <h1>Activity Log</h1>
          <p>View all system activities and user actions</p>
        </div>

        {deleteSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <p>{deleteSuccess}</p>
          </div>
        )}

        {deleteError && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{deleteError}</p>
          </div>
        )}

        <div className="dashboard-section activities-section">
          <div className="section-header">            
            <h2>Recent Activities</h2>            
            <div className="actions">              
              <div className="filter-group">                
                <select                   
                  className="filter-select"                  
                  value={filter}                  
                  onChange={(e) => setFilter(e.target.value)}                
                >                  
                  <option value="all">All Activities</option>                  
                  <option value="login">Logins</option>                  
                  <option value="signup">Signups</option>                  
                  <option value="job_post">Job Posts</option>                  
                  <option value="job_application">Applications</option>                  
                  <option value="payment">Payments</option>                  
                  <option value="subscription-update">Subscription Updates</option>                  
                  <option value="user_update">User Updates</option>                  
                  <option value="job_update">Job Updates</option>                
                </select>                
                <select                   
                  className="filter-select"                  
                  value={userRoleFilter}                  
                  onChange={(e) => setUserRoleFilter(e.target.value)}                
                >                  
                  <option value="regular_users">Regular Users Only</option>                  
                  <option value="admin_users">Admin Users Only</option>                  
                  <option value="all_users">All Users</option>                
                </select>              
              </div>              
              <div className="button-group">                
                <button className="btn btn-secondary" onClick={fetchActivities}>                  
                  <i className="fas fa-sync-alt"></i> Refresh                
                </button>                
                <button className="btn btn-secondary">                  
                  <i className="fas fa-download"></i> Export                
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => setShowConfirmModal(true)}
                >                  
                  <i className="fas fa-trash-alt"></i> Delete All               
                </button>              
              </div>            
            </div>
          </div>
          
          <div className="activity-list">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="activity-item" data-type={activity.type}>
                  <div className={`activity-icon ${activity.type}`}>
                    <i className={`fas fa-${
                      activity.type === 'login' ? 'sign-in-alt' :
                      activity.type === 'signup' ? 'user-plus' :
                      activity.type === 'job_post' ? 'briefcase' :
                      activity.type === 'job_application' ? 'file-alt' :
                      activity.type === 'message' ? 'envelope' :
                      activity.type === 'payment' ? 'credit-card' :
                      activity.type === 'user_update' ? 'user-edit' :
                      activity.type === 'job_update' ? 'edit' :
                      activity.type === 'subscription-update' ? 'crown' : 'bell'
                    }`}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {activity.type === 'login' && 'User Login'}
                      {activity.type === 'signup' && 'New User Registration'}
                      {activity.type === 'job_post' && 'New Job Posted'}
                      {activity.type === 'job_application' && 'New Application'}
                      {activity.type === 'message' && 'New Contact Message'}
                      {activity.type === 'payment' && 'New Payment'}
                      {activity.type === 'user_update' && 'User Profile Updated'}
                      {activity.type === 'job_update' && 'Job Listing Updated'}
                      {activity.type === 'subscription-update' && 'Subscription Plan Upgrade'}
                    </div>
                    <div className="activity-desc">{activity.description}</div>
                    <div className="activity-time">{activity.relativeTime}</div>
                    {activity.user && (
                      <div className="activity-user">
                        <i className="fas fa-user"></i> {activity.user.name} ({activity.user.email})
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No activities found matching your filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Show confirmation modal */}
      {showConfirmModal && <ConfirmationModal />}
    </div>
  );
}

export default AdminActivities; 