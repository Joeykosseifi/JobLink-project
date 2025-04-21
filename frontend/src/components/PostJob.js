import React, { useState } from 'react';
import './PostJob.css';

function PostJob() {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: '',
    salary: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="postjob-container">
      <div className="card postjob-card">
        <h1>Post a New Job</h1>
        <p className="subtitle">Fill in the details below to post your job opening</p>
        
        <form onSubmit={handleSubmit} className="postjob-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company Name</label>
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
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, NY"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Job Type</label>
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
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role and responsibilities"
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              className="form-control"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List the key requirements and qualifications"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary Range (Optional)</label>
            <input
              type="text"
              id="salary"
              name="salary"
              className="form-control"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $80,000 - $100,000"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob; 