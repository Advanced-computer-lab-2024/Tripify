import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Container, Card, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import AccountDeletionRequest from '../../components/AccountDeletionRequest';

const AdvertiserProfile = () => {
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
        `http://localhost:5000/api/advertiser/profile/${user.username}`,
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
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/advertiser/profile/${userDetails.username}`,
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
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Loading profile information...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Advertiser Profile</h4>
            </Card.Header>
            <Card.Body>
              {updateSuccess && (
                <Alert variant="success" className="mb-4">
                  Profile updated successfully!
                </Alert>
              )}

              {userDetails && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
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
                      <Form.Group className="mb-3">
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
                      value={userDetails.companyName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-light' : ''}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                          type="url"
                          name="website"
                          value={userDetails.website}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hotline</Form.Label>
                        <Form.Control
                          type="text"
                          name="hotline"
                          value={userDetails.hotline}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mb-4">
                    <Button
                      variant={isEditing ? "secondary" : "primary"}
                      onClick={handleEditToggle}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>

                    {isEditing && (
                      <Button variant="success" onClick={handleUpdate}>
                        Save Changes
                      </Button>
                    )}
                  </div>

                  {/* Account Management Section */}
                  <div className="mt-4 pt-4 border-top">
                    <h5 className="text-danger mb-3">Account Management</h5>
                    <AccountDeletionRequest
                      role="advertiser"
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

export default AdvertiserProfile;