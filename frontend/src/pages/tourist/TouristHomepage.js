import React from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import { Container, Row, Col, Card, Button } from "react-bootstrap";  // For Bootstrap styling
import {
  FaPlane,
  FaHotel,
  FaCar,
  FaMap,
  FaShoppingBag,
  FaExclamationCircle,
  FaUser,
  FaLock,
  FaBookmark,
  FaMapMarkerAlt
} from "react-icons/fa";  

const TouristHomePage = () => {
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Tourist";

  const menuItems = [
    {
      to: "/tourist/view-events",
      label: "View Events",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/saved-events", // Moved to main services
      label: "Saved Events",
      icon: <FaBookmark />,
      variant: "primary",
    },
    {
      to: "/tourist/my-profile",
      label: "My Profile",
      icon: <FaUser />,
      variant: "primary",
    },
    {
      to: "/tourist/book-flight",
      label: "Book a Flight",
      icon: <FaPlane />,
      variant: "primary",
    },
    {
      to: "/tourist/book-hotel",
      label: "Book a Hotel",
      icon: <FaHotel />,
      variant: "primary",
    },
    {
      to: "/tourist/book-transportation",
      label: "Book Transportation",
      icon: <FaCar />,
      variant: "primary",
    },
    {
      to: "/tourist/delivery-addresses",
      label: "Delivery Addresses",
      icon: <FaMapMarkerAlt />,
      variant: "primary",
    },
    {
      to: "/tourist/itinerary-filter",
      label: "Itinerary Filter",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/filtered-activities",
      label: "Filtered Activities",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/products",
      label: "View Products",
      icon: <FaShoppingBag />,
      variant: "primary",
    },
    {
      to: "/tourist/purchases",
      label: "My Purchases",
      icon: <FaShoppingBag />,
      variant: "primary",
    },
    {
      to: "/tourist/view-bookings",
      label: "View Bookings",
      icon: <FaMap />,
      variant: "primary",
    },
    // Support items
    {
      to: "/tourist/change-password",
      label: "Change My Password",
      icon: <FaLock />,
      variant: "primary",
    },
    {
      to: "/tourist/complaints",
      label: "File a Complaint",
      icon: <FaExclamationCircle />,
      variant: "danger",
    },
    {
      to: "/tourist/my-complaints",
      label: "My Complaints",
      icon: <FaExclamationCircle />,
      variant: "primary",
    }
  ];

  // Updated grouping to include saved events in Main Services
  const menuCategories = {
    "Main Services": menuItems.slice(0, 11), // First 11 items including saved events
    "Support": menuItems.slice(11) // Remaining items
  };

  // Rest of the component remains the same...
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3">Welcome to the Tourist Homepage</h1>
            <p className="text-muted">Welcome back, {username}!</p>
          </div>

          {Object.entries(menuCategories).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="mb-3 text-primary border-bottom pb-2">
                {category}
              </h3>
              <Row className="g-4 justify-content-center">
                {items.map((item) => (
                  <Col xs={12} sm={6} md={4} key={item.to}>
                    <Link
                      to={item.to}
                      className={`btn btn-${item.variant} w-100 d-flex align-items-center justify-content-center gap-2 p-3`}
                      style={{
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                      aria-label={item.label}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 8px rgba(0,0,0,0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Col>
                ))}
              </Row>

              {category === "Main Services" && (
                <div className="text-center mt-4">
                  <Link to="/tourist/filter-historical-places">
                    <Button variant="outline-primary" aria-label="Filter Historical Places">
                      Filter Historical Places by Tags
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TouristHomePage;