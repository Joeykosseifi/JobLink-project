import React, { useState } from 'react';
import './ContactUs.css';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [activeQuestion, setActiveQuestion] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/messages/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setFormSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after a delay
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting message:', error);
      setErrorMessage(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqCategories = {
    general: [
      {
        question: "What is JobLink?",
        answer: "JobLink is a professional job board platform connecting employers with qualified job seekers. We help companies find the right talent and help professionals find their dream careers."
      },
      {
        question: "How do I create an account?",
        answer: "To create an account, click the 'Sign Up' button in the top navigation bar. You can register as a job seeker or an employer by providing your basic information and creating a password."
      },
      {
        question: "Is JobLink free to use?",
        answer: "JobLink offers both free and premium services. Job seekers can browse jobs, create profiles, and apply for positions at no cost. Employers may choose from various subscription plans for posting jobs and accessing additional features."
      }
    ],
    jobseekers: [
      {
        question: "How do I apply for a job?",
        answer: "To apply for a job, first create an account and complete your profile. Browse job listings and click the 'Apply' button on positions that interest you. You can then submit your application with your profile information or customize it for each position."
      },
      {
        question: "Can I upload my resume?",
        answer: "Yes, you can upload your resume in PDF, DOCX, or TXT format. This allows employers to view your qualifications, and our system can also help pre-fill your profile information based on your resume."
      },
      {
        question: "How can I make my profile stand out?",
        answer: "Complete all sections of your profile, add a professional photo, detail your skills and experience, and keep your information up-to-date. Consider adding work samples or a portfolio if relevant to your field."
      }
    ],
    employers: [
      {
        question: "How do I post a job?",
        answer: "After creating an employer account, click on 'Post a Job' from your dashboard. Fill in the job details including title, description, requirements, and application instructions. Select your preferred plan and publish your listing."
      },
      {
        question: "What subscription plans do you offer?",
        answer: "We offer several plans: Free (basic job posting), Standard ($99/month for multiple postings and basic candidate matching), and Premium ($299/month for featured listings, advanced search, and priority support)."
      },
      {
        question: "How long will my job posting remain active?",
        answer: "Job postings remain active for 30 days by default. You can extend this period from your dashboard or set up automatic renewal depending on your subscription plan."
      }
    ]
  };

  const officeLocations = [
    {
      city: "New York",
      address: "350 Fifth Avenue, New York, NY 10118",
      phone: "+1 (212) 555-1234",
      email: "nyc@joblink.com"
    },
    {
      city: "San Francisco",
      address: "85 Second Street, San Francisco, CA 94105",
      phone: "+1 (415) 555-6789",
      email: "sf@joblink.com"
    },
    {
      city: "London",
      address: "One Canada Square, Canary Wharf, London E14 5AB",
      phone: "+44 20 7946 0958",
      email: "london@joblink.com"
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <p>Have questions or need assistance? We're here to help you.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="contact-main">
        {/* Contact Information and Form */}
        <div className="contact-grid">
          <div className="contact-info-card">
            <div className="contact-card-header">
              <i className="fas fa-map-marker-alt"></i>
              <h2>Contact Information</h2>
            </div>
            
            <div className="contact-details">
              <div className="contact-detail-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email Us</h3>
                  <p>contact@joblink.com</p>
                  <p>support@joblink.com</p>
                </div>
              </div>
              
              <div className="contact-detail-item">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <h3>Call Us</h3>
                  <p>Main: (123) 456-7890</p>
                  <p>Support: (123) 456-7891</p>
                </div>
              </div>
              
              <div className="contact-detail-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h3>Working Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
            
            <div className="social-links">
              <h3>Connect With Us</h3>
              <div className="social-icons">
                <a href="https://www.facebook.com/" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="https://www.twitter.com/" className="social-icon"><i className="fab fa-twitter"></i></a>
                <a href="https://www.linkedin.com/" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://www.instagram.com/" className="social-icon"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            
            {formSubmitted ? (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <h3>Thank you for your message!</h3>
                <p>We have received your inquiry and will respond shortly.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{errorMessage}</p>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Office Locations */}
        <div className="office-locations-section">
          <h2>Our Offices</h2>
          <div className="office-cards">
            {officeLocations.map((office, index) => (
              <div className="office-card" key={index}>
                <div className="office-card-header">
                  <h3>{office.city}</h3>
                  <i className="fas fa-building"></i>
                </div>
                <div className="office-card-content">
                  <p><i className="fas fa-map-marker-alt"></i> {office.address}</p>
                  <p><i className="fas fa-phone-alt"></i> {office.phone}</p>
                  <p><i className="fas fa-envelope"></i> {office.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Map Section */}
        <div className="map-section">
          <h2>Find Us</h2>
          <div className="map-container">
            {/* Embed a static map image as a placeholder */}
            <div className="map-placeholder">
              <img 
                src="https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.7128,-74.0060&key=YOUR_API_KEY" 
                alt="Office Location Map" 
              />
              <div className="map-overlay">
                <p>Interactive map loading...</p>
                <button className="view-map-btn">
                  <i className="fas fa-map-marked-alt"></i>
                  View Full Map
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-tabs">
            <button 
              className={`faq-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`faq-tab ${activeTab === 'jobseekers' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobseekers')}
            >
              For Job Seekers
            </button>
            <button 
              className={`faq-tab ${activeTab === 'employers' ? 'active' : ''}`}
              onClick={() => setActiveTab('employers')}
            >
              For Employers
            </button>
          </div>
          
          <div className="faq-content">
            {faqCategories[activeTab].map((faq, index) => (
              <div className="faq-item" key={index}>
                <div 
                  className={`faq-question ${activeQuestion === index ? 'active' : ''}`}
                  onClick={() => toggleQuestion(index)}
                >
                  <h3>{faq.question}</h3>
                  <i className={`fas fa-chevron-${activeQuestion === index ? 'up' : 'down'}`}></i>
                </div>
                <div className={`faq-answer ${activeQuestion === index ? 'active' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="faq-footer">
            <p>Don't see your question here? Contact our support team.</p>
            <button className="support-btn">
              <i className="fas fa-headset"></i>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs; 