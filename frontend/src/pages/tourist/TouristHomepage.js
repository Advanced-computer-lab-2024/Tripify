import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaPlane,
  FaHotel,
  FaCar,
  FaMap,
  FaShoppingBag,
  FaExclamationCircle,
  FaUser,
} from "react-icons/fa";

const TouristHomePage = () => {
  const username =
    JSON.parse(localStorage.getItem("user"))?.username || "Tourist";

  const menuItems = [
    {
      to: "/tourist/view-events",
      label: "View Events",
      icon: <FaMap />,
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
      to: "/tourist/view-bookings",
      label: "View Bookings",
      icon: <FaMap />,
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
    },
  ];

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3">Welcome to the Tourist Homepage</h1>
            <p className="text-muted">{username}</p>
          </div>

          <Row className="g-4 justify-content-center">
            {menuItems.map((item, index) => (
              <Col xs={12} sm={6} md={4} key={index}>
                <Link
                  to={item.to}
                  className={`btn btn-${item.variant} w-100 d-flex align-items-center justify-content-center gap-2`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TouristHomePage;
