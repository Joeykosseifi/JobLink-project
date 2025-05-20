import bcrypt from 'bcryptjs'; //bcrypt is to hash the password
import jwt from 'jsonwebtoken'; //jwt is to generate the token
import User from '../models/User.js'; //User is the model for the user
import { logActivity } from './activityController.js'; //logActivity is to log the activity 

// Helper function to generate JWT token
const signToken = (user) => { //signToken is to generate the token
  return jwt.sign(
    { 
      id: user._id,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Helper function to create and send token response
const createSendToken = (user, statusCode, res) => { //createSendToken is to create and send the token response
  const token = signToken(user);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({ 
    status: 'success',
    token,
    data: { user }
  });
};
// Sign up function
export const signup = async (req, res) => { 
  try {
    console.log('Received signup request with data:', {
      ...req.body,
      password: '[HIDDEN]'
    });
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }

    // Check if this is the first user being created
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    console.log('Is first user:', isFirstUser);

    // Create new user - first user is automatically an admin
    const newUser = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save middleware
      role: isFirstUser ? 'admin' : (role || 'user'),
      subscriptionPlan: 'free' // Set default plan explicitly
    });

    console.log('Successfully created new user:', {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      subscriptionPlan: newUser.subscriptionPlan
    });
    
    // Log signup activity
    await logActivity({
      userId: newUser._id,
      activityType: 'signup',
      description: `${newUser.name} registered as a new ${newUser.role === 'admin' ? 'admin' : newUser.jobRole || 'user'}`,
      metadata: {
        userEmail: newUser.email,
        userRole: newUser.role,
        jobRole: newUser.jobRole,
        subscriptionPlan: newUser.subscriptionPlan
      },
      ip: req.ip || 'unknown'
    });
    
    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password); //bcrypt is to compare the password with the hashed password
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = signToken(user);

    // Log login activity
    await logActivity({
      userId: user._id,
      activityType: 'login',
      description: `${user.name} logged in`,
      metadata: {
        userEmail: user.email,
        userRole: user.role,
        jobRole: user.jobRole
      },
      ip: req.ip || 'unknown'
    });

    // Send response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          jobRole: user.jobRole,
          subscriptionPlan: user.subscriptionPlan,
          active: user.active,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while logging in'
    });
  }
};

// Get profile function
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 