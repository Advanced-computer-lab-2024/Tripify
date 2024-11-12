import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaStar } from "react-icons/fa";

const API_URL = "http://localhost:5000/api";

function MyPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded._id || decoded.user?._id;

      const response = await axios.get(
        `${API_URL}/products/purchases/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPurchases(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setError("Failed to load purchase history");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!rating || !selectedPurchase) return;

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/products/purchases/${selectedPurchase._id}/review`,
        { rating, comment: review },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update the purchase in the local state
        setPurchases((prevPurchases) =>
          prevPurchases.map((p) =>
            p._id === selectedPurchase._id ? response.data.data : p
          )
        );

        setShowReviewModal(false);
        alert("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarRating = ({ rating }) => (
    <div className="text-warning">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={star <= rating ? "text-warning" : "text-secondary"}
        />
      ))}
    </div>
  );

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  if (error)
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Purchases</h2>

      {purchases.length === 0 ? (
        <Alert variant="info">You haven't made any purchases yet.</Alert>
      ) : (
        <Row>
          {purchases.map((purchase) => (
            <Col md={6} lg={4} key={purchase._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{purchase.productId.name}</Card.Title>
                  <Card.Text>
                    Purchased:{" "}
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </Card.Text>
                  <Card.Text>Quantity: {purchase.quantity}</Card.Text>
                  <Card.Text>Total: ${purchase.totalPrice}</Card.Text>

                  {purchase.review ? (
                    <div className="mt-3">
                      <h6>Your Review</h6>
                      <StarRating rating={purchase.review.rating} />
                      {purchase.review.comment && (
                        <p className="mt-2 text-muted">
                          {purchase.review.comment}
                        </p>
                      )}
                      <small className="text-muted d-block mt-2">
                        Reviewed on:{" "}
                        {new Date(purchase.review.date).toLocaleDateString()}
                      </small>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setRating(0);
                        setReview("");
                        setShowReviewModal(true);
                      }}
                      className="w-100"
                    >
                      <FaStar className="me-2" />
                      Write a Review
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPurchase && (
            <>
              <h5 className="mb-3">{selectedPurchase.productId.name}</h5>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`cursor-pointer ${
                        star <= rating ? "text-warning" : "text-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                      size={24}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Review (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this product..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReviewSubmit}
            disabled={!rating || submittingReview}
          >
            {submittingReview ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyPurchasesPage;
