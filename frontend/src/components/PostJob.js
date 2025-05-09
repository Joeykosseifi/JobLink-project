import React, { useState } from 'react';
import axios from 'axios';
import './PostJob.css';
import { useNotification } from './NotificationContext';

function PostJob() {
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    category: 'kitchen-staff',
    experience: 'entry',
    deadline: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    salary: '',
    contactEmail: '',
    contactPhone: '',
    companyLogo: '',
    companyWebsite: '',
    companyDescription: '',
    remote: false,
    urgent: false,
    featured: false
  });

  const jobCategories = [
    { value: 'kitchen-staff', label: 'Kitchen Staff (Chef, Line Cook, etc)' },
    { value: 'restaurant-service', label: 'Restaurant Service (Waiter, Host, etc)' },
    { value: 'hotel-operations', label: 'Hotel Operations (Front Desk, Housekeeping, etc)' },
    { value: 'catering-events', label: 'Catering & Events' },
    { value: 'bar-service', label: 'Bar Service (Bartender, Barista, etc)' },
    { value: 'food-delivery', label: 'Food Delivery' },
    { value: 'cafe-coffee', label: 'Cafe & Coffee Shops' },
    { value: 'resort-leisure', label: 'Resort & Leisure' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-Level (3-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
    { value: 'manager', label: 'Manager/Director (Team Lead)' },
    { value: 'executive', label: 'Executive (C-Suite, VP)' }
  ];

  const locations = ['Beirut', 'Jounieh', 'Byblos', 'Tripoli', 'Sidon', 'Batroun', 'Tyre', 'Zahle'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedInput = tagInput.trim();
    if (trimmedInput && !tags.includes(trimmedInput) && tags.length < 10) {
      setTags([...tags, trimmedInput]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        skills: tags
      };
      
      // Send data to the backend API
      const response = await axios.post('http://localhost:5000/api/jobs', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if user is logged in
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Job posted successfully:', response.data);
      setSuccess(true);
      setLoading(false);
      
      showNotification('Job posted successfully!', 'success');
      
      // Reset form after successful submission
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        category: 'kitchen-staff',
        experience: 'entry',
        deadline: '',
        description: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
        salary: '',
        contactEmail: '',
        contactPhone: '',
        companyLogo: '',
        companyWebsite: '',
        companyDescription: '',
        remote: false,
        urgent: false,
        featured: false
      });
      setTags([]);
      setCurrentStep(1);
      setPreviewMode(false);
      
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Failed to post job. Please try again.';
      setError(errorMessage);
      console.error('Error posting job:', error);
      showNotification(errorMessage, 'error');
    }
  };

  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
  return (
          <>
            <div className="step-indicator">
              <div className="step active">
                <div className="step-number">1</div>
                <div className="step-label">Basic Info</div>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-label">Details</div>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-label">Company Info</div>
              </div>
            </div>
            
          <div className="form-row">
            <div className="form-group">
                <label htmlFor="title">Job Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                  placeholder="e.g., Executive Chef"
                required
              />
            </div>
            
            <div className="form-group">
                <label htmlFor="company">Company Name*</label>
              <input
                type="text"
                id="company"
                name="company"
                className="form-control"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label htmlFor="location">Location*</label>
                <div className="dropdown-input">
              <input
                type="text"
                id="location"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                    placeholder="e.g., Beirut, Lebanon"
                    list="location-list"
                required
              />
                  <datalist id="location-list">
                    {locations.map((location, index) => (
                      <option key={index} value={`${location}, Lebanon`} />
                    ))}
                  </datalist>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="type">Job Type*</label>
              <select
                id="type"
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="temporary">Temporary</option>
              </select>
            </div>
          </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Job Category*</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {jobCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="experience">Experience Level*</label>
                <select
                  id="experience"
                  name="experience"
                  className="form-control"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salary">Salary Range (Optional)</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className="form-control"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $2,500 - $3,500 per month"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deadline">Application Deadline (Optional)</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  className="form-control"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-row checkbox-row">
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="remote"
                  name="remote"
                  checked={formData.remote}
                  onChange={handleChange}
                />
                <label htmlFor="remote">Remote Job / Work from Home Option</label>
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="urgent"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                />
                <label htmlFor="urgent">Urgent Hiring</label>
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <label htmlFor="featured">Featured Job (Premium)</label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next: Job Details <i className='bx bx-right-arrow-alt'></i>
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="step-indicator">
              <div className="step completed">
                <div className="step-number"><i className='bx bx-check'></i></div>
                <div className="step-label">Basic Info</div>
              </div>
              <div className="step-connector completed"></div>
              <div className="step active">
                <div className="step-number">2</div>
                <div className="step-label">Details</div>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-label">Company Info</div>
            </div>
          </div>

          <div className="form-group">
              <label htmlFor="description">Job Description*</label>
              <div className="text-editor-container">
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
                  placeholder="Provide a detailed description of the job role"
              rows="6"
              required
            ></textarea>
                <div className="editor-tips">
                  <i className='bx bx-bulb'></i> Tip: A detailed job description increases qualified applications
                </div>
              </div>
          </div>

          <div className="form-group">
              <label htmlFor="responsibilities">Responsibilities*</label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                className="form-control"
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="List the key responsibilities (e.g., -Prepare daily menu items -Supervise kitchen staff)"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements & Qualifications*</label>
            <textarea
              id="requirements"
              name="requirements"
              className="form-control"
              value={formData.requirements}
              onChange={handleChange}
                placeholder="List the key requirements and qualifications (e.g., -Minimum 3 years experience -Culinary degree)"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
              <label htmlFor="benefits">Benefits & Perks (Optional)</label>
              <textarea
                id="benefits"
                name="benefits"
                className="form-control"
                value={formData.benefits}
                onChange={handleChange}
                placeholder="List benefits and perks (e.g., -Health insurance -Staff meals -Flexible schedule)"
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Skills & Keywords (Add up to 10)</label>
              <div className="tags-input-container">
                <div className="tags-input">
                  {tags.map((tag, index) => (
                    <div key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="remove-tag">
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  ))}
            <input
              type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={tags.length === 0 ? "Add skills (e.g., Culinary Arts, Pastry Making)" : ""}
                    disabled={tags.length >= 10}
                  />
                </div>
                <button 
                  type="button" 
                  className="add-tag-btn" 
                  onClick={addTag}
                  disabled={tags.length >= 10 || !tagInput.trim()}
                >
                  Add
                </button>
              </div>
              <small className="form-text">Press Enter or comma to add a tag (e.g., Barista, English Fluent)</small>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <i className='bx bx-left-arrow-alt'></i> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next: Company Info <i className='bx bx-right-arrow-alt'></i>
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="step-indicator">
              <div className="step completed">
                <div className="step-number"><i className='bx bx-check'></i></div>
                <div className="step-label">Basic Info</div>
              </div>
              <div className="step-connector completed"></div>
              <div className="step completed">
                <div className="step-number"><i className='bx bx-check'></i></div>
                <div className="step-label">Details</div>
              </div>
              <div className="step-connector completed"></div>
              <div className="step active">
                <div className="step-number">3</div>
                <div className="step-label">Company Info</div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email*</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  className="form-control"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Email for applications"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  className="form-control"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="e.g., +961 X XXX XXX"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyLogo">Company Logo URL (Optional)</label>
                <input
                  type="url"
                  id="companyLogo"
                  name="companyLogo"
              className="form-control"
                  value={formData.companyLogo}
              onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="companyWebsite">Company Website (Optional)</label>
                <input
                  type="url"
                  id="companyWebsite"
                  name="companyWebsite"
                  className="form-control"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="companyDescription">Company Description (Optional)</label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                className="form-control"
                value={formData.companyDescription}
                onChange={handleChange}
                placeholder="Tell candidates about your company culture and work environment"
                rows="4"
              ></textarea>
          </div>

          <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <i className='bx bx-left-arrow-alt'></i> Back
              </button>
              <button type="button" className="btn btn-outline" onClick={togglePreview}>
                <i className='bx bx-show'></i> Preview
              </button>
            <button type="submit" className="btn btn-primary">
                <i className='bx bx-send'></i> Post Job
            </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    return (
      <div className="job-preview">
        <h2 className="preview-title">Job Listing Preview</h2>
        
        <div className="preview-header">
          <div className="preview-company-info">
            {formData.companyLogo && (
              <div className="preview-logo">
                <img src={formData.companyLogo} alt={formData.company} />
              </div>
            )}
            <div>
              <h1 className="preview-job-title">{formData.title || 'Job Title'}</h1>
              <p className="preview-company-name">{formData.company || 'Company Name'}</p>
            </div>
          </div>
          <div className="preview-job-meta">
            {formData.urgent && <span className="tag urgent">Urgent</span>}
            {formData.featured && <span className="tag featured">Featured</span>}
            {formData.remote && <span className="tag remote">Remote Option</span>}
          </div>
        </div>
        
        <div className="preview-details">
          <div className="preview-detail">
            <i className='bx bx-map'></i>
            <span>{formData.location || 'Location'}</span>
          </div>
          <div className="preview-detail">
            <i className='bx bx-briefcase'></i>
            <span>{formData.type === 'full-time' ? 'Full-time' : 
                   formData.type === 'part-time' ? 'Part-time' : 
                   formData.type === 'contract' ? 'Contract' : 
                   formData.type === 'internship' ? 'Internship' : 
                   formData.type === 'seasonal' ? 'Seasonal' : 
                   formData.type === 'temporary' ? 'Temporary' : 'Job Type'}</span>
          </div>
          <div className="preview-detail">
            <i className='bx bx-category'></i>
            <span>{jobCategories.find(c => c.value === formData.category)?.label || 'Category'}</span>
          </div>
          <div className="preview-detail">
            <i className='bx bx-user'></i>
            <span>{experienceLevels.find(e => e.value === formData.experience)?.label || 'Experience'}</span>
          </div>
          {formData.salary && (
            <div className="preview-detail">
              <i className='bx bx-money'></i>
              <span>{formData.salary}</span>
            </div>
          )}
          {formData.deadline && (
            <div className="preview-detail">
              <i className='bx bx-calendar'></i>
              <span>Apply by: {new Date(formData.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="preview-section">
          <h3>Job Description</h3>
          <p>{formData.description || 'No description provided.'}</p>
        </div>
        
        <div className="preview-section">
          <h3>Responsibilities</h3>
          <div className="preview-list">
            {formData.responsibilities ? (
              formData.responsibilities.split('\n').map((item, index) => (
                <p key={index}>{item}</p>
              ))
            ) : (
              <p>No responsibilities provided.</p>
            )}
          </div>
        </div>
        
        <div className="preview-section">
          <h3>Requirements & Qualifications</h3>
          <div className="preview-list">
            {formData.requirements ? (
              formData.requirements.split('\n').map((item, index) => (
                <p key={index}>{item}</p>
              ))
            ) : (
              <p>No requirements provided.</p>
            )}
          </div>
        </div>
        
        {formData.benefits && (
          <div className="preview-section">
            <h3>Benefits & Perks</h3>
            <div className="preview-list">
              {formData.benefits.split('\n').map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </div>
        )}
        
        {tags.length > 0 && (
          <div className="preview-section">
            <h3>Skills & Keywords</h3>
            <div className="preview-tags">
              {tags.map((tag, index) => (
                <span key={index} className="preview-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        {(formData.companyDescription || formData.companyWebsite) && (
          <div className="preview-section">
            <h3>About {formData.company || 'the Company'}</h3>
            {formData.companyDescription && <p>{formData.companyDescription}</p>}
            {formData.companyWebsite && (
              <p className="preview-website">
                <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer">
                  <i className='bx bx-globe'></i> Visit company website
                </a>
              </p>
            )}
          </div>
        )}
        
        <div className="preview-section">
          <h3>How to Apply</h3>
          <p>
            Contact: {formData.contactEmail}
            {formData.contactPhone && ` | ${formData.contactPhone}`}
          </p>
        </div>
        
        <div className="preview-actions">
          <button type="button" className="btn btn-secondary" onClick={togglePreview}>
            <i className='bx bx-edit'></i> Edit Job
          </button>
          <button type="submit" className="btn btn-primary">
            <i className='bx bx-send'></i> Post Job
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="postjob-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Submitting your job posting...</p>
        </div>
      )}
      
      <div className="card postjob-card">
        {!previewMode ? (
          <>
            <h1>Post a New Job</h1>
            <p className="subtitle">Connect with top talent in Lebanon's hospitality industry</p>
            
            {success && (
              <div className="alert success-alert">
                <i className='bx bx-check-circle'></i> Job posted successfully!
              </div>
            )}
            
            {error && (
              <div className="alert error-alert">
                <i className='bx bx-error-circle'></i> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="postjob-form">
              {renderFormStep()}
            </form>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="postjob-form">
            {renderPreview()}
          </form>
        )}
      </div>
      
      <div className="posting-tips">
        <div className="tips-container">
          <h3><i className='bx bx-bulb'></i> Tips for Effective Job Postings</h3>
          <ul>
            <li>Be specific about requirements and responsibilities</li>
            <li>Include salary information to attract more qualified candidates</li>
            <li>Highlight company culture and benefits</li>
            <li>Use industry-specific keywords to improve visibility</li>
            <li>Mention if there are growth opportunities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PostJob; 