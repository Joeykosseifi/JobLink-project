import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MyNetwork.css';

const MyNetwork = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState({
    connected: [],
    pending: [],
    requests: []
  });
  const [connectStatus, setConnectStatus] = useState({});
  const [notifications, setNotifications] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view your network');
          setLoading(false);
          return;
        }

        // Get current user info
        const userData = localStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        // Fetch users and connections in parallel
        const [usersResponse, connectionsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/users/connections', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Get the current user ID (from parsed user data)
        const currentUserData = JSON.parse(userData);
        const currentUserId = currentUserData._id || currentUserData.id;

        // Filter out admin users and current user
        const filteredUsers = usersResponse.data.data.users.filter(user => {
          // First check if it's an admin
          if (user.role === 'admin') return false;
          
          // Then check if it's the current user (using multiple comparison methods for safety)
          if (user._id && currentUserId) {
            // Try multiple comparison methods to ensure we catch all cases
            const isCurrentUser = 
              user._id === currentUserId || 
              String(user._id) === String(currentUserId);
              
            if (isCurrentUser) return false;
          }
          
          return true;
        });
        
        // Save connection data
        const connectionData = connectionsResponse.data.data;
        setConnections({
          connected: connectionData.connections || [],
          pending: connectionData.pendingConnections || [],
          requests: connectionData.connectionRequests || []
        });

        // Create a map of connection statuses for each user
        const statusMap = {};
        
        // Add connected users
        connectionData.connections.forEach(user => {
          statusMap[user._id] = 'connected';
        });
        
        // Add pending connection requests
        connectionData.pendingConnections.forEach(user => {
          statusMap[user._id] = 'pending';
        });
        
        // Add received connection requests
        connectionData.connectionRequests.forEach(user => {
          statusMap[user._id] = 'request';
        });
        
        setConnectStatus(statusMap);
        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load network data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle connection request
  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:5000/api/users/connect',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setConnectStatus(prev => ({
        ...prev,
        [userId]: 'pending'
      }));
      
      // Add to pending connections
      setConnections(prev => ({
        ...prev,
        pending: [...prev.pending, users.find(user => user._id === userId)]
      }));
      
      // Show success notification
      setNotifications({
        show: true,
        message: 'Connection request sent successfully!',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, show: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error connecting with user:', error);
      
      // Show error notification
      setNotifications({
        show: true,
        message: error.response?.data?.message || 'Failed to send connection request',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Handle accepting connection request
  const handleAcceptRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:5000/api/users/accept-connection',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setConnectStatus(prev => ({
        ...prev,
        [userId]: 'connected'
      }));
      
      // Update connections
      const user = users.find(user => user._id === userId);
      
      setConnections(prev => ({
        connected: [...prev.connected, user],
        pending: prev.pending,
        requests: prev.requests.filter(req => req._id !== userId)
      }));
      
      // Show success notification
      setNotifications({
        show: true,
        message: 'Connection request accepted!',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, show: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error accepting connection request:', error);
      
      // Show error notification
      setNotifications({
        show: true,
        message: error.response?.data?.message || 'Failed to accept connection request',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Handle rejecting connection request
  const handleRejectRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:5000/api/users/reject-connection',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      const newConnectStatus = { ...connectStatus };
      delete newConnectStatus[userId];
      setConnectStatus(newConnectStatus);
      
      // Update connections
      setConnections(prev => ({
        ...prev,
        requests: prev.requests.filter(req => req._id !== userId)
      }));
      
      // Show success notification
      setNotifications({
        show: true,
        message: 'Connection request rejected',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, show: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      
      // Show error notification
      setNotifications({
        show: true,
        message: error.response?.data?.message || 'Failed to reject connection request',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Get connection button based on status
  const getConnectionButton = (user) => {
    const status = connectStatus[user._id];
    
    switch(status) {
      case 'connected':
        return (
          <button className="connected-button" disabled>
            <i className="fas fa-check"></i> Connected
          </button>
        );
      case 'pending':
        return (
          <button className="pending-button" disabled>
            <i className="fas fa-clock"></i> Request Pending
          </button>
        );
      case 'request':
        return (
          <div className="request-buttons">
            <button 
              className="accept-button" 
              onClick={() => handleAcceptRequest(user._id)}
            >
              <i className="fas fa-check"></i> Accept
            </button>
            <button 
              className="reject-button"
              onClick={() => handleRejectRequest(user._id)}
            >
              <i className="fas fa-times"></i> Reject
            </button>
          </div>
        );
      default:
        return (
          <button 
            className="connect-button"
            onClick={() => handleConnect(user._id)}
          >
            <i className="fas fa-user-plus"></i> Connect
          </button>
        );
    }
  };

  // Filter users based on job role
  const getFilteredUsers = (usersList) => {
    if (activeFilter === 'all') {
      return usersList;
    }
    
    return usersList.filter(user => {
      // Treat users without a jobRole as job-seekers by default
      const userRole = user.jobRole || 'job-seeker';
      return userRole === activeFilter;
    });
  };

  // Set active filter
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Get non-connected users for the "People in Your Network" section
  const getNonConnectedUsers = () => {
    // Filter out users who already have a connection status
    return users.filter(user => !connectStatus[user._id]);
  };

  if (loading) {
    return (
      <div className="network-loading">
        <div className="loading-spinner"></div>
        <p>Loading your professional network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="network-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-network-page">
      {notifications.show && (
        <div className={`notification ${notifications.type}`}>
          {notifications.type === 'success' ? (
            <i className="fas fa-check-circle"></i>
          ) : (
            <i className="fas fa-exclamation-circle"></i>
          )}
          <p>{notifications.message}</p>
        </div>
      )}
      
      <div className="network-header">
        <h1>Professional Network</h1>
        <p>Connect with industry professionals, share opportunities, and grow your career</p>
      </div>

      {/* Current User Profile Card */}
      {currentUser && (
        <div className="current-user-section">
          <h2 className="section-title">Your Profile</h2>
          <div className="current-user-card">
            <div className="current-user-header">
              <div className="current-user-avatar">
                {currentUser.profileImage ? (
                  <img src={currentUser.profileImage} alt={currentUser.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="current-user-basics">
                <h2 className="current-user-name">
                  {currentUser.name}
                  {currentUser.jobRole && (
                    <span className={`user-job-role ${currentUser.jobRole}`}>
                      <i className={`fas ${currentUser.jobRole === 'job-seeker' ? 'fa-search' : 'fa-briefcase'}`}></i>
                      {currentUser.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
                    </span>
                  )}
                </h2>
                <p className="current-user-title">{currentUser.title || 'Add your professional title'}</p>
                <Link to="/user/account" className="edit-profile-button">
                  <i className="fas fa-edit"></i> Edit Your Profile
                </Link>
              </div>
            </div>
            <div className="current-user-body">
              <div className="current-user-about">
                <h3><i className="fas fa-user"></i> About</h3>
                <p>{currentUser.bio || 'Add a bio to tell other professionals about yourself, your experience, and your interests.'}</p>
              </div>
              <div className="current-user-stats">
                <div className="stat-item">
                  <i className="fas fa-users"></i>
                  <div className="stat-details">
                    <span className="stat-number">{connections.connected.length}</span>
                    <span className="stat-label">Connections</span>
                  </div>
                </div>
                <div className="stat-item">
                  <i className="fas fa-user-plus"></i>
                  <div className="stat-details">
                    <span className="stat-number">{connections.requests.length}</span>
                    <span className="stat-label">Pending Requests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Controls */}
      <div className="network-filters">
        <h2 className="section-title">Filter Network</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <i className="fas fa-users"></i> All Professionals
          </button>
          <button 
            className={`filter-button ${activeFilter === 'job-seeker' ? 'active' : ''}`}
            onClick={() => handleFilterChange('job-seeker')}
          >
            <i className="fas fa-search"></i> Job Seekers
          </button>
          <button 
            className={`filter-button ${activeFilter === 'job-poster' ? 'active' : ''}`}
            onClick={() => handleFilterChange('job-poster')}
          >
            <i className="fas fa-briefcase"></i> Job Posters
          </button>
        </div>
      </div>
      
      {/* Connection Requests Section */}
      {connections.requests.length > 0 && (
        <div className="connection-requests-section">
          <h2 className="section-title">Connection Requests</h2>
          <div className="user-list">
            {getFilteredUsers(connections.requests).map((user) => (
              <div className="user-card" key={user._id}>
                <div className="user-header">
                  <div className="user-avatar">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-basics">
                    <h3 className="user-name">
                      {user.name}
                      {user.jobRole && (
                        <span className={`user-job-role ${user.jobRole}`}>
                          <i className={`fas ${user.jobRole === 'job-seeker' ? 'fa-search' : 'fa-briefcase'}`}></i>
                          {user.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
                        </span>
                      )}
                    </h3>
                    <p className="user-title">{user.title || 'JobLink Member'}</p>
                    <div className="request-buttons">
                      <button 
                        className="accept-button" 
                        onClick={() => handleAcceptRequest(user._id)}
                      >
                        <i className="fas fa-check"></i> Accept
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => handleRejectRequest(user._id)}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                  </div>
                </div>
                <div className="user-body">
                  <div className="user-about">
                    <h3><i className="fas fa-user"></i> About</h3>
                    <p className="user-bio">
                      {user.bio || 
                        'This user has not added a bio yet. Connect to learn more about their professional experience and interests.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeFilter !== 'all' && getFilteredUsers(connections.requests).length === 0 && (
            <div className="no-results">
              <p>No {activeFilter === 'job-seeker' ? 'job seekers' : 'job posters'} in your connection requests.</p>
            </div>
          )}
        </div>
      )}

      {/* My Connections Section */}
      {connections.connected.length > 0 && (
        <div className="my-connections-section">
          <h2 className="section-title">My Connections</h2>
          <p className="section-description">People you've connected with on JobLink</p>
          
          <div className="user-list">
            {getFilteredUsers(connections.connected).map((user) => (
              <div className="user-card connected-user-card" key={user._id}>
                <div className="user-header">
                  <div className="user-avatar">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-basics">
                    <h3 className="user-name">
                      {user.name}
                      {user.jobRole && (
                        <span className={`user-job-role ${user.jobRole}`}>
                          <i className={`fas ${user.jobRole === 'job-seeker' ? 'fa-search' : 'fa-briefcase'}`}></i>
                          {user.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
                        </span>
                      )}
                    </h3>
                    <p className="user-title">{user.title || 'JobLink Member'}</p>
                    <div className="connection-status">
                      <span className="connection-badge">
                        <i className="fas fa-check"></i> Connected
                      </span>
                      <button className="message-button">
                        <i className="fas fa-envelope"></i> Message
                      </button>
                    </div>
                  </div>
                </div>
                <div className="user-body">
                  <div className="user-about">
                    <h3><i className="fas fa-user"></i> About</h3>
                    <p className="user-bio">
                      {user.bio || 
                        'This user has not added a bio yet.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeFilter !== 'all' && getFilteredUsers(connections.connected).length === 0 && (
            <div className="no-results">
              <p>No {activeFilter === 'job-seeker' ? 'job seekers' : 'job posters'} in your connections.</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Connections Section */}
      {connections.pending.length > 0 && (
        <div className="pending-connections-section">
          <h2 className="section-title">Pending Connections</h2>
          <p className="section-description">Connection requests you've sent</p>
          
          <div className="user-list">
            {getFilteredUsers(connections.pending).map((user) => (
              <div className="user-card pending-user-card" key={user._id}>
                <div className="user-header">
                  <div className="user-avatar">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-basics">
                    <h3 className="user-name">
                      {user.name}
                      {user.jobRole && (
                        <span className={`user-job-role ${user.jobRole}`}>
                          <i className={`fas ${user.jobRole === 'job-seeker' ? 'fa-search' : 'fa-briefcase'}`}></i>
                          {user.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
                        </span>
                      )}
                    </h3>
                    <p className="user-title">{user.title || 'JobLink Member'}</p>
                    <div className="connection-status">
                      <span className="pending-badge">
                        <i className="fas fa-clock"></i> Request Pending
                      </span>
                    </div>
                  </div>
                </div>
                <div className="user-body">
                  <div className="user-about">
                    <h3><i className="fas fa-user"></i> About</h3>
                    <p className="user-bio">
                      {user.bio || 
                        'This user has not added a bio yet.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeFilter !== 'all' && getFilteredUsers(connections.pending).length === 0 && (
            <div className="no-results">
              <p>No {activeFilter === 'job-seeker' ? 'job seekers' : 'job posters'} in your pending connections.</p>
            </div>
          )}
        </div>
      )}

      {/* Network Section - Only show users that aren't connected */}
      {getNonConnectedUsers().length > 0 && (
      <div className="network-section">
        <h2 className="section-title">People in Your Network</h2>
        <div className="network-stats">
          <div className="stat-card">
              <div className="stat-value">
                {activeFilter === 'all' 
                  ? getNonConnectedUsers().length 
                  : getNonConnectedUsers().filter(user => {
                      const userRole = user.jobRole || 'job-seeker';
                      return userRole === activeFilter;
                    }).length}
              </div>
              <div className="stat-label">
                {activeFilter === 'all' 
                  ? 'Professionals' 
                  : activeFilter === 'job-seeker' ? 'Job Seekers' : 'Job Posters'}
              </div>
          </div>
        </div>

        <div className="user-list">
            {getFilteredUsers(getNonConnectedUsers()).map((user) => (
            <div className="user-card" key={user._id}>
              <div className="user-header">
                <div className="user-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-basics">
                    <h3 className="user-name">
                      {user.name}
                      {user.jobRole && (
                        <span className={`user-job-role ${user.jobRole}`}>
                          <i className={`fas ${user.jobRole === 'job-seeker' ? 'fa-search' : 'fa-briefcase'}`}></i>
                          {user.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
                        </span>
                      )}
                    </h3>
                  <p className="user-title">{user.title || 'JobLink Member'}</p>
                  {getConnectionButton(user)}
                </div>
              </div>
              <div className="user-body">
                <div className="user-about">
                  <h3><i className="fas fa-user"></i> About</h3>
                  <p className="user-bio">
                    {user.bio || 
                      'This user has not added a bio yet. Connect to learn more about their professional experience and interests.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
          {activeFilter !== 'all' && getFilteredUsers(getNonConnectedUsers()).length === 0 && (
            <div className="no-results">
              <p>No {activeFilter === 'job-seeker' ? 'job seekers' : 'job posters'} found in your network.</p>
            </div>
          )}
        </div>
      )}

      {getNonConnectedUsers().length === 0 && (
        <div className="empty-network-section">
          <h2 className="section-title">People in Your Network</h2>
          <div className="no-results">
            <p>You've connected with everyone in your network! Check back later for new professionals.</p>
        </div>
      </div>
      )}
    </div>
  );
};

export default MyNetwork; 