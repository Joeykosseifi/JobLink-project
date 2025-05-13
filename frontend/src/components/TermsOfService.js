import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Terms of Service</h1>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="terms-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to JobLink. These Terms of Service ("Terms") govern your use of our website, services, and applications
            (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
          </p>
        </section>

        <section>
          <h2>2. Account Registration</h2>
          <p>
            To access certain features of our Services, you may be required to register for an account. When you register, you agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Be responsible for all activities that occur under your account</li>
          </ul>
        </section>

        <section>
          <h2>3. User Content</h2>
          <p>
            Our Services may allow you to post, upload, or submit content, including resumes, job applications, and other materials ("User Content").
            You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use,
            reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with our Services.
          </p>
        </section>

        <section>
          <h2>4. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use our Services for any illegal purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Post false or misleading information</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with or disrupt our Services</li>
            <li>Attempt to gain unauthorized access to our Services</li>
          </ul>
        </section>

        <section>
          <h2>5. Job Listings</h2>
          <p>
            While we strive to ensure the accuracy and quality of job listings on our platform, we do not guarantee:
          </p>
          <ul>
            <li>The accuracy of any job listing</li>
            <li>That any job listing will result in employment</li>
            <li>The quality, safety, or legality of the jobs listed</li>
          </ul>
          <p>
            Users are responsible for verifying the legitimacy and suitability of any job opportunity.
          </p>
        </section>

        <section>
          <h2>6. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to our Services at our sole discretion,
            without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties,
            or for any other reason.
          </p>
        </section>

        <section>
          <h2>7. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of material changes by posting a notice on our website.
            Your continued use of our Services after any changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
          </p>
        </section>

        <section>
          <h2>9. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of Lebanon, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: support@joblink.com<br />
            Address: Beirut, Lebanon
          </p>
        </section>
      </div>

      <div className="terms-footer">
        <Link to="/signup" className="back-button">Back to Sign Up</Link>
      </div>
    </div>
  );
};

export default TermsOfService; 