import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminMessages.css';
import { useDialog } from './DialogContext';
import { useNotification } from './NotificationContext';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { showConfirmDialog } = useDialog();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('http://localhost:5000/api/messages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError(error.message);
        showNotification(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [showNotification]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://localhost:5000/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
      
      // Update the local state
      setMessages(messages.map(message => 
        message._id === id ? { ...message, isRead: true } : message
      ));
      
      showNotification('Message marked as read', 'success');
    } catch (error) {
      console.error('Error marking message as read:', error);
      setError(error.message);
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      // Remove the message from the local state
      setMessages(messages.filter(message => message._id !== id));
      
      // Close the modal if the deleted message was selected
      if (selectedMessage && selectedMessage._id === id) {
        setShowModal(false);
        setSelectedMessage(null);
      }
      
      showNotification('Message deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      setError(error.message);
      showNotification(error.message, 'error');
    }
  };

  const confirmDeleteMessage = (id) => {
    showConfirmDialog({
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      onConfirm: () => handleDeleteMessage(id),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    });
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // If message is unread, mark it as read
    if (!message.isRead) {
      handleMarkAsRead(message._id);
    }
  };

  const closeMessageModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
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
            <Link to="/admin/messages" className="menu-item active">
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
        <div className="admin-messages-container">
          <div className="loader">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
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
            <Link to="/admin/messages" className="menu-item active">
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
        <div className="admin-messages-container">
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
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
          <Link to="/admin/messages" className="menu-item active">
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
      <div className="admin-messages-container">
        <div className="admin-messages-header">
          <h1>Contact Messages</h1>
          <p>Manage and respond to user inquiries</p>
        </div>
        
        <div className="admin-messages-stats">
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="stats-info">
              <h3>Total Messages</h3>
              <p>{messages.length}</p>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-envelope-open"></i>
            </div>
            <div className="stats-info">
              <h3>Unread Messages</h3>
              <p>{messages.filter(msg => !msg.isRead).length}</p>
            </div>
          </div>
        </div>
        
        <div className="section-header">
          <h2>Message Management</h2>
          <div className="actions">
            <button className="btn btn-secondary">
              <i className="fas fa-download"></i> Export
            </button>
          </div>
        </div>
        
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-inbox"></i>
            <h2>No messages yet</h2>
            <p>When users send contact messages, they will appear here.</p>
          </div>
        ) : (
          <div className="messages-table-container">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(message => (
                  <tr 
                    key={message._id} 
                    className={!message.isRead ? 'unread-message' : ''}
                    onClick={() => openMessageModal(message)}
                  >
                    <td>
                      {!message.isRead ? (
                        <span className="status-badge unread">Unread</span>
                      ) : (
                        <span className="status-badge read">Read</span>
                      )}
                    </td>
                    <td>
                      <div className="message-sender">
                        <span className="sender-name">{message.name}</span>
                        <span className="sender-email">{message.email}</span>
                      </div>
                    </td>
                    <td className="message-subject">{message.subject}</td>
                    <td>{formatDate(message.createdAt)}</td>
                    <td>
                      <div className="message-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMessageModal(message);
                          }}
                          title="View Message"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteMessage(message._id);
                          }}
                          title="Delete Message"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {showModal && selectedMessage && (
          <div className="message-modal-overlay">
            <div className="message-modal">
              <div className="message-modal-header">
                <h2>{selectedMessage.subject}</h2>
                <button className="close-modal-btn" onClick={closeMessageModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="message-modal-info">
                <div className="message-modal-sender">
                  <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                </div>
                <div className="message-modal-date">
                  <p><strong>Date:</strong> {formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>
              
              <div className="message-modal-content">
                <p>{selectedMessage.message}</p>
              </div>
              
              <div className="message-modal-actions">
                <a 
                  href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`}
                  className="reply-btn"
                >
                  <i className="fas fa-reply"></i>
                  Reply via Email
                </a>
                <button 
                  className="delete-message-btn"
                  onClick={() => confirmDeleteMessage(selectedMessage._id)}
                >
                  <i className="fas fa-trash"></i>
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMessages; 