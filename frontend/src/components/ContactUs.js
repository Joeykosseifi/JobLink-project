import React from 'react';
import './ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <div className="contact-content">
        <p>Have questions? We'd love to hear from you!</p>
        <div className="contact-info">
          <p>Email: contact@joblink.com</p>
          <p>Phone: (123) 456-7890</p>
          <p>Address: 123 Job Street, Career City</p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs; 