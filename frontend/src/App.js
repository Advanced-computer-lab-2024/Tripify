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
import SellerReg from "./pages/seller/SellerReg";
import AdvertiserReg from "./pages/advertiser/AdvertiserRegister";
import TourismGovReg from "./pages/tourismGovernor/TourismGovernorReg";
import TourGuideReg from "./pages/tourguide/TourguideReg";
import ListUsers from "./pages/admin/ListUsers";
import AdminHomePage from "./pages/admin/AdminHomePage";
import ActivityCategoryManagement from "./pages/admin/ActivityCategoryManagement";
import PreferenceTagManagement from "./pages/admin/PreferenceTagManagement";
import AdvertiserHomepage from "./pages/advertiser/AdvertiserHomepage";
import CreateActivity from "./pages/advertiser/CreateActivity";
import ActivityList from "./pages/advertiser/ActivityList";
import AdvertiserProfile from "./pages/advertiser/AdvertiserProfile";
import SellerHomePage from "./pages/seller/SellerHomePage";
import UserDisplay from "./components/UserDisplay";
import ProductPage from "./pages/product/productPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/tourist" element={<TouristHomePage />} />
          <Route path="/tourist/register" element={<TouristRegister />} />
          <Route path="/tourist/view-events" element={<ViewEvents />} />
          <Route path="/tourist/my-profile" element={<MyProfile />} />
          <Route
            path="/tourist/itinerary-filter"
            element={<ItineraryFilter />}
          />
          <Route
            path="/tourist/filtered-activities"
            element={<FilteredActivities />}
          />
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/manage-users" element={<ListUsers />} />
          <Route
            path="/admin/activity-categories"
            element={<ActivityCategoryManagement />}
          />
          <Route
            path="/admin/preference-tags"
            element={<PreferenceTagManagement />}
          />
          <Route path="/advertiser" element={<AdvertiserHomepage />} />
          <Route
            path="/advertiser/create-activity"
            element={<CreateActivity />}
          />
          <Route
            path="/advertiser/view-activities"
            element={<ActivityList />}
          />
          <Route path="/advertiser/profile" element={<AdvertiserProfile />} />
          <Route path="/seller" element={<SellerHomePage />} />
          <Route path="/seller/profile" element={<UserDisplay />} />
          <Route path="/seller/products" element={<ProductPage />} /> // Changed
          to PascalCase
          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/register/tourist" element={<TouristRegister />} />
          <Route path="/register/tourguide" element={<TourGuideReg />} />
          <Route path="/register/advertiser" element={<AdvertiserReg />} />
          <Route
            path="/register/tourism-governor"
            element={<TourismGovReg />}
          />
          <Route path="/register/seller" element={<SellerReg />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
