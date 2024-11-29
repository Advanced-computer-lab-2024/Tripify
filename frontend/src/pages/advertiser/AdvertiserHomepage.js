import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Modal,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AdvertiserHomepage = () => {
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login.");
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        
        // Fetch current user data
        const response = await axios.get(
          `http://localhost:5000/api/advertiser/profile/${decoded.username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAdvertiserInfo(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user information:", error);
        setError("Error loading user information. Please login again.");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAcceptTandC = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await axios.put(
        `http://localhost:5000/api/advertiser/profile/${advertiserInfo.username}`,
        { TandC: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAdvertiserInfo(prev => ({ ...prev, TandC: true }));
    } catch (error) {
      console.error("Error accepting T&C:", error);
      setError("Failed to accept Terms and Conditions. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const decoded = jwtDecode(token);
      const userId = decoded._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      await axios.delete(`http://localhost:5000/api/advertiser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.clear();
      alert("Your account has been successfully deleted");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete account. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
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

  // Show only T&C modal if terms haven't been accepted
  console.log("advertiserInfo:", advertiserInfo); // Add this log
  console.log("T&C status:", advertiserInfo?.TandC);
  if (advertiserInfo && !advertiserInfo.TandC) {
    return (
      <Container fluid className="p-5">
        <Modal show={true} backdrop="static" keyboard={false} centered size="lg">
          <Modal.Header>
            <Modal.Title>Terms and Conditions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="terms-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <h5>Please read and accept our Terms and Conditions</h5>
              <p>1. Account Responsibilities</p>
              <ul>
                <li>You are responsible for maintaining accurate and up-to-date information</li>
                <li>All activities must comply with local laws and regulations</li>
                <li>You must maintain appropriate licenses and permits</li>
              </ul>
              
              <p>2. Content Guidelines</p>
              <ul>
                <li>All posted content must be accurate and truthful</li>
                <li>No misleading or fraudulent activities</li>
                <li>Content must not infringe on any third-party rights</li>
              </ul>
              
              <p>3. Service Standards</p>
              <ul>
                <li>Maintain professional communication with customers</li>
                <li>Respond to inquiries in a timely manner</li>
                <li>Honor all confirmed bookings and arrangements</li>
              </ul>

              <p>4. User Data and Privacy</p>
              <ul>
                <li>Protect user information and maintain confidentiality</li>
                <li>Only use customer data for intended business purposes</li>
                <li>Comply with applicable data protection regulations</li>
              </ul>

              <p>5. Platform Usage</p>
              <ul>
                <li>Do not engage in activities that could harm the platform</li>
                <li>Maintain accurate availability and pricing information</li>
                <li>Respond to customer inquiries within 24 hours</li>
              </ul>

              <p>6. Cancellation and Refunds</p>
              <ul>
                <li>Clear cancellation policies must be stated for all services</li>
                <li>Process refunds according to stated policies</li>
                <li>Maintain fair and transparent pricing</li>
              </ul>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleAcceptTandC}>
              I Accept the Terms and Conditions
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }

  // Show dashboard content only after T&C acceptance
  return (
    <Container fluid className="p-5">
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
              <Card.Title>Transportation Services</Card.Title>
              <Card.Text>
                Manage your transportation listings and bookings.
              </Card.Text>
              <Link to="/advertiser/transportation">
                <Button variant="info">Manage Transportation</Button>
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
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Change Your Password</Card.Title>
              <Link to="/advertiser/change-password">
                <Button variant="warning">Change Your Password</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="text-danger">Delete Account</Card.Title>
              <Card.Text>
                Permanently delete your account and all associated data.
              </Card.Text>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h4>⚠️ Warning</h4>
            <p>
              Are you sure you want to delete your account? This action cannot
              be undone. Your profile and all associated activities will no
              longer be visible to tourists.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdvertiserHomepage;