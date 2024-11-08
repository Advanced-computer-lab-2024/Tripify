import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState({
    identifier: '', // email or username
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate password matching
    if (userData.newPassword !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (userData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    // Get the user's role from local storage
    const role = localStorage.getItem('userRole'); // Assuming you store the role in localStorage

    try {
      // Adjust the endpoint according to the user role
      await axios.put(`http://localhost:5000/api/${role}/profile/${userData.identifier}/change-password`, {
        newPassword: userData.newPassword,
        // Include identifier if your backend requires it
      });

      // Handle success response
      setSuccess('Password has been successfully reset!');
      setTimeout(() => {
        navigate('/'); // Redirect to login page after success
      }, 2000);
    } catch (err) {
      // Display error message from server or a fallback message
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Reset Password</h2>
                <Link to="/" className="btn btn-outline-secondary btn-sm">
                  Back to Login
                </Link>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleResetPassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Email or Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="identifier"
                    value={userData.identifier}
                    onChange={handleInputChange}
                    placeholder="Enter your email or username"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
