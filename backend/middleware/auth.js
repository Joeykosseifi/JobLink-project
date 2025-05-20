import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => { //the protect middleware is to protect the routes that are not public if the jwt valid the request proceed normally. if not, it will be canceled.
  try {
    // Get token from header
    const authHeader = req.headers.authorization; // req is divided in 2 parts: header and body.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //jwt.verify is to verify the token with the secret key.

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Check if user is active
    console.log(`user from backend: ${user}`);
    if (!user.active) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    // Add user info to request (include BOTH the decoded token and the full user object)
    req.user = {
      ...decoded,
      role: user.role,
      jobRole: user.jobRole,
      active: user.active
    };
    
    next(); // accept the request and proceed to the next middleware or route handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      message: 'Not authorized',
      error: error.message
    });
  }
};

// Middleware to restrict access based on roles
export const restrictTo = (...roles) => { //restrictTo is to restrict the access to the routes based on the roles.
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action'
      });
    }
    next(); // accept the request and proceed to the next middleware or route handler
  };
}; 