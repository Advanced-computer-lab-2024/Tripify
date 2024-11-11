import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdvertiserHomepage = () => {
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login.");
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);
        setAdvertiserInfo(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError("Error loading user information. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [navigate]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-5">
      {/* Welcome Section */}
      <Card className="mb-4 bg-light">
        <Card.Body>
          <h2 className="mb-3">Welcome, {advertiserInfo?.username}</h2>
          <p className="text-muted mb-0">
            Manage your activities, transportation services, and business profile all in one place.
          </p>
        </Card.Body>
      </Card>

      {/* Main Actions */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Activities Management</Card.Title>
              <Card.Text className="flex-grow-1">
                Create and manage your activities and promotions.
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/advertiser/create-activity" className="btn btn-primary">
                  Create New Activity
                </Link>
                <Link to="/advertiser/view-activities" className="btn btn-outline-primary">
                  View Current Activities
                </Link>
                <Link to="/advertiser/activities" className="btn btn-outline-primary">
                  Activity History
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Transportation Services</Card.Title>
              <Card.Text className="flex-grow-1">
                Manage your transportation listings and track bookings.
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/advertiser/transportation" className="btn btn-success">
                  Manage Transportation
                </Link>
                <Link to="/advertiser/transportation/bookings" className="btn btn-outline-success">
                  View Bookings
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* New Account Management Section with Danger Zone */}
        <Col md={4}>
          <Card className="h-100 border-danger">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Account Management</Card.Title>
              <Card.Text className="flex-grow-1">
                Update your profile and manage account settings.
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/advertiser/profile" className="btn btn-warning">
                  Manage Profile
                </Link>
                <Link to="/advertiser/settings" className="btn btn-outline-warning">
                  Account Settings
                </Link>
                <hr className="my-2" />
                <div className="text-danger">
                  <small>Danger Zone</small>
                </div>
                <Link 
                  to="/advertiser/profile/delete-account" 
                  className="btn btn-outline-danger"
                >
                  Delete Account
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="text-center bg-light">
            <Card.Body>
              <h3 className="h5 mb-0">Active Activities</h3>
              <p className="display-6 mb-0">0</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center bg-light">
            <Card.Body>
              <h3 className="h5 mb-0">Transportation Listings</h3>
              <p className="display-6 mb-0">0</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center bg-light">
            <Card.Body>
              <h3 className="h5 mb-0">Current Bookings</h3>
              <p className="display-6 mb-0">0</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Support Section */}
      <Card className="mt-4 text-center bg-light">
        <Card.Body>
          <Card.Title>Need Help?</Card.Title>
          <Card.Text>
            Our support team is here to assist you with any questions or concerns.
          </Card.Text>
          <Button variant="info" onClick={() => navigate('/support')}>
            Contact Support
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdvertiserHomepage;
