import React from "react";
import { Link } from "react-router-dom";

const SellerHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Seller Homepage</h1>
      <div className="mt-4">
        <Link to="/seller/profile" className="btn btn-primary m-2">
          view profile
        </Link>
        <Link to="/seller/products" className="btn btn-primary m-2">
          view products
        </Link>
      </div>
    </div>
  );
};
export default SellerHomePage;