import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users for network
export const getAllUsers = async (req, res) => {
  try {
    // Find all active users that are not admins, exclude password field
    const users = await User.find({ 
      active: true,
      role: { $ne: 'admin' } 
    }).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Don't allow self-connection
    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    // Find both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already connected
    if (currentUser.connections.includes(userId)) {
      return res.status(400).json({ message: 'Already connected with this user' });
    }

    // Check if request already sent
    if (currentUser.pendingConnections.includes(userId)) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }

    // Check if received a request from this user
    if (currentUser.connectionRequests.includes(userId)) {
      return res.status(400).json({ 
        message: 'This user has already sent you a connection request',
        pendingRequest: true
      });
    }

    // Add to pending connections for current user
    currentUser.pendingConnections.push(userId);
    await currentUser.save();
    
    // Add to connection requests for target user
    targetUser.connectionRequests.push(currentUserId);
    await targetUser.save();

    res.status(200).json({
      status: 'success',
      message: 'Connection request sent'
    });

  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Error sending connection request' });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Find both users
    const [currentUser, requesterUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!requesterUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!currentUser.connectionRequests.includes(userId)) {
      return res.status(400).json({ message: 'No connection request from this user' });
    }

    // Update both users

    // Remove from connection requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      id => id.toString() !== userId
    );
    
    // Remove from pending connections
    requesterUser.pendingConnections = requesterUser.pendingConnections.filter(
      id => id.toString() !== currentUserId
    );

    // Add to connections for both users
    currentUser.connections.push(userId);
    requesterUser.connections.push(currentUserId);

    await Promise.all([currentUser.save(), requesterUser.save()]);

    res.status(200).json({
      status: 'success',
      message: 'Connection accepted'
    });

  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ message: 'Error accepting connection request' });
  }
};

// Reject connection request
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Find both users
    const [currentUser, requesterUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!requesterUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!currentUser.connectionRequests.includes(userId)) {
      return res.status(400).json({ message: 'No connection request from this user' });
    }

    // Remove from connection requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      id => id.toString() !== userId
    );
    
    // Remove from pending connections
    requesterUser.pendingConnections = requesterUser.pendingConnections.filter(
      id => id.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), requesterUser.save()]);

    res.status(200).json({
      status: 'success',
      message: 'Connection request rejected'
    });

  } catch (error) {
    console.error('Error rejecting connection request:', error);
    res.status(500).json({ message: 'Error rejecting connection request' });
  }
};

// Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('connections', 'name email title bio profileImage jobRole')
      .populate('connectionRequests', 'name email title bio profileImage jobRole')
      .populate('pendingConnections', 'name email title bio profileImage jobRole');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        connections: user.connections,
        connectionRequests: user.connectionRequests,
        pendingConnections: user.pendingConnections
      }
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Error fetching connections' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, title, bio, profileImage, jobRole, currentPassword, newPassword } = req.body;
    const userId = req.user.id; // This will come from the auth middleware

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If current password is provided, verify it
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Update basic info
    user.name = name || user.name;
    user.email = email || user.email;
    
    // Update profile fields
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (jobRole !== undefined) user.jobRole = jobRole;

    // Update password if new password is provided
    if (newPassword && currentPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Save the updated user
    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      jobRole: user.jobRole,
      title: user.title,
      bio: user.bio,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    };

    res.json({ 
      message: 'Profile updated successfully',
      user: userResponse 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error updating profile' });
  }
}; 