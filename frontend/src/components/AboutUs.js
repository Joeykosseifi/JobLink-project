import React from 'react';
import './AboutUs.css';

function AboutUs() {
  const teamMembers = [
    {
      name: "Sarah Khoury",
      position: "Founder & CEO",
      bio: "With over 15 years of experience in the hospitality industry, Sarah founded JobLink to solve the hiring challenges she witnessed firsthand in Lebanon's restaurants and hotels.",
      image: "https://randomuser.me/api/portraits/women/23.jpg"
    },
    {
      name: "Michel Haddad",
      position: "Head of Employer Relations",
      bio: "Former F&B director at a 5-star hotel in Beirut, Michel helps restaurants and hotels optimize their hiring process and find ideal candidates.",
      image: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      name: "Nour Abboud",
      position: "Career Development Manager",
      bio: "Passionate about career growth in hospitality, Nour develops resources to help job seekers advance in Lebanon's competitive restaurant scene.",
      image: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      name: "Karim Nassar",
      position: "Technology Director",
      bio: "With a background in both tech and restaurant management, Karim ensures our platform meets the unique needs of Lebanon's hospitality sector.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ];

  const partnerships = [
    { name: "Lebanese Restaurant Association", logo: "https://via.placeholder.com/150x80?text=LRA" },
    { name: "Beirut Hotel School", logo: "https://via.placeholder.com/150x80?text=BHS" },
    { name: "Syndicate of Owners of Restaurants, Cafes, Night-Clubs & Pastries", logo: "https://via.placeholder.com/150x80?text=Syndicate" },
    { name: "Lebanese Ministry of Tourism", logo: "https://via.placeholder.com/150x80?text=Tourism" },
    { name: "Hospitality Services Lebanon", logo: "https://via.placeholder.com/150x80?text=HSL" }
  ];

  const stats = [
    { value: "2,500+", label: "Hospitality Jobs Posted Monthly" },
    { value: "8,000+", label: "Registered Restaurants & Hotels" },
    { value: "45,000+", label: "Active Job Seekers" },
    { value: "70%", label: "Placement Rate" }
  ];

  const testimonials = [
    {
      quote: "JobLink has transformed our hiring process. We've been able to find qualified staff for our restaurant in Achrafieh even during high season.",
      author: "Ziad Karam",
      position: "General Manager, La Maison Beirut",
      image: "https://randomuser.me/api/portraits/men/41.jpg"
    },
    {
      quote: "As a chef looking to advance my career, JobLink connected me with opportunities I wouldn't have found elsewhere in Lebanon's competitive restaurant scene.",
      author: "Maya Salloum",
      position: "Head Chef, previously job seeker",
      image: "https://randomuser.me/api/portraits/women/39.jpg"
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
      <h1>About JobLink</h1>
          <p>Connecting talent with opportunity in Lebanon's hospitality industry</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-main">
        {/* Mission Section */}
        <section className="about-section mission-section">
          <div className="section-content">
            <div className="text-column">
              <h2>Our Mission</h2>
              <p className="tagline">Empowering Lebanon's hospitality and restaurant sectors</p>
              <p>
                JobLink is an online platform dedicated to connecting job seekers with employers 
                in the hospitality and restaurant sectors across Lebanon. We understand the unique 
                challenges faced by both businesses and talent in this dynamic industry.
              </p>
              <p>
                In a country renowned for its culinary excellence and warm hospitality, 
                we bridge the gap between passionate professionals and establishments seeking 
                qualified staff—from chefs and servers to hotel managers and receptionists.
              </p>
              <div className="mission-points">
                <div className="mission-point">
                  <i className="fas fa-utensils"></i>
                  <div>
                    <h3>For Restaurants & Hotels</h3>
                    <p>Access to pre-screened candidates with specific experience in Lebanon's hospitality sector</p>
                  </div>
                </div>
                <div className="mission-point">
                  <i className="fas fa-user-tie"></i>
                  <div>
                    <h3>For Job Seekers</h3>
                    <p>Opportunities with Lebanon's leading restaurants, hotels, catering companies, and resorts</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="image-column">
              <div className="about-image mission-image">
                <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Lebanese restaurant" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-section stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="about-section story-section">
          <div className="section-content reverse">
            <div className="text-column">
              <h2>Our Story</h2>
              <p className="tagline">Built for Lebanon's unique hospitality landscape</p>
              <p>
                Founded in 2018, JobLink was born from the recognition that Lebanon's world-class 
                hospitality sector needed a specialized platform to connect talent with opportunities.
              </p>
              <p>
                During the challenging economic times, we've remained committed to supporting 
                Lebanon's restaurant and hotel industry—helping businesses find the right staff 
                and providing job seekers with pathways to rewarding careers in hospitality.
              </p>
              <p>
                Our deep understanding of local market needs allows us to offer services 
                tailored specifically to the Lebanese context, from seasonal hiring fluctuations 
                to the specific skill sets valued in Beirut's competitive dining scene.
              </p>
            </div>
            <div className="image-column">
              <div className="about-image story-image">
                <img src="https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Beirut skyline" />
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section team-section">
          <h2>Meet Our Team</h2>
          <p className="section-intro">
            Our team combines expertise in Lebanon's hospitality industry with technical innovation
          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-photo">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p className="position">{member.position}</p>
                <p className="bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="about-section testimonials-section">
          <h2>Success Stories</h2>
          <div className="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="quote-icon">
                  <i className="fas fa-quote-right"></i>
                </div>
                <blockquote>{testimonial.quote}</blockquote>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.author} />
                  <div>
                    <p className="author-name">{testimonial.author}</p>
                    <p className="author-position">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partners Section */}
        <section className="about-section partners-section">
          <h2>Our Partners</h2>
          <p className="section-intro">
            Working together to strengthen Lebanon's hospitality ecosystem
          </p>
          <div className="partners-grid">
            {partnerships.map((partner, index) => (
              <div className="partner-card" key={index}>
                <img src={partner.logo} alt={partner.name} />
                <p>{partner.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-section cta-section">
          <div className="cta-container">
            <h2>Join Lebanon's Leading Hospitality Network</h2>
            <p>Whether you're looking to build your career or hire talented staff in Lebanon's restaurant and hotel sectors, JobLink provides the platform you need.</p>
            <div className="cta-buttons">
              <a href="/signup" className="cta-button primary">Create an Account</a>
              <a href="/contact" className="cta-button secondary">Contact Us</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs; 