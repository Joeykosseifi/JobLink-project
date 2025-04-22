const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT token
const signToken = (user) => {
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
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.signup = async (req, res) => {
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
      role: isFirstUser ? 'admin' : (role || 'user')
    });

    console.log('Successfully created new user:', {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
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

exports.login = async (req, res) => {
  try {
    console.log('Received login request for email:', req.body.email);
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password);
    console.log('Password correct:', isPasswordCorrect ? 'Yes' : 'No');

    if (!isPasswordCorrect) {
      console.log('Incorrect password for user:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    console.log('Login successful for user:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Error in login:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
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