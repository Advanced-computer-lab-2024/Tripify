import React from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { Container } from "react-bootstrap"; // Assuming you are using React Bootstrap
import bgImage from "../assets/images/bg_2.jpg";

const IntroSection = () => {
  // Check if the user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem("token"); // Check if token exists
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "5px",
  };

  return (
    <>
      {isLoggedIn() ? (
        // Logged-in view
        <section className="ftco-intro ftco-section ftco-no-pt">
          <div
            className="container"
            style={{
              padding: "48px",
            }}
          >
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
                      gap: "20px",
                    }}
                  >
                    <a
                      href="/tourist/complaints"
                      className="btn px-4 py-3 d-flex align-items-center justify-content-center"
                      style={{
                        flex: 1,
                        maxWidth: "200px",
                        display: "inline-flex",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        textDecoration: "none",
                        border: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc3545")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc3545")
                      }
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
      ) : (
        // Not logged-in view
        <section className="py-5">
          <Container>
            <div
              className="text-center p-5 position-relative"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "5px",
              }}
            >
              <div style={overlayStyle}></div>
              <div
                className="position-relative"
                style={{ zIndex: 2 }}
              >
                <h2 className="text-white mb-4">
                  We Are Pacific A Travel Agency
                </h2>
                <p className="text-white mb-4">
                  We can manage your dream building A small river named Duden
                  flows by their place
                </p>
                <button className="btn btn-primary px-4 py-3">
                  Ask For A Quote
                </button>
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
};

export default IntroSection;
