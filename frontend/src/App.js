import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage"; // Combined login/register page
import TouristRegister from "./pages/tourist/TouristRegister";
import ReviewsSystem from "./components/ReviewsSystem";
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
import DeliveryAddresses from './components/DeliveryAddresses';
import TourGuideReviews from "./pages/reviews/TourGuideReviews";
import EventReviews from "./pages/reviews/EventReviews";
import ProductReviews from "./pages/reviews/ProductReviews";
import MyReviews from "./pages/reviews/MyReviews";
import RateTourGuides from "./pages/tourist/RateTourGuides";
import HotelBookings from "./pages/tourist/HotelBookings";
import SavedEvents from './pages/tourist/SavedEvents';
import NotificationsPage from "./pages/tourist/NotificationPage";
import VacationGuide from './components/VacationGuide';


// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import AdminChangePassword from "./changePassword/AdminChangePassword";
import AdvertiserChangePassword from "./changePassword/AdvertiserChangePassword";
import SellerChangePassword from "./changePassword/SellerChangePassword";
import TourGuideChangePassword from "./changePassword/TourGuideChangePassword";
import TouristChangePassword from "./changePassword/TouristChangePassword";
import TouristGovernorChangePassword from "./changePassword/TouristGovernerChangePassword";
import ViewDocuemnts from "./pages/admin/ViewDocuments";
import MyPurchasesPage from "./pages/tourist/MyPurchasesPage";
import PromoCodeManager from "./pages/admin/PromoCodeManager";
import SellerSalesReport from "./pages/seller/SellerSalesReport";
import TourGuideSalesReport from "./pages/tourguide/TourGuideSalesReport";
import AdvertiserSalesReport from "./pages/advertiser/AdvertiserSalesReport";
import AdminSalesReport from "./pages/admin/AdminSalesReport";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          {/* Tourist Routes */}
          <Route path="/tourist" element={<TouristHomePage />} />
          <Route path="/tourist/register" element={<TouristRegister />} />
          <Route path="/tourist/view-events" element={<ViewEvents />} />
          <Route path="/tourist/my-profile" element={<MyProfile />} />
          <Route
            path="/tourist/my-complaints"
            element={<TouristComplaints />}
          />
          <Route
            path="/tourist/itinerary-filter"
            element={<ItineraryFilter />}
          />
          <Route
            path="/tourist/filtered-activities"
            element={<FilteredActivities />}
          />
          <Route path="/tourist/products" element={<ProductTouristPage />} />
          <Route path="/tourist/purchases" element={<MyPurchasesPage />} />
          <Route path="/tourist/complaints" element={<CreateComplaint />} />
          <Route path="/tourist/book-flight" element={<FlightBooking />} />
          <Route path="/tourist/book-hotel" element={<HotelBooking />} />
          <Route path="/tourist/saved-events" element={<SavedEvents />} />
          <Route path="/tourist/notifications" element={<NotificationsPage />} />
          <Route path="/tourist/guide" element={<VacationGuide />} />
          <Route
            path="/tourist/hotel-bookings"
            element={<HotelBookings />}
          />{" "}
          <Route path="/tourist/view-bookings" element={<ViewBookings />} />
          <Route
            path="/tourist/book-transportation"
            element={<BookTransportation />}
          />
          <Route
            path="/tourist/change-password"
            element={<TouristChangePassword />}
          />
          {/* Review System Routes */}
          <Route
            path="/tourist/reviews/tour-guides"
            element={<RateTourGuides />}
          />
          <Route path="/tourist/delivery-addresses" element={<DeliveryAddresses />} />
          <Route path="/tourist/reviews/events" element={<EventReviews />} />
          <Route
            path="/tourist/reviews/products"
            element={<ProductReviews />}
          />
          <Route path="/tourist/my-reviews" element={<MyReviews />} />
          <Route path="/tourist/reviews" element={<ReviewsSystem />} />{" "}
          {/* Keep your existing general reviews route */}
          {/* Tour Guide Routes */}
          <Route path="/tourguide" element={<TourguideHomePage />} />
          <Route
            path="/tourguide/itinerary-management"
            element={<ItineraryManagement />}
          />
          <Route
            path="/tourguide/MyItineraries"
            element={<TourGuideItineraries />}
          />
          <Route
            path="/tourguide/change-password"
            element={<TourGuideChangePassword />}
          />
          <Route
            path="/tourguide/sales-report"
            element={<TourGuideSalesReport />}
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/manage-users" element={<ListUsers />} />
          <Route
            path="/admin/activity-categories"
            element={<ActivityCategoryManagement />}
          />
          <Route path="/admin/promo-codes" element={<PromoCodeManager />} />
          <Route
            path="/admin/preference-tags"
            element={<PreferenceTagManagement />}
          />
          <Route path="/admin/complaints" element={<Complaints />} />
          <Route
            path="/admin/content-moderation"
            element={<ContentModeration />}
          />
          <Route path="/admin/view-documents" element={<ViewDocuemnts />} />
          <Route
            path="/admin/change-password"
            element={<AdminChangePassword />}
          />
          <Route path="/admin/sales-report" element={<AdminSalesReport />} />
          {/* Advertiser Routes */}
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
          <Route
            path="/advertiser/activities"
            element={<AdvertiserActivities />}
          />
          <Route
            path="/advertiser/create-transportation"
            element={<CreateTransportationListing />}
          />
          <Route
            path="/advertiser/transportation"
            element={<ManageTransportations />}
          />
          <Route
            path="/advertiser/change-password"
            element={<AdvertiserChangePassword />}
          />
          <Route
            path="/advertiser/sales-report"
            element={<AdvertiserSalesReport />}
          />
          {/* Tourism Governor Routes */}
          <Route path="/governor" element={<GovernorHomePage />} />
          <Route path="/governor/view-places" element={<ViewHistorical />} />
          <Route
            path="/governor/my-places"
            element={<GovernorCreatedPlaces />}
          />
          <Route path="/governor/tag-management" element={<TagManagement />} />
          <Route
            path="/governor/change-password"
            element={<TouristGovernorChangePassword />}
          />
          {/* Seller Routes */}
          <Route path="/seller" element={<SellerHomePage />} />
          <Route path="/seller/products" element={<ProductPage />} />
          <Route path="/seller/profile" element={<UserDisplay />} />
          <Route
            path="/seller/change-password"
            element={<SellerChangePassword />}
          />
          <Route path="/seller/sales-report" element={<SellerSalesReport />} />
          {/* Registration Routes */}
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
