import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import TouristRegister from "./pages/tourist/TouristRegister";
import TouristHomePage from "./pages/tourist/TouristHomepage";
import ViewEvents from "./pages/tourist/ViewEvents";
import MyProfile from "./pages/tourist/MyProfile";
import ItineraryFilter from "./pages/tourist/ItineraryFilter";
import FilteredActivities from "./pages/tourist/FilteredActivities";
import AdminRegister from "./pages/admin/AdminRegister";
// Removed SellerReg if not used
import AdvertiserReg from "./pages/advertiser/AdvertiserRegister";
import TourismGovReg from "./pages/tourismGovernor/TourismGovernorReg";
import TourGuideReg from "./pages/tourguide/TourguideReg";
import AdvertiserHomepage from "./pages/advertiser/AdvertiserHomepage";
import CreateActivity from "./pages/advertiser/CreateActivity";
import ActivityList from "./pages/advertiser/ActivityList";
import AdvertiserProfile from "./pages/advertiser/AdvertiserProfile";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/tourist" element={<TouristHomePage />}>
            <Route index element={<TouristRegister />} />
            <Route path="register" element={<TouristRegister />} />
            <Route path="view-events" element={<ViewEvents />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="itinerary-filter" element={<ItineraryFilter />} />
            <Route path="filtered-activities" element={<FilteredActivities />} />
          </Route>

          <Route path="/advertiser" element={<AdvertiserHomepage />} />
          <Route path="/advertiser/create-activity" element={<CreateActivity />} />
          <Route path="/advertiser/view-activities" element={<ActivityList />} />
          <Route path="/advertiser/profile" element={<AdvertiserProfile />} />

          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/register/tourist" element={<TouristRegister />} />
          <Route path="/register/tourguide" element={<TourGuideReg />} />
          <Route path="/register/advertiser" element={<AdvertiserReg />} />
          <Route path="/register/tourism-governor" element={<TourismGovReg />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
