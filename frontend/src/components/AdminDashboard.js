import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const usersPerPage = 5;

  // Stats data
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 23,
    applications: 157,
    revenue: 12589
  });

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
  }, [fetchUsers]);

  const handleEditUser = useCallback(async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newRole = prompt('Enter new role (user/employer/admin):', user.role);
      if (!newRole) {
        return; // User cancelled
      }

      const token = localStorage.getItem('token');
      await axios.patch(
            `http://localhost:5000/api/admin/users/${userId}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await fetchUsers(); // Refresh the list
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  }, [users, fetchUsers]);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

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
      
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  }, [users]);

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
      user.role === roleFilter;
    
    // Status filter
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.active) || 
      (statusFilter === 'inactive' && !user.active);
    
    return searchMatch && roleMatch && statusMatch;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
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
      <div className={`admin-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-briefcase"></i>
            <h2>JobLink Admin</h2>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas fa-${sidebarExpanded ? 'chevron-left' : 'chevron-right'}`}></i>
          </button>
        </div>
        <div className="sidebar-menu">
          <div className="menu-category">Dashboard</div>
          <a href="#overview" className="menu-item active">
            <i className="fas fa-home"></i>
            <span>Overview</span>
          </a>
          <a href="#analytics" className="menu-item">
            <i className="fas fa-chart-line"></i>
            <span>Analytics</span>
          </a>
          
          <div className="menu-category">Management</div>
          <a href="#users" className="menu-item">
            <i className="fas fa-users"></i>
            <span>Users</span>
          </a>
          <a href="#jobs" className="menu-item">
            <i className="fas fa-briefcase"></i>
            <span>Jobs</span>
          </a>
          <a href="#applications" className="menu-item">
            <i className="fas fa-file-alt"></i>
            <span>Applications</span>
          </a>
          
          <div className="menu-category">Settings</div>
          <a href="#account" className="menu-item">
            <i className="fas fa-user-cog"></i>
            <span>Account</span>
          </a>
          <a href="#security" className="menu-item">
            <i className="fas fa-shield-alt"></i>
            <span>Security</span>
          </a>
          <a href="#system" className="menu-item">
            <i className="fas fa-cog"></i>
            <span>System</span>
          </a>
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

        {/* Users Section */}
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
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="employer">Employer</option>
              </select>
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              <th>Status</th>
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
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Active' : 'Inactive'}
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
    </div>
  );
}

export default AdminDashboard; 