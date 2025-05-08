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
      total: 156,
      growth: 12,
      newUsers: 24,
      active: 128
    },
    jobStats: {
      total: 87,
      growth: 5,
      newJobs: 15,
      active: 72
    },
    applicationStats: {
      total: 324,
      growth: 8,
      newApplications: 46,
      completed: 205
    },
    revenueStats: {
      total: 15780,
      growth: -3,
      newRevenue: 2450,
      recurring: 13330
    }
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

  // Sample data for charts
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    users: [80, 92, 105, 110, 118, 125, 130, 135, 142, 146, 150, 156],
    jobs: [42, 45, 50, 55, 60, 65, 68, 72, 75, 80, 83, 87],
    applications: [180, 195, 210, 225, 240, 255, 270, 285, 295, 305, 315, 324],
    revenue: [8500, 9200, 10000, 10800, 11500, 12200, 12800, 13500, 14100, 14800, 15400, 15780]
  };

  const weeklyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    users: [144, 148, 152, 156],
    jobs: [80, 82, 85, 87],
    applications: [300, 308, 316, 324],
    revenue: [14500, 14900, 15300, 15780]
  };

  const dailyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    users: [152, 153, 154, 154, 155, 155, 156],
    jobs: [84, 85, 85, 86, 86, 87, 87],
    applications: [318, 319, 320, 321, 322, 323, 324],
    revenue: [15500, 15580, 15650, 15700, 15730, 15760, 15780]
  };

  // Choose the data based on selected timeframe
  const getTimeframeData = () => {
    // If we have chartData from the API, use it
    if (analyticsData.chartData) {
      return analyticsData.chartData;
    }

    // Fallback to static data (should not be needed after API integration)
    switch(timeframe) {
      case 'day':
        return dailyData;
      case 'week':
        return weeklyData;
      case 'month':
      default:
        return monthlyData;
    }
  };

  const chartData = getTimeframeData();

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
            <div className="activity-item">
              <div className="activity-icon new-user">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">New User Registered</div>
                <div className="activity-desc">John Doe joined as an employer</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon new-job">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">New Job Posted</div>
                <div className="activity-desc">Senior Chef at Gourmet Restaurant</div>
                <div className="activity-time">5 hours ago</div>
              </div>
            </div>
            
            {mockApplications.map((app) => (
              <div key={app.id} className="activity-item">
                <div className="activity-icon application">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New Application</div>
                  <div className="activity-desc">{app.user} applied for {app.job}</div>
                  <div className="activity-time">{app.time}</div>
                </div>
              </div>
            ))}
            
            <div className="activity-item">
              <div className="activity-icon payment">
                <i className="fas fa-credit-card"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">New Payment</div>
                <div className="activity-desc">Premium subscription payment received</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon message">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="activity-content">
                <div className="activity-title">New Message</div>
                <div className="activity-desc">Customer inquiry about job listings</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics; 