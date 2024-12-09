import React, { useState, useCallback } from 'react';
import Navbar from "./components/Navbar";

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
import { Link } from 'react-router-dom';
import { 
  FaPlaneDeparture, 
  FaPlaneArrival,
  FaCalendarAlt, 
  FaUsers,
  FaSearch,
  FaChevronRight,
  FaInfoCircle
  
} from 'react-icons/fa';
import axios from 'axios';
import FlightCard from './FlightCard';
import BookingModal from './BookingModal';
import { useNavigate } from 'react-router-dom';  // Add this
import { FaPlane } from 'react-icons/fa';
const FlightBooking = () => {
  // Search states
  const navigate = useNavigate(); 
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
    <>
  <Navbar/>
    <div className="flight-booking-page">
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
                Book Flight <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Search & Book Flights</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
    <h3 className="mb-0">Search & Book Flights</h3>
    <Button 
      variant="primary"
      onClick={() => navigate('/tourist/view-flight-bookings')}
      className="rounded-pill"
      style={{
        backgroundColor: '#1089ff',
        border: 'none',
        padding: '0.75rem 1.5rem'
      }}
    >
      <FaPlane className="me-2" />
      View My Flight Bookings
    </Button>
  </div>
        {/* Search Card */}
        <Card 
          className="shadow-sm mb-5" 
          style={{ 
            borderRadius: '15px',
            border: 'none'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaPlaneDeparture className="text-primary me-3" size={24} />
              <h3 className="mb-0">Find Your Flight</h3>
            </div>

            <Form onSubmit={handleSearch}>
              <Row className="g-4">
                {/* Origin Input */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaPlaneDeparture className="me-2" />
                      Origin
                    </Form.Label>
                    <Form.Control
                      placeholder="Origin Airport (e.g., JFK)"
                      value={searchParams.origin}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        origin: e.target.value.toUpperCase()
                      }))}
                      required
                      maxLength="3"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Destination Input */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaPlaneArrival className="me-2" />
                      Destination
                    </Form.Label>
                    <Form.Control
                      placeholder="Destination Airport (e.g., LAX)"
                      value={searchParams.destination}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        destination: e.target.value.toUpperCase()
                      }))}
                      required
                      maxLength="3"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Date Input */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      Departure Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={searchParams.departureDate}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        departureDate: e.target.value
                      }))}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Passengers Input */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaUsers className="me-2" />
                      Passengers
                    </Form.Label>
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
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Search Button */}
                <Col xs={12}>
                  <Button 
                    type="submit" 
                    className="w-100 rounded-pill"
                    style={{
                      backgroundColor: '#1089ff',
                      border: 'none',
                      padding: '0.75rem'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Searching Flights...
                      </>
                    ) : (
                      <>
                        <FaSearch className="me-2" />
                        Search Flights
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert 
            variant="danger" 
            className="mb-4"
            style={{ borderRadius: '10px' }}
          >
            <div className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              {error}
            </div>
          </Alert>
        )}

        {/* Flight Results */}
        {flights.length > 0 ? (
          <div className="mb-5">
            <h3 className="mb-4 text-primary border-bottom pb-2">Available Flights</h3>
            <Row className="g-4">
              {flights.map((flight) => (
                <Col xs={12} key={flight.id}>
                  <Card 
                    className="shadow-hover" 
                    style={{
                      borderRadius: '15px',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Card.Body className="p-4">
                      <FlightCard
                        flight={flight}
                        onBook={handleBookingClick}
                        formatPrice={formatPrice}
                        formatDuration={formatDuration}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : !loading && !error && (
          <Card 
            className="text-center p-5" 
            style={{ 
              borderRadius: '15px',
              border: 'none'
            }}
          >
            <Card.Body>
              <FaInfoCircle size={48} className="text-muted mb-3" />
              <h4>No Flights Found</h4>
              <p className="text-muted">Search for flights to see available options.</p>
            </Card.Body>
          </Card>
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
    </div>
    \    </>

  );
};

export default FlightBooking;