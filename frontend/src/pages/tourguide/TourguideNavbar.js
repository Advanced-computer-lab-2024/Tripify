import React, { useState, useEffect } from "react";
import { 
  FaUser, 
  FaSignOutAlt, 
  FaRoute, 
  FaMapMarkedAlt, 
  FaKey,
  
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const TourguideNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 992);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 992;
      setIsMobileView(isMobile);
      if (!isMobile && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  const linkStyle = {
    fontSize: "18px",
    fontWeight: "600",
    marginRight: "20px",
    transition: "color 0.3s ease",
  };

  const defaultLinkColor = menuOpen || isMobileView
    ? { color: "#fff" }
    : { color: "#000" };

  const logoStyle = {
    fontWeight: "700",
    fontSize: "28px",
    ...defaultLinkColor,
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        menuOpen || isMobileView ? "bg-dark" : "bg-white shadow-sm"
      } fixed-top`}
      style={{ transition: "background-color 0.3s ease" }}
    >
      <div className="container">
        <Link className="navbar-brand" to="/tourguide" style={logoStyle}>
          Tripify<span style={{ fontSize: "14px" }}>Travel Agency</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            border: "1px solid #fff",
            color: menuOpen || isMobileView ? "#fff" : "#000",
          }}
        >
          <span
            className="oi oi-menu"
            style={{ color: menuOpen || isMobileView ? "#fff" : "#000" }}
          ></span>{" "}
          Menu
        </button>

        <div
          className={`navbar-collapse ${menuOpen ? "show" : "collapse"}`}
          id="ftco-nav"
        >
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/tourguide" 
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/tourguide/itinerary-management"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                <FaRoute className="me-2" />
                Itineraries Management
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/tourguide/MyItineraries"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                <FaMapMarkedAlt className="me-2" />
                My Itineraries
              </Link>
            </li>

            {/* Dropdown Menu */}
            <li
              className={`nav-item dropdown ${dropdownOpen ? "show" : ""}`}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
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
              >
                <Link className="dropdown-item" to="/tourguide/change-password">
                  <FaKey className="me-2" />
                  Change Password
                </Link>
                <Link className="dropdown-item" to="/tourguide/profile">
                  <FaUser className="me-2" />
                  My Profile
                </Link>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default TourguideNavbar;
