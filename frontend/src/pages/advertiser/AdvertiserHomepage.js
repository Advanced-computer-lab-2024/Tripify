import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdvertiserHomepage = () => {
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login.');
        return;
      }

      const decoded = jwtDecode(token);
      setAdvertiserInfo(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Error loading user information. Please login again.');
    }
  }, []);

  if (error) {
    return (
      <Container fluid className="p-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-5">
      <Row className="mb-4">
        <Col>
          <h1>Welcome, {advertiserInfo?.username || 'Advertiser'}!</h1>
          {advertiserInfo?.companyName && (
            <h4 className="text-muted">{advertiserInfo.companyName}</h4>
          )}
          <p>Manage your activities, create new ones, and view your profile.</p>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Create New Activity</Card.Title>
              <Card.Text>
                Advertise new activities and promotions to reach tourists.
              </Card.Text>
              <Link to="/advertiser/create-activity">
                <Button variant="primary">Create Activity</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>View Your Activities</Card.Title>
              <Card.Text>
                Check your current activities and promotions that are live.
              </Card.Text>
              <Link to="/advertiser/view-activities">
                <Button variant="success">View Activities</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Manage Your Profile</Card.Title>
              <Card.Text>
                Update your company information and contact details.
              </Card.Text>
              <Link to="/advertiser/profile">
                <Button variant="warning">Manage Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>View Your Created Activities</Card.Title>
              <Card.Text>
                See your history of created activities and promotions.
              </Card.Text>
              <Link to="/advertiser/activities">
                <Button variant="warning">View</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
     
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Help & Support</Card.Title>
              <Card.Text>
                Need assistance? Check out our support resources or contact us.
              </Card.Text>
              <Button variant="info">Get Support</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdvertiserHomepage;