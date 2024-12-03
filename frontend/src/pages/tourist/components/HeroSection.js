import React, { useState } from "react";
import ModalVideo from "react-modal-video";
import "react-modal-video/scss/modal-video.scss";
import bgImage from "../assets/images/bg_5.jpg";

const HeroSection = ({ username }) => {
   // Check if the user is logged in
   const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="hero-wrap js-fullheight"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay to darken the background */}
      <div className="overlay active"></div>

      {/* Welcome Back Message */}
      {isLoggedIn() && (
        <div
          style={{
            position: "absolute",
            top: "90px", // Adjust to align below the navbar
            right: "170px", // Positioned to the right
            zIndex: 10,
            color: "#fff", // White text
            fontSize: "18px", // Font size
            fontWeight: "600", // Font weight
          }}
        >
          <p style={{ margin: 0 }}>
            Welcome back, <strong>{username}</strong>!
          </p>
        </div>
      )}

      {/* Main Container */}
      <div className="container">
        <div
          className="row no-gutters slider-text js-fullheight align-items-center"
          data-scrollax-parent="true"
        >
          {/* Text Section */}
          <div className="col-md-7 ftco-animate">
            <div className="slider-text">
              <span className="subheading">Welcome to Pacific</span>
              <h1 className="mb-4">Discover Your Favorite Place with Us</h1>
              <p className="caps">
                Travel to any corner of the world, without going around in
                circles
              </p>
            </div>
          </div>

          {/* Play Button */}
          <div className="col-md-5 d-flex align-items-center justify-content-end">
            <button
              onClick={() => setIsOpen(true)}
              className="icon-video popup-vimeo d-flex align-items-center justify-content-center"
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                background: "#fff",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                zIndex: 3,
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                className="fa fa-play"
                style={{
                  color: "#f15d30",
                  fontSize: "24px",
                }}
              ></span>
            </button>
            <ModalVideo
              channel="vimeo"
              isOpen={isOpen}
              videoId="45830194"
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
