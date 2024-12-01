import React from "react";
import aboutImage from "../assets/images/about-1.jpg";

const AboutUsSection = () => {
  return (
    <section className="ftco-section ftco-about ftco-no-pt img">
      <div className="container">
        <div className="row d-flex">
          <div className="col-md-12 about-intro">
            <div className="row">
              <div className="col-md-6 d-flex align-items-stretch">
                <div
                  className="img d-flex w-100 align-items-center justify-content-center"
                  style={{
                    backgroundImage: `url(${aboutImage})`,
                  }}
                ></div>
              </div>
              <div className="col-md-6 pl-md-5 py-5">
                <div className="row justify-content-start pb-3">
                  <div className="col-md-12 heading-section ftco-animate">
                    <span className="subheading">About Us</span>
                    <h2 className="mb-4">Make Your Tour Memorable and Safe With Us</h2>
                    <p>
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts. Separated they live in Bookmarksgrove right at the
                      coast of the Semantics, a large language ocean.
                    </p>
                    <p>
                      <a href="/tourist/filtered-itineraries" className="btn btn-primary">
                        Book Your Itinerary
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
