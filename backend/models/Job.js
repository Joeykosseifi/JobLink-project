import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Please provide a company name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide a job type'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'seasonal', 'temporary']
  },
  category: {
    type: String,
    required: [true, 'Please provide a job category']
  },
  experience: {
    type: String,
    required: [true, 'Please provide an experience level']
  },
  deadline: {
    type: Date
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description']
  },
  responsibilities: {
    type: String,
    required: [true, 'Please provide job responsibilities']
  },
  requirements: {
    type: String,
    required: [true, 'Please provide job requirements']
  },
  benefits: {
    type: String
  },
  salary: {
    type: String
  },
  skills: [String],
  contactEmail: {
    type: String,
    required: [true, 'Please provide a contact email']
  },
  contactPhone: {
    type: String
  },
  companyLogo: {
    type: String
  },
  companyWebsite: {
    type: String
  },
  companyDescription: {
    type: String
  },
  remote: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);

export default Job; 