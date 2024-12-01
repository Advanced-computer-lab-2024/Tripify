import React from "react";
import service1 from "../assets/images/services-1.jpg"
import service2 from "../assets/images/services-2.jpg"
import service3 from "../assets/images/services-3.jpg"
import service4 from "../assets/images/services-4.jpg"
const ServicesSection = () => {
  return (
    <section className="ftco-section services-section">
      <div className="container">
        <div className="row d-flex">
          {/* Text Content Section */}
          <div className="col-md-6 order-md-last heading-section pl-md-5 ftco-animate d-flex align-items-center">
            <div className="w-100">
              <span className="subheading">Welcome to Tripify</span>
              <h2 className="mb-4">It's time to start your adventure</h2>
              <p>
                A small river named Duden flows by their place and supplies it
                with the necessary regelialia. It is a paradisematic country, in
                which roasted parts of sentences fly into your mouth.
              </p>
              <p>
                Far far away, behind the word mountains, far from the countries
                Vokalia and Consonantia, there live the blind texts. Separated
                they live in Bookmarksgrove right at the coast of the Semantics,
                a large language ocean. A small river named Duden flows by their
                place and supplies it with the necessary regelialia.
              </p>
              <p>
                <a href="/tourist/view-events" className="btn btn-primary py-3 px-4">
                  View Events
                </a>
              </p>
            </div>
          </div>

          {/* Services Section */}
          <div className="col-md-6">
            <div className="row">
              {/* Service 1 */}
              <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                <div
                  className="services services-1 color-1 d-block img"
                  style={{
                    backgroundImage: `url(${service1})`,
                  }}
                >
                  <div className="icon d-flex align-items-center justify-content-center">
                    <span className="flaticon-paragliding"></span>
                  </div>
                  <div className="media-body">
                    <h3 className="heading mb-3">Activities</h3>
                    <p>
                      A small river named Duden flows by their place and
                      supplies it with the necessary
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 2 */}
              <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                <div
                  className="services services-1 color-2 d-block img"
                  style={{
                    backgroundImage: `url(${service2})`,
                  }}
                >
                  <div className="icon d-flex align-items-center justify-content-center">
                    <span className="flaticon-route"></span>
                  </div>
                  <div className="media-body">
                    <h3 className="heading mb-3">Travel Arrangements</h3>
                    <p>
                      A small river named Duden flows by their place and
                      supplies it with the necessary
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 3 */}
              <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                <div
                  className="services services-1 color-3 d-block img"
                  style={{
                    backgroundImage: `url(${service3})`,
                  }}
                >
                  <div className="icon d-flex align-items-center justify-content-center">
                    <span className="flaticon-tour-guide"></span>
                  </div>
                  <div className="media-body">
                    <h3 className="heading mb-3">Private Guide</h3>
                    <p>
                      A small river named Duden flows by their place and
                      supplies it with the necessary
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 4 */}
              <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                <div
                  className="services services-1 color-4 d-block img"
                  style={{
                    backgroundImage: `url(${service4})`,
                  }}
                >
                  <div className="icon d-flex align-items-center justify-content-center">
                    <span className="flaticon-map"></span>
                  </div>
                  <div className="media-body">
                    <h3 className="heading mb-3">Location Manager</h3>
                    <p>
                      A small river named Duden flows by their place and
                      supplies it with the necessary
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

export default ServicesSection;
