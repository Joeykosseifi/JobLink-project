import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <h1>Privacy Policy</h1>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="privacy-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            At JobLink, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you visit our website or use our services. Please read this policy carefully. 
            If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways including:</p>
          
          <h3>Personal Data</h3>
          <p>
            When you create an account, apply for jobs, or use our services, we may collect personally identifiable information, such as:
          </p>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Job history, education, and skills</li>
            <li>Resume and cover letter content</li>
            <li>Profile information and preferences</li>
            <li>Payment information (when applicable)</li>
          </ul>
          
          <h3>Usage Data</h3>
          <p>
            We may also collect information on how you access and use our website, including:
          </p>
          <ul>
            <li>Your browser type and version</li>
            <li>Pages you visit and features you use</li>
            <li>Time spent on pages</li>
            <li>Device information</li>
            <li>Unique device identifiers</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We may use the information we collect about you to:</p>
          <ul>
            <li>Create and maintain your account</li>
            <li>Connect you with employers or job seekers</li>
            <li>Process job applications</li>
            <li>Personalize user experience</li>
            <li>Improve our website and services</li>
            <li>Send you relevant job alerts and updates</li>
            <li>Communicate with you about our services</li>
            <li>Respond to your inquiries</li>
            <li>Ensure compliance with our terms and policies</li>
          </ul>
        </section>

        <section>
          <h2>4. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations:</p>
          
          <h3>With Employers and Recruiters</h3>
          <p>
            When you apply for a job, your profile information, resume, and other application materials 
            may be shared with potential employers or recruiters.
          </p>
          
          <h3>With Your Consent</h3>
          <p>
            We may share your information with third parties if you have given us consent to do so.
          </p>
          
          <h3>Business Transfers</h3>
          <p>
            If JobLink is involved in a merger, acquisition, or sale of all or a portion of its assets, 
            your information may be transferred as part of that transaction.
          </p>
          
          <h3>Legal Requirements</h3>
          <p>
            We may disclose your information where we are legally required to do so in order to 
            comply with applicable law, governmental requests, judicial proceedings, or court orders.
          </p>
        </section>

        <section>
          <h2>5. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. 
            While we have taken reasonable steps to secure the information you provide to us, please be aware that 
            no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.
          </p>
        </section>

        <section>
          <h2>6. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul>
            <li>Right to access your personal data</li>
            <li>Right to correct inaccurate information</li>
            <li>Right to request deletion of your information</li>
            <li>Right to restrict or object to processing</li>
            <li>Right to data portability</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 16. We do not knowingly collect or solicit 
            personal information from children. If we learn that we have collected personal information from a child, 
            we will delete that information as quickly as possible.
          </p>
        </section>

        <section>
          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@joblink.com<br />
            Address: Beirut, Lebanon
          </p>
        </section>
      </div>

      <div className="privacy-footer">
        <Link to="/signup" className="back-button">Back to Sign Up</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 