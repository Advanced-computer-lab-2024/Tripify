import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TourguideHomePage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Decode token to get user ID
      const decodedToken = jwtDecode(token);
      const userId = decodedToken._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Delete the tour guide account using ID instead of username
      await axios.delete(
        `http://localhost:5000/api/tourguide/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

        <Button
          variant="danger"
          className="m-2"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete My Account
        </Button>
      </div>

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
