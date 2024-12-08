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
  Spinner
} from "react-bootstrap";
import { 
  FaCar, 
  FaPlus, 
  FaTrash, 
  FaChevronRight,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import AdvertiserNavbar from './AdvertiserNavbar';

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
  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    padding: '8rem 0 4rem 0',
    marginBottom: '2rem'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

  return (
    <>
      <AdvertiserNavbar />
      <div className="manage-transportations">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/advertiser" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  Transportation <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Manage Transportation Listings</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-4">
              {/* Header Section */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <div 
                    className="icon-circle me-3"
                    style={{
                      backgroundColor: '#1089ff',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <FaCar size={24} />
                  </div>
                  <h3 className="mb-0">My Transportation Listings</h3>
                </div>
                <Link to="/advertiser/create-transportation">
                  <Button 
                    className="rounded-pill px-4"
                    style={{
                      backgroundColor: '#1089ff',
                      border: 'none'
                    }}
                  >
                    <FaPlus className="me-2" />
                    Add New Transportation
                  </Button>
                </Link>
              </div>

              {error && (
                <Alert 
                  variant="danger" 
                  onClose={() => setError("")} 
                  dismissible
                  className="rounded-3"
                >
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert 
                  variant="success" 
                  onClose={() => setSuccess("")} 
                  dismissible
                  className="rounded-3"
                >
                  <FaCheck className="me-2" />
                  {success}
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading your transportation listings...</p>
                </div>
              ) : transportations.length === 0 ? (
                <div className="text-center py-5">
                  <FaCar size={48} className="text-muted mb-3" />
                  <h4>No Transportation Listings Yet</h4>
                  <p className="text-muted mb-4">You haven't created any transportation listings.</p>
                  <Link to="/advertiser/create-transportation">
                    <Button 
                      className="rounded-pill px-4"
                      style={{
                        backgroundColor: '#1089ff',
                        border: 'none'
                      }}
                    >
                      <FaPlus className="me-2" />
                      Create Your First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <Row className="g-4">
                  {transportations.map((transport) => (
                    <Col md={6} lg={4} key={transport._id}>
                      <Card 
                        className="h-100 shadow-hover" 
                        style={{
                          borderRadius: '15px',
                          border: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              className="icon-circle me-3"
                              style={{
                                backgroundColor: '#1089ff',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                            >
                              <FaCar size={20} />
                            </div>
                            <h4 className="mb-0">
                              {transport.vehicleType} - {transport.model}
                            </h4>
                          </div>

                          <Badge 
                            bg={transport.status === "available" ? "success" : "warning"}
                            className="mb-3 rounded-pill px-3 py-2"
                          >
                            {transport.status === "available" ? (
                              <><FaCheck className="me-1" /> Available</>
                            ) : (
                              <><FaTimes className="me-1" /> Unavailable</>
                            )}
                          </Badge>

                          <div className="d-flex flex-column gap-2 mb-4">
                            <div className="d-flex align-items-center">
                              <FaUsers className="text-primary me-2" />
                              <span>{transport.capacity} passengers</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaDollarSign className="text-success me-2" />
                              <span>${transport.price}/day</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="text-danger me-2" />
                              <span>Pickup: {transport.pickupLocation}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="text-danger me-2" />
                              <span>Dropoff: {transport.dropoffLocation}</span>
                            </div>
                          </div>

                          <Button
                            variant="danger"
                            className="w-100 rounded-pill"
                            onClick={() => handleDeleteClick(transport)}
                          >
                            <FaTrash className="me-2" />
                            Delete Listing
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Container>

        {/* Delete Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header 
            closeButton 
            className="border-0 bg-danger text-white"
          >
            <Modal.Title>
              <FaExclamationTriangle className="me-2" />
              Confirm Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p>Are you sure you want to delete this transportation listing?</p>
            {selectedTransportation && (
              <Card className="bg-light border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <FaCar className="text-primary me-2" />
                    <strong>
                      {selectedTransportation.vehicleType} - {selectedTransportation.model}
                    </strong>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaDollarSign className="text-success me-2" />
                    <span>${selectedTransportation.price}/day</span>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="light" 
              className="rounded-pill"
              onClick={() => setShowDeleteModal(false)}
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="rounded-pill"
              onClick={handleDeleteConfirm}
            >
              <FaTrash className="me-2" />
              Delete Listing
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default ManageTransportations;