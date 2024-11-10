import React, { useState, useEffect } from "react";
import axios from "axios";
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
              // Update to use the correct endpoint
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
              // If the update fails, return the original booking
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
      // Find the booking to get the price for refund
      const booking = bookings.find((b) => b._id === bookingId);
      if (!booking) {
        alert("Booking not found");
        return;
      }

      const refundAmount = getItemPrice(booking);

      // Cancel the booking
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
        // Process the refund
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
          // Update stored tourist data with new wallet balance
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
          fetchBookings(); // Refresh the bookings list
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
    }, [bookings]); // Refresh when bookings change

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

  // Handle rating booking
  const handleRateBooking = (booking) => {
    if (!canBeRated(booking)) {
      let message = "This booking cannot be rated. ";
      if (booking.status !== "attended") {
        message += "The booking must be marked as attended. ";
      } else if (booking.rating) {
        message += "You have already rated this booking. ";
      } else if (
        !["Itinerary", "HistoricalPlace"].includes(booking.bookingType)
      ) {
        message += "Only itineraries and historical places can be rated. ";
      }
      alert(message);
      return;
    }

    setSelectedBooking(booking);
    setRating(0); // Reset rating
    setReview(""); // Reset review
    setShowRatingModal(true);
  };

  // Submit rating
  const submitRating = async () => {
    if (!selectedBooking) return;

    // Validation checks
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
        fetchBookings(); // Refresh the bookings list

        // Log the ratings stats if they're returned
        if (response.data.data.stats) {
          console.log(
            `${selectedBooking.bookingType} Rating Stats:`,
            response.data.data.stats
          );
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit rating. Please ensure this booking can be rated."
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  const canBeRated = (booking) => {
    return (
      booking.status === "attended" &&
      (booking.bookingType === "Itinerary" ||
        booking.bookingType === "HistoricalPlace") &&
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

  // Set up initial fetch and refresh interval
  useEffect(() => {
    fetchBookings();
    // Refresh every minute
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
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
    <Container className="py-5">
      <h2 className="mb-4">My Bookings</h2>
      <WalletBalance />

      {bookings.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h4>No bookings found</h4>
            <p>You haven't made any bookings yet.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {bookings.map((booking) => (
            <Col md={6} lg={4} key={booking._id} className="mb-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{booking.bookingType}</h5>
                  <Badge bg={getStatusBadge(booking.status)}>
                    {booking.status}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    {booking.itemId?.name || "Item Unavailable"}
                  </Card.Title>
                  <Card.Text>
                    <strong>Booking Date:</strong>{" "}
                    {formatDate(booking.bookingDate)}
                  </Card.Text>
                  {!isEventPassed(booking.bookingDate) && (
                    <Card.Text>
                      <strong>Time Until Event:</strong>{" "}
                      {getTimeRemaining(booking.bookingDate)}
                    </Card.Text>
                  )}
                  <Card.Text>
                    <strong>Booked On:</strong> {formatDate(booking.createdAt)}
                  </Card.Text>

                  <div className="d-grid gap-2">
                    {/* Rating Button - Show only for attended bookings that can be rated */}
                    {canBeRated(booking) && (
                      <Button
                        variant="primary"
                        onClick={() => handleRateBooking(booking)}
                        className="mt-2"
                      >
                        <FaStar className="me-2" />
                        Rate{" "}
                        {booking.bookingType === "Itinerary"
                          ? "Tour Guide"
                          : "Historical Place"}
                      </Button>
                    )}

                    {/* Show existing rating if it exists */}
                    {booking.rating > 0 && (
                      <div className="mt-2">
                        <strong>Your Rating: </strong>
                        {[...Array(booking.rating)].map((_, i) => (
                          <FaStar key={i} className="text-warning" />
                        ))}
                        {booking.review && (
                          <p className="mt-1 text-muted small">
                            {booking.review}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Cancellation Button - Show only for future, non-cancelled bookings */}
                    {!isEventPassed(booking.bookingDate) &&
                      booking.status !== "cancelled" && (
                        <>
                          {canCancelBooking(booking.bookingDate) ? (
                            <Button
                              variant="danger"
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancellingId === booking._id}
                            >
                              {cancellingId === booking._id ? (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                              ) : (
                                <FaCalendarTimes className="me-2" />
                              )}
                              Cancel Booking
                            </Button>
                          ) : (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  Cancellation is only allowed up to 48 hours
                                  before the event
                                </Tooltip>
                              }
                            >
                              <div>
                                <Button
                                  variant="danger"
                                  disabled
                                  className="w-100"
                                >
                                  <FaInfoCircle className="me-2" />
                                  Cannot Cancel
                                </Button>
                              </div>
                            </OverlayTrigger>
                          )}
                        </>
                      )}
                  </div>
                </Card.Body>
                <Card.Footer className="text-muted">
                  Booking ID: {booking._id}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rate Your Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div>
                <StarRating value={rating} onChange={setRating} />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Review (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={submitRating}
            disabled={!rating || submittingRating}
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
    </Container>
  );
};

export default ViewBookings;
