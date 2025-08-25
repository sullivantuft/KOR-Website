import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      // Use Formspree to handle form submission
      const formspreeId = process.env.REACT_APP_FORMSPREE_ID || 'myyvklzv';
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.question,
          _replyto: formData.email,
          _subject: 'KOR FAQ Question'
        }),
      });
      
      if (response.ok) {
        setSubmitMessage('Question submitted successfully! We\'ll respond within 24 hours.');
        setFormData({ name: '', email: '', question: '' });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage('Error submitting question. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main>
      <h1 style={{ color: 'black' }}>Frequently Asked Questions</h1>
      <div className="FAQ">
        <h2>Q:</h2>
        <h3 className="question">
          I just bought a used bike, how can I track that bike accurately?
        </h3>
        <h2>A:</h2>
        <h3 className="answer">
          The app has a "Part Settings" settings page where you can manually set
          the wear percentage for used parts. We recommend having a bike shop
          estimate the condition of your components for the most accurate
          tracking.
        </h3>
        
        <h2>Q:</h2>
        <h3 className="question">Can I use this app without a shop?</h3>
        <h2>A:</h2>
        <h3 className="answer">
          Absolutely! You can purchase a personal account plan or use our free
          limited version. However, we highly recommend getting a shop code from
          a participating bike shop as it unlocks additional features and
          enhanced support.
        </h3>
        
        <h2>Q:</h2>
        <h3 className="question">
          I signed up for a personal account and lost my code before entering it
          in the app. How can I get the code?
        </h3>
        <h2>A:</h2>
        <h3 className="answer">
          No problem! Contact us via email with your account information, and
          we'll help you retrieve your personal account code.
        </h3>
        
        <h2>Q:</h2>
        <h3 className="question">
          What if I do not have all of the parts on my bike, like front fork,
          rear shock, sealant, or a dropper seatpost?
        </h3>
        <h2>A:</h2>
        <h3 className="answer">
          KOR is flexible! Use the bike settings page to customize which
          components you want to track based on your specific bike setup. You
          can easily add or remove parts like suspension, dropper posts, and
          tubeless sealant.
        </h3>
        
        <h2>Q:</h2>
        <h3 className="question">How do I use the QR code system?</h3>
        <h2>A:</h2>
        <h3 className="answer">
          Our QR code system makes it easy for bike shops to onboard new
          customers. Simply have your customers scan the QR code, and they will
          be automatically redirected to the app store with your shop code
          pre-filled for instant login.
        </h3>
      </div>
      
      <h1><span style={{ color: 'black' }}>If you have any questions</span></h1>
      <div className="FAQ">
        {submitMessage && (
          <div className={`form-message ${submitMessage.includes('Error') ? 'error' : 'success'}`} style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            borderRadius: '4px', 
            backgroundColor: submitMessage.includes('Error') ? '#ffe6e6' : '#e6f7e6',
            color: submitMessage.includes('Error') ? '#d63031' : '#00b894',
            border: `1px solid ${submitMessage.includes('Error') ? '#d63031' : '#00b894'}`
          }}>
            {submitMessage}
          </div>
        )}
        <form
          action="https://formspree.io/f/myyvklzv"
          method="post"
          name="EmailForm"
          className="login_form"
          onSubmit={handleSubmit}
        >
          <div className="form_line">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="first name/last name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form_line">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="youraddress@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form_line">
            <label htmlFor="question">Your Question</label>
            <textarea
              id="question"
              name="question"
              placeholder="Please describe your question or concern in detail..."
              rows={4}
              value={formData.question}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Question'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default FAQ;
