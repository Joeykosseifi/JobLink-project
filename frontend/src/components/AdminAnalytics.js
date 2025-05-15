import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AdminAnalytics.css';

// Mock applications data for recent activity
const mockApplications = [
  { id: 1, user: 'Jane Smith', job: 'Hotel Manager', time: '8 hours ago' },
  { id: 2, user: 'John Davis', job: 'Executive Chef', time: '1 day ago' },
  { id: 3, user: 'Sarah Johnson', job: 'Restaurant Manager', time: '2 days ago' }
];

function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({
    userStats: {
      total: 0,
      growth: 0,
      newUsers: 0,
      active: 0
    },
    jobStats: {
      total: 0,
      growth: 0,
      newJobs: 0,
      active: 0
    },
    applicationStats: {
      total: 0,
      growth: 0,
      newApplications: 0,
      completed: 0
    },
    revenueStats: {
      total: 0,
      growth: 0,
      newRevenue: 0,
      recurring: 0
    },
    recentActivities: []
  });
  
  // Create a ref for mockApplications to avoid dependency issues
  const mockApplicationsRef = useRef(mockApplications);
  
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch real analytics data from the backend
      const response = await fetch(`http://localhost:5000/api/admin/analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch analytics data');
      }
      
      const data = await response.json();
      
      if (!data.data || !data.status === 'success') {
        throw new Error('Invalid data format received from server');
      }
      
      setAnalyticsData(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    // We're using mockApplicationsRef.current here to satisfy the linter
    // but since it's a ref to a constant array, it won't cause re-renders
    const applications = mockApplicationsRef.current;
    console.log("Applications loaded:", applications.length);
    
    fetchAnalyticsData();
    // Since mockApplications is a constant defined outside the component,
    // it doesn't need to be in the dependency array
  }, [fetchAnalyticsData]);

  // Choose the data based on selected timeframe
  const getTimeframeData = () => {
    // If we have chartData from the API, use it
    if (analyticsData.chartData) {
      return analyticsData.chartData;
    }

    // Fallback to empty data
    return {
      labels: [],
      users: [],
      jobs: [],
      applications: [],
      revenue: []
    };
  };

  const chartData = getTimeframeData();

  // Helper functions for activity icons
  const getActivityIcon = (activityType) => {
    switch(activityType) {
      case 'login':
        return 'sign-in-alt';
      case 'signup':
        return 'user-plus';
      case 'job_post':
        return 'briefcase';
      case 'job_application':
        return 'file-alt';
      case 'message':
        return 'envelope';
      case 'payment':
        return 'credit-card';
      case 'user_update':
        return 'user-edit';
      case 'job_update':
        return 'edit';
      default:
        return 'bell';
    }
  };

  // Helper function for activity classes
  const getActivityClass = (activityType) => {
    switch(activityType) {
      case 'login':
        return 'login';
      case 'signup':
        return 'new-user';
      case 'job_post':
        return 'new-job';
      case 'job_application':
        return 'application';
      case 'message':
        return 'message';
      case 'payment':
        return 'payment';
      case 'user_update':
        return 'update';
      case 'job_update':
        return 'update';
      default:
        return '';
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
            <Link to="/admin/analytics" className="menu-item active">
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
        <div className="admin-analytics-container">
          <div className="loader">
            <div className="loading-spinner"></div>
            <p>Loading analytics data...</p>
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
            <Link to="/admin/analytics" className="menu-item active">
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
        <div className="admin-analytics-container">
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button 
              className="btn btn-primary retry-btn" 
              onClick={() => {
                setError(null);
                fetchAnalyticsData();
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
          <Link to="/admin/analytics" className="menu-item active">
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
      <div className="admin-analytics-container">
        <div className="admin-analytics-header">
          <h1>Analytics Dashboard</h1>
          <p>Track performance metrics and monitor platform growth</p>
        </div>
        
        <div className="analytics-timeframe-selector">
          <button 
            className={`timeframe-btn ${timeframe === 'day' ? 'active' : ''}`}
            onClick={() => setTimeframe('day')}
          >
            Daily
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
            onClick={() => setTimeframe('week')}
          >
            Weekly
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
            onClick={() => setTimeframe('month')}
          >
            Monthly
          </button>
        </div>
        
        <div className="analytics-stats-container">
          <div className="analytics-stat-card">
            <div className="stat-header">
              <div className="stat-icon users">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-change positive">
                <i className="fas fa-arrow-up"></i>
                {analyticsData.userStats.growth}%
              </div>
            </div>
            <div className="stat-value">{analyticsData.userStats.total}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-details">
              <div className="stat-detail-item">
                <span className="detail-label">New Users:</span>
                <span className="detail-value">{analyticsData.userStats.newUsers}</span>
              </div>
              <div className="stat-detail-item">
                <span className="detail-label">Active Users:</span>
                <span className="detail-value">{analyticsData.userStats.active}</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-stat-card">
            <div className="stat-header">
              <div className="stat-icon jobs">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="stat-change positive">
                <i className="fas fa-arrow-up"></i>
                {analyticsData.jobStats.growth}%
              </div>
            </div>
            <div className="stat-value">{analyticsData.jobStats.total}</div>
            <div className="stat-label">Total Jobs</div>
            <div className="stat-details">
              <div className="stat-detail-item">
                <span className="detail-label">New Jobs:</span>
                <span className="detail-value">{analyticsData.jobStats.newJobs}</span>
              </div>
              <div className="stat-detail-item">
                <span className="detail-label">Active Jobs:</span>
                <span className="detail-value">{analyticsData.jobStats.active}</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-stat-card">
            <div className="stat-header">
              <div className="stat-icon applications">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="stat-change positive">
                <i className="fas fa-arrow-up"></i>
                {analyticsData.applicationStats.growth}%
              </div>
            </div>
            <div className="stat-value">{analyticsData.applicationStats.total}</div>
            <div className="stat-label">Applications</div>
            <div className="stat-details">
              <div className="stat-detail-item">
                <span className="detail-label">New Applications:</span>
                <span className="detail-value">{analyticsData.applicationStats.newApplications}</span>
              </div>
              <div className="stat-detail-item">
                <span className="detail-label">Completed:</span>
                <span className="detail-value">{analyticsData.applicationStats.completed}</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-stat-card">
            <div className="stat-header">
              <div className="stat-icon revenue">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-change negative">
                <i className="fas fa-arrow-down"></i>
                {Math.abs(analyticsData.revenueStats.growth)}%
              </div>
            </div>
            <div className="stat-value">${analyticsData.revenueStats.total.toLocaleString()}</div>
            <div className="stat-label">Revenue</div>
            <div className="stat-details">
              <div className="stat-detail-item">
                <span className="detail-label">New Revenue:</span>
                <span className="detail-value">${analyticsData.revenueStats.newRevenue.toLocaleString()}</span>
              </div>
              <div className="stat-detail-item">
                <span className="detail-label">Recurring:</span>
                <span className="detail-value">${analyticsData.revenueStats.recurring.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-charts-container">
          <div className="analytics-chart-card">
            <h3>User Growth</h3>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {chartData.users.map((value, index) => (
                    <div 
                      key={index} 
                      className="chart-bar" 
                      style={{ 
                        height: `${(value / Math.max(...chartData.users)) * 100}%`,
                        backgroundColor: 'rgba(79, 172, 254, 0.7)'
                      }}
                      title={`${chartData.labels[index]}: ${value} users`}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="chart-label">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="analytics-chart-card">
            <h3>Job Listings</h3>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {chartData.jobs.map((value, index) => (
                    <div 
                      key={index} 
                      className="chart-bar" 
                      style={{ 
                        height: `${(value / Math.max(...chartData.jobs)) * 100}%`,
                        backgroundColor: 'rgba(102, 126, 234, 0.7)'
                      }}
                      title={`${chartData.labels[index]}: ${value} jobs`}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="chart-label">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="analytics-chart-card">
            <h3>Applications</h3>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {chartData.applications.map((value, index) => (
                    <div 
                      key={index} 
                      className="chart-bar" 
                      style={{ 
                        height: `${(value / Math.max(...chartData.applications)) * 100}%`,
                        backgroundColor: 'rgba(240, 147, 251, 0.7)'
                      }}
                      title={`${chartData.labels[index]}: ${value} applications`}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="chart-label">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="analytics-chart-card">
            <h3>Revenue ($)</h3>
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {chartData.revenue.map((value, index) => (
                    <div 
                      key={index} 
                      className="chart-bar" 
                      style={{ 
                        height: `${(value / Math.max(...chartData.revenue)) * 100}%`,
                        backgroundColor: 'rgba(67, 233, 123, 0.7)'
                      }}
                      title={`${chartData.labels[index]}: $${value.toLocaleString()}`}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="chart-label">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-recent-activity">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <div className="actions">
              <button className="btn btn-secondary">
                <i className="fas fa-download"></i> Export
              </button>
            </div>
          </div>
          
          <div className="activity-list">
            {analyticsData.recentActivities && analyticsData.recentActivities.length > 0 ? (
              analyticsData.recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${getActivityClass(activity.type)}`}>
                    <i className={`fas fa-${getActivityIcon(activity.type)}`}></i>
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
              </div>
                    <div className="activity-desc">{activity.description}</div>
                    <div className="activity-time">{activity.time}</div>
            </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No recent activities to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics; 