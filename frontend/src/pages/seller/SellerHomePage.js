import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import AccountDeletionRequest from '../../components/AccountDeletionRequest';

const SellerProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const getUserFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid authentication token');
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const user = getUserFromToken();
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/seller/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your profile');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to fetch profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setUpdateSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/seller/profile/${userDetails.username}`,
        userDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setError(null);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Seller Profile</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {updateSuccess && (
                <Alert variant="success" className="mb-4">
                  Profile updated successfully!
                </Alert>
              )}

              {userDetails && (
                <Form>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          value={userDetails.username}
                          readOnly
                          className="bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={userDetails.email}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={userDetails.companyName || ''}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-light' : ''}
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                          type="url"
                          name="website"
                          value={userDetails.website || ''}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="https://example.com"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Hotline</Form.Label>
                        <Form.Control
                          type="text"
                          name="hotline"
                          value={userDetails.hotline || ''}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="+XX-XXXX-XXXX"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mb-4">
                    <Button
                      variant={isEditing ? "secondary" : "primary"}
                      onClick={handleEditToggle}
                      disabled={isLoading}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>

                    {isEditing && (
                      <Button 
                        variant="success" 
                        onClick={handleUpdate}
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
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Account Management Section */}
                  <div className="mt-4 pt-4 border-top">
                    <h5 className="text-danger mb-3">Account Management</h5>
                    <AccountDeletionRequest
                      role="seller"
                      userId={userDetails._id}
                      token={localStorage.getItem('token')}
                    />
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SellerProfile;