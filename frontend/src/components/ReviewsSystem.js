import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  Modal
} from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const ReviewsSystem = ({ reviewType }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const navigate = useNavigate();

  // Separate useEffect for token initialization
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      
      const parsedUserData = JSON.parse(userData);
      if (!parsedUserData.token) {
        console.error('No token found in user data');
        navigate('/login');
        return;
      }
      
      setAuthToken(parsedUserData.token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Only fetch items when we have a valid token
  useEffect(() => {
    if (authToken) {
      fetchReviewableItems();
    }
  }, [reviewType, authToken]);

  const fetchReviewableItems = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${API_URL}/reviews/completed/${reviewType.toLowerCase()}s`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const formData = new FormData(e.target);
      
      const reviewData = {
        entityId: selectedItem._id,
        reviewType: reviewType.toLowerCase(),
        rating: parseInt(formData.get('rating')),
        comment: formData.get('comment')
      };

      const response = await axios.post(
        `${API_URL}/reviews`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowReviewModal(false);
        fetchReviewableItems();
        alert('Review submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review');
      console.error('Review submission error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const renderRating = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        color={index < rating ? "#ffc107" : "#e4e5e9"}
        className="me-1"
      />
    ));
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Alert variant="info">Loading {reviewType}s...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button
            variant="outline-danger"
            className="ms-3"
            onClick={fetchReviewableItems}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">{reviewType} Reviews</h2>
      
      <Row className="g-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Col key={item._id} md={6} lg={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{item.name || item.title}</Card.Title>
                  <div className="mb-3">
                    {renderRating(item.averageRating || 0)}
                    <small className="text-muted ms-2">
                      ({item.totalReviews || 0} reviews)
                    </small>
                  </div>
                  <Card.Text>{item.description}</Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowReviewModal(true);
                    }}
                  >
                    Write Review
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="info">
              No {reviewType.toLowerCase()}s available for review.
            </Alert>
          </Col>
        )}
      </Row>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Write Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReviewSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Form.Check
                    key={num}
                    type="radio"
                    name="rating"
                    value={num}
                    label={`${num} Star${num !== 1 ? 's' : ''}`}
                    required
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                rows={3}
                required
                minLength={10}
                maxLength={500}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Submit Review
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ReviewsSystem;