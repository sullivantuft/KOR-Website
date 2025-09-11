import React, { useEffect } from 'react';

// Declare Chargebee as a global variable for TypeScript
declare global {
  interface Window {
    Chargebee: any;
  }
}

const SignUp: React.FC = () => {
  useEffect(() => {
    // Initialize Chargebee when component mounts
    if (window.Chargebee) {
      const site = process.env.REACT_APP_CHARGEBEE_SITE || 'jmrcycling';
      window.Chargebee.init({
        site: site
      });
      console.log(`Chargebee initialized with site: ${site}`);
    } else {
      console.warn('Chargebee not loaded - using development fallback mode');
    }
  }, []);

  const handleSubscription = (planType: string, billingCycle: string) => {
    console.log(`Attempting to subscribe to ${planType} - ${billingCycle}`);
    
    // Check if we're in development mode or Chargebee isn't configured
    const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';
    
    if (!window.Chargebee) {
      if (isDevelopment) {
        // Development fallback - show a modal or redirect to a test page
        const confirmed = window.confirm(
          `Development Mode:\n\nYou're trying to subscribe to:\n${planType} - ${billingCycle}\n\nThis would normally open Chargebee checkout.\n\nClick OK to simulate successful subscription, or Cancel to abort.`
        );
        
        if (confirmed) {
          // Simulate successful subscription in development
          alert('Simulated successful subscription! Redirecting to dashboard...');
          window.location.href = '/shop-dashboard?success=true&plan=' + encodeURIComponent(`${planType}-${billingCycle}`);
        }
        return;
      } else {
        alert('Payment system is not available. Please try again in a moment or contact support.');
        return;
      }
    }

    // Map plan types to Chargebee plan IDs
    const planMap: { [key: string]: string } = {
      'Basic-Monthly': 'Basic-USD-Monthly',
      'Basic-Yearly': 'Basic-Plan-USD-Yearly', 
      'Premium-Monthly': 'Premium-USD-Monthly',
      'Premium-Yearly': 'Premium-USD-Yearly'
    };

    const planId = planMap[`${planType}-${billingCycle}`];
    
    if (!planId) {
      console.error('Plan ID not found for:', planType, billingCycle);
      alert('Plan configuration error. Please contact support.');
      return;
    }

    try {
      // Initialize Chargebee instance if not already done
      const cbInstance = window.Chargebee.getInstance();
      
      if (!cbInstance) {
        alert('Payment system initialization error. Please refresh the page and try again.');
        return;
      }

      // Open Chargebee checkout
      cbInstance.openCheckout({
        hostedPage: () => {
          // This should return a hosted page object from your backend
          // For now, we'll attempt to create a basic checkout configuration
          return {
            id: planId,
            type: 'checkout_new_subscription',
            embed: false,
            success_url: `${window.location.origin}/shop-dashboard?success=true`,
            cancel_url: `${window.location.origin}/sign-up?cancelled=true`
          };
        },
        success: (hostedPageId: string) => {
          console.log('Checkout successful:', hostedPageId);
          window.location.href = `/shop-dashboard?success=true&subscription=${hostedPageId}`;
        },
        error: (error: any) => {
          console.error('Checkout error:', error);
          alert('There was an error processing your subscription. Please try again or contact support.');
        },
        close: () => {
          console.log('Checkout closed by user');
        }
      });
    } catch (error) {
      console.error('Error opening Chargebee checkout:', error);
      
      if (isDevelopment) {
        alert('Chargebee configuration error in development. Using fallback simulation.');
        const confirmed = window.confirm(`Simulate subscription to ${planType} - ${billingCycle}?`);
        if (confirmed) {
          window.location.href = '/shop-dashboard?success=true&plan=' + encodeURIComponent(`${planType}-${billingCycle}`);
        }
      } else {
        alert('Unable to open checkout. Please contact support.');
      }
    }
  };

  return (
    <>
      <div className="parallax_parent">
        <div className="parallax_sign_up">
          <div style={{ padding: '5%' }}>
            <h1 className="title_box">Shop Sign Up</h1>
            <div className="mobile_textbox">
              <p className="paragraph">
                Partner with KOR to enhance your bike shop's customer service.
                Get exclusive access to invite your customers, send automated
                maintenance notifications, and gain insights into their riding
                patterns to better serve their needs.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="parallax_parent">
        <div className="parallax2_sign_up">
          <div style={{ padding: '5%' }}>
            <div className="payment-plans">
              <div className="payment-card1">
                <h1>Basic</h1>
                <h2 className="title">$40/month</h2>
                <h2 className="title">Features</h2>
                <ul className="list">
                  <li>Unlimited Customer Invites</li>
                  <li>
                    Daily email reports of customers notified about worn parts
                  </li>
                  <li>
                    Automated notifications to customers about worn parts with
                    your shop's contact information
                  </li>
                </ul>
              </div>
              <div className="payment1">
                <div className="payment-row">
                  <button
                    type="button"
                    data-cb-type="checkout"
                    data-cb-item-0="Basic-USD-Monthly"
                    data-cb-item-0-quantity="1"
                    className="subscribe"
                    onClick={() => handleSubscription('Basic', 'Monthly')}
                  >
                    Subscribe Monthly
                  </button>
                  <button
                    type="button"
                    data-cb-type="checkout"
                    data-cb-item-0="Basic-Plan-USD-Yearly"
                    data-cb-item-0-quantity="1"
                    className="subscribe"
                    onClick={() => handleSubscription('Basic', 'Yearly')}
                  >
                    Subscribe Yearly
                  </button>
                </div>
              </div>

              <div className="payment-card2">
                <h1>Premium</h1>
                <h2 className="title">$80/month</h2>
                <h2 className="title">Features</h2>
                <ul className="list">
                  <li>Unlimited Customer Invites</li>
                  <li>
                    Daily email reports of customers notified about worn parts
                  </li>
                  <li>
                    Automated notifications to customers about worn parts with
                    your shop's contact information
                  </li>
                  <li>
                    Customizable notifications to customers for activities or
                    special deals
                  </li>
                </ul>
              </div>
              <div className="payment2">
                <div className="payment-row">
                  <button
                    type="button"
                    data-cb-type="checkout"
                    data-cb-item-0="Premium-USD-Monthly"
                    data-cb-item-0-quantity="1"
                    className="subscribe"
                    onClick={() => handleSubscription('Premium', 'Monthly')}
                  >
                    Subscribe Monthly
                  </button>
                  <button
                    type="button"
                    data-cb-type="checkout"
                    data-cb-item-0="Premium-USD-Yearly"
                    data-cb-item-0-quantity="1"
                    className="subscribe"
                    onClick={() => handleSubscription('Premium', 'Yearly')}
                  >
                    Subscribe Yearly
                  </button>
                </div>
              </div>
              
              <div className="payment-card3" style={{ opacity: 0.5 }}>
                <h1>Pro</h1>
                <h2 className="title">Features</h2>
                <ul className="list">
                  <li>Unlimited Customer Invites</li>
                  <li>
                    Daily email reports of customers that have been notified of
                    warn out parts
                  </li>
                  <li>
                    Automated Notifications notifying your customers that their
                    parts are worn and gives your contact information
                  </li>
                  <li>
                    Customizable notifications to customers for activities or
                    special deals
                  </li>
                  <li>
                    Ability to view your customer's part data and send direct
                    notifications to them regarding their part wear
                  </li>
                </ul>
                <h1 style={{ position: 'absolute', bottom: '50%', opacity: 1 }}>
                  Unavailable
                </h1>
              </div>
              <div className="payment3" style={{ opacity: 0.5 }}>
                <div className="payment-row"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
