import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Modal,
  Spinner
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaCar,
  FaUser,
  FaHistory,
  FaKey,
  FaTrash,
  FaChevronRight,
  FaExclamationTriangle,
  FaTimes,
  FaBuilding
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdvertiserNavbar from './AdvertiserNavbar';

const AdvertiserHomepage = () => {
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

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

  const cards = [
    {
      title: "Create New Activity",
      description: "Advertise new activities and promotions to reach tourists.",
      icon: <FaPlus />,
      path: "/advertiser/create-activity",
      color: "#1089ff",
      buttonText: "Create Activity"
    },
    {
      title: "View Your Activities",
      description: "Check your current activities and promotions that are live.",
      icon: <FaEye />,
      path: "/advertiser/view-activities",
      color: "#28a745",
      buttonText: "View Activities"
    },
    {
      title: "Transportation Services",
      description: "Manage your transportation listings and bookings.",
      icon: <FaCar />,
      path: "/advertiser/transportation",
      color: "#17a2b8",
      buttonText: "Manage Transportation"
    },
    {
      title: "Manage Your Profile",
      description: "Update your company information and contact details.",
      icon: <FaUser />,
      path: "/advertiser/profile",
      color: "#ffc107",
      buttonText: "Manage Profile"
    },
    {
      title: "Activity History",
      description: "See your history of created activities and promotions.",
      icon: <FaHistory />,
      path: "/advertiser/activities",
      color: "#6f42c1",
      buttonText: "View History"
    },
    {
      title: "Change Password",
      description: "Update your account password for better security.",
      icon: <FaKey />,
      path: "/advertiser/change-password",
      color: "#fd7e14",
      buttonText: "Change Password"
    }
  ];

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
      setShowDeleteModal(false);
    }
  };

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="rounded-3 shadow-sm">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <AdvertiserNavbar />
    <div className="advertiser-homepage">
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
                Advertiser Dashboard <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Welcome to Your Dashboard</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Header Section */}
        <Card className="shadow-sm border-0 rounded-3 mb-4">
          <Card.Body className="p-4">
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
                <FaBuilding size={24} />
              </div>
              <div>
                <h3 className="mb-0">Advertiser Dashboard</h3>
                {advertiserInfo && (
                  <p className="text-muted mb-0">
                    Welcome back, {advertiserInfo.username}
                  </p>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Dashboard Cards */}
        <Row className="g-4">
          {cards.map((card, index) => (
            <Col md={4} key={index}>
              <Card 
                className="shadow-sm border-0 rounded-3 h-100 hover-card"
                style={{ 
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="icon-circle me-3"
                      style={{
                        backgroundColor: card.color,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {card.icon}
                    </div>
                    <h4 className="mb-0" style={{ color: card.color }}>
                      {card.title}
                    </h4>
                  </div>
                  <p className="text-muted mb-4">{card.description}</p>
                  <Link to={card.path}>
                    <Button 
                      variant="primary" 
                      className="rounded-pill w-100"
                      style={{
                        backgroundColor: card.color,
                        border: 'none'
                      }}
                    >
                      {card.buttonText}
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {/* Delete Account Card */}
          <Col md={4}>
            <Card 
              className="shadow-sm border-0 rounded-3 h-100 hover-card"
              style={{ 
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div 
                    className="icon-circle me-3"
                    style={{
                      backgroundColor: '#dc3545',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <FaTrash />
                  </div>
                  <h4 className="mb-0 text-danger">Delete Account</h4>
                </div>
                <p className="text-muted mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <Button 
                  variant="danger" 
                  className="rounded-pill w-100"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Delete Account Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header 
            closeButton 
            className="bg-danger text-white"
          >
            <Modal.Title className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2" />
              Delete Account
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="text-center mb-4">
              <h4>⚠️ Warning</h4>
              <p className="mb-0">
                Are you sure you want to delete your account? This action cannot be undone.
                Your profile and all associated activities will no longer be visible to tourists.
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="rounded-3 mb-0">
                {error}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="light"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-pill"
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-pill"
            >
              {isDeleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Delete Account
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
    </>
  );
};

export default AdvertiserHomepage;