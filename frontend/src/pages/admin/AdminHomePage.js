import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

const AdminHomePage = () => {
  const [username, setUsername] = useState("");

  // Check if the user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  // Fetch username from localStorage (or an API if needed)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
    }
  }, []);

  return (
    <>
      <AdminNavbar />
      <div
        className="container"
        style={{ marginTop: "100px" }}
      >
        {/* Hero Section */}
        {isLoggedIn() && (
          <div className="hero-section text-center p-5 mb-4 bg-light rounded shadow">
            <h1 className="display-4">Admin Dashboard</h1>
            <p className="lead">
              Welcome back, <strong>{username || "Admin"}!</strong> Manage your agency’s activities, users, and more efficiently.
            </p>
          </div>
        )}

        {/* Navigation Section */}
        <div className="row">
          {/* Column 1 */}
          <div className="col-md-4 mb-4">
            <Link
              to="/register/tourism-governor"
              className="card text-center shadow h-100 text-decoration-none"
            >
              <div className="card-body">
                <h5 className="card-title">Add Tourism Governor</h5>
                <p className="card-text">
                  Register new tourism governors to enhance operations.
                </p>
              </div>
            </Link>
          </div>

          {/* Column 2 */}
          <div className="col-md-4 mb-4">
            <Link
              to="/register/admin"
              className="card text-center shadow h-100 text-decoration-none"
            >
              <div className="card-body">
                <h5 className="card-title">Add Another Admin</h5>
                <p className="card-text">
                  Grant admin access to new team members.
                </p>
              </div>
            </Link>
          </div>

          {/* Column 3 */}
          <div className="col-md-4 mb-4">
            <Link
              to="/admin/activity-categories"
              className="card text-center shadow h-100 text-decoration-none"
            >
              <div className="card-body">
                <h5 className="card-title">Manage Activity Categories</h5>
                <p className="card-text">
                  Organize and update activity categories.
                </p>
              </div>
            </Link>
          </div>

          {/* Column 4 */}
          <div className="col-md-4 mb-4">
            <Link
              to="/admin/preference-tags"
              className="card text-center shadow h-100 text-decoration-none"
            >
              <div className="card-body">
                <h5 className="card-title">Manage Preference Tags</h5>
                <p className="card-text">
                  Customize preference tags for a better user experience.
                </p>
              </div>
            </Link>
          </div>

          {/* Column 5 */}
          <div className="col-md-4 mb-4">
            <Link
              to="/admin/content-moderation"
              className="card text-center shadow h-100 text-decoration-none"
            >
              <div className="card-body">
                <h5 className="card-title">Moderate Content</h5>
                <p className="card-text">
                  Review and approve user-generated content.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHomePage;
