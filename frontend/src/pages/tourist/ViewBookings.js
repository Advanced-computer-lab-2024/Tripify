import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Spinner, Badge, OverlayTrigger, Tooltip, Modal, Form } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { FaCalendarTimes, FaInfoCircle, FaStar } from 'react-icons/fa';

const ViewBookings = () => {
  // State management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Get user ID from JWT token
  const getUserId = () => {
    const token = localStorage.getItem('token');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info',
      attended: 'primary'
    };
    return statusColors[status] || 'secondary';
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
      alert('Please log in to view bookings');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Process each booking
      const updatedBookings = await Promise.all(
        response.data.data.map(async (booking) => {
          if (booking.status !== 'cancelled' && 
              booking.status !== 'attended' && 
              isEventPassed(booking.bookingDate)) {
            try {
              const updateResponse = await axios.patch(
                `http://localhost:5000/api/bookings/${booking._id}/status`,
                { status: 'attended' },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                }
              );
              return updateResponse.data.data;
            } catch (error) {
              console.error('Error updating booking status:', error);
              return { ...booking, status: 'attended' };
            }
          }
          return booking;
        })
      );

      setBookings(updatedBookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/bookings/cancel/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        alert('Booking cancelled successfully');
        fetchBookings();
      } else {
        alert(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  // Handle rating booking
  const handleRateBooking = (booking) => {
    setSelectedBooking(booking);
    setRating(booking.rating || 0);
    setReview(booking.review || '');
    setShowRatingModal(true);
  };

  // Submit rating
  const submitRating = async () => {
    if (!selectedBooking) return;

    setSubmittingRating(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/rate`,
        { rating, review },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        alert('Rating submitted successfully');
        setShowRatingModal(false);
        fetchBookings();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
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
                  <Card.Title>{booking.itemId?.name || 'Item Unavailable'}</Card.Title>
                  <Card.Text>
                    <strong>Booking Date:</strong> {formatDate(booking.bookingDate)}
                  </Card.Text>
                  {!isEventPassed(booking.bookingDate) && (
                    <Card.Text>
                      <strong>Time Until Event:</strong> {getTimeRemaining(booking.bookingDate)}
                    </Card.Text>
                  )}
                  <Card.Text>
                    <strong>Booked On:</strong> {formatDate(booking.createdAt)}
                  </Card.Text>
                  {booking.rating && (
                    <Card.Text>
                      <strong>Your Rating:</strong>{' '}
                      {[...Array(booking.rating)].map((_, i) => (
                        <FaStar key={i} color="#ffc107" className="me-1" />
                      ))}
                    </Card.Text>
                  )}
                  <div className="d-grid gap-2">
                    {booking.status === 'attended' && !booking.rating && (
                      <Button
                        variant="primary"
                        onClick={() => handleRateBooking(booking)}
                      >
                        Rate Your Experience
                      </Button>
                    )}
                    {!isEventPassed(booking.bookingDate) && booking.status !== 'cancelled' && (
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
                                Cancellation is only allowed up to 48 hours before the event
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
              'Submit Rating'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ViewBookings;