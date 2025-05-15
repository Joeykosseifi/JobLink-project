import User from '../models/User.js';
import { logActivity } from './activityController.js';

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

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    console.log('Delete account request received');
    const userId = req.user.id;
    console.log('User ID from request:', userId);
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.email);

    // Delete the user (You can also implement soft delete by setting active: false)
    console.log('Attempting to delete user...');
    
    // Log account deletion activity before deleting the user
    await logActivity({
      userId: null, // We set userId to null since the user is being deleted
      activityType: 'user_delete',
      description: `User ${user.name} (${user.email}) deleted their account`,
      metadata: {
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        userId: userId
      },
      ip: req.ip || 'unknown'
    });
    
    await User.findByIdAndDelete(userId);
    console.log('User successfully deleted');
    
    res.status(200).json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting account' 
    });
  }
}; 