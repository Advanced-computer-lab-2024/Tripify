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
  FaBuilding,
  FaGavel,
  FaFolder,
  FaChartBar,
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdvertiserNavbar from "./AdvertiserNavbar";

const AdvertiserHomepage = () => {
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      title: "Create New Activity",
      description: "Advertise new activities and promotions to reach tourists.",
      icon: <FaPlus />,
      path: "/advertiser/create-activity",
      color: "#1089ff",
      buttonText: "Create Activity",
    },
    {
      title: "View Your Activities",
      description:
        "Check your current activities and promotions that are live.",
      icon: <FaEye />,
      path: "/advertiser/view-activities",
      color: "#28a745",
      buttonText: "View Activities",
    },
    {
      title: "Transportation Services",
      description: "Manage your transportation listings and bookings.",
      icon: <FaCar />,
      path: "/advertiser/transportation",
      color: "#17a2b8",
      buttonText: "Manage Transportation",
    },
    {
      title: "reports",
      description: "View your sales report ",
      icon: <FaFolder />,
      path: "/advertiser/sales-report",
      color: "#5efcdb",
      buttonText: "View Reports",
    },
    {
      title: "Number of atendees",
      description: "See number of atendees tourists.",
      icon: <FaChartBar />,
      path: "/advertiser/report",
      color: "#c69fa1",
      buttonText: "View Numbers",
    },
    {
      title: "Manage Your Profile",
      description: "Update your company information and contact details.",
      icon: <FaUser />,
      path: "/advertiser/profile",
      color: "#ffc107",
      buttonText: "Manage Profile",
    },
    {
      title: "Activity History",
      description: "See your history of created activities and promotions.",
      icon: <FaHistory />,
      path: "/advertiser/activities",
      color: "#6f42c1",
      buttonText: "View History",
    },
    {
      title: "Change Password",
      description: "Update your account password for better security.",
      icon: <FaKey />,
      path: "/advertiser/change-password",
      color: "#fd7e14",
      buttonText: "Change Password",
    },
  ];

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

      setAdvertiserInfo((prev) => ({ ...prev, TandC: true }));
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
      setShowDeleteModal(false);
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
      <Container className="py-5">
        <Alert variant="danger" className="rounded-3 shadow-sm">
          {error}
        </Alert>
      </Container>
    );
  }

  if (advertiserInfo && !advertiserInfo.TandC) {
    return (
      <Container fluid className="p-5">
        <Modal
          show={true}
          backdrop="static"
          keyboard={false}
          centered
          size="lg"
        >
          <Modal.Header className="bg-primary text-white border-0">
            <Modal.Title className="d-flex align-items-center">
              <FaGavel className="me-2" />
              Terms and Conditions
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div
              className="terms-content"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <h5 className="mb-4">
                Please read and accept our Terms and Conditions
              </h5>

              <div className="mb-4">
                <h6 className="text-primary">1. Account Responsibilities</h6>
                <ul className="text-muted">
                  <li>
                    You are responsible for maintaining accurate and up-to-date
                    information
                  </li>
                  <li>
                    All activities must comply with local laws and regulations
                  </li>
                  <li>You must maintain appropriate licenses and permits</li>
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-primary">2. Content Guidelines</h6>
                <ul className="text-muted">
                  <li>All posted content must be accurate and truthful</li>
                  <li>No misleading or fraudulent activities</li>
                  <li>Content must not infringe on any third-party rights</li>
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-primary">3. Service Standards</h6>
                <ul className="text-muted">
                  <li>Maintain professional communication with customers</li>
                  <li>Respond to inquiries in a timely manner</li>
                  <li>Honor all confirmed bookings and arrangements</li>
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-primary">4. User Data and Privacy</h6>
                <ul className="text-muted">
                  <li>Protect user information and maintain confidentiality</li>
                  <li>Only use customer data for intended business purposes</li>
                  <li>Comply with applicable data protection regulations</li>
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-primary">5. Platform Usage</h6>
                <ul className="text-muted">
                  <li>
                    Do not engage in activities that could harm the platform
                  </li>
                  <li>
                    Maintain accurate availability and pricing information
                  </li>
                  <li>Respond to customer inquiries within 24 hours</li>
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-primary">6. Cancellation and Refunds</h6>
                <ul className="text-muted">
                  <li>
                    Clear cancellation policies must be stated for all services
                  </li>
                  <li>Process refunds according to stated policies</li>
                  <li>Maintain fair and transparent pricing</li>
                </ul>
              </div>
            </div>
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
          <Container style={{ position: "relative", zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link
                    to="/advertiser"
                    className="text-white text-decoration-none"
                  >
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
                    backgroundColor: "#1089ff",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
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
                    transition: "transform 0.2s",
                    cursor: "pointer",
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
                    <p className="text-muted mb-4">{card.description}</p>
                    <Link to={card.path}>
                      <Button
                        variant="primary"
                        className="rounded-pill w-100"
                        style={{
                          backgroundColor: card.color,
                          border: "none",
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
                  transition: "transform 0.2s",
                  cursor: "pointer",
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
                    className="rounded-pill w-100"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Delete Modal */}
          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
          >
            <Modal.Header closeButton className="bg-danger text-white">
              <Modal.Title className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                Delete Account
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <div className="text-center mb-4">
                <h4>⚠️ Warning</h4>
                <p className="mb-0">
                  Are you sure you want to delete your account? This action
                  cannot be undone. Your profile and all associated activities
                  will no longer be visible to tourists.
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="rounded-3 mb-0">
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
        </Container>
      </div>
    </>
  );
};

export default AdvertiserHomepage;
