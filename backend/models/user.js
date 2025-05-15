import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't send password by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Job role field to identify job seekers vs job posters
  jobRole: {
    type: String,
    enum: ['job-seeker', 'job-poster'],
    default: 'job-seeker'
  },
  // Subscription plan field
  subscriptionPlan: {
    type: String,
    enum: ['free', 'premium', 'business'],
    default: 'free'
  },
  // Billing information
  billing: {
    cycle: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null
    },
    nextBillingDate: {
      type: Date,
      default: null
    },
    amount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      default: null
    },
    paymentHistory: [{
      amount: Number,
      date: {
        type: Date,
        default: Date.now
      },
      plan: String,
      cycle: String
    }]
  },
  // Profile fields
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  profileImage: {
    type: String,
    trim: true
  },
  // Connection fields
  connections: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  connectionRequests: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  pendingConnections: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  savedJobs: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  }],
  settings: {
    emailNotifications: {
      jobAlerts: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      newsletters: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: false }
    },
    privacySettings: {
      profileVisibility: { type: String, enum: ['public', 'private', 'contacts'], default: 'public' },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'english' }
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    console.log('Hashing password for user:', this.email);
    
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords for user:', this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

export default mongoose.models.User || mongoose.model('User', userSchema); 