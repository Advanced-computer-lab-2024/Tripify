import React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";

const RegisterPage = () => {
  return (
    <Container className="text-center mt-5">
      <h1>Register As</h1>
      <Row className="mt-4 justify-content-center">
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Link to="/register/admin" className="d-grid">
            <Button variant="primary" size="lg">
              Admin
            </Button>
          </Link>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Link to="/register/tourist" className="d-grid">
            <Button variant="primary" size="lg">
              Tourist
            </Button>
          </Link>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Link to="/register/tourguide" className="d-grid">
            <Button variant="primary" size="lg">
              Tour Guide
            </Button>
          </Link>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Link to="/register/advertiser" className="d-grid">
            <Button variant="primary" size="lg">
              Advertiser
            </Button>
          </Link>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Link to="/register/tourism-governor" className="d-grid">
            <Button variant="primary" size="lg">
              Tourism Governor
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;