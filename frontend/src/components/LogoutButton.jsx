import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    // Redirect to auth page
    navigate("/auth");
  };

  return (
    <Button
      variant="danger"
      onClick={handleLogout}
      className="position-absolute top-0 end-0 m-3"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
