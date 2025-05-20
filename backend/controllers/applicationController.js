import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { logActivity } from './activityController.js';

// Get all applications (admin only)
export const getAllApplications = async (req, res) => { 
  try {
    const applications = await Application.find()
      .populate('jobId', 'title company location') 
      .populate('applicantId', 'name email')
      .select('jobId applicantId fullName email phone status resume coverLetter createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ //send the response
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
      .populate('applicantId', 'name email')
      .select('jobId applicantId fullName email phone status resume coverLetter currentCompany linkedInProfile createdAt updatedAt');
    
    if (!application) { //if the application is not found
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
    // Debug incoming request
    console.log('Application submission request received');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('File info:', req.file ? { 
      filename: req.file.filename, 
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype 
    } : 'No file uploaded');
    
    const { 
      jobId, 
      fullName, 
      email, 
      phone, 
      currentCompany, 
      linkedInProfile 
    } = req.body;
    
    // Debugging
    console.log('Application submission payload:', {
      jobId,
      fullName,
      email,
      phone,
      currentCompany,
      linkedInProfile,
      hasFile: !!req.file
    });
    
    let coverLetter = req.body.coverLetter || '';
    
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'You must be logged in to apply for a job'
      });
    }
    
    // Check if jobId is valid
    if (!jobId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Job ID is required'
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
    
    // Check if resume file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload your resume/CV'
      });
    }
    
    // Check if required fields are provided
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your full name, email, and phone number'
      });
    }
    
    // Create new application with the file path and additional fields
    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      fullName,
      email,
      phone,
      currentCompany: currentCompany || '',
      linkedInProfile: linkedInProfile || '',
      resume: req.file.path, // Save file path from multer
      coverLetter,
      status: 'pending'
    });
    
    // Debugging - verify saved application
    console.log('Application saved successfully with fields:', {
      id: application._id,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone
    });
    
    // Get job details for the activity log
    const job = await Job.findById(jobId).select('title company');
    
    // Log job application activity
    await logActivity({
      userId: req.user.id,
      activityType: 'job_application',
      description: `${req.user.name || application.fullName} applied for ${job.title} at ${job.company}`,
      metadata: {
        jobId: jobId,
        applicationId: application._id,
        jobTitle: job.title,
        company: job.company
      },
      ip: req.ip || 'unknown'
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
      .select('jobId fullName email phone status resume coverLetter currentCompany linkedInProfile createdAt')
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

// Get applications for jobs posted by the current user
export const getJobPosterApplications = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'You must be logged in to view applications'
      });
    }
    
    // Check if user has the job-poster role or is an admin
    if (req.user.jobRole !== 'job-poster' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view job applications'
      });
    }
    
    // First, get all jobs posted by this user
    const jobs = await Job.find({ postedBy: req.user.id }).select('_id title company');
    
    if (jobs.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          jobsWithApplications: []
        }
      });
    }
    
    // Get the job IDs
    const jobIds = jobs.map(job => job._id);
    
    // Find all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location')
      .select('jobId fullName email phone currentCompany linkedInProfile resume coverLetter status createdAt')
      .sort({ createdAt: -1 });
    
    // Create a response that includes both the job details and applications
    const jobsWithApplications = jobs.map(job => {
      const jobApplications = applications.filter(app => 
        app.jobId._id.toString() === job._id.toString()
      );
      
      return {
        job: {
          id: job._id,
          title: job.title,
          company: job.company
        },
        applications: jobApplications,
        count: jobApplications.length
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        jobsWithApplications
      }
    });
  } catch (error) {
    console.error('Error getting applications for posted jobs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get applications for your job postings'
    });
  }
}; 