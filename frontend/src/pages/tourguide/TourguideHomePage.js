import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Container, Card, Spinner, Modal } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import AccountDeletionRequest from '../../components/AccountDeletionRequest'; // Account Deletion Component
import DeleteAccountButton from '../../components/DeleteAccountButton'; // Will be removed later if needed

const TourguideProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false); // Added success state

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
        `http://localhost:5000/api/tourguide/profile/${user.username}`,
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
      setIsLoading(true);

      await axios.put(
        `http://localhost:5000/api/tourguide/profile/${userDetails.username}`,
        userDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setError(null);
      setIsEditing(false);
      setUpdateSuccess(true); // Set success message
      setTimeout(() => setUpdateSuccess(false), 3000); // Reset success message after 3 seconds
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/tourguide/request-deletion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert(response.data.message);
      setShowDeleteModal(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to request deletion at this time. Please try again.'
      );
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
    <Container>
      <Card>
        <Card.Body>
          <h2 className="mb-4">Tour Guide Profile</h2>

          {/* Error and Success Alerts */}
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
            <div className="mt-4">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={userDetails.username}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>

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

                <div className="d-flex gap-2">
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
              </Form>

              {/* Account Management Section */}
              <div className="mt-4 pt-4 border-top">
                <h5 className="text-danger mb-3">Account Management</h5>
                <AccountDeletionRequest
                  role="tourguide"
                  userId={userDetails._id}
                  token={localStorage.getItem('token')}
                />
              </div>

              {/* Removed extra modal for delete */}
              <div className="mt-4 text-center">
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Request Account Deletion
                </Button>
              </div>
            </div>
          )}

          {/* Deletion Confirmation Modal */}
          <Modal
            show={showDeleteModal}
            onHide={() => !isLoading && setShowDeleteModal(false)}
            backdrop={isLoading ? 'static' : true}
            keyboard={!isLoading}
          >
            <Modal.Header closeButton={!isLoading}>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to request account deletion? This action cannot be undone.</p>
              {error && (
                <div className="alert alert-danger mb-0">
                  {error}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRequest}
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
                    Processing...
                  </>
                ) : (
                  'Confirm Deletion'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TourguideProfile;
