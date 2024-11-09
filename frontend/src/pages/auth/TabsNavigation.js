// TabsNavigation.js

import React from "react";
import PropTypes from "prop-types";
import { Nav } from "react-bootstrap";

const TabsNavigation = ({ activeTab, setActiveTab, isAuthenticated }) => {
  return (
    <Nav variant="tabs" className="mb-3">
      <Nav.Item>
        <Nav.Link
          onClick={() => setActiveTab("login")}
          active={activeTab === "login"}
        >
          Login
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          onClick={() => setActiveTab("register")}
          active={activeTab === "register"}
        >
          Register
        </Nav.Link>
      </Nav.Item>
      {isAuthenticated && (
        <Nav.Item>
          <Nav.Link
            onClick={() => setActiveTab("changePassword")}
            active={activeTab === "changePassword"}
          >
            Change Password
          </Nav.Link>
        </Nav.Item>
      )}
    </Nav>
  );
};

// Optional: PropTypes for prop validation
TabsNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default TabsNavigation;
