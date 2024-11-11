import React, { useState, useEffect } from 'react';
import { Button, Modal, Alert, Spinner, Container, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountDeletionRequest = ({ role, userId, token, onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      navigate('/login');
    }
  }, [navigate, userId, token]);

  const handleRequestDeletion = async () => {
    if (!token || !userId) {
      setError('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Send deletion request to backend
      const response = await axios.put(
        `http://localhost:5000/api/${role}/request-deletion`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If account can be deleted, proceed with deletion and log out the user
      if (response.data.canBeDeleted) {
        setSuccess('Your account is being deleted.');

        // Clear localStorage and sessionStorage to log the user out
        localStorage.clear();
        sessionStorage.clear();

        // Optional: Notify backend that user has been logged out
        await axios.post(`http://localhost:5000/api/${role}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Trigger the success redirection
        onSuccess();
      } else {
        setSuccess(response.data.message || 'Your deletion request has been submitted and is pending review.');
      }
      setDeletionRequested(true);
    } catch (err) {
      console.error('Deletion request error:', err);
      setError(
        err.response?.data?.message || 
        'Cannot process deletion request at this time. You may have upcoming events or active bookings.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow">
        <Card.Body>
          <Card.Title className="mb-4">Account Deletion</Card.Title>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {deletionRequested ? (
            <Alert variant="success">
              {success} You will be redirected to the login page in a few seconds.
            </Alert>
          ) : (
            <div>
              <Button variant="danger" onClick={() => setShowModal(true)}>
                Request Account Deletion
              </Button>

              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Request Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Alert variant="warning">
                    <Alert.Heading>Warning: This action cannot be undone!</Alert.Heading>
                    <p>Before requesting deletion, please note:</p>
                    <ul>
                      <li>Your account cannot be deleted if you have upcoming events or activities.</li>
                      <li>Any active paid bookings must be completed first.</li>
                      <li>This action will hide your profile and associated content from tourists.</li>
                      <li>This action is permanent and all your data will be immediately removed from our system.</li>
                    </ul>
                    <p>Are you sure you want to proceed with the deletion request?</p>
                  </Alert>

                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleRequestDeletion}
                    disabled={loading}
                  >
                    {loading ? (
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
                      'Confirm Deletion Request'
                    )}
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountDeletionRequest;
