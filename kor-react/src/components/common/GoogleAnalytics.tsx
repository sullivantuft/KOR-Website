import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 (GA4) integration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || 'G-XXXXXXXXXX';

// Track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = (action: string, parameters: Record<string, any>) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, parameters);
  }
};

// Track app download clicks
export const trackAppDownload = (platform: 'ios' | 'android') => {
  event('app_download_click', {
    platform: platform,
    event_category: 'engagement',
    event_label: `${platform}_store_button`,
  });
};

// Track form submissions
export const trackFormSubmission = (formType: string, success: boolean) => {
  event('form_submission', {
    form_type: formType,
    success: success,
    event_category: 'form',
  });
};

// Track subscription clicks
export const trackSubscriptionClick = (plan: string, cycle: string) => {
  event('subscription_click', {
    plan_name: plan,
    billing_cycle: cycle,
    event_category: 'conversion',
    value: plan === 'Basic' ? 40 : 80,
  });
};

// Track authentication events
export const trackAuth = (action: 'login' | 'logout' | 'signup') => {
  event(action, {
    event_category: 'auth',
  });
};

// Hook to track page views automatically
const GoogleAnalytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track in production
    if (process.env.NODE_ENV === 'production' && GA_TRACKING_ID !== 'G-XXXXXXXXXX') {
      pageview(location.pathname + location.search);
    }
  }, [location]);

  return null;
};

// Initialize Google Analytics
export const initGA = () => {
  // Only initialize in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_GA_ENABLE !== 'true') {
    console.log('Google Analytics disabled in development');
    return;
  }

  if (GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    console.warn('Google Analytics tracking ID not configured');
    return;
  }

  // Create script tag for gtag
  const script1 = document.createElement('script');
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  script1.async = true;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false
    });
  `;
  document.head.appendChild(script2);

  // Store gtag in window for later use
  window.gtag = function(...args: any[]) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(arguments);
  };

  console.log('Google Analytics initialized with ID:', GA_TRACKING_ID);
};

export default GoogleAnalytics;
