import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Import User Account Display
import UserAccount from './components/UserDisplay'; // Import User Account

// Import registration components for different user types
import AdvertiserRegister from './components/AdvertiserRegister';
import SellerRegister from './components/SellerRegister';
import TourguideRegister from './components/TourguideRegister';
import UpdateUser from './components/UpdateUser'; // Assuming you still need this component

const App = () => {
  return (
    <Router>
      <div className="container">
        {/* Header */}
        <div className="text-center mt-5 mb-4">
          <h1 className="display-4">User Management System</h1>
          <p className="lead">Manage users, advertisers, sellers, and tour guides efficiently.</p>
        </div>

        {/* Navigation */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-5">
          <div className="container-fluid">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">User Account</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register/advertiser">Register Advertiser</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register/seller">Register Seller</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register/tourguide">Register Tour Guide</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/update/:id">Update User</Link> {/* Update User Link */}
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Routes Configuration */}
        <Routes>
          {/* Main Functional Pages */}
          <Route path="/" element={<UserAccount />} />
          <Route path="/update/:id" element={<UpdateUser />} />

          {/* Registration Routes for Different User Types */}
          <Route path="/register/advertiser" element={<AdvertiserRegister />} />
          <Route path="/register/seller" element={<SellerRegister />} />
          <Route path="/register/tourguide" element={<TourguideRegister />} />

          {/* 404 Catch-All Route */}
          <Route path="*" element={<h2 className="text-center text-danger">404 Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
