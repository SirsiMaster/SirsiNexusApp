---
layout: page
title: Stay Updated with SirsiNexus
---

<div class="newsletter-hero">
  <h1>Get the Latest SirsiNexus Updates</h1>
  <p>Join our mailing list and be the first to know about new features, improvements, and exciting developments in AI-powered cloud infrastructure.</p>
</div>

## 📬 What You'll Receive

<div class="benefits-grid">
  <div class="benefit-card">
    <h3>🚀 Product Updates</h3>
    <p>Be first to know about new features, improvements, and major releases</p>
  </div>
  
  <div class="benefit-card">
    <h3>🧠 AI Insights</h3>
    <p>Technical deep-dives into our AI implementations and cloud optimization strategies</p>
  </div>
  
  <div class="benefit-card">
    <h3>📊 Industry Reports</h3>
    <p>Exclusive research and analysis on cloud infrastructure trends and best practices</p>
  </div>
  
  <div class="benefit-card">
    <h3>🎯 Early Access</h3>
    <p>Beta program invitations and early access to new platform features</p>
  </div>
</div>

## 📝 Sign Up Now

<div class="signup-form-container">
  <form class="newsletter-form" action="#" method="post">
    <div class="form-group">
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email" required placeholder="your.email@company.com">
    </div>
    
    <div class="form-group">
      <label for="name">Full Name</label>
      <input type="text" id="name" name="name" required placeholder="Your Name">
    </div>
    
    <div class="form-group">
      <label for="company">Company (Optional)</label>
      <input type="text" id="company" name="company" placeholder="Your Company">
    </div>
    
    <div class="form-group">
      <label for="role">Role (Optional)</label>
      <select id="role" name="role">
        <option value="">Select your role</option>
        <option value="developer">Developer</option>
        <option value="devops">DevOps Engineer</option>
        <option value="architect">Solutions Architect</option>
        <option value="manager">Engineering Manager</option>
        <option value="cto">CTO/Technical Leadership</option>
        <option value="other">Other</option>
      </select>
    </div>
    
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" name="updates" value="product" checked>
        <span class="checkmark"></span>
        Product updates and announcements
      </label>
    </div>
    
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" name="updates" value="technical">
        <span class="checkmark"></span>
        Technical insights and tutorials
      </label>
    </div>
    
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" name="updates" value="research">
        <span class="checkmark"></span>
        Research reports and industry analysis
      </label>
    </div>
    
    <button type="submit" class="btn btn-primary btn-large">
      Subscribe to Updates
    </button>
    
    <p class="privacy-note">
      We respect your privacy. Unsubscribe at any time. 
      <a href="{{ '/privacy' | relative_url }}">Privacy Policy</a>
    </p>
  </form>
</div>

<div class="social-proof">
  <h3>Join 5,000+ Cloud Professionals</h3>
  <p>Already getting insights from SirsiNexus to optimize their infrastructure</p>
</div>

<style>
.newsletter-hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(145deg, #1e3a8a 15%, #059669 85%);
  color: white;
  border-radius: 0.75rem;
  margin-bottom: 3rem;
}

.newsletter-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.newsletter-hero p {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.benefit-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 0.75rem;
  border-left: 4px solid #059669;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.benefit-card h3 {
  margin-bottom: 1rem;
  color: #1e3a8a;
  font-weight: 600;
}

.signup-form-container {
  max-width: 600px;
  margin: 3rem auto;
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.newsletter-form .form-group {
  margin-bottom: 1.5rem;
}

.newsletter-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.newsletter-form input[type="email"],
.newsletter-form input[type="text"],
.newsletter-form select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.newsletter-form input:focus,
.newsletter-form select:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: 400 !important;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.75rem;
  width: auto;
}

.privacy-note {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
  margin-top: 1rem;
}

.privacy-note a {
  color: #059669;
  text-decoration: none;
}

.privacy-note a:hover {
  text-decoration: underline;
}

.social-proof {
  text-align: center;
  margin-top: 4rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
}

.social-proof h3 {
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.social-proof p {
  color: #6b7280;
}

@media (max-width: 768px) {
  .newsletter-hero h1 {
    font-size: 2rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .signup-form-container {
    margin: 2rem 1rem;
    padding: 2rem 1.5rem;
  }
}
</style>
