import React from "react";
import { FaExclamationCircle } from "react-icons/fa";
import bgImage from "../assets/images/bg_2.jpg";

const IntroSection = () => {
  return (
    <section className="ftco-intro ftco-section ftco-no-pt">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12 text-center">
            <div
              className="img"
              style={{
                backgroundImage: `url(${bgImage})`,
                position: "relative",
                padding: "50px 20px",
                color: "#fff",
              }}
            >
              <div
                className="overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
              ></div>
              <h2 style={{ position: "relative", zIndex: 1 }}>Support</h2>
              <p style={{ position: "relative", zIndex: 1 }}>
                We Are Always At Your Service
              </p>
              <div
                className="d-flex justify-content-center gap-3"
                style={{
                  position: "relative",
                  zIndex: 1,
                  gap: "20px", // Gap between buttons
                }}
              >
                <a
                  href="/tourist/complaints"
                  className="btn px-4 py-3 d-flex align-items-center justify-content-center"
                  style={{
                    flex: 1,
                    maxWidth: "200px",
                    display: "inline-flex",
                    backgroundColor: "#dc3545", // Bootstrap danger color
                    color: "#fff",
                    textDecoration: "none",
                    border: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
                >
                  <FaExclamationCircle className="me-2" />
                  File a Complaint
                </a>
                <a
                  href="/tourist/my-complaints"
                  className="btn btn-primary px-4 py-3 d-flex align-items-center justify-content-center"
                  style={{
                    flex: 1,
                    maxWidth: "200px",
                    display: "inline-flex",
                  }}
                >
                  <FaExclamationCircle className="me-2" />
                  My Complaints
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
