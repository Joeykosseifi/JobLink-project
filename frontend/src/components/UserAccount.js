import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserAccount.css';

const UserAccount = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    profileImage: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    jobRole: 'job-seeker' // Default to job-seeker
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      console.log('Loaded user data:', parsedUser);
      console.log('User ID:', parsedUser._id || parsedUser.id);
      
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name,
        email: parsedUser.email,
        title: parsedUser.title || '',
        bio: parsedUser.bio || '',
        profileImage: parsedUser.profileImage || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        jobRole: parsedUser.jobRole || 'job-seeker' // Load existing job role or default to job-seeker
      });
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setError('Error loading user data');
      setLoading(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    // Validate passwords match if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Log request details for debugging
      console.log('Sending request to:', 'http://localhost:5000/api/users/update-profile');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      console.log('Request body:', {
        name: formData.name,
        email: formData.email,
        title: formData.title,
        bio: formData.bio,
        profileImage: formData.profileImage,
        jobRole: formData.jobRole,
        currentPassword: formData.currentPassword ? '[HIDDEN]' : undefined,
        newPassword: formData.newPassword ? '[HIDDEN]' : undefined
      });

      const response = await axios.put(
        'http://localhost:5000/api/users/update-profile',
        {
          name: formData.name,
          email: formData.email,
          title: formData.title,
          bio: formData.bio,
          profileImage: formData.profileImage,
          jobRole: formData.jobRole,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Server response:', response.data);
      console.log('Updated job role:', response.data.user.jobRole);

      // Make sure the jobRole is included in the updated user data
      const updatedUser = response.data.user;
      if (!updatedUser.jobRole) {
        console.warn('Job role not included in response, using form data value');
        updatedUser.jobRole = formData.jobRole;
      }

      // Preserve existing user data that wasn't updated
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      const mergedUserData = {
        ...currentUserData,
        ...updatedUser,
        // Explicitly ensure these important fields are preserved
        _id: currentUserData._id || currentUserData.id,
        connections: currentUserData.connections,
        connectionRequests: currentUserData.connectionRequests,
        pendingConnections: currentUserData.pendingConnections
      };

      console.log('Merged user data being saved:', mergedUserData);

      // Update local storage with merged user data
      localStorage.setItem('user', JSON.stringify(mergedUserData));
      setUser(mergedUserData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Update profile error:', err);
      console.error('Error response:', err.response);
      
      // More detailed error message
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Error updating profile. Please try again.';
      
      setError(`Error: ${errorMessage}`);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  if (loading) {
    return <div className="user-account-loading">Loading...</div>;
  }

  if (error) {
    return <div className="user-account-error">{error}</div>;
  }

  return (
    <div className="user-account-page">
      <div className="user-account-container">
        <div className="user-account-header">
          <h1>My Profile</h1>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <><i className="fas fa-times"></i> Cancel</>
            ) : (
              <><i className="fas fa-edit"></i> Edit Profile</>
            )}
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}

        <div className="profile-preview">
          <div className="profile-avatar">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt={formData.name} />
            ) : (
              <div className="avatar-placeholder">
                {formData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h2>{formData.name}</h2>
            <p className="profile-title">{formData.title || 'No title specified'}</p>
            <div className="job-role-badge">
              <i className={`fas ${formData.jobRole === 'job-seeker' ? 'fa-search' : 'fa-briefcase'}`}></i>
              {formData.jobRole === 'job-seeker' ? 'Job Seeker' : 'Job Poster'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="user-account-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Professional Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Senior Chef, Restaurant Manager"
            />
          </div>
          
          <div className="form-group">
            <label>I am a:</label>
            <div className="job-role-selection">
              <label className={`job-role-option ${formData.jobRole === 'job-seeker' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="jobRole"
                  value="job-seeker"
                  checked={formData.jobRole === 'job-seeker'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <i className="fas fa-search"></i>
                <span>Job Seeker</span>
                <p className="role-description">I'm looking for job opportunities</p>
              </label>
              
              <label className={`job-role-option ${formData.jobRole === 'job-poster' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="jobRole"
                  value="job-poster"
                  checked={formData.jobRole === 'job-poster'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <i className="fas fa-briefcase"></i>
                <span>Job Poster</span>
                <p className="role-description">I'm hiring and posting job offers</p>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Tell others about yourself and your professional background"
              rows={4}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Profile Image URL</label>
            <input
              type="text"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="https://example.com/your-image.jpg"
            />
          </div>

          {isEditing && (
            <>
              <div className="form-divider">
                <h3>Change Password</h3>
              </div>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (optional)"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>

              <button type="submit" className="save-button">
                <i className="fas fa-save"></i> Save Changes
              </button>
            </>
          )}
        </form>

        <div className="user-account-info">
          <h2>Account Information</h2>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className={`user-role ${user.role}`}>{user.role}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Member Since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount; 