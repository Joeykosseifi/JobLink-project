import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Settings.css';
import { useNotification } from './NotificationContext';
import { useDialog } from './DialogContext';

const Settings = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showConfirmDialog } = useDialog();
  
  const [settings, setSettings] = useState({
    emailNotifications: {
      jobAlerts: true,
      applicationUpdates: true,
      newsletters: false,
      marketingEmails: false
    },
    privacySettings: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    preferences: {
      darkMode: false,
      language: 'english'
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      lastPasswordChange: '2023-01-01'
    },
    profileInfo: {
      bio: '',
      skills: [],
      resumeUploaded: false
    },
    jobPreferences: {
      desiredSalary: {
        min: 30000,
        max: 100000
      },
      preferredLocations: [],
      jobTypes: [],
      remoteOnly: false,
      availableFrom: ''
    },
    connectedAccounts: {
      google: false,
      linkedin: false,
      facebook: false,
      github: false
    }
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/settings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.settings) {
          setSettings(response.data.settings);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
        showNotification('Failed to load settings', 'error');
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate, showNotification]);

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSelectChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleRangeChange = (category, setting, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: {
          ...prev[category][setting],
          [key]: value
        }
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      showNotification('New passwords do not match', 'error');
      return;
    }

    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/settings/password',
        passwordData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      showNotification('Password updated successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update password';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !settings.profileInfo.skills.includes(skillInput.trim())) {
      setSettings(prev => ({
        ...prev,
        profileInfo: {
          ...prev.profileInfo,
          skills: [...prev.profileInfo.skills, skillInput.trim()]
        }
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSettings(prev => ({
      ...prev,
      profileInfo: {
        ...prev.profileInfo,
        skills: prev.profileInfo.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;
    if (location && !settings.jobPreferences.preferredLocations.includes(location)) {
      setSettings(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          preferredLocations: [...prev.jobPreferences.preferredLocations, location]
        }
      }));
    }
  };

  const removeLocation = (locationToRemove) => {
    setSettings(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        preferredLocations: prev.jobPreferences.preferredLocations.filter(
          location => location !== locationToRemove
        )
      }
    }));
  };

  const handleJobTypeChange = (jobType) => {
    const updatedJobTypes = settings.jobPreferences.jobTypes.includes(jobType)
      ? settings.jobPreferences.jobTypes.filter(type => type !== jobType)
      : [...settings.jobPreferences.jobTypes, jobType];
    
    setSettings(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        jobTypes: updatedJobTypes
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.put(
        'http://localhost:5000/api/settings',
        { settings },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      showNotification('Settings saved successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteAccount = () => {
    showConfirmDialog({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          console.log('Deleting account, token exists:', !!token);
          
          // Log the full request details for debugging
          console.log('Making DELETE request to:', 'http://localhost:5000/api/settings/account');
          console.log('With headers:', { Authorization: `Bearer ${token ? token.substring(0, 10) + '...' : 'none'}` });
          
          const response = await axios.delete('http://localhost:5000/api/settings/account', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Delete account response:', response.data);
          
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showNotification('Your account has been deleted successfully', 'success');
          navigate('/');
        } catch (err) {
          console.error('Full delete account error:', err);
          
          // More detailed error handling
          if (err.response) {
            // The server responded with a status code outside of 2xx
            console.error('Server error response:', {
              status: err.response.status,
              data: err.response.data
            });
            const errorMessage = err.response.data.message || 'Failed to delete account';
            showNotification(`Error (${err.response.status}): ${errorMessage}`, 'error');
          } else if (err.request) {
            // The request was made but no response was received
            console.error('No response received from server');
            showNotification('Server not responding. Please try again later.', 'error');
          } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', err.message);
            showNotification('Error preparing request: ' + err.message, 'error');
          }
        }
      }
    });
  };

  if (loading) {
    return <div className="settings-loading">Loading...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Account Settings</h1>
            </div>

          {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            </div>
          )}

        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fas fa-bell"></i> Notifications
          </button>
          <button 
            className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <i className="fas fa-user-shield"></i> Privacy
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="fas fa-sliders-h"></i> Preferences
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fas fa-lock"></i> Security
          </button>
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'job' ? 'active' : ''}`}
            onClick={() => setActiveTab('job')}
          >
            <i className="fas fa-briefcase"></i> Job Preferences
          </button>
          <button 
            className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <i className="fas fa-link"></i> Connected Accounts
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
          <section className="settings-section">
            <h2><i className="fas fa-bell"></i> Notification Settings</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.jobAlerts}
                    onChange={() => handleToggle('emailNotifications', 'jobAlerts')}
                  />
                  Job Alerts
                </label>
                <span className="setting-description">
                  Receive notifications about new job postings matching your preferences
                </span>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.applicationUpdates}
                    onChange={() => handleToggle('emailNotifications', 'applicationUpdates')}
                  />
                  Application Updates
                </label>
                <span className="setting-description">
                  Get notified about the status of your job applications
                </span>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.newsletters}
                    onChange={() => handleToggle('emailNotifications', 'newsletters')}
                  />
                  Newsletters
                </label>
                <span className="setting-description">
                  Receive our weekly newsletter with career tips and insights
                </span>
              </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications.marketingEmails}
                      onChange={() => handleToggle('emailNotifications', 'marketingEmails')}
                    />
                    Marketing Emails
                  </label>
                  <span className="setting-description">
                    Receive promotional emails about our services and partner offers
                </span>
              </div>
            </div>
          </section>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
          <section className="settings-section">
            <h2><i className="fas fa-user-shield"></i> Privacy Settings</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label>Profile Visibility</label>
                <select
                  value={settings.privacySettings.profileVisibility}
                  onChange={(e) => handleSelectChange('privacySettings', 'profileVisibility', e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts">Contacts Only</option>
                </select>
                <span className="setting-description">
                  Control who can view your profile
                </span>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.privacySettings.showEmail}
                    onChange={() => handleToggle('privacySettings', 'showEmail')}
                  />
                  Show Email Address
                </label>
                <span className="setting-description">
                  Allow others to see your email address
                </span>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.privacySettings.showPhone}
                    onChange={() => handleToggle('privacySettings', 'showPhone')}
                  />
                  Show Phone Number
                </label>
                <span className="setting-description">
                  Allow others to see your phone number
                </span>
              </div>
            </div>
          </section>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
          <section className="settings-section">
            <h2><i className="fas fa-sliders-h"></i> Preferences</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.preferences.darkMode}
                    onChange={() => handleToggle('preferences', 'darkMode')}
                  />
                  Dark Mode
                </label>
                <span className="setting-description">
                  Switch between light and dark theme
                </span>
              </div>

              <div className="setting-item">
                <label>Language</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
                <span className="setting-description">
                  Choose your preferred language
                </span>
              </div>
            </div>
          </section>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <section className="settings-section">
              <h2><i className="fas fa-lock"></i> Account Security</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={() => handleToggle('security', 'twoFactorEnabled')}
                    />
                    Two-Factor Authentication
                  </label>
                  <span className="setting-description">
                    Add an extra layer of security to your account
                  </span>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.loginNotifications}
                      onChange={() => handleToggle('security', 'loginNotifications')}
                    />
                    Login Notifications
                  </label>
                  <span className="setting-description">
                    Get notified when someone logs into your account
                  </span>
                </div>

                <div className="security-info">
                  <div className="security-detail">
                    <span className="security-label">Last Password Change:</span>
                    <span className="security-value">
                      {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="password-change-section">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="password-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="password-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="password-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="change-password-btn">
                    <i className="fas fa-key"></i> Update Password
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* Profile Information */}
          {activeTab === 'profile' && (
            <section className="settings-section">
              <h2><i className="fas fa-user"></i> Profile Information</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <label>Professional Bio</label>
                  <textarea
                    value={settings.profileInfo.bio}
                    onChange={(e) => handleSelectChange('profileInfo', 'bio', e.target.value)}
                    placeholder="Write a short professional bio"
                    rows={4}
                  ></textarea>
                  <span className="setting-description">
                    A brief summary about your professional background
                  </span>
                </div>

                <div className="setting-item">
                  <label>Skills</label>
                  <div className="skills-input-container">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                    />
                    <button 
                      type="button" 
                      className="add-skill-btn"
                      onClick={addSkill}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  
                  <div className="skills-list">
                    {settings.profileInfo.skills.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <button 
                          type="button" 
                          className="remove-skill-btn"
                          onClick={() => removeSkill(skill)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <span className="setting-description">
                    Add skills that showcase your abilities
                  </span>
                </div>

                <div className="setting-item">
                  <label>Resume</label>
                  <div className="resume-upload">
                    {settings.profileInfo.resumeUploaded ? (
                      <div className="resume-status">
                        <i className="fas fa-file-pdf"></i>
                        <span>Resume uploaded</span>
                        <button type="button" className="view-resume-btn">
                          View
                        </button>
                        <button 
                          type="button" 
                          className="remove-resume-btn"
                          onClick={() => handleSelectChange('profileInfo', 'resumeUploaded', false)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="upload-container">
                        <button type="button" className="upload-resume-btn">
                          <i className="fas fa-upload"></i> Upload Resume
                        </button>
                        <span>PDF, DOCX, or TXT (Max 5MB)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Job Preferences */}
          {activeTab === 'job' && (
            <section className="settings-section">
              <h2><i className="fas fa-briefcase"></i> Job Preferences</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <label>Desired Salary Range ($)</label>
                  <div className="salary-range">
                    <div className="salary-input">
                      <span>Min:</span>
                      <input
                        type="number"
                        value={settings.jobPreferences.desiredSalary.min}
                        onChange={(e) => handleRangeChange('jobPreferences', 'desiredSalary', 'min', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="salary-input">
                      <span>Max:</span>
                      <input
                        type="number"
                        value={settings.jobPreferences.desiredSalary.max}
                        onChange={(e) => handleRangeChange('jobPreferences', 'desiredSalary', 'max', parseInt(e.target.value))}
                        min={settings.jobPreferences.desiredSalary.min}
                      />
                    </div>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Preferred Locations</label>
                  <select
                    onChange={handleLocationChange}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a location</option>
                    <option value="New York, NY">New York, NY</option>
                    <option value="San Francisco, CA">San Francisco, CA</option>
                    <option value="Chicago, IL">Chicago, IL</option>
                    <option value="Austin, TX">Austin, TX</option>
                    <option value="Seattle, WA">Seattle, WA</option>
                    <option value="Boston, MA">Boston, MA</option>
                  </select>
                  
                  <div className="locations-list">
                    {settings.jobPreferences.preferredLocations.map((location, index) => (
                      <div key={index} className="location-tag">
                        {location}
                        <button 
                          type="button" 
                          className="remove-location-btn"
                          onClick={() => removeLocation(location)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="setting-item">
                  <label>Job Types</label>
                  <div className="job-types-container">
                    <div className="job-type-option">
                      <input
                        type="checkbox"
                        id="full-time"
                        checked={settings.jobPreferences.jobTypes.includes('full-time')}
                        onChange={() => handleJobTypeChange('full-time')}
                      />
                      <label htmlFor="full-time">Full-time</label>
                    </div>
                    <div className="job-type-option">
                      <input
                        type="checkbox"
                        id="part-time"
                        checked={settings.jobPreferences.jobTypes.includes('part-time')}
                        onChange={() => handleJobTypeChange('part-time')}
                      />
                      <label htmlFor="part-time">Part-time</label>
                    </div>
                    <div className="job-type-option">
                      <input
                        type="checkbox"
                        id="contract"
                        checked={settings.jobPreferences.jobTypes.includes('contract')}
                        onChange={() => handleJobTypeChange('contract')}
                      />
                      <label htmlFor="contract">Contract</label>
                    </div>
                    <div className="job-type-option">
                      <input
                        type="checkbox"
                        id="internship"
                        checked={settings.jobPreferences.jobTypes.includes('internship')}
                        onChange={() => handleJobTypeChange('internship')}
                      />
                      <label htmlFor="internship">Internship</label>
                    </div>
                  </div>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.jobPreferences.remoteOnly}
                      onChange={() => handleToggle('jobPreferences', 'remoteOnly')}
                    />
                    Remote Jobs Only
                  </label>
                  <span className="setting-description">
                    Only show remote job opportunities
                  </span>
                </div>

                <div className="setting-item">
                  <label>Available From</label>
                  <input
                    type="date"
                    value={settings.jobPreferences.availableFrom}
                    onChange={(e) => handleSelectChange('jobPreferences', 'availableFrom', e.target.value)}
                  />
                  <span className="setting-description">
                    When are you available to start a new job?
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Connected Accounts */}
          {activeTab === 'accounts' && (
            <section className="settings-section">
              <h2><i className="fas fa-link"></i> Connected Accounts</h2>
              
              <div className="settings-group">
                <div className="connected-account">
                  <div className="account-info">
                    <div className="account-icon google">
                      <i className="fab fa-google"></i>
                    </div>
                    <div className="account-details">
                      <h3>Google</h3>
                      <p>Connect your Google account for simplified login</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`connect-btn ${settings.connectedAccounts.google ? 'disconnect' : 'connect'}`}
                    onClick={() => handleToggle('connectedAccounts', 'google')}
                  >
                    {settings.connectedAccounts.google ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                <div className="connected-account">
                  <div className="account-info">
                    <div className="account-icon linkedin">
                      <i className="fab fa-linkedin"></i>
                    </div>
                    <div className="account-details">
                      <h3>LinkedIn</h3>
                      <p>Import your professional profile and network</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`connect-btn ${settings.connectedAccounts.linkedin ? 'disconnect' : 'connect'}`}
                    onClick={() => handleToggle('connectedAccounts', 'linkedin')}
                  >
                    {settings.connectedAccounts.linkedin ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                <div className="connected-account">
                  <div className="account-info">
                    <div className="account-icon facebook">
                      <i className="fab fa-facebook"></i>
                    </div>
                    <div className="account-details">
                      <h3>Facebook</h3>
                      <p>Connect to share job postings with your network</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`connect-btn ${settings.connectedAccounts.facebook ? 'disconnect' : 'connect'}`}
                    onClick={() => handleToggle('connectedAccounts', 'facebook')}
                  >
                    {settings.connectedAccounts.facebook ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                <div className="connected-account">
                  <div className="account-info">
                    <div className="account-icon github">
                      <i className="fab fa-github"></i>
                    </div>
                    <div className="account-details">
                      <h3>GitHub</h3>
                      <p>Link your GitHub profile to showcase your projects</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`connect-btn ${settings.connectedAccounts.github ? 'disconnect' : 'connect'}`}
                    onClick={() => handleToggle('connectedAccounts', 'github')}
                  >
                    {settings.connectedAccounts.github ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </section>
          )}

          <div className="settings-actions">
            <button type="submit" className="save-button">
              <i className="fas fa-save"></i> Save Changes
            </button>
            <button type="button" className="delete-button" onClick={handleDeleteAccount}>
              <i className="fas fa-trash"></i> Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 