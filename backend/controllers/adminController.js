import User from '../models/User.js';
import Job from '../models/Job.js';
import Message from '../models/Message.js';

export const getAllUsers = async (req, res) => {
  try {
    // Fetch only non-admin users
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    
    return res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID format'
      });
    }
    
    const { role, active } = req.body;
    
    // Validate input
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role value. Must be "user" or "admin"'
      });
    }
    
    const updateFields = {};
    if (role) updateFields.role = role;
    if (active !== undefined) updateFields.active = active;
    
    console.log(`Updating user ${id} with fields:`, updateFields);
    
    const user = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    console.log(`User ${id} updated successfully`);
    return res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      details: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    return res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

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
    const [totalUsers, activeUsers, totalJobs, activeJobs, totalMessages] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ active: true, role: { $ne: 'admin' } }),
      Job.countDocuments(),
      Job.countDocuments({ active: true }),
      Message.countDocuments()
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
    
    // Get new applications in current period (assuming applications are linked to jobs)
    const newApplications = 46; // This would be a real count from your database
    
    // Get previous period data for growth calculations - exclude admin users
    const [prevPeriodUsers, prevPeriodJobs] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: compareStartDate, $lt: startDate },
        role: { $ne: 'admin' }
      }),
      Job.countDocuments({ 
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
    
    // For applications and revenue, we would use real data in a production app
    // Here we're using placeholder values that would be replaced with real DB queries
    const applicationGrowth = 8;
    const totalApplications = 324;
    const completedApplications = 205;
    
    const totalRevenue = 15780;
    const newRevenue = 2450;
    const recurringRevenue = totalRevenue - newRevenue;
    const revenueGrowth = -3;
    
    // Get chart data (would be more sophisticated in production)
    let chartData;
    
    if (timeframe === 'day') {
      // Hourly data for the last 24 hours
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
        applications: [300, 304, 308, 312, 316, 320, 324],
        revenue: [14500, 14700, 14900, 15100, 15300, 15500, 15780]
      };
    } else {
      // Monthly data
      chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        users: [80, 92, 105, 110, 118, 125, 130, 135, 142, 146, 150, 156],
        jobs: [42, 45, 50, 55, 60, 65, 68, 72, 75, 80, 83, 87],
        applications: [180, 195, 210, 225, 240, 255, 270, 285, 295, 305, 315, 324],
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