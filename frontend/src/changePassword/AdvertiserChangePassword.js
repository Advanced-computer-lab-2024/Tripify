
import React, { useState } from "react";
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner 
} from "react-bootstrap";
import { 
  FaKey, 
  FaLock, 
  FaUnlock,
  FaCheckCircle,
  FaChevronRight,
  FaExclamationTriangle
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdvertiserNavbar from '../pages/advertiser/AdvertiserNavbar';

const AdvertiserChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      const response = await axios.put(
        "http://localhost:5000/api/advertiser/change-password",
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
    <>
      <AdvertiserNavbar />
      <div className="change-password">
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
                  Change Password <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Change Password</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-4">
              {/* Header Section */}
              <div className="d-flex align-items-center mb-4">
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
                  <FaKey size={24} />
                </div>
                <h3 className="mb-0">Update Your Password</h3>
              </div>

              {message && (
                <Alert 
                  variant={message.type} 
                  className="d-flex align-items-center mb-4"
                >
                  {message.type === "success" ? (
                    <FaCheckCircle className="me-2" size={18} />
                  ) : (
                    <FaExclamationTriangle className="me-2" size={18} />
                  )}
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FaLock className="me-2" />
                    Current Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FaUnlock className="me-2" />
                    New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FaUnlock className="me-2" />
                    Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="rounded-pill w-100"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none',
                    padding: '0.75rem'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <FaKey className="me-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default AdvertiserChangePassword;
