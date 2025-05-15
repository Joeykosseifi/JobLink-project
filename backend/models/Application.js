import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  currentCompany: {
    type: String
  },
  linkedInProfile: {
    type: String
  },
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  coverLetter: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interviewed', 'offered', 'hired', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
applicationSchema.pre('findOneAndUpdate', function(next) {
  this.update({}, { $set: { updatedAt: Date.now() } });
  next();
});

export default mongoose.model('Application', applicationSchema); 