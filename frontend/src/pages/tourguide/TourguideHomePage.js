<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';

const TourguideHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Tour Guide Home page</h1>
      <div className="mt-4">
        <Link to="/tourguide/itinerary-management" className="btn btn-primary m-2">
        Itineraries Management
        </Link>
        <Link to="/tourguide/MyItineraries" className="btn btn-primary m-2">
          My Created Itineraries
        </Link>
      </div>
    </div>
  );
};

export default TourguideHomePage;
=======
import React from 'react';
import { Link } from 'react-router-dom';

const TourguideHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Tour Guide Home page</h1>
      <div className="mt-4">
        <Link to="/tourguide/itinerary-management" className="btn btn-primary m-2">
        Itineraries Management
        </Link>
        <Link to="/tourguide/MyItineraries" className="btn btn-primary m-2">
          My Created Itineraries
        </Link>
      </div>
    </div>
  );
};

export default TourguideHomePage;
>>>>>>> jwtdemo
