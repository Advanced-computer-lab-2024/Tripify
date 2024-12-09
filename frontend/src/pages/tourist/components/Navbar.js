import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaShoppingBag,
  FaBars
} from 'react-icons/fa';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 992);
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 992;
      setIsMobileView(isMobile);
      if (!isMobile && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // Dynamic styles for the links
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
        <Link className="navbar-brand" to="/" style={logoStyle}>
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
          <FaBars
            style={{ color: menuOpen || isMobileView ? "#fff" : "#000" }}
          />{" "}
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
                to="/" 
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
                to="/tourist/view-events"
                style={{ ...linkStyle, ...defaultLinkColor }}
              >
                Events
              </Link>
            </li>

            {loggedIn && (
              <>
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
                    to="/tourist/my-purchases"
                    style={{ ...linkStyle, ...defaultLinkColor }}
                  >
                    <div className="d-flex align-items-center">
                      <FaShoppingBag className="me-2" />
                      My Purchases
                    </div>
                  </Link>
                </li>

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
                    <Link className="dropdown-item" to="/tourist/my-profile">
                      View Profile
                    </Link>
                    <Link className="dropdown-item" to="/tourist/change-password">
                      Change Password
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
              </>
            )}

            {!loggedIn && (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/login"
                  style={{ ...linkStyle, ...defaultLinkColor }}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;