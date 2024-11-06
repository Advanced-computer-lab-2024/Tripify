import React, { useState, useCallback } from 'react';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  InputGroup, 
  Alert,
  Spinner
} from 'react-bootstrap';
import { FaPlaneDeparture, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import FlightCard from './FlightCard';
import BookingModal from './BookingModal';

const FlightBooking = () => {
  // Search states
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    adults: 1
  });
  
  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Utility functions
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency
    }).format(price.total);
  }, []);

  const formatDuration = useCallback((duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'string' && duration.includes('PT')) {
      return duration.replace('PT', '').toLowerCase();
    }
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    }
    return 'N/A';
  }, []);

  // Handlers
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/flights/search', searchParams);
      if (response.data.errors) {
        throw new Error(response.data.errors[0].detail);
      }
      setFlights(response.data.data || []);
      if (response.data.data?.length === 0) {
        setError('No flights found for these criteria');
      }
    } catch (err) {
      setError(err.response?.data?.error?.[0]?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleBookingClick = useCallback((flight) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
  }, []);

  return (
    <Container className="py-4">
      {/* Search Form */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <Card.Title className="h4 mb-0">Search Flights</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              {/* Origin Input */}
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaPlaneDeparture />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Origin (e.g., JFK)"
                    value={searchParams.origin}
                    onChange={(e) => setSearchParams(prev => ({
                      ...prev,
                      origin: e.target.value.toUpperCase()
                    }))}
                    required
                    maxLength="3"
                  />
                </InputGroup>
              </Col>

              {/* Destination Input */}
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaPlaneDeparture />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Destination (e.g., LAX)"
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams(prev => ({
                      ...prev,
                      destination: e.target.value.toUpperCase()
                    }))}
                    required
                    maxLength="3"
                  />
                </InputGroup>
              </Col>

              {/* Date Input */}
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaCalendarAlt />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={searchParams.departureDate}
                    onChange={(e) => setSearchParams(prev => ({
                      ...prev,
                      departureDate: e.target.value
                    }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </InputGroup>
              </Col>

              {/* Passengers Input */}
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUsers />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="1"
                    max="9"
                    value={searchParams.adults}
                    onChange={(e) => setSearchParams(prev => ({
                      ...prev,
                      adults: parseInt(e.target.value)
                    }))}
                    required
                  />
                </InputGroup>
              </Col>

              {/* Search Button */}
              <Col xs={12}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Searching...
                    </>
                  ) : (
                    'Search Flights'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Flight Results */}
      {flights.length > 0 && (
        <>
          <h2 className="h4 mb-3">Available Flights</h2>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onBook={handleBookingClick}
              formatPrice={formatPrice}
              formatDuration={formatDuration}
            />
          ))}
        </>
      )}

      {/* Booking Modal */}
      {selectedFlight && (
        <BookingModal
          show={showBookingModal}
          onHide={() => setShowBookingModal(false)}
          flight={selectedFlight}
          formatPrice={formatPrice}
        />
      )}
    </Container>
  );
};

export default FlightBooking;