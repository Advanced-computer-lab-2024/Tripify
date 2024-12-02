import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Navbar from "./components/Navbar";

import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Badge,
  OverlayTrigger,
  Tooltip,
  Modal,
  Form,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import {
  FaCalendarTimes,
  FaInfoCircle,
  FaStar,
  FaWallet,
} from "react-icons/fa";

const getItemPrice = (booking) => {
  const item = booking.itemId;
  if (!item) return 0;

  switch (booking.bookingType) {
    case "HistoricalPlace":
      return item.ticketPrices?.price || 100;
    case "Activity":
      return item.price || 0;
    case "Itinerary":
      return item.totalPrice || 0;
    default:
      return 0;
  }
};

const ViewBookings = () => {
  // State management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // New states for guide rating
  const [showGuideRatingModal, setShowGuideRatingModal] = useState(false);
  const [guideRating, setGuideRating] = useState(0);
  const [guideReview, setGuideReview] = useState("");
  const [submittingGuideRating, setSubmittingGuideRating] = useState(false);

  // Get user ID from JWT token
  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.user?._id || decoded.userId || decoded.id || decoded._id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Check if event date has passed
  const isEventPassed = (bookingDate) => {
    const now = new Date();
    const eventDate = new Date(bookingDate);
    return eventDate < now;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "warning",
      confirmed: "success",
      cancelled: "danger",
      completed: "info",
      attended: "primary",
    };
    return statusColors[status] || "secondary";
  };

  // Check if booking can be cancelled (48 hours before)
  const canCancelBooking = (bookingDate) => {
    const now = new Date();
    const bookingTime = new Date(bookingDate);
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    return hoursUntilBooking >= 48;
  };

  // Calculate time remaining until booking
  const getTimeRemaining = (bookingDate) => {
    const now = new Date();
    const bookingTime = new Date(bookingDate);
    const diff = bookingTime - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} days and ${hours} hours`;
    }
    return `${hours} hours`;
  };

  // Fetch bookings from API
  const fetchBookings = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to view bookings");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Process each booking
      const updatedBookings = await Promise.all(
        response.data.data.map(async (booking) => {
          if (
            booking.status !== "cancelled" &&
            booking.status !== "attended" &&
            isEventPassed(booking.bookingDate)
          ) {
            try {
              const updateResponse = await axios.patch(
                `http://localhost:5000/api/bookings/status/${booking._id}`,
                { status: "attended" },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              return updateResponse.data.data;
            } catch (error) {
              console.error("Error updating booking status:", error);
              return booking;
            }
          }
          return booking;
        })
      );

      setBookings(updatedBookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const booking = bookings.find((b) => b._id === bookingId);
      if (!booking) {
        alert("Booking not found");
        return;
      }

      const refundAmount = getItemPrice(booking);

      const cancelResponse = await axios.patch(
        `http://localhost:5000/api/bookings/cancel/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (cancelResponse.data.success) {
        const userId = getUserId();
        const refundResponse = await axios.post(
          `http://localhost:5000/api/tourist/wallet/refund/${userId}`,
          { amount: refundAmount },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (refundResponse.data.success) {
          const touristData = JSON.parse(localStorage.getItem("tourist")) || {};
          localStorage.setItem(
            "tourist",
            JSON.stringify({
              ...touristData,
              wallet: refundResponse.data.currentBalance,
            })
          );

          alert(
            `Booking cancelled successfully. $${refundAmount} has been refunded to your wallet.`
          );
          fetchBookings();
        } else {
          alert("Booking cancelled but refund failed. Please contact support.");
        }
      } else {
        alert(cancelResponse.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Error cancelling booking");
    } finally {
      setCancellingId(null);
    }
  };

  // Handle rating booking
  const handleRateBooking = (booking) => {
    if (!canBeRated(booking)) {
      let message = "This booking cannot be rated. ";
      if (booking.status !== "attended") {
        message += "The booking must be marked as attended. ";
      } else if (booking.rating) {
        message += "You have already rated this booking. ";
      }
      alert(message);
      return;
    }

    setSelectedBooking(booking);
    setRating(0);
    setReview("");
    setShowRatingModal(true);
  };

  // Submit booking rating
  const submitRating = async () => {
    if (!selectedBooking) return;

    if (!rating || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }

    if (selectedBooking.status !== "attended") {
      alert("Can only rate attended bookings");
      return;
    }

    if (selectedBooking.rating > 0) {
      alert("This booking has already been rated");
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/rating`,
        {
          rating,
          review,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Rating submitted successfully");
        setShowRatingModal(false);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  // Submit tour guide rating
  const submitGuideRating = async () => {
    if (!selectedBooking?.guideId) {
      alert("No tour guide found for this booking");
      return;
    }

    if (!guideRating || guideRating < 1 || guideRating > 5) {
      alert("Please select a rating between 1 and 5 for the tour guide");
      return;
    }

    setSubmittingGuideRating(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tourist/rate-guide/${selectedBooking.guideId}`,
        {
          rating: guideRating,
          comment: guideReview
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Tour guide rating submitted successfully");
        setShowGuideRatingModal(false);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error submitting guide rating:", error);
      alert(error.response?.data?.message || "Failed to submit guide rating");
    } finally {
      setSubmittingGuideRating(false);
      setGuideRating(0);
      setGuideReview("");
    }
  };

  const canBeRated = (booking) => {
    return (
      booking.status === "attended" &&
      ["Itinerary", "HistoricalPlace", "Activity"].includes(
        booking.bookingType
      ) &&
      !booking.rating
    );
  };

  // Star rating component
  const StarRating = ({ value, onChange }) => {
    return (
      <div className="d-flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className="cursor-pointer"
            color={star <= value ? "#ffc107" : "#e4e5e9"}
            size={24}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  // Wallet Balance Component
  const WalletBalance = () => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
      const fetchWalletBalance = async () => {
        try {
          const touristData = JSON.parse(localStorage.getItem("tourist"));
          if (touristData?.wallet !== undefined) {
            setBalance(touristData.wallet);
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
        }
      };

      fetchWalletBalance();
    }, [bookings]);

    return (
      <div className="bg-light p-3 rounded shadow-sm d-flex align-items-center mb-4">
        <FaWallet className="me-2 text-primary" size={24} />
        <div>
          <h4 className="mb-0">Wallet Balance: ${balance}</h4>
          <small className="text-muted">Available for bookings</small>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
  <Navbar/>
    
    <div className="bookings-page">
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '8rem 0 4rem 0',
          marginBottom: '2rem'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        ></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Link to="/tourist" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </Link>
              </span>
              <span>
                My Bookings <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">View My Bookings</h1>
          </div>
        </Container>
      </div>
  
      <Container className="py-5">
        {/* Wallet Info Card */}
        <Card 
          className="shadow-sm mb-5" 
          style={{ 
            borderRadius: '15px',
            border: 'none',
            backgroundImage: 'url("/images/bg_2.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1
            }}
          ></div>
          <Card.Body className="p-4 position-relative" style={{ zIndex: 2 }}>
            <div className="d-flex align-items-center text-white">
              <FaWallet className="me-3" size={40} />
              <div>
                <h3 className="mb-1">Wallet Balance: ${JSON.parse(localStorage.getItem("tourist"))?.wallet || 0}</h3>
                <p className="mb-0">Available for bookings</p>
              </div>
            </div>
          </Card.Body>
        </Card>
  
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card 
            className="text-center p-5 shadow-sm" 
            style={{ borderRadius: '15px', border: 'none' }}
          >
            <Card.Body>
              <FaCalendarTimes size={48} className="text-muted mb-3" />
              <h4>No bookings found</h4>
              <p className="text-muted mb-4">You haven't made any bookings yet.</p>
              <Link to="/tourist/view-events" className="btn btn-primary px-4 py-2">
                Browse Events
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {bookings.map((booking) => (
              <Col key={booking._id} lg={4} md={6} className="mb-4">
                <Card 
                  className="h-100 shadow-hover" 
                  style={{
                    borderRadius: '15px',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div 
                    className="card-img-top"
                    style={{
                      height: '120px',
                      backgroundImage: 'url("/images/services-2.jpg")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px',
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px'
                      }}
                    />
                    <div 
                      className="p-3" 
                      style={{ 
                        position: 'relative',
                        zIndex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Badge 
                        bg={getStatusBadge(booking.status)}
                        style={{
                          padding: '8px 15px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          alignSelf: 'flex-start'
                        }}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
  
                  <Card.Body className="p-4">
                    <h5 className="mb-3">{booking.itemId?.name || "Item Unavailable"}</h5>
                    <div className="text-muted mb-3">
                      <p className="mb-2">
                        <strong>Booking Date:</strong> {formatDate(booking.bookingDate)}
                      </p>
                      {!isEventPassed(booking.bookingDate) && (
                        <p className="mb-2">
                          <strong>Time Until Event:</strong> {getTimeRemaining(booking.bookingDate)}
                        </p>
                      )}
                    </div>
  
                    {booking.rating > 0 && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center mb-2">
                          <strong className="me-2">Rating:</strong>
                          {[...Array(booking.rating)].map((_, i) => (
                            <FaStar key={i} className="text-warning" />
                          ))}
                        </div>
                        {booking.review && (
                          <p className="mb-0 small text-muted">{booking.review}</p>
                        )}
                      </div>
                    )}
  
                    <div className="d-grid gap-2">
                      {canBeRated(booking) && (
                        <Button
                          variant="primary"
                          onClick={() => handleRateBooking(booking)}
                          className="rounded-pill"
                          style={{
                            backgroundColor: '#1089ff',
                            border: 'none',
                            padding: '0.8rem'
                          }}
                        >
                          <FaStar className="me-2" />
                          Rate {booking.bookingType}
                        </Button>
                      )}
  
                      {!isEventPassed(booking.bookingDate) &&
                        booking.status !== "cancelled" &&
                        canCancelBooking(booking.bookingDate) && (
                          <Button
                            variant="danger"
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="rounded-pill"
                            style={{ padding: '0.8rem' }}
                          >
                            {cancellingId === booking._id ? (
                              <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                              <FaCalendarTimes className="me-2" />
                            )}
                            Cancel Booking
                          </Button>
                      )}
                    </div>
                  </Card.Body>
  
                  <Card.Footer 
                    className="text-muted py-3 px-4" 
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderBottomLeftRadius: '15px',
                      borderBottomRightRadius: '15px',
                      borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <small>Booking ID: {booking._id}</small>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
  
        {/* Rating Modal */}
        <Modal 
          show={showRatingModal} 
          onHide={() => setShowRatingModal(false)}
          centered
        >
          <Modal.Header 
            closeButton
            className="border-bottom"
            style={{ 
              background: '#f8f9fa',
              borderTopLeftRadius: '15px',
              borderTopRightRadius: '15px'
            }}
          >
            <Modal.Title>Rate Your Experience</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Rating</Form.Label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className="cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      color={star <= rating ? "#ffc107" : "#e4e5e9"}
                      size={24}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Review (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #eee'
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-top">
            <Button 
              variant="secondary" 
              onClick={() => setShowRatingModal(false)}
              className="rounded-pill"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={submitRating}
              disabled={!rating || submittingRating}
              className="rounded-pill"
              style={{ backgroundColor: '#1089ff', border: 'none' }}
            >
              {submittingRating ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
  
        {/* Guide Rating Modal */}
        <Modal 
          show={showGuideRatingModal} 
          onHide={() => setShowGuideRatingModal(false)}
          centered
        >
          <Modal.Header 
            closeButton
            className="border-bottom"
            style={{ 
              background: '#f8f9fa',
              borderTopLeftRadius: '15px',
              borderTopRightRadius: '15px'
            }}
          >
            <Modal.Title>Rate Tour Guide</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Rating</Form.Label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className="cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      color={star <= guideRating ? "#ffc107" : "#e4e5e9"}
                      size={24}
                      onClick={() => setGuideRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Review (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={guideReview}
                  onChange={(e) => setGuideReview(e.target.value)}
                  placeholder="Share your experience with the tour guide..."
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #eee'
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-top">
            <Button 
              variant="secondary" 
              onClick={() => setShowGuideRatingModal(false)}
              className="rounded-pill"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={submitGuideRating}
              disabled={!guideRating || submittingGuideRating}
              className="rounded-pill"
              style={{ backgroundColor: '#1089ff', border: 'none' }}
            >
              {submittingGuideRating ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
    </>
  );

 
};

export default ViewBookings;