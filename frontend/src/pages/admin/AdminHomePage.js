<<<<<<< HEAD
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
          view products
        </Link>
        <Link
          to="/admin/complaints"
          className="btn btn-primary m-2"
        >
          Complaints
        </Link>
      </div>
    </div>
  );
};

export default AdminHomePage;
=======
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
          view products
        </Link>
      </div>
    </div>
  );
};

export default AdminHomePage;
>>>>>>> jwtdemo
