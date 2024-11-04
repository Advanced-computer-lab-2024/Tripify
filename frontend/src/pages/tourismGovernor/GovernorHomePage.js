<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';

const GovernorHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Tourism Governor Home page</h1>
      <div className="mt-4">
        <Link to="/governor/view-places" className="btn btn-primary m-2">
          View Historical Places
        </Link>
        <Link to="/governor/my-places" className="btn btn-primary m-2">
          My Created Places
        </Link>
        {/* <Link to="/tourist/itinerary-filter" className="btn btn-primary m-2">
          Itinerary Filter
        </Link>
        <Link to="/tourist/filtered-activities" className="btn btn-primary m-2">
          Filtered Activities
        </Link> */}
        <Link to="/governor/tag-management" className="btn btn-primary m-2">
            Manage Tags
        </Link>
      </div>
    </div>
  );
};

export default GovernorHomePage;
=======
import React from 'react';
import { Link } from 'react-router-dom';

const GovernorHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Tourism Governor Home page</h1>
      <div className="mt-4">
        <Link to="/governor/view-places" className="btn btn-primary m-2">
          View Historical Places
        </Link>
        <Link to="/governor/my-places" className="btn btn-primary m-2">
          My Created Places
        </Link>
        {/* <Link to="/tourist/itinerary-filter" className="btn btn-primary m-2">
          Itinerary Filter
        </Link>
        <Link to="/tourist/filtered-activities" className="btn btn-primary m-2">
          Filtered Activities
        </Link> */}
        <Link to="/governor/tag-management" className="btn btn-primary m-2">
            Manage Tags
        </Link>
      </div>
    </div>
  );
};

export default GovernorHomePage;
>>>>>>> jwtdemo
