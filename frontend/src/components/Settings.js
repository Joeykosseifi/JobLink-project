import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
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
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Sending settings update request...');
      const response = await axios.put(
        'http://localhost:5000/api/settings',
        { settings },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Settings update response:', response.data);

      setSuccessMessage('Settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Account Settings</h1>
          {successMessage && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i> {successMessage}
            </div>
          )}
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
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
            </div>
          </section>

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

          <div className="settings-actions">
            <button type="submit" className="save-button">
              <i className="fas fa-save"></i> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 