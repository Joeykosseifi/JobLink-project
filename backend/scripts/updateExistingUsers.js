// Update existing users to have a subscription plan
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Update existing users
const updateUsers = async () => {
  try {
    // Find all users that don't have a subscriptionPlan field set
    const users = await User.find({ $or: [
      { subscriptionPlan: { $exists: false } },
      { billing: { $exists: false } }
    ]});
    
    console.log(`Found ${users.length} users to update with subscription information`);
    
    // Update all users to have a free subscription plan and billing structure
    const updatePromises = users.map(user => {
      console.log(`Updating user: ${user.email}`);
      
      // Set subscription plan if it doesn't exist
      if (!user.subscriptionPlan) {
        user.subscriptionPlan = 'free';
      }
      
      // Set billing information if it doesn't exist
      if (!user.billing) {
        user.billing = {
          cycle: null,
          nextBillingDate: null,
          amount: 0,
          paymentMethod: null,
          paymentHistory: []
        };
      }
      
      return user.save();
    });
    
    await Promise.all(updatePromises);
    
    console.log('Successfully updated all users with subscription information');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

updateUsers(); 