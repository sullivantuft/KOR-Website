import React from 'react';
import StructuredData from '../common/StructuredData';

const OurStory: React.FC = () => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://jmrcycling.com';
  return (
    <>
      <StructuredData
        type="website"
        pageTitle="Our Story — KOR"
        pageDescription="Learn how the KOR team started and our mission to keep cyclists rolling with smart maintenance tracking."
        url={`${baseUrl}/our-story`}
      />
      <div className="parallax_parent">
        <div className="parallax_our_story">
          <div style={{ padding: '5%' }}>
            <div className="mobile_textbox" style={{ opacity: 0.75 }}>
              <h1>Our Story</h1>
              <h3 className="paragraph">
                We began with an idea to address the inconvenience of waiting
                weeks for bike parts due to supply chain issues. Jessica Wyman
                initially conceived this idea and later collaborated with Mason
                Tuft and Robert Tuft to develop an app to solve this problem. We
                started working on this project back in June 2020, and it has
                been a long journey, but we are thrilled to present our app to
                you now!
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div className="parallax_parent">
        <div className="parallax2_our_story">
          <div style={{ padding: '20%' }}>
            <div className="mobile_textbox" style={{ opacity: 0.75 }}>
              <h1>Our Audience</h1>
              <h3 className="paragraph">
                We had this App originally tailored to high school mountain bike
                racers. We have recently adapted to other types of riders from
                hobbyists to pro racers!
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OurStory;
