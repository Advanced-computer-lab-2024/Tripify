import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { FaTrash, FaCalendar, FaBookmark, FaMapMarkerAlt, FaDollarSign, FaLanguage } from 'react-icons/fa';
import Navbar from './components/Navbar';
import axios from 'axios';

const SavedEvents = () => {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tourist/saved-events', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavedEvents(response.data.savedEvents || []);
    } catch (error) {
      console.error('Error fetching saved events:', error);
      setSavedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/tourist/bookmark/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSavedEvents(currentEvents => currentEvents.filter(event => event._id !== eventId));
        alert('Event removed from bookmarks successfully');
      }
    } catch (error) {
      console.error('Error removing event:', error);
      alert(error.response?.data?.message || 'Error removing bookmark');
    }
  };

  const renderEventDetails = (event) => {
    switch (event.eventType) {
      case 'HistoricalPlace':
        return (
          <>
            <Card.Text>
              <FaCalendar className="me-2" />
              <strong>Opening Hours:</strong> {event.openingHours}
            </Card.Text>
            <Card.Text>
              <FaDollarSign className="me-2" />
              <strong>Price:</strong> ${event.ticketPrices?.price || 0}
            </Card.Text>
          </>
        );
      case 'Activity':
        return (
          <>
            <Card.Text>
              <FaDollarSign className="me-2" />
              <strong>Price:</strong> ${event.price || 0}
            </Card.Text>
            {event.category && (
              <Card.Text>
                <strong>Category:</strong> {event.category.name}
              </Card.Text>
            )}
          </>
        );
      case 'Itinerary':
        return (
          <>
            <Card.Text>
              <FaLanguage className="me-2" />
              <strong>Language:</strong> {event.language}
            </Card.Text>
            <Card.Text>
              <FaDollarSign className="me-2" />
              <strong>Price:</strong> ${event.totalPrice || 0}
            </Card.Text>
          </>
        );
      default:
        return null;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'HistoricalPlace':
        return 'primary';
      case 'Activity':
        return 'success';
      case 'Itinerary':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          style={{
            backgroundImage: 'url("/images/bg_1.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative'
        }}
      >
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRadius: '8px' }}>
          <h1>My Saved Events</h1>
        </div>
      </div>
      <Container className="mt-5">
        {savedEvents.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <FaBookmark size={48} className="text-muted mb-3" />
              <h3>No saved events yet</h3>
              <p>Events you bookmark will appear here</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {savedEvents.map(event => (
              <Col md={4} key={event._id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title>{event.name}</Card.Title>
                      <Badge bg={getBadgeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                    </div>
                    <Card.Text>{event.description}</Card.Text>
                    {renderEventDetails(event)}
                    {event.location && (
                      <Card.Text>
                        <FaMapMarkerAlt className="me-2" />
                        <strong>Location:</strong>{' '}
                        {typeof event.location === 'object' && event.location.coordinates
                          ? event.location.coordinates.join(', ')
                          : event.location}
                      </Card.Text>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white border-top-0 p-3">
                    <Button
                      variant="outline-danger"
                      onClick={() => removeFromSaved(event._id)}
                      className="w-100"
                    >
                      <FaTrash className="me-2" />
                      Remove from Saved
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default SavedEvents;
