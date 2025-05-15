import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import { useNotification } from './NotificationContext';
import { useDialog } from './DialogContext';
import { useEditDialog } from './EditDialogContext';

function AdminDashboard({ activeTab: initialActiveTab = 'users' }) {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  // const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(initialActiveTab); // users or jobs
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const usersPerPage = 5;
  const jobsPerPage = 5;
  
  // Use the notification and dialog context hooks
  const { showNotification } = useNotification();
  const { showConfirmDialog } = useDialog();
  const { showEditDialog } = useEditDialog();

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

  // Stats data
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 0,
    applications: 0,
    revenue: 12589
  });

  const fetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const fetchedJobs = response.data.data.jobs;
      setJobs(fetchedJobs);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalJobs: fetchedJobs.length
      }));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  const fetchApplicationsCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/applications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // The applicationController.getAllApplications returns applications.length in the results property
      const applicationsCount = response.data.results || 0;
      
      console.log('Total applications count from API:', applicationsCount);
      
      // Update stats with the actual count from the database
      setStats(prev => ({
        ...prev,
        applications: applicationsCount
      }));
    } catch (err) {
      console.error('Error fetching applications count:', err);
      // Keep the current value on error
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const fetchedUsers = response.data.data.users;
      setUsers(fetchedUsers);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: fetchedUsers.length,
        activeUsers: fetchedUsers.filter(user => user.active).length
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Only administrators can access this page.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchJobs();
    fetchApplicationsCount();
  }, [fetchUsers, fetchJobs, fetchApplicationsCount]);

  const handleEditUser = useCallback(async (userId) => {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        showNotification('Invalid user ID', 'error');
        return;
      }
      
      const user = users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      showEditDialog({
        title: 'Edit User Role',
        fields: [
          {
            name: 'role',
            label: 'Role',
            required: true
          }
        ],
        initialValues: { role: user.role },
        onSubmit: async (values) => {
          try {
            const token = localStorage.getItem('token');
            console.log(`Updating user with ID: ${userId}`);
            
            const response = await axios.patch(
                  `http://localhost:5000/api/admin/users/${userId}`,
                    { role: values.role },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            console.log('Update response:', response);
            await fetchUsers(); // Refresh the list
            showNotification('User updated successfully!');
          } catch (err) {
            console.error('Error updating user:', err);
            console.error('Error details:', {
              message: err.message,
              response: err.response,
              status: err.response?.status,
              data: err.response?.data
            });
            showNotification(err.response?.data?.message || 'Failed to update user', 'error');
          }
        }
      });
    } catch (err) {
      console.error('Error preparing to edit user:', err);
      showNotification('Error preparing to edit user', 'error');
    }
  }, [users, fetchUsers, showEditDialog, showNotification]);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      showConfirmDialog({
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        onConfirm: async () => {
          try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        activeUsers: prev.activeUsers - (users.find(u => u._id === userId)?.active ? 1 : 0)
      }));
      
            showNotification('User deleted successfully!');
          } catch (err) {
            console.error('Error deleting user:', err);
            showNotification(err.response?.data?.message || 'Failed to delete user', 'error');
          }
        }
      });
    } catch (err) {
      console.error('Error showing delete confirmation:', err);
      showNotification('Something went wrong', 'error');
    }
  }, [users, showConfirmDialog, showNotification]);

  const handleEditJob = useCallback(async (jobId) => {
    try {
      window.location.href = `/jobs/${jobId}`;
    } catch (err) {
      console.error('Error navigating to job:', err);
      showNotification('Failed to navigate to job edit page', 'error');
    }
  }, [showNotification]);

  const handleDeleteJob = useCallback(async (jobId) => {
    try {
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

      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalJobs: prev.totalJobs - 1
      }));
      
            showNotification('Job deleted successfully!');
          } catch (err) {
            console.error('Error deleting job:', err);
            showNotification(err.response?.data?.message || 'Failed to delete job', 'error');
          }
        }
      });
    } catch (err) {
      console.error('Error showing delete confirmation:', err);
      showNotification('Something went wrong', 'error');
    }
  }, [showConfirmDialog, showNotification]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const searchMatch = 
      search === '' || 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    // Role filter
    const roleMatch = 
      roleFilter === 'all' || 
      user.jobRole === roleFilter;
    
    // Plan filter
    const planMatch = 
      planFilter === 'all' || 
      (user.subscriptionPlan || 'free') === planFilter;
    
    return searchMatch && roleMatch && planMatch;
  });

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    // Search filter
    const searchMatch = 
      jobSearch === '' || 
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(jobSearch.toLowerCase()));
    
    // Category filter
    const categoryMatch = 
      jobCategoryFilter === 'all' || 
      job.category === jobCategoryFilter;
    
    // Type filter
    const typeMatch = 
      jobTypeFilter === 'all' || 
      job.type === jobTypeFilter;
    
    return searchMatch && categoryMatch && typeMatch;
  });

  // Pagination for users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Pagination for jobs
  const indexOfLastJob = currentJobPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalJobPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalUserPages) {
      setCurrentPage(pageNumber);
    }
  };

  const paginateJobs = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalJobPages) {
      setCurrentJobPage(pageNumber);
    }
  };

  // const toggleSidebar = () => {
  //   setSidebarExpanded(!sidebarExpanded);
  // };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`admin-sidebar`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-user-circle"></i>
            <h2>Admin</h2>
          </div>
           {/* <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas fa-${sidebarExpanded ? 'chevron-left' : 'chevron-right'}`}></i>
          </button>  */}
        </div> 
        <div className="sidebar-menu">
          <div className="menu-category">Dashboard</div>
          <Link to="/admin/dashboard" className="menu-item active">
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
          <button 
            className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i>
            <span>Users</span>
          </button>
          <button 
            className={`menu-item ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fas fa-briefcase"></i>
            <span>Jobs</span>
          </button>
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
          <Link to="/settings" className="menu-item">
            <i className="fas fa-cog"></i>
            <span>System</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, track statistics, and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon users">
                <i className="fas fa-users"></i>
              </div>
            </div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i>
              12% from last month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon jobs">
                <i className="fas fa-briefcase"></i>
              </div>
            </div>
            <div className="stat-value">{stats.totalJobs}</div>
            <div className="stat-label">Total Jobs</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i>
              5% from last month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon applications">
                <i className="fas fa-file-alt"></i>
              </div>
            </div>
            <div className="stat-value">{stats.applications}</div>
            <div className="stat-label">Applications</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i>
              8% from last month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon revenue">
                <i className="fas fa-dollar-sign"></i>
              </div>
            </div>
            <div className="stat-value">${(stats.revenue).toLocaleString()}</div>
            <div className="stat-label">Revenue</div>
            <div className="stat-change negative">
              <i className="fas fa-arrow-down"></i>
              3% from last month
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i> User Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fas fa-briefcase"></i> Job Management
          </button>
        </div>

        {/* Users Section */}
        {activeTab === 'users' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>User Management</h2>
              <div className="actions">
                <button className="btn btn-secondary">
                  <i className="fas fa-download"></i> Export
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i> Add User
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="search-and-filter">
              <div className="search-input">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search users..."
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
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="job-seeker">Job Seeker</option>
                  <option value="job-poster">Job Poster</option>
                </select>
                <select 
                  className="filter-select"
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Subscription Plan</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.jobRole}`}>
                            {user.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`plan-badge ${user.subscriptionPlan || 'free'}`}>
                            {user.subscriptionPlan ? 
                              user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1) : 
                              'Free'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditUser(user._id)}
                              title="Edit User"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteUser(user._id)}
                              title="Delete User"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        No users found matching the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="pagination">
                <button 
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  className={`pagination-btn ${currentPage === totalUserPages ? 'disabled' : ''}`}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalUserPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Jobs Section */}
        {activeTab === 'jobs' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Job Management</h2>
              <div className="actions">
                <button className="btn btn-secondary">
                  <i className="fas fa-download"></i> Export
                </button>
                <Link to="/postjob" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Post New Job
                </Link>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="search-and-filter">
              <div className="search-input">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search jobs..."
                  value={jobSearch}
                  onChange={(e) => {
                    setJobSearch(e.target.value);
                    setCurrentJobPage(1); // Reset to first page on search
                  }}
                />
              </div>
              <div className="filter-group">
                <select 
                  className="filter-select"
                  value={jobCategoryFilter}
                  onChange={(e) => {
                    setJobCategoryFilter(e.target.value);
                    setCurrentJobPage(1); // Reset to first page on filter change
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
                  value={jobTypeFilter}
                  onChange={(e) => {
                    setJobTypeFilter(e.target.value);
                    setCurrentJobPage(1); // Reset to first page on filter change
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
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Posted On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.length > 0 ? (
                    currentJobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.title}</td>
                        <td>{job.company}</td>
                        <td>{job.location}</td>
                        <td>
                          <span className={`role-badge job-type-${job.type}`}>
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                          </span>
                        </td>
                        <td>{formatDate(job.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${job.featured ? 'featured' : job.urgent ? 'urgent' : 'active'}`}>
                            {job.featured ? 'Featured' : job.urgent ? 'Urgent' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/jobs/${job._id}`}
                              className="action-btn view"
                              title="View Details"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditJob(job._id)}
                              title="Edit Job"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteJob(job._id)}
                              title="Delete Job"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No jobs found matching the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="pagination">
                <button 
                  className={`pagination-btn ${currentJobPage === 1 ? 'disabled' : ''}`}
                  onClick={() => paginateJobs(currentJobPage - 1)}
                  disabled={currentJobPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: totalJobPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`pagination-btn ${currentJobPage === number ? 'active' : ''}`}
                    onClick={() => paginateJobs(number)}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  className={`pagination-btn ${currentJobPage === totalJobPages ? 'disabled' : ''}`}
                  onClick={() => paginateJobs(currentJobPage + 1)}
                  disabled={currentJobPage === totalJobPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 