import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaRoute,
  FaMapMarkedAlt,
  FaKey,
  FaTrash,
  FaChevronRight,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TourguideNavbar from "./TourguideNavbar";

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
      const username = decodedToken.username;

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

  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    padding: "8rem 0 4rem 0",
    marginBottom: "2rem",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  };

  const cards = [
    {
      title: "Itineraries Management",
      description: "Manage and organize tourist itineraries",
      icon: <FaRoute />,
      path: "/tourguide/itinerary-management",
      color: "#1089ff",
    },
    {
      title: "My Created Itineraries",
      description: "View and edit your created itineraries",
      icon: <FaMapMarkedAlt />,
      path: "/tourguide/MyItineraries",
      color: "#28a745",
    },
    {
      title: "Change Password",
      description: "Update your account security",
      icon: <FaKey />,
      path: "/tourguide/change-password",
      color: "#ffc107",
    },
  ];

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
    <>
      <TourguideNavbar />
      <div className="tourguide-homepage">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: "relative", zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span>
                  Tour Guide Dashboard <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Welcome to Your Dashboard</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Row className="g-4">
            {cards.map((card, index) => (
              <Col md={4} key={index}>
                <Link to={card.path} className="text-decoration-none">
                  <Card
                    className="h-100 shadow-sm border-0 hover-card"
                    style={{
                      transition: "transform 0.2s",
                      cursor: "pointer",
                      borderRadius: "15px",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="icon-circle me-3"
                          style={{
                            backgroundColor: card.color,
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          {card.icon}
                        </div>
                        <h4 className="mb-0" style={{ color: card.color }}>
                          {card.title}
                        </h4>
                      </div>
                      <p className="text-muted mb-0">{card.description}</p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}

            {/* Delete Account Card */}
            <Col md={4}>
              <Card
                className="h-100 shadow-sm border-0 hover-card"
                style={{
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  borderRadius: "15px",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="icon-circle me-3"
                      style={{
                        backgroundColor: "#dc3545",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
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
                    className="w-100 rounded-pill"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Terms and Conditions Modal */}
        <Modal
          show={showTandCModal}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header className="border-0 bg-primary text-white">
            <Modal.Title>Terms and Conditions</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="text-start mb-4">
              <h5>Please read and accept our Terms and Conditions</h5>
              <div
                className="terms-content"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <p>1. Introduction</p>
                <p>
                  By using our services, you agree to these terms and
                  conditions...
                </p>
                <p>2. User Responsibilities</p>
                <p>As a tour guide, you are responsible for...</p>
                <p>3. Service Standards</p>
                <p>You agree to maintain professional standards...</p>
              </div>
            </div>
            {error && (
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="primary"
              onClick={handleAcceptTandC}
              className="rounded-pill w-100"
            >
              I Accept the Terms and Conditions
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton className="border-0 bg-danger text-white">
            <Modal.Title>
              <FaExclamationTriangle className="me-2" />
              Delete Account
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="text-center mb-4">
              <h4>⚠️ Warning</h4>
              <p className="mb-0">
                Are you sure you want to delete your account? This action cannot
                be undone. Your profile and all associated itineraries will no
                longer be visible to tourists.
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
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
      </div>
    </>
  );
};

export default TourguideHomePage;
