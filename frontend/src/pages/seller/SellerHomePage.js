import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Modal, Spinner } from "react-bootstrap";
import axios from "axios";

const SellerHomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "Seller";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDeleteRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/seller/request-deletion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      setShowDeleteModal(false);
      navigate("/logout");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Unable to request deletion at this time. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3">Welcome to the Seller Homepage</h1>
            <p className="text-muted">Welcome, {username}!</p>
          </div>

          <Row className="g-4 justify-content-center">
            <Col xs={12} sm={6} md={4}>
              <Link to="/seller/profile" className="btn btn-primary w-100">
                View Profile
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Link to="/seller/products" className="btn btn-primary w-100">
                View Products
              </Link>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Button 
                variant="danger" 
                className="w-100" 
                onClick={() => setShowDeleteModal(true)}
              >
                Request Account Deletion
              </Button>
            </Col>
          </Row>

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

export default SellerHomePage;