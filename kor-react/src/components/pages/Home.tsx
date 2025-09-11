import React from 'react';
import { Link } from 'react-router-dom';
import StructuredData from '../common/StructuredData';
import { trackAppDownload } from '../common/GoogleAnalytics';

const Home: React.FC = () => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://jmrcycling.com';
  return (
    <>
      <StructuredData 
        type="product" 
        pageTitle="KOR - Never Miss Bike Maintenance Again | Free Bike Tracking App"
        pageDescription="Track your bike's component wear automatically with KOR. Integrated with Strava, our intelligent maintenance app alerts you before parts fail. Free download for iOS & Android."
        url={`${baseUrl}/`}
      />
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="parallax_parent">
          <div className="parallax_home">
            <div style={{ padding: '5%' }}>
              <div className="center">
                <img
                  className="app_logo"
                  src="/images/KOR_app_Logo.png"
                  alt="App Logo"
                />
              </div>
              <h1 id="hero-title" className="title_box">KOR (Keep On Rolling)</h1>
              <div className="cta-section">
                <h3 className="cta-heading">Get Started Today - Free Download!</h3>
                <div className="app-store-buttons">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.robtuft.newKOR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-button-link"
                    onClick={() => trackAppDownload('android')}
                  >
                    <img
                      className="store_buttons_large"
                      src="/images/Google_play_button.svg"
                      alt="Download on Google Play Store"
                    />
                  </a>
                  <a
                    href="https://apps.apple.com/us/app/kor-keep-on-rolling/id1599601993"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-button-link"
                    onClick={() => trackAppDownload('ios')}
                  >
                    <img
                      className="store_buttons_large"
                      src="/images/Apple_app_store_button.svg"
                      alt="Download on App Store"
                    />
                  </a>
                </div>
                <div className="secondary-cta">
                  <p className="cta-subtext">Don't have a bike shop? No problem!</p>
                  <Link className="personal-cta-button" to="/personal-plans">
                    View Personal Account Plans →
                  </Link>
                </div>
                <p className="cta-trust-signal">
                  ✅ Free to download • 🔒 Secure Strava integration
                </p>
              </div>

              <div className="mobile_textbox">
                <h2 className="hero-subtitle">Never Miss Bike Maintenance Again</h2>
                <h4 className="paragraph">
                  Track your bike's component wear automatically with our
                  intelligent maintenance app. Connected to Strava, KOR monitors
                  your rides and alerts you before parts fail, keeping you
                  rolling when it matters most.
                </h4>
                <div className="key-benefits">
                  <div className="benefit-point">
                    🔧 <strong>Smart Tracking:</strong> Automatically monitors
                    component wear
                  </div>
                  <div className="benefit-point">
                    📱 <strong>Strava Integration:</strong> Uses your ride data
                  </div>
                  <div className="benefit-point">
                    ⚡ <strong>Proactive Alerts:</strong> Know before parts fail
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" aria-labelledby="features-title">
        <div className="parallax_parent">
          <div className="parallax2_home">
            <div style={{ padding: '5%' }}>
              <h1 id="features-title">Why Choose KOR?</h1>
              <div className="point-content" role="list">
                <article className="point-card" role="listitem">
                  <h3 className="title">Dedicated Support</h3>
                  <p className="paragraph-on-dark">
                    Get personal help from our founders. We're passionate
                    cyclists who understand your needs and are here to ensure
                    you have the best experience with KOR.
                  </p>
                  <Link className="point-link" to="/contact">
                    Contact Us
                  </Link>
                </article>
                <article className="point-card" role="listitem">
                  <h3 className="title">Simple & Intuitive</h3>
                  <p className="paragraph-on-dark">
                    No complicated setup or confusing interfaces. KOR is
                    designed for riders, by riders. Connect to Strava and you're
                    ready to track your bike's health automatically.
                  </p>
                </article>
                <article className="point-card" role="listitem">
                  <h3 className="title">Stay Ride-Ready</h3>
                  <p className="paragraph-on-dark">
                    Advanced algorithms predict when components need attention,
                    so you're never caught off-guard with a broken chain or worn
                    brake pads during peak riding season.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
