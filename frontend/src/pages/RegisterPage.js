import React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";

const RegisterPage = () => {
  return (
    <Container className="text-center mt-5">
      <h1>Register As</h1>
      <Row className="mt-4">
        <Col>
          <Link to="/register/admin">
            <Button variant="primary" size="lg">
              Admin
            </Button>
          </Link>
        </Col>
        <Col>
          <Link to="/register/tourist">
            <Button variant="primary" size="lg">
              Tourist
            </Button>
          </Link>
        </Col>
        <Col>
          <Link to="/register/tourguide">
            <Button variant="primary" size="lg">
              Tour Guide
            </Button>
          </Link>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Link to="/register/advertiser">
            <Button variant="primary" size="lg">
              Advertiser
            </Button>
          </Link>
        </Col>
        <Col>
          <Link to="/register/tourism-governor">
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
