import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AccountDeletionRequest from '../../components/AccountDeletionRequest';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  const token = localStorage.getItem('token');

  // Function to handle redirection after successful deletion
  const handleRedirection = () => {
    setTimeout(() => {
      navigate('/login'); // Redirect to login page after 3 seconds
    }, 3000);
  };

  return (
    <Container fluid className="py-5 bg-light">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-danger text-white">
              <h4 className="mb-0">Delete Account</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h5>Important Information</h5>
                <p>Before proceeding with account deletion, please note:</p>
                <ul>
                  {userRole === 'tourist' && (
                    <li>All your active bookings must be completed</li>
                  )}
                  {userRole === 'tourguide' && (
                    <>
                      <li>All your upcoming itineraries with bookings must be completed</li>
                      <li>Your profile will be removed from tour guide listings</li>
                    </>
                  )}
                  {userRole === 'advertiser' && (
                    <>
                      <li>All your activities with upcoming bookings must be completed</li>
                      <li>Your advertisements will be removed from the platform</li>
                    </>
                  )}
                  {userRole === 'seller' && (
                    <>
                      <li>All your active orders must be fulfilled</li>
                      <li>Your products will be removed from the marketplace</li>
                    </>
                  )}
                  <li>This action cannot be undone</li>
                  <li>All your data will be permanently deleted</li>
                </ul>
              </div>

              <AccountDeletionRequest
                role={userRole}
                userId={userId}
                token={token}
                onSuccess={handleRedirection}  // Trigger redirection when deletion is successful
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DeleteAccount;
