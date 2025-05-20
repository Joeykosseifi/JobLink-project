import User from '../models/User.js';
import { logActivity } from './activityController.js';

// Available plans
const AVAILABLE_PLANS = {
  free: {
    name: 'Free',
    price: 0
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99
  },
  business: {
    name: 'Business',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99
  }
};

// Update user subscription plan
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const userId = req.user.id;

    // Validate plan
    if (!plan || !['free', 'premium', 'business'].includes(plan)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription plan'
      });
    }

    // Validate billing cycle if not free plan
    if (plan !== 'free' && (!billingCycle || !['monthly', 'yearly'].includes(billingCycle))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid billing cycle'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user's subscription plan
    user.subscriptionPlan = plan;
    
    // Add billing cycle and payment information
    if (!user.billing) {
      user.billing = {};
    }
    
    if (plan !== 'free') {
      user.billing.cycle = billingCycle;
      user.billing.nextBillingDate = calculateNextBillingDate(billingCycle);
      user.billing.amount = billingCycle === 'monthly' 
        ? AVAILABLE_PLANS[plan].monthlyPrice 
        : AVAILABLE_PLANS[plan].yearlyPrice;
    } else {
      // Reset billing info for free plan
      user.billing = {
        cycle: null,
        nextBillingDate: null,
        amount: 0
      };
    }

    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      activityType: 'subscription-update',
      description: `${user.name} upgraded to ${plan} plan (${billingCycle || 'free'})`,
      metadata: {
        userEmail: user.email,
        previousPlan: user.subscriptionPlan,
        newPlan: plan,
        billingCycle: billingCycle || 'free'
      },
      ip: req.ip || 'unknown'
    });

    res.status(200).json({
      status: 'success',
      message: `Successfully upgraded to ${plan} plan`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscriptionPlan: user.subscriptionPlan,
          billing: user.billing
        }
      }
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating subscription plan'
    });
  }
};

// Get current subscription details
export const getSubscriptionDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Return subscription details
    res.status(200).json({
      status: 'success',
      data: {
        plan: user.subscriptionPlan,
        billing: user.billing || {
          cycle: null,
          nextBillingDate: null,
          amount: 0
        },
        planDetails: AVAILABLE_PLANS[user.subscriptionPlan]
      }
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching subscription details'
    });
  }
};

// Helper function to calculate next billing date
const calculateNextBillingDate = (billingCycle) => {
  const today = new Date();
  if (billingCycle === 'monthly') {
    return new Date(today.setMonth(today.getMonth() + 1));
  } else {
    return new Date(today.setFullYear(today.getFullYear() + 1));
  }
}; 