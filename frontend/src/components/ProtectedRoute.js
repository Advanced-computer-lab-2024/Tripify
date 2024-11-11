import React from "react";
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  // Redirect to login if token is missing
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }
  // If the user doesn't have the required role, redirect to a fallback page (e.g., home)
  if (requiredRole && userRole !== requiredRole) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }
  // If both checks pass, render the child components
  return children;
};
export default ProtectedRoute;
