import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaTrash, FaSignOutAlt, FaEnvelope, FaInfoCircle, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

import SellerNavbar from '../pages/seller/SellerNavbar';

const UserDisplay = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/seller/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile data:", response.data);
      setProfile(response.data.seller);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/seller/profile/${profile.id}`,
        {
          username: profile.username,
          email: profile.email,
          name: profile.name,
          description: profile.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.seller);
      setIsEditing(false);
      setError("");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/seller/profile/${profile.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      alert("Account deleted successfully");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.response?.data?.message || "Failed to delete account");
      setShowDeleteModal(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="seller-profile-page">
        <SellerNavbar />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
        </Container>
      </div>
    );
  }

  return (
    <div className="seller-profile-page">
      <SellerNavbar />
      
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: "relative", zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span>Account Management <FaChevronRight className="small" /></span>
            </p>
            <h1 className="display-4 mb-0">My Profile</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Card className="shadow-sm" style={{ borderRadius: "15px" }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <div className="icon-circle bg-primary me-3 d-flex align-items-center justify-content-center"
                     style={{ width: "50px", height: "50px", borderRadius: "50%" }}>
                  <FaUser className="text-white" size={24} />
                </div>
                <h3 className="mb-0">Profile Details</h3>
              </div>
              <div>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout} 
                  className="me-2 rounded-pill"
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-pill"
                >
                  <FaTrash className="me-2" />
                  Delete Account
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4 rounded-3">
                <FaInfoCircle className="me-2" />
                {error}
              </Alert>
            )}

            {!isEditing ? (
              // View Mode
              <div className="profile-details">
                <Row className="g-4">
                  {[
                    { icon: FaUser, label: "Username", value: profile?.username },
                    { icon: FaEnvelope, label: "Email", value: profile?.email },
                    { icon: FaUser, label: "Name", value: profile?.name },
                    { icon: FaInfoCircle, label: "Description", value: profile?.description }
                  ].map((field, index) => (
                    <Col md={6} key={index}>
                      <Card className="h-100 border-0 bg-light" style={{ borderRadius: "15px" }}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <field.icon className="text-primary me-2" />
                            <h5 className="mb-0">{field.label}</h5>
                          </div>
                          <p className="mb-0">{field.value}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="rounded-pill px-4 py-2"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <Form onSubmit={handleUpdateProfile}>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-muted me-2" />
                        <Form.Label className="mb-0">Username</Form.Label>
                      </div>
                      <Form.Control
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleInputChange}
                        disabled
                        className="rounded-pill"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <div className="d-flex align-items-center mb-2">
                        <FaEnvelope className="text-muted me-2" />
                        <Form.Label className="mb-0">Email</Form.Label>
                      </div>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                        required
                        className="rounded-pill"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-muted me-2" />
                        <Form.Label className="mb-0">Name</Form.Label>
                      </div>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        required
                        className="rounded-pill"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <div className="d-flex align-items-center mb-2">
                        <FaInfoCircle className="text-muted me-2" />
                        <Form.Label className="mb-0">Description</Form.Label>
                      </div>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={profile.description}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: "15px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center gap-3 mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    className="rounded-pill px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaEdit className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setIsEditing(false)}
                    className="rounded-pill px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Delete Account Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 bg-danger text-white">
          <Modal.Title>
            <FaTrash className="me-2" />
            Delete Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <div className="mb-4">
              <span className="icon-circle bg-danger d-inline-flex align-items-center justify-content-center"
                    style={{ width: "64px", height: "64px", borderRadius: "50%" }}>
                <FaTrash className="text-white" size={24} />
              </span>
            </div>
            <h4 className="mb-3">⚠️ Warning</h4>
            <p className="mb-0">
              Are you sure you want to delete your account? This action cannot be undone.
              All your products and data will be permanently removed from the system.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            className="rounded-pill"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            className="rounded-pill"
          >
            <FaTrash className="me-2" />
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDisplay;