import React from "react";
import { Link } from "react-router-dom";

const AdminHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Admin Homepage</h1>
      <div className="mt-4">
        <Link
          to="/admin/manage-users"
          className="btn btn-primary m-2"
        >
          Manage Users
        </Link>
        <Link
          to="/admin/user-approvals"
          className="btn btn-primary m-2"
        >
          User Approvals
        </Link>
        <Link
          to="/register/tourism-governor"
          className="btn btn-primary m-2"
        >
          Add a Tourism Governor
        </Link>
        <Link
          to="/register/admin"
          className="btn btn-primary m-2"
        >
          Add Another Admin
        </Link>
        <Link
          to="/admin/archived-products"
          className="btn btn-primary m-2"
        >
          View Archived Products
        </Link>
        <Link
          to="/admin/activity-categories"
          className="btn btn-primary m-2"
        >
          Manage Activity Categories
        </Link>
        <Link
          to="/admin/preference-tags"
          className="btn btn-primary m-2"
        >
          Manage Preference Tags
        </Link>
        <Link
          to="/seller/products"
          className="btn btn-primary m-2"
        >
          View Products
        </Link>
        <Link
          to="/admin/content-moderation"
          className="btn btn-primary m-2"
        >
          Moderate Content
        </Link>
        <Link
          to="/admin/complaints"
          className="btn btn-primary m-2"
        >
          View Complaints
        </Link>
        <Link
          to="/admin/change-password"
          className="btn btn-primary m-2"
        >
          Change Password
        </Link>
        <Link
          to="/admin/view-documents"
          className="btn btn-primary m-2"
        >
          View Documents
        </Link>
      </div>
    </div>
  );
};

export default AdminHomePage;
