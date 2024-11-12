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
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login.");
        return;
      }

      const decoded = jwtDecode(token);
      setAdvertiserInfo(decoded);
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Error loading user information. Please login again.");
    }
  }, []);

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

      // Delete the advertiser account
      await axios.delete(`http://localhost:5000/api/advertiser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear local storage
      localStorage.clear();

      // Show success message and redirect
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
        {/* Existing columns */}
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

        {/* Additional columns ... */}
        
        {/* New Upload Logo Section */}
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Upload Logo</Card.Title>
              <Card.Text>
                Update your logo to improve brand visibility.
              </Card.Text>
              <Link to="/seller/upload-logo">
                <Button variant="secondary">Upload Logo</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Rest of the existing code for delete account and other functionalities */}
      </Row>

      {/* Delete Account Confirmation Modal */}
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
