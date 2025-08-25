import React from 'react';
import ScrollAnimations from '../common/ScrollAnimations';

const OurApp: React.FC = () => {
  return (
    <>
      <ScrollAnimations />
      <section className="app-screen-section">
        <div className="app-content-grid">
          <div className="our_app_textbox slide-in">
            <h1>The KOR App</h1>
            <p className="paragraph">
              This application integrates with a third-party application,
              Strava, a social media platform for athletes. Strava tracks the
              miles you accumulate, and our application utilizes this data to
              calculate the percentage of wear on your bicycle.
            </p>
          </div>
          <div className="center slide-in">
            <img
              className="our_app_example"
              src="/images/WelcomeScreenshot.png"
              alt="App Home Screen"
            />
          </div>
        </div>
      </section>

      <section className="app-screen-section">
        <div className="app-content-grid">
          <div className="our_app_textbox slide-in">
            <p className="paragraph">
              This screen serves as the central hub for monitoring the wear and
              tear of your bicycle's components. It organizes the information of
              all your bicycle's parts in descending order of their level of
              wear. By tapping the (i) icon, you can access detailed information
              about each component.
            </p>
          </div>
          <div className="center slide-in">
            <img
              src="/images/BikeDashboard.png"
              className="our_app_example"
              alt="App Dashboard"
            />
          </div>
        </div>
      </section>

      <section className="app-screen-section">
        <div className="app-content-grid">
          <div className="our_app_textbox slide-in">
            <p className="paragraph">
              This pop-up window provides comprehensive information for viewing
              and updating your part details.
            </p>
          </div>
          <div className="center slide-in">
            <img
              className="our_app_example"
              src="/images/PartPopup.png"
              alt="App Part Screen"
            />
          </div>
        </div>
      </section>

      <section className="app-screen-section">
        <div className="app-content-grid">
          <div className="our_app_textbox slide-in">
            <p className="paragraph">
              This page will allow you to access the settings for your bicycle.
              You can change add shock notes (ratings such as PSI, rebound and
              sag percentage), customize your parts, set a default bike, and
              send feedback!
            </p>
          </div>
          <div className="center slide-in">
            <img
              className="our_app_example"
              src="/images/BikeSettings.png"
              alt="App Part Model Change"
            />
          </div>
        </div>
      </section>

      <section className="app-screen-section">
        <div className="app-content-grid">
          <div className="our_app_textbox slide-in">
            <p className="paragraph">
              You can utilize this provided page to update bike information such
              as predetermined part wear percentages, used miles, and estimated
              life miles
            </p>
          </div>
          <div className="center slide-in">
            <img
              className="our_app_example"
              src="/images/PartSettings.png"
              alt="App Part Model Change"
            />
          </div>
        </div>
      </section>

      <section className="app-screen-section">
        <div className="app-content-grid">
          <div className="our_app_textbox slide-in">
            <p className="paragraph">
              Here is the location to modify the components that are physically
              present on your bicycle. You can remove items such as suspension,
              sealant, and a dropper seatpost from the application.
            </p>
          </div>
          <div className="center slide-in">
            <img
              className="our_app_example"
              src="/images/PartVisibility.png"
              alt="App Part Visibility"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">
            Ready to Never Miss Maintenance Again?
          </h2>
          <p className="cta-banner-text">
            Join many cyclists who trust KOR to keep their bikes in perfect
            condition.
          </p>
          <div className="cta-banner-buttons">
            <a
              href="https://play.google.com/store/apps/details?id=com.robtuft.newKOR"
              target="_blank"
              rel="noopener noreferrer"
              className="store-button-link"
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
            >
              <img
                className="store_buttons_large"
                src="/images/Apple_app_store_button.svg"
                alt="Download on App Store"
              />
            </a>
          </div>
          <div className="cta-banner-secondary">
            <a className="personal-cta-button" href="/personal-plans">
              Personal Plans Available →
            </a>
            <span className="cta-divider">•</span>
            <a className="shop-cta-button" href="/sign-up">
              Bike Shop Partnerships →
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default OurApp;
