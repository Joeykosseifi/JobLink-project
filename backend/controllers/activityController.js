import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

// Log a new activity
export const logActivity = async (activityData) => {
  try {
    const activity = await Activity.create(activityData);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

// Get recent activities for admin dashboard
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email role jobRole')
      .lean();
    
    // Format activities for display
    const formattedActivities = await Promise.all(activities.map(async activity => {
      const formattedActivity = {
        id: activity._id,
        type: activity.activityType,
        description: activity.description,
        time: activity.createdAt,
        relativeTime: getRelativeTimeString(activity.createdAt)
      };
      
      // Add user info if available
      if (activity.userId) {
        formattedActivity.user = {
          id: activity.userId._id,
          name: activity.userId.name,
          email: activity.userId.email,
          role: activity.userId.role
        };
      }
      
      // Add additional data based on activity type
      if (activity.metadata) {
        // For job posts, add job title
        if (activity.activityType === 'job_post' && activity.metadata.jobId) {
          try {
            const job = await Job.findById(activity.metadata.jobId)
              .select('title company')
              .lean();
            
            if (job) {
              formattedActivity.job = {
                id: job._id,
                title: job.title,
                company: job.company
              };
            }
          } catch (err) {
            console.error('Error fetching job details:', err);
          }
        }
        
        // Add any other metadata
        formattedActivity.metadata = activity.metadata;
      }
      
      return formattedActivity;
    }));
    
    res.status(200).json({
      status: 'success',
      results: formattedActivities.length,
      data: {
        activities: formattedActivities
      }
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recent activities'
    });
  }
};

// Helper function to format relative time
const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// Delete all activities
export const deleteAllActivities = async (req, res) => {
  try {
    // Optional filter parameter for deleting specific activity types
    const { type } = req.query;
    
    let deleteQuery = {};
    
    // If a specific activity type is provided, delete only those activities
    if (type && type !== 'all') {
      deleteQuery = { activityType: type };
    }
    
    const result = await Activity.deleteMany(deleteQuery);
    
    // Log this activity
    await logActivity({
      userId: req.user._id,
      activityType: 'admin_action',
      description: `Deleted ${result.deletedCount} activities${type && type !== 'all' ? ` of type: ${type}` : ''}`,
      metadata: {
        count: result.deletedCount,
        type: type || 'all'
      },
      ip: req.ip
    });
    
    res.status(200).json({
      status: 'success',
      message: `Successfully deleted ${result.deletedCount} activities`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting activities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete activities'
    });
  }
}; 