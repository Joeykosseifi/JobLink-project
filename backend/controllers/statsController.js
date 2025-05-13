import Job from '../models/Job.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get platform statistics
// @route   GET /api/stats
// @access  Public
export const getStats = asyncHandler(async (req, res) => {
  console.log('getStats endpoint called - checking live statistics');
  
  try {
    // Get total job count
    let jobCount = 0;
    try {
      jobCount = await Job.countDocuments();
      console.log(`Found ${jobCount} jobs in database`);
    } catch (err) {
      console.error('Error counting jobs:', err);
    }
    
    // Get total job seekers - excluding admin users
    let seekerCount = 0;
    try {
      seekerCount = await User.countDocuments({ 
        jobRole: 'job-seeker',
        role: { $ne: 'admin' } // Exclude admin users
      });
      console.log(`Found ${seekerCount} job seekers in database (excluding admins)`);
    } catch (err) {
      console.error('Error counting job seekers:', err);
    }
    
    // Get total companies/job posters - excluding admin users
    let companyCount = 0;
    try {
      companyCount = await User.countDocuments({ 
        jobRole: 'job-poster',
        role: { $ne: 'admin' } // Exclude admin users
      });
      console.log(`Found ${companyCount} job posters in database (excluding admins)`);
    } catch (err) {
      console.error('Error counting companies:', err);
    }
    
    // Return statistics
    console.log('Returning statistics:', {
      jobs: jobCount,
      seekers: seekerCount,
      companies: companyCount
    });
    
    res.status(200).json({
      success: true,
      data: {
        jobs: jobCount,
        seekers: seekerCount,
        companies: companyCount,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error when retrieving statistics'
    });
  }
}); 