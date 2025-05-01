import Application from '../models/Application.js';

// Get all applications (admin only)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title company location')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get applications'
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company location salary description')
      .populate('applicantId', 'name email');
    
    if (!application) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get application details'
    });
  }
};

// Submit a new application
export const submitApplication = async (req, res) => {
  try {
    const { jobId, resume, coverLetter } = req.body;
    
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'You must be logged in to apply for a job'
      });
    }
    
    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already applied for this job'
      });
    }
    
    // Create new application
    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      resume,
      coverLetter,
      status: 'pending'
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to submit application'
    });
  }
};

// Get user's applications
export const getUserApplications = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'You must be logged in to view your applications'
      });
    }
    
    const applications = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title company location')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    console.error('Error getting user applications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get your applications'
    });
  }
};

// Update application status (admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a status'
      });
    }
    
    const validStatuses = ['pending', 'reviewed', 'interviewed', 'offered', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Status must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    )
    .populate('jobId', 'title company')
    .populate('applicantId', 'name email');
    
    if (!application) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update application status'
    });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found'
      });
    }
    
    // Only allow admins or the applicant to delete their application
    if (req.user.role !== 'admin' && application.applicantId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this application'
      });
    }
    
    await Application.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete application'
    });
  }
}; 