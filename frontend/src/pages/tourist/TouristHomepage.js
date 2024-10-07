import React from 'react';
import { Link } from 'react-router-dom';

const TouristHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Tourist Homepage</h1>
      <div className="mt-4">
        <Link to="/view-events" className="btn btn-primary m-2">
          View Events
        </Link>
        <Link to="/my-profile" className="btn btn-primary m-2">
          My Profile
        </Link>
        <Link to="/itinerary-filter" className="btn btn-primary m-2">
          Itinerary Filter
        </Link>
        <Link to="/filtered-activities" className="btn btn-primary m-2">
          Filtered Activities
        </Link>
      </div>
    </div>
  );
};

export default TouristHomePage;
