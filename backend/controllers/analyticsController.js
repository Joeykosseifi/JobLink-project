import User from '../models/User.js';
import Job from '../models/Job.js';
import Message from '../models/Message.js';
import Application from '../models/Application.js';
import Activity from '../models/Activity.js';

// Get analytics data
export const getAnalyticsData = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    // Get date ranges based on timeframe
    const now = new Date();
    let startDate;
    let compareStartDate;
    
    if (timeframe === 'day') {
      // Last 24 hours
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      
      // Previous 24 hours for comparison
      compareStartDate = new Date(startDate);
      compareStartDate.setDate(compareStartDate.getDate() - 1);
    } else if (timeframe === 'week') {
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      
      // Previous 7 days for comparison
      compareStartDate = new Date(startDate);
      compareStartDate.setDate(compareStartDate.getDate() - 7);
    } else {
      // Last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      
      // Previous 30 days for comparison
      compareStartDate = new Date(startDate);
      compareStartDate.setDate(compareStartDate.getDate() - 30);
    }
    
    // Get current period data - exclude admin users
    const [totalUsers, activeUsers, totalJobs, activeJobs, totalMessages, totalApplications, completedApplications] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ active: true, role: { $ne: 'admin' } }),
      Job.countDocuments(),
      Job.countDocuments({ active: true }),
      Message.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ['hired', 'offered'] } })
    ]);
    
    // Get new users in current period - exclude admin users
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: startDate },
      role: { $ne: 'admin' }
    });
    
    // Get new jobs in current period
    const newJobs = await Job.countDocuments({ 
      createdAt: { $gte: startDate } 
    });
    
    // Get new applications in current period
    const newApplications = await Application.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    // Get previous period data for growth calculations - exclude admin users
    const [prevPeriodUsers, prevPeriodJobs, prevPeriodApplications] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: compareStartDate, $lt: startDate },
        role: { $ne: 'admin' }
      }),
      Job.countDocuments({ 
        createdAt: { $gte: compareStartDate, $lt: startDate } 
      }),
      Application.countDocuments({
        createdAt: { $gte: compareStartDate, $lt: startDate }
      })
    ]);
    
    // Calculate growth percentages
    const userGrowth = prevPeriodUsers === 0 
      ? 100 
      : Math.round(((newUsers - prevPeriodUsers) / prevPeriodUsers) * 100);
    
    const jobGrowth = prevPeriodJobs === 0 
      ? 100 
      : Math.round(((newJobs - prevPeriodJobs) / prevPeriodJobs) * 100);
    
    const applicationGrowth = prevPeriodApplications === 0
      ? 100
      : Math.round(((newApplications - prevPeriodApplications) / prevPeriodApplications) * 100);
    
    // Revenue data (this would be replaced with real revenue tracking in a production app)
    const totalRevenue = 15780;
    const newRevenue = 2450;
    const recurringRevenue = totalRevenue - newRevenue;
    const revenueGrowth = -3;
    
    // Get recent activities for dashboard
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();
    
    // Format activities for the dashboard
    const formattedActivities = recentActivities.map(activity => ({
      id: activity._id,
      type: activity.activityType,
      description: activity.description,
      time: getRelativeTimeString(activity.createdAt),
      user: activity.userId ? activity.userId.name : 'Anonymous',
      metadata: activity.metadata
    }));
    
    // Get chart data (would be more sophisticated in production)
    let chartData;
    
    if (timeframe === 'day') {
      // Hourly data for the last 24 hours
      // This would be replaced with real-time data in production
      chartData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        users: [152, 152, 153, 153, 153, 153, 153, 153, 154, 154, 154, 155, 155, 155, 155, 155, 155, 156, 156, 156, 156, 156, 156, 156],
        jobs: [84, 84, 84, 84, 84, 85, 85, 85, 85, 85, 85, 86, 86, 86, 86, 86, 86, 87, 87, 87, 87, 87, 87, 87],
        applications: [318, 318, 319, 319, 319, 319, 320, 320, 320, 321, 321, 321, 321, 322, 322, 322, 323, 323, 323, 323, 324, 324, 324, 324],
        revenue: [15500, 15500, 15520, 15540, 15560, 15580, 15600, 15620, 15640, 15650, 15660, 15670, 15680, 15690, 15700, 15710, 15720, 15730, 15740, 15750, 15760, 15770, 15775, 15780]
      };
    } else if (timeframe === 'week') {
      // Daily data for the last 7 days
      chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        users: [144, 146, 148, 150, 152, 154, 156],
        jobs: [80, 81, 82, 84, 85, 86, 87],
        applications: [300, 304, 308, 312, 316, 320, totalApplications],
        revenue: [14500, 14700, 14900, 15100, 15300, 15500, 15780]
      };
    } else {
      // Monthly data
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        users: [80, 92, 105, 110, 118, 125, 130, 135, 142, 146, 150, 156],
        jobs: [42, 45, 50, 55, 60, 65, 68, 72, 75, 80, 83, 87],
        applications: [180, 195, 210, 225, 240, 255, 270, 285, 295, 305, 315, totalApplications],
        revenue: [8500, 9200, 10000, 10800, 11500, 12200, 12800, 13500, 14100, 14800, 15400, 15780]
      };
    }
    
    // Construct response data
    const analyticsData = {
      userStats: {
        total: totalUsers,
        growth: userGrowth,
        newUsers: newUsers,
        active: activeUsers
      },
      jobStats: {
        total: totalJobs,
        growth: jobGrowth,
        newJobs: newJobs,
        active: activeJobs
      },
      applicationStats: {
        total: totalApplications,
        growth: applicationGrowth,
        newApplications: newApplications,
        completed: completedApplications
      },
      revenueStats: {
        total: totalRevenue,
        growth: revenueGrowth,
        newRevenue: newRevenue,
        recurring: recurringRevenue
      },
      recentActivities: formattedActivities,
      chartData
    };
    
    return res.status(200).json({
      status: 'success',
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics data'
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