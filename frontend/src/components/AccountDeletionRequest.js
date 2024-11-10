import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Container, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountDeletionRequest = ({ role, userId, token }) => {
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [error, setError] = useState(null);
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
      setError(null);

      // Log token and userId for debugging purposes
      console.log("Attempting deletion with Token:", token, "User ID:", userId);

      // Request deletion (PUT request)
      await axios.put(
        `http://localhost:5000/api/${role}/request-deletion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Perform the actual deletion (DELETE request)
      const response = await axios.delete(
        `http://localhost:5000/api/${role}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success || response.status === 200) {
        setDeletionRequested(true);
        localStorage.clear();
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      console.error('Deletion request error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to delete account. Please try again.'
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
              Your account has been successfully deleted. 
              You will be redirected to the login page in a few seconds.
            </Alert>
          ) : (
            <div>
              <Alert variant="warning">
                <Alert.Heading>Warning: This action cannot be undone!</Alert.Heading>
                <p className="mb-0">
                  Are you sure you want to delete your account? This action is permanent 
                  and all your data will be immediately removed from our system.
                </p>
              </Alert>
              
              <div className="d-flex justify-content-between mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate(`/${role}`)}
                >
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
                    'Permanently Delete Account'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountDeletionRequest;
