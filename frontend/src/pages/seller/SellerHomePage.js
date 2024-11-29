import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Modal, Button } from "react-bootstrap";
import axios from "axios"; // Make sure axios is imported

const SellerHomePage = () => {
  const [showTandC, setShowTandC] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const username = user?.username || "Seller";

  useEffect(() => {
    checkTandCStatus();
  }, []);

  const checkTandCStatus = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !user.TandC) {
      setShowTandC(true);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/seller/profile/${user.id}`,
        { TandC: true },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        // Update local storage with new TandC status
        const updatedUser = { ...user, TandC: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowTandC(false);
      }
    } catch (error) {
      console.error("Error accepting terms:", error);
    }
  };

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
            <Col xs={12} sm={6} md={4}>
              <Link to="/seller/change-password" className="btn btn-primary w-100">
                Change My Password
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Terms and Conditions Modal */}
      <Modal
        show={showTandC}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <h5>Please read and accept our Terms and Conditions</h5>
            <p>
              1. Seller Responsibilities:
              - Maintain accurate product information
              - Process orders in a timely manner
              - Maintain professional communication
              - Comply with all applicable laws and regulations
            </p>
            <p>
              2. Product Guidelines:
              - List only legitimate and legal products
              - Provide accurate product descriptions
              - Set fair and transparent pricing
              - Maintain adequate inventory
            </p>
            <p>
              3. Order Fulfillment:
              - Process orders within stated timeframes
              - Provide tracking information when available
              - Handle returns and refunds according to policy
            </p>
            {/* Add more terms as needed */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAcceptTerms}>
            Accept Terms
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SellerHomePage;