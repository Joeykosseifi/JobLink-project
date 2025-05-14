import Job from '../models/Job.js';
import User from '../models/User.js';

// Create a new job
export const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body
    };
    
    // If the user is authenticated, add the postedBy field
    if (req.user) {
      jobData.postedBy = req.user.id;
      
      // Update user's jobRole to job-poster if they post a job
      await User.findByIdAndUpdate(req.user.id, { jobRole: 'job-poster' });
    }

    const job = await Job.create(jobData);
    
    res.status(201).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    // Build query
    const query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by location
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Filter by experience
    if (req.query.experience) {
      query.experience = req.query.experience;
    }
    
    // Filter by remote
    if (req.query.remote === 'true') {
      query.remote = true;
    }
    
    // Get jobs
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name');
    
    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name');
    
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }
    
    // Check if user is the owner of the job
    if (req.user && job.postedBy && job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this job'
      });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        job: updatedJob
      }
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }
    
    // Check if user is the owner of the job or an admin
    if (req.user && job.postedBy && job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this job'
      });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}; 