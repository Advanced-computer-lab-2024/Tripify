import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Row,
  Col
} from 'react-bootstrap';
import { Star, StarFill } from 'react-bootstrap-icons';

const TourGuideRating = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRating, setActiveRating] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [reviews, setReviews] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});

  useEffect(() => {
    fetchAttendedBookings();
  }, []);

  const fetchAttendedBookings = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/bookings/user/${getUserIdFromToken(token)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      
      // Filter for attended itinerary bookings that haven't been rated
      const attendedBookings = data.data.filter(booking => 
        booking.status === 'attended' && 
        booking.bookingType === 'Itinerary' &&
        !booking.rating
      );

      setBookings(attendedBookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (err) {
      throw new Error('Invalid token');
    }
  };

  const handleMouseEnter = (bookingId, rating) => {
    setHoverRating(prev => ({
      ...prev,
      [bookingId]: rating
    }));
  };

  const handleMouseLeave = (bookingId) => {
    setHoverRating(prev => ({
      ...prev,
      [bookingId]: 0
    }));
  };

  const handleRatingClick = (bookingId, rating) => {
    setActiveRating(prev => ({
      ...prev,
      [bookingId]: rating
    }));
  };

  const handleReviewChange = (bookingId, review) => {
    setReviews(prev => ({
      ...prev,
      [bookingId]: review
    }));
  };

  const handleSubmitRating = async (bookingId) => {
    try {
      const token = localStorage.getItem('jwt');
      const rating = activeRating[bookingId];
      const review = reviews[bookingId] || '';

      if (!rating) {
        throw new Error('Please select a rating');
      }

      const response = await fetch(`/api/bookings/${bookingId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      setSubmitStatus(prev => ({
        ...prev,
        [bookingId]: { success: true, message: 'Rating submitted successfully!' }
      }));

      // Remove the rated booking from the list
      setBookings(prev => prev.filter(booking => booking._id !== bookingId));

    } catch (err) {
      setSubmitStatus(prev => ({
        ...prev,
        [bookingId]: { success: false, message: err.message }
      }));
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!bookings.length) {
    return (
      <Container className="mt-4">
        <Alert variant="info">No unrated attended itineraries found.</Alert>
      </Container>
    );
  }

  const StarRating = ({ bookingId }) => {
    const rating = hoverRating[bookingId] || activeRating[bookingId] || 0;
    
    return (
      <div className="d-flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            onMouseEnter={() => handleMouseEnter(bookingId, star)}
            onMouseLeave={() => handleMouseLeave(bookingId)}
            onClick={() => handleRatingClick(bookingId, star)}
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          >
            {star <= rating ? (
              <StarFill className="text-warning" />
            ) : (
              <Star className="text-warning" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Rate Your Tour Guides</h2>
      <Row>
        {bookings.map(booking => (
          <Col key={booking._id} xs={12} className="mb-4">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{booking.itemId.title || 'Itinerary'}</h5>
                    <small className="text-muted">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <StarRating bookingId={booking._id} />
                
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Write your review (optional)"
                    value={reviews[booking._id] || ''}
                    onChange={(e) => handleReviewChange(booking._id, e.target.value)}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={() => handleSubmitRating(booking._id)}
                  disabled={!activeRating[booking._id]}
                  className="w-100"
                >
                  Submit Rating
                </Button>

                {submitStatus[booking._id] && (
                  <Alert 
                    variant={submitStatus[booking._id].success ? "success" : "danger"}
                    className="mt-3 mb-0"
                  >
                    {submitStatus[booking._id].message}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TourGuideRating;