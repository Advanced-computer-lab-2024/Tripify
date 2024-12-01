import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu toggle
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 992); // Check if it's mobile view
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown toggle

  // Handle scrolling and resizing
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const handleResize = () => {
      const isMobile = window.innerWidth <= 992;
      setIsMobileView(isMobile);
      if (!isMobile && menuOpen) {
        setMenuOpen(false); // Close menu when switching to desktop view
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  // Dynamic styles for the links
  const linkStyle = {
    fontSize: "18px",
    fontWeight: "600",
    marginRight: "20px",
    transition: "color 0.3s ease",
  };

  const defaultLinkColor = menuOpen || isMobileView
    ? { color: "#fff" } // White for mobile menu
    : scrolled
    ? { color: "#000" } // Black when scrolled
    : { color: "#000" }; // Black for default state

  const logoStyle = {
    fontWeight: "700",
    fontSize: "28px", // Larger font size for the logo
    transition: "color 0.3s ease",
    ...defaultLinkColor,
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        menuOpen || isMobileView ? "bg-dark" : "bg-white shadow-sm"
      } fixed-top`}
      id="ftco-navbar"
      style={{
        transition: "background-color 0.3s ease",
      }}
    >
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand" to="/" style={logoStyle}>
          Tripify<span style={{ fontSize: "14px" }}>Travel Agency</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={menuOpen} // Reflect the menu state
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)} // Toggle menu state
          style={{
            border: "1px solid #fff",
            color: menuOpen || isMobileView ? "#fff" : "#000", // Make text white for mobile view
            transition: "color 0.3s ease",
          }}
        >
          <span className="oi oi-menu" style={{ color: menuOpen || isMobileView ? "#fff" : "#000" }}></span> Menu
        </button>

        {/* Navbar Links */}
        <div
          className={`navbar-collapse ${menuOpen ? "show" : "collapse"}`}
          id="ftco-nav"
        >
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/tourist"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/about"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/destination"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Events
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/tourist/products"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/tourist/view-bookings"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Bookings
              </Link>
            </li>

            {/* Dropdown Menu for My Profile */}
            <li
              className={`nav-item dropdown ${
                dropdownOpen ? "show" : ""
              }`} // Toggle dropdown state
              onMouseEnter={() => setDropdownOpen(true)} // Open on hover
              onMouseLeave={() => setDropdownOpen(false)} // Close on mouse leave
            >
              <Link
                className="nav-link dropdown-toggle d-flex align-items-center"
                to="#"
                id="navbarDropdown"
                role="button"
                aria-expanded={dropdownOpen}
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                <FaUser className="me-2" />
                My Profile
              </Link>
              <div
                className={`dropdown-menu dropdown-menu-right ${
                  dropdownOpen ? "show" : ""
                }`}
                aria-labelledby="navbarDropdown"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Link className="dropdown-item" to="/tourist/my-profile">
                  View Profile
                </Link>
                <Link className="dropdown-item" to="/tourist/change-password">
                  Change Password
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
