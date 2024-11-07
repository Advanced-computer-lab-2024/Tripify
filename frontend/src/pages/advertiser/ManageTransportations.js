import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Modal,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";

const ManageTransportations = () => {
  const navigate = useNavigate();
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransportation, setSelectedTransportation] = useState(null);

  useEffect(() => {
    fetchAdvertiserTransportations();
  }, []);

  const fetchAdvertiserTransportations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/transportation/advertiser/listings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTransportations(response.data);
    } catch (err) {
      console.error("Error fetching transportations:", err);
      setError("Failed to fetch transportation listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (transportation) => {
    setSelectedTransportation(transportation);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/transportation/${selectedTransportation._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Transportation listing deleted successfully");
      setShowDeleteModal(false);
      setSelectedTransportation(null);
      fetchAdvertiserTransportations(); // Refresh the list
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete transportation listing");
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Alert variant="info">Loading your transportation listings...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Transportation Listings</h2>
        <Link to="/advertiser/create-transportation">
          <Button variant="primary">Add New Transportation</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      {transportations.length === 0 ? (
        <div className="text-center mt-5">
          <Alert variant="info">
            You haven't created any transportation listings yet.
          </Alert>
          <Link to="/advertiser/create-transportation">
            <Button variant="primary" className="mt-3">
              Create Your First Transportation Listing
            </Button>
          </Link>
        </div>
      ) : (
        <Row>
          {transportations.map((transport) => (
            <Col md={6} lg={4} key={transport._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>
                    {transport.vehicleType} - {transport.model}
                  </Card.Title>
                  <Card.Text>
                    <div className="mb-2">
                      <strong>Status:</strong>{" "}
                      <Badge
                        bg={
                          transport.status === "available"
                            ? "success"
                            : "warning"
                        }
                      >
                        {transport.status}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <strong>Capacity:</strong> {transport.capacity} passengers
                    </div>
                    <div className="mb-2">
                      <strong>Price:</strong> ${transport.price}/day
                    </div>
                    <div className="mb-2">
                      <strong>Pickup:</strong> {transport.pickupLocation}
                    </div>
                    <div className="mb-2">
                      <strong>Dropoff:</strong> {transport.dropoffLocation}
                    </div>
                  </Card.Text>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteClick(transport)}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this transportation listing?
          {selectedTransportation && (
            <div className="mt-2 p-2 bg-light rounded">
              <strong>
                {selectedTransportation.vehicleType} -{" "}
                {selectedTransportation.model}
              </strong>
              <br />
              Price: ${selectedTransportation.price}/day
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageTransportations;
