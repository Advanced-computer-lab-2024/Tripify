import React, { useState, useEffect } from "react";
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
  ProgressBar,
} from "react-bootstrap";
import {
  FaStar,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaArrowLeft,
  FaTimesCircle,
  FaWallet,
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function MyPurchasesPage() {
  const navigate = useNavigate();

  // State variables
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  // Helper functions
  const calculateStatus = (purchase) => {
    if (purchase.status === "cancelled") {
      return "cancelled";
    }

    const now = new Date();
    const orderDate = new Date(purchase.purchaseDate);
    const daysSinceOrder = Math.floor(
      (now - orderDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceOrder >= 3) {
      return "delivered";
    } else if (daysSinceOrder >= 2) {
      return "on_the_way";
    } else {
      return "processing";
    }
  };

  const getUserSpecificKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return `tourist_${user?.username}`;
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        console.error("No token or user found");
        return;
      }

      const response = await axios.get(
        `${API_URL}/tourist/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.tourist) {
        setWalletBalance(response.data.tourist.wallet);
        const userKey = getUserSpecificKey();
        localStorage.setItem(
          userKey,
          JSON.stringify({
            wallet: response.data.tourist.wallet,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const initializeUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to access this page");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      await fetchUserProfile();
    } catch (error) {
      console.error("Token decode error:", error);
      setError("Invalid session. Please login again.");
    }
  };
  const handleCancelOrder = async (purchase) => {
    setCancellingOrder(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/products/purchases/${purchase._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update the specific purchase's status in the state
        setPurchases((prevPurchases) =>
          prevPurchases.map((p) =>
            p._id === purchase._id
              ? {
                  ...p,
                  status: "cancelled",
                  trackingUpdates: [
                    ...p.trackingUpdates,
                    {
                      status: "cancelled",
                      message: "Order has been cancelled and refunded",
                      timestamp: new Date(),
                    },
                  ],
                }
              : p
          )
        );

        setWalletBalance(response.data.data.newWalletBalance);
        setCancelSuccess({
          message: "Order cancelled successfully",
          refundAmount: response.data.data.refundAmount,
        });

        // Refetch purchases to get updated data
        await fetchPurchases();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setCancelSuccess({
        error: error.response?.data?.message || "Failed to cancel order",
      });
    } finally {
      setCancellingOrder(false);
      setShowCancelModal(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "warning";
      case "on_the_way":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getDeliveryProgress = (status) => {
    switch (status) {
      case "processing":
        return 25;
      case "on_the_way":
        return 75;
      case "delivered":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <FaBox className="me-2" />;
      case "on_the_way":
        return <FaTruck className="me-2" />;
      case "delivered":
        return <FaCheckCircle className="me-2" />;
      default:
        return <FaClock className="me-2" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Data fetching
  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your purchases");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded._id || decoded.user?._id;

      const response = await axios.get(
        `${API_URL}/products/purchases/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const updatedPurchases = response.data.data.map((purchase) => {
          // Pass the whole purchase object to calculate status
          const status = calculateStatus(purchase);
          const orderDate = new Date(purchase.purchaseDate);
          const estimatedDeliveryDate = new Date(orderDate);
          estimatedDeliveryDate.setDate(orderDate.getDate() + 3);

          const trackingUpdates = [];

          // Always add the initial processing status
          trackingUpdates.push({
            status: "processing",
            message: "Order is being processed",
            timestamp: orderDate,
          });

          // If status has progressed to on_the_way
          if (status === "on_the_way" || status === "delivered") {
            const onTheWayDate = new Date(orderDate);
            onTheWayDate.setDate(orderDate.getDate() + 2);
            trackingUpdates.push({
              status: "on_the_way",
              message: "Order is on the way",
              timestamp: onTheWayDate,
            });
          }

          // If status is delivered
          if (status === "delivered") {
            const deliveryDate = new Date(orderDate);
            deliveryDate.setDate(orderDate.getDate() + 3);
            trackingUpdates.push({
              status: "delivered",
              message: "Order has been delivered",
              timestamp: deliveryDate,
            });
          }

          // If the order is cancelled, add the cancelled tracking update
          if (status === "cancelled") {
            trackingUpdates.push({
              status: "cancelled",
              message: "Order has been cancelled and refunded",
              timestamp: purchase.updatedAt || new Date(),
            });
          }

          return {
            ...purchase,
            status,
            estimatedDeliveryDate,
            trackingUpdates,
          };
        });

        setPurchases(
          updatedPurchases.sort(
            (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
          )
        );
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
      await axios.post(
        `${API_URL}/products/purchases/${selectedPurchase._id}/review`,
        {
          rating,
          comment: review,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPurchases(
        purchases.map((purchase) =>
          purchase._id === selectedPurchase._id
            ? {
                ...purchase,
                review: {
                  rating,
                  comment: review,
                  date: new Date(),
                },
              }
            : purchase
        )
      );

      setRating(0);
      setReview("");
      setShowReviewModal(false);
      setSelectedPurchase(null);
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Effects
  useEffect(() => {
    initializeUser();
    fetchPurchases();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      const userKey = getUserSpecificKey();
      if (e.key === userKey) {
        try {
          const newData = JSON.parse(e.newValue);
          if (newData && typeof newData.wallet !== "undefined") {
            setWalletBalance(newData.wallet);
          }
        } catch (error) {
          console.error("Error parsing storage data:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPurchases((currentPurchases) =>
        currentPurchases.map((purchase) => ({
          ...purchase,
          // Only recalculate status if not cancelled
          status:
            purchase.status === "cancelled"
              ? "cancelled"
              : calculateStatus(purchase),
        }))
      );
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Loading and error states
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate("/auth")}>
          Go to Login
        </Button>
      </Container>
    );
  }

  // Return statement remains the same as in your original code
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Purchases</h2>
        <Button variant="outline-primary" onClick={() => navigate("/tourist")}>
          <FaArrowLeft className="me-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-light mb-4">
        <Card.Body>
          <div className="d-flex align-items-center">
            <FaWallet className="me-2 text-primary" size={24} />
            <div>
              <h5 className="mb-0">Wallet Balance</h5>
              <h3 className="mb-0">${walletBalance.toFixed(2)}</h3>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <Alert variant="info">You haven't made any purchases yet.</Alert>
      ) : (
        <Row>
          {purchases.map((purchase) => (
            <Col md={6} lg={4} key={purchase._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    {purchase.productId?.name || "Unknown Product"}
                  </Card.Title>
                  <div className="mb-3">
                    <Badge
                      bg={getStatusColor(purchase.status)}
                      className="mb-2"
                    >
                      {getStatusIcon(purchase.status)}
                      {purchase.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <ProgressBar
                      now={getDeliveryProgress(purchase.status)}
                      variant={getStatusColor(purchase.status)}
                      className="mt-2"
                    />
                  </div>
                  <Card.Text>
                    <small className="text-muted">
                      Ordered: {formatDate(purchase.purchaseDate)}
                    </small>
                  </Card.Text>
                  <Card.Text>
                    <small className="text-muted">
                      Estimated Delivery:{" "}
                      {formatDate(purchase.estimatedDeliveryDate)}
                    </small>
                  </Card.Text>
                  <Card.Text>Quantity: {purchase.quantity}</Card.Text>
                  <Card.Text>
                    Total: ${purchase.totalPrice.toFixed(2)}
                  </Card.Text>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setShowTrackingModal(true);
                      }}
                    >
                      <FaTruck className="me-2" />
                      Track Order
                    </Button>

                    {purchase.status === "delivered" && !purchase.review && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setRating(0);
                          setReview("");
                          setShowReviewModal(true);
                        }}
                      >
                        <FaStar className="me-2" />
                        Write Review
                      </Button>
                    )}

                    {(purchase.status === "processing" ||
                      purchase.status === "on_the_way") && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancelOrder(purchase)}
                        disabled={cancellingOrder}
                      >
                        <FaTimesCircle className="me-2" />
                        {cancellingOrder ? "Cancelling..." : "Cancel Order"}
                      </Button>
                    )}
                  </div>

                  {purchase.review && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <h6 className="mb-2">Your Review</h6>
                      <div className="text-warning mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < purchase.review.rating
                                ? "text-warning"
                                : "text-secondary"
                            }
                          />
                        ))}
                      </div>
                      {purchase.review.comment && (
                        <p className="small mb-1">{purchase.review.comment}</p>
                      )}
                      <small className="text-muted">
                        Reviewed on: {formatDate(purchase.review.date)}
                      </small>
                    </div>
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

      {/* Tracking Modal */}
      <Modal
        show={showTrackingModal}
        onHide={() => setShowTrackingModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPurchase && (
            <div>
              <div className="mb-4">
                <h5>Order Details</h5>
                <p className="mb-1">Order ID: {selectedPurchase._id}</p>
                <p className="mb-1">
                  Product: {selectedPurchase.productId.name}
                </p>
                <p className="mb-1">Quantity: {selectedPurchase.quantity}</p>
                <p className="mb-1">
                  Total: ${selectedPurchase.totalPrice.toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <h5>Delivery Status</h5>
                <ProgressBar
                  now={getDeliveryProgress(selectedPurchase.status)}
                  variant={getStatusColor(selectedPurchase.status)}
                  className="mb-3"
                />

                <div className="timeline">
                  {selectedPurchase.trackingUpdates?.map((update, index) => (
                    <div key={index} className="d-flex mb-3">
                      <div
                        className={`me-3 text-${getStatusColor(update.status)}`}
                      >
                        {getStatusIcon(update.status)}
                      </div>
                      <div>
                        <div className="fw-bold">{update.message}</div>
                        <small className="text-muted">
                          {formatDate(update.timestamp)}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5>Estimated Delivery</h5>
                <p>{formatDate(selectedPurchase.estimatedDeliveryDate)}</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {cancelSuccess?.error ? "Cancel Order Failed" : "Order Cancelled"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelSuccess?.error ? (
            <Alert variant="danger">{cancelSuccess.error}</Alert>
          ) : (
            <>
              <Alert variant="success">
                <div className="mb-2">{cancelSuccess?.message}</div>
                <div className="d-flex align-items-center">
                  <FaWallet className="me-2" />
                  <strong>
                    Refund Amount: ${cancelSuccess?.refundAmount?.toFixed(2)}
                  </strong>
                </div>
                <div className="mt-2">
                  <strong>
                    New Wallet Balance: ${walletBalance.toFixed(2)}
                  </strong>
                </div>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

