import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaBox, FaKey, FaTrash, FaChevronRight, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import SellerNavbar from './SellerNavbar';

const SellerHomePage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Seller";

  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    padding: "8rem 0 4rem 0",
    marginBottom: "2rem"
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1
  };

  const cards = [
    {
      title: "View Profile",
      description: "Manage your seller profile and settings",
      icon: <FaUser />,
      path: "/seller/profile",
      color: "#1089ff"
    },
    {
      title: "Products Management",
      description: "View and manage your product listings",
      icon: <FaBox />,
      path: "/seller/products",
      color: "#28a745"
    },
    {
      title: "Change Password",
      description: "Update your account security",
      icon: <FaKey />,
      path: "/seller/change-password",
      color: "#ffc107"
    }
  ];

  const handleDelete = () => {
    setIsDeleting(true);
    // Simulate delete operation
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }, 2000);
  };

  return (
    <div className="seller-homepage">
      <SellerNavbar />
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: "relative", zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span>Seller Dashboard <FaChevronRight className="small" /></span>
            </p>
            <h1 className="display-4 mb-0">Welcome, {username}!</h1>
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
                    borderRadius: "15px"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
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
                          color: "white"
                        }}
                      >
                        {card.icon}
                      </div>
                      <h4 className="mb-0" style={{ color: card.color }}>{card.title}</h4>
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
                borderRadius: "15px"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
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
                      color: "white"
                    }}
                  >
                    <FaTrash />
                  </div>
                  <h4 className="mb-0 text-danger">Delete Account</h4>
                </div>
                <p className="text-muted mb-4">Permanently delete your account and all associated data.</p>
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
              Are you sure you want to delete your account? This action cannot be undone. 
              Your profile and all associated products will be permanently removed.
            </p>
          </div>
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
  );
};

export default SellerHomePage;