import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TourguideHomePage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTandCModal, setShowTandCModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check T&C status on component mount
  useEffect(() => {
    const checkTandCStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/tourguide/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data.tourGuide.TandC) {
          setShowTandCModal(true);
        }
      } catch (error) {
        console.error("Error checking T&C status:", error);
      }
    };

    checkTandCStatus();
  }, [navigate]);

  // Handle T&C acceptance
  const handleAcceptTandC = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const username = decodedToken.username; // Use username instead of ID

      await axios.put(
        `http://localhost:5000/api/tourguide/profile/${username}`,
        {
          TandC: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowTandCModal(false);
    } catch (error) {
      console.error("Error accepting T&C:", error);
      setError("Failed to accept terms and conditions. Please try again.");
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
      const decodedToken = jwtDecode(token);
      const userId = decodedToken._id;
      if (!userId) {
        throw new Error("User ID not found");
      }
      await axios.delete(
        `http://localhost:5000/api/tourguide/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  return (
    <div className="container text-center mt-5">
      <h1>Welcome to the Tour Guide Home page</h1>
      <div className="mt-4">
        <Link
          to="/tourguide/itinerary-management"
          className="btn btn-primary m-2"
        >
          Itineraries Management
        </Link>
        <Link to="/tourguide/MyItineraries" className="btn btn-primary m-2">
          My Created Itineraries
        </Link>
        <Link to="/tourguide/change-password" className="btn btn-primary m-2">
          Change My Password
        </Link>
        <Link to="/tourguide/sales-report" className="btn btn-primary m-2">
          View Sales Report
        </Link>
        <Button
          variant="danger"
          className="m-2"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete My Account
        </Button>
      </div>

      {/* Terms and Conditions Modal */}
      <Modal show={showTandCModal} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-start mb-4">
            <h5>Please read and accept our Terms and Conditions</h5>
            <div
              className="terms-content"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {/* Add your terms and conditions content here */}
              <p>1. Introduction</p>
              <p>
                By using our services, you agree to these terms and
                conditions...
              </p>
              <p>2. User Responsibilities</p>
              <p>As a tour guide, you are responsible for...</p>
              <p>3. Service Standards</p>
              <p>You agree to maintain professional standards...</p>
              {/* Add more terms as needed */}
            </div>
          </div>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAcceptTandC}>
            I Accept the Terms and Conditions
          </Button>
        </Modal.Footer>
      </Modal>

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
              be undone. Your profile and all associated itineraries will no
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
    </div>
  );
};

export default TourguideHomePage;
