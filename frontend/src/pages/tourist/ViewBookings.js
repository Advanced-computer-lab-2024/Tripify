import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { FaCalendarTimes, FaInfoCircle } from 'react-icons/fa';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

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

      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Check if booking can be cancelled (48 hours before)
  const canCancelBooking = (bookingDate) => {
    const now = new Date();
    const bookingTime = new Date(bookingDate);
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    return hoursUntilBooking >= 48;
  };

  // Get time remaining until booking
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info'
    };
    return statusColors[status] || 'secondary';
  };

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
                  <Card.Text>
                    <strong>Time Until Event:</strong> {getTimeRemaining(booking.bookingDate)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Booked On:</strong> {formatDate(booking.createdAt)}
                  </Card.Text>
                  {booking.status !== 'cancelled' && (
                    <div className="d-grid">
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
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="text-muted">
                  Booking ID: {booking._id}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ViewBookings;