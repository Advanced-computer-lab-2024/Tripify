<<<<<<< HEAD
import React from "react";
import { Link } from "react-router-dom";

const SellerHomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Seller Homepage</h1>
      <div className="mt-4">
        <Link to="/seller/profile" className="btn btn-primary m-2">
          view profile
        </Link>
        <Link to="/seller/products" className="btn btn-primary m-2">
          view products
        </Link>
      </div>
    </div>
  );
};
export default SellerHomePage;
=======
import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";

const SellerHomePage = () => {
  const username =
    JSON.parse(localStorage.getItem("user"))?.username || "Seller";

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3">Welcome to the Seller Homepage</h1>
            <p className="text-muted">Welcome, {username}!</p>
          </div>

          <Row className="g-4 justify-content-center">
            <Col xs={12} sm={6} md={4}>
              <Link to="/seller/profile" className="btn btn-primary w-100">
                View Profile
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/seller/products" className="btn btn-primary w-100">
                View Products
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SellerHomePage;
>>>>>>> jwtdemo
