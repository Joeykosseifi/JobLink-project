import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous activities
  },
  activityType: {
    type: String,
    required: true,
    enum: ['login', 'signup', 'job_post', 'job_update', 'job_delete', 'job_application', 'message', 'payment', 'user_update', 'user_delete', 'admin_user_delete', 'connection_request', 'connection_accept']
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    required: false
  }
});

// Index for quick queries
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema); 