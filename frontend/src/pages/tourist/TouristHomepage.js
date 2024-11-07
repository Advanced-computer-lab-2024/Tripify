import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";

const TouristHomePage = () => {
  // Retrieve username from local storage with fallback
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Tourist";

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3" aria-level="1">Welcome to the Tourist Homepage</h1>
            <p className="text-muted" role="note">{username}</p>
          </div>

          <Row className="g-4 justify-content-center">
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/view-events" className="btn btn-primary w-100" aria-label="View Events">
                View Events
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/my-profile" className="btn btn-primary w-100" aria-label="My Profile">
                My Profile
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/itinerary-filter" className="btn btn-primary w-100" aria-label="Itinerary Filter">
                Itinerary Filter
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/filtered-activities" className="btn btn-primary w-100" aria-label="Filtered Activities">
                Filtered Activities
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/products" className="btn btn-primary w-100" aria-label="View Products">
                View Products
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/book-flight" className="btn btn-primary w-100">
                Book a Flight
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/view-bookings" className="btn btn-primary w-100">
                View Your Bookings
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/complaints" className="btn btn-danger w-100">
                File a Complaint
              </Link>
            </Col>
            
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/book-transportation" className="btn btn-primary w-100" aria-label="Book Transportation">
                Book Transportation
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/my-complaints" className="btn btn-primary w-100" aria-label="My Complaints">
                My Complaints
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TouristHomePage;
