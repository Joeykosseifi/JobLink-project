import User from '../models/User.js';

// Get user settings
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user doesn't have settings yet, return default settings
    if (!user.settings) {
      const defaultSettings = {
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
      };

      // Save default settings to user
      user.settings = defaultSettings;
      await user.save();

      return res.json({ settings: defaultSettings });
    }

    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update user settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ message: 'Settings are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user settings
    user.settings = settings;
    await user.save();

    res.json({ 
      message: 'Settings updated successfully',
      settings: user.settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
}; 