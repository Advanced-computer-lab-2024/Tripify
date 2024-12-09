import React, { useState } from "react";
import ModalVideo from "react-modal-video";
import "react-modal-video/scss/modal-video.scss";
import bgImage from "../assets/images/bg_4.jpg";

const AboutSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className="ftco-section ftco-about img"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="overlay"></div>
      <div className="container py-md-5">
        <div className="row py-md-5">
          <div className="col-md d-flex align-items-center justify-content-center">
            <button
              onClick={() => setIsOpen(true)}
              className="icon-video popup-vimeo d-flex align-items-center justify-content-center mb-4"
              style={{
                width: "80px",
                height: "80px",
                background: "#fff",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                zIndex: 2, // Ensure the button is above other components
              }}
            >
              <span
                className="fa fa-play"
                style={{
                  fontSize: "24px",
                  color: "#f15d30",
                }}
              ></span>
            </button>

            {/* Video Modal */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: isOpen ? 1050 : -1, // Modal will appear above everything
                display: isOpen ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.8)", // Backdrop color
              }}
            >
              {isOpen && (
                <ModalVideo
                  channel="vimeo"
                  isOpen={isOpen}
                  videoId="45830194"
                  onClose={() => setIsOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
