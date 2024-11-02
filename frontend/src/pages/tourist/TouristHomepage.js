import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";

const TouristHomePage = () => {
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3">Welcome to the Tourist Homepage</h1>
            <p className="text-muted">
              {JSON.parse(localStorage.getItem("user"))?.username || "Tourist"}
            </p>
          </div>

          <Row className="g-4 justify-content-center">
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/view-events" className="btn btn-primary w-100">
                View Events
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/my-profile" className="btn btn-primary w-100">
                My Profile
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link
                to="/tourist/itinerary-filter"
                className="btn btn-primary w-100"
              >
                Itinerary Filter
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link
                to="/tourist/filtered-activities"
                className="btn btn-primary w-100"
              >
                Filtered Activities
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/tourist/products" className="btn btn-primary w-100">
                View Products
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TouristHomePage;
