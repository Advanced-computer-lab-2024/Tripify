import React, { useState, useEffect } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png"
const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu toggle
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 992); // Check if it's mobile view
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown toggle

  // Check if user is logged in
  const loggedIn = !!localStorage.getItem("token"); // Check if token exists in localStorage

  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 992;
      setIsMobileView(isMobile);
      if (!isMobile && menuOpen) {
        setMenuOpen(false); // Close menu when switching to desktop view
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
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
    : { color: "#000" }; // Black for desktop

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
        {/* Logo */}
        <Link className="navbar-brand" to="/">
  <img
    src={logo}
    alt="Tripify Logo"
    style={{ height: "40px", objectFit: "contain" }} // Adjust height to fit your design
  />
</Link>

        {/* Mobile Menu Button */}
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

        {/* Navbar Links */}
        <div
          className={`navbar-collapse ${menuOpen ? "show" : "collapse"}`}
          id="ftco-nav"
        >
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin" style={{ ...linkStyle, ...defaultLinkColor }}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/manage-users"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Users
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/complaints"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Complaints
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/view-documents"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Documents
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/admin/products"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Products
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
                <Link className="dropdown-item" to="/admin/change-password">
                  Change Password
                </Link>
                <Link className="dropdown-item" to="/admin/promo-codes">
                  Manage Promo Codes
                </Link>
                <Link className="dropdown-item" to="/admin/notifications">
                  Notifications
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

export default AdminNavbar;
