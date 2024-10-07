import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage"; // Import the RegisterPage component
import TouristRegister from "./pages/tourist/TouristRegister";
import TouristHomePage from "./pages/tourist/TouristHomePage";
import ViewEvents from "./pages/tourist/ViewEvents";
import MyProfile from "./pages/tourist/MyProfile";
import ItineraryFilter from "./pages/tourist/ItineraryFilter";
import FilteredActivities from "./pages/tourist/FilteredActivities";
import AdminRegister from "./pages/admin/AdminRegister";
import SellerReg from "./pages/seller/SellerReg";
import AdvertiserReg from "./pages/advertiser/AdvertiserRegister";
import TourismGovReg from "./pages/tourismGovernor/TourismGovernorReg";
import TourGuideReg from "./pages/tourguide/TourguideReg";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Default route set to the RegisterPage */}
          <Route path="/" element={<RegisterPage />} />
          
          {/* Routes under "/tourist" */}
          <Route path="/tourist" element={<TouristHomePage />}>
            <Route index element={<TouristRegister />} />
            <Route path="register" element={<TouristRegister />} />
            <Route path="view-events" element={<ViewEvents />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="itinerary-filter" element={<ItineraryFilter />} />
            <Route path="filtered-activities" element={<FilteredActivities />} />
          </Route>

          {/* Registration routes */}
          <Route path="/register/admin" element={<AdminRegister/>} /> {/* Placeholder for Admin Register */}
          <Route path="/register/tourist" element={<TouristRegister />} />
          <Route path="/register/tourguide" element={<TourGuideReg/>} /> {/* Placeholder for Tour Guide Register */}
          <Route path="/register/advertiser" element={<AdvertiserReg/>} /> {/* Placeholder for Advertiser Register */}
          <Route path="/register/tourism-governor" element={<TourismGovReg/>} /> {/* Placeholder for Tourism Governor Register */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
