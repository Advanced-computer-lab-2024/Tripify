import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
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
import GovernorHomePage from "./pages/tourismGovernor/GovernorHomePage";
import ViewHistorical from "./pages/tourismGovernor/ViewHistorical";
import GovernorCreatedPlaces from "./pages/tourismGovernor/GovernorCreatedPlaces";
import TagManagement from "./components/TagManagement";
import SellerHomePage from "./pages/seller/SellerHomePage";
import ProductPage from "./pages/product/productPage";
import UserDisplay from "./components/UserDisplay";
import ItineraryManagement from "./pages/tourguide/ItineraryManagement";
import TourguideHomePage from "./pages/tourguide/TourguideHomePage";
import TourGuideItineraries from "./pages/tourguide/TourGuideItineraries";
import Complaints from "./pages/admin/Complaints";
import ProductTouristPage from "./pages/product/productTouristPage";
import AdvertiserActivities from "./pages/advertiser/AdvertisersActivity";
import CreateComplaint from "./pages/tourist/CreateComplaint";
import FlightBooking from "./pages/tourist/FlightBooking";
import ViewBookings from "./pages/tourist/ViewBookings";
import ContentModeration from "./pages/admin/ContentModeration";
import CreateTransportationListing from "./pages/advertiser/CreateTransportationListing";
import BookTransportation from "./pages/tourist/BookTransportation";
import ManageTransportations from "./pages/advertiser/ManageTransportations";
import TouristComplaints from "./pages/tourist/TouristComplaints";
import HotelBooking from "./pages/tourist/HotelBooking";
import AccountDeletionRequest from "./components/AccountDeletionRequest";

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Tourist Routes */}
          <Route path="/tourist" element={<TouristHomePage />} />
          <Route path="/tourist/register" element={<TouristRegister />} />
          <Route path="/tourist/view-events" element={<ViewEvents />} />
          <Route path="/tourist/my-profile" element={<MyProfile />} />
          <Route path="/tourist/my-complaints" element={<TouristComplaints />} />
          <Route path="/tourist/itinerary-filter" element={<ItineraryFilter />} />
          <Route path="/tourist/filtered-activities" element={<FilteredActivities />} />
          <Route path="/tourist/products" element={<ProductTouristPage />} />
          <Route path="/tourist/complaints" element={<CreateComplaint />} />
          <Route path="/tourist/book-flight" element={<FlightBooking />} />
          <Route path="/tourist/book-hotel" element={<HotelBooking />} />
          <Route path="/tourist/view-bookings" element={<ViewBookings />} />
          <Route path="/tourist/book-transportation" element={<BookTransportation />} />
          <Route 
            path="/tourist/request-deletion" 
            element={
              <AccountDeletionRequest 
                role="tourist"
                userId={JSON.parse(localStorage.getItem("user"))?._id}
                token={localStorage.getItem("token")}
              />
            } 
          />

          {/* Tour Guide Routes */}
          <Route path="/tourguide" element={<TourguideHomePage />} />
          <Route path="/tourguide/itinerary-management" element={<ItineraryManagement />} />
          <Route path="/tourguide/MyItineraries" element={<TourGuideItineraries />} />
          <Route 
            path="/tourguide/request-deletion" 
            element={
              <AccountDeletionRequest 
                role="tourguide"
                userId={JSON.parse(localStorage.getItem("user"))?._id}
                token={localStorage.getItem("token")}
              />
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/manage-users" element={<ListUsers />} />
          <Route path="/admin/activity-categories" element={<ActivityCategoryManagement />} />
          <Route path="/admin/preference-tags" element={<PreferenceTagManagement />} />
          <Route path="/admin/complaints" element={<Complaints />} />
          <Route path="/admin/content-moderation" element={<ContentModeration />} />

          {/* Advertiser Routes */}
          <Route path="/advertiser" element={<AdvertiserHomepage />} />
          <Route path="/advertiser/create-activity" element={<CreateActivity />} />
          <Route path="/advertiser/view-activities" element={<ActivityList />} />
          <Route path="/advertiser/profile" element={<AdvertiserProfile />} />
          <Route path="/advertiser/activities" element={<AdvertiserActivities />} />
          <Route path="/advertiser/create-transportation" element={<CreateTransportationListing />} />
          <Route path="/advertiser/transportation" element={<ManageTransportations />} />
          <Route 
            path="/advertiser/request-deletion" 
            element={
              <AccountDeletionRequest 
                role="advertiser"
                userId={JSON.parse(localStorage.getItem("user"))?._id}
                token={localStorage.getItem("token")}
              />
            } 
          />

          {/* Tourism Governor Routes */}
          <Route path="/governor" element={<GovernorHomePage />} />
          <Route path="/governor/view-places" element={<ViewHistorical />} />
          <Route path="/governor/my-places" element={<GovernorCreatedPlaces />} />
          <Route path="/governor/tag-management" element={<TagManagement />} />
          <Route 
            path="/governor/request-deletion" 
            element={
              <AccountDeletionRequest 
                role="governor"
                userId={JSON.parse(localStorage.getItem("user"))?._id}
                token={localStorage.getItem("token")}
              />
            } 
          />

          {/* Seller Routes */}
          <Route path="/seller" element={<SellerHomePage />} />
          <Route path="/seller/products" element={<ProductPage />} />
          <Route path="/seller/profile" element={<UserDisplay />} />
          <Route 
            path="/seller/request-deletion" 
            element={
              <AccountDeletionRequest 
                role="seller"
                userId={JSON.parse(localStorage.getItem("user"))?._id}
                token={localStorage.getItem("token")}
              />
            } 
          />

          {/* Registration Routes */}
          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/register/tourist" element={<TouristRegister />} />
          <Route path="/register/tourguide" element={<TourGuideReg />} />
          <Route path="/register/advertiser" element={<AdvertiserReg />} />
          <Route path="/register/tourism-governor" element={<TourismGovReg />} />
          <Route path="/register/seller" element={<SellerReg />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;