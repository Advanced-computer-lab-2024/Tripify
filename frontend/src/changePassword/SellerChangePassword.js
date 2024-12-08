import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaKey, FaLock, FaUnlock, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import SellerNavbar from '../pages/seller/SellerNavbar';

const SellerChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "danger",
        text: "New passwords don't match",
      });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "danger",
          text: "No authentication token found. Please login again.",
        });
        setIsLoading(false);
        navigate("/login");
        return;
      }

      await axios.put(
        "http://localhost:5000/api/seller/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.clear();
      setMessage({
        type: "success",
        text: "Password updated successfully! Please log in with your new password.",
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Error changing password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <SellerNavbar />
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: "relative", zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span>Security Settings <FaChevronRight className="small" /></span>
            </p>
            <h1 className="display-4 mb-0">Change Password</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Card className="shadow-sm" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="mb-4">
                    <span className="icon-circle bg-primary d-inline-flex align-items-center justify-content-center" 
                          style={{ width: "64px", height: "64px", borderRadius: "50%" }}>
                      <FaKey className="text-white" size={24} />
                    </span>
                  </div>
                  <h4 className="mb-0">Update Your Password</h4>
                  <p className="text-muted">Please enter your current and new password</p>
                </div>

                {message && (
                  <Alert variant={message.type} className="mb-4">
                    {message.text}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaUnlock className="text-muted me-2" />
                      <Form.Label className="mb-0">Current Password</Form.Label>
                    </div>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className="rounded-pill"
                      style={{ padding: "0.75rem 1.25rem" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaLock className="text-muted me-2" />
                      <Form.Label className="mb-0">New Password</Form.Label>
                    </div>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="rounded-pill"
                      style={{ padding: "0.75rem 1.25rem" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaLock className="text-muted me-2" />
                      <Form.Label className="mb-0">Confirm New Password</Form.Label>
                    </div>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="rounded-pill"
                      style={{ padding: "0.75rem 1.25rem" }}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 rounded-pill py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <FaKey className="me-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SellerChangePassword;