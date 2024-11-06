import React, { useState, memo } from 'react';
import { 
  Modal, 
  Form, 
  Button, 
  Row, 
  Col, 
  Alert, 
  Card,
  Spinner 
} from 'react-bootstrap';
import axios from 'axios';

// Country options for passport/nationality
const countryOptions = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'EG', name: 'Egypt' }
];

const BookingModal = memo(({ 
  show, 
  onHide, 
  flight, 
  formatPrice 
}) => {
  const [bookingData, setBookingData] = useState({
    travelers: [{
      id: '1',
      dateOfBirth: '',
      name: {
        firstName: '',
        lastName: ''
      },
      gender: '',
      contact: {
        emailAddress: '',
        phones: [{
          deviceType: 'MOBILE',
          countryCallingCode: '1',
          number: ''
        }]
      },
      documents: [{
        documentType: 'PASSPORT',
        number: '',
        expiryDate: '',
        issuanceCountry: '',
        nationality: '',
        holder: true
      }]
    }]
  });
  
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      // First verify price
      const priceVerification = await axios.post('http://localhost:5000/api/flights/verify-price', {
        flightOffers: flight
      });

      // Then create booking
      const bookingResponse = await axios.post('http://localhost:5000/api/flights/book', {
        flightOffer: flight,
        travelers: bookingData.travelers
      });

      alert(`Booking successful!\nReference: ${bookingResponse.data.data.id}`);
      onHide();
      
    } catch (err) {
      console.error('Booking error:', err.response?.data);
      
      if (err.response?.data?.errors?.[0]?.code === 'FLIGHT_UNAVAILABLE') {
        setBookingError('This flight is no longer available. Please search for new flights.');
      } else if (err.message.includes('no longer available')) {
        setBookingError(err.message);
      } else {
        setBookingError(
          err.response?.data?.errors?.[0]?.detail || 
          'Unable to complete booking. Please try again.'
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bookingError && (
          <Alert variant="danger">{bookingError}</Alert>
        )}
        
        {flight && (
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Flight Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <p className="mb-1">
                    <strong>Flight: </strong>
                    {flight.itineraries[0].segments[0].carrierCode}
                    {flight.itineraries[0].segments[0].number}
                  </p>
                  <p className="mb-1">
                    <strong>Route: </strong>
                    {flight.itineraries[0].segments[0].departure.iataCode} →
                    {flight.itineraries[0].segments[0].arrival.iataCode}
                  </p>
                  <p className="mb-1">
                    <strong>Date: </strong>
                    {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleDateString()}
                  </p>
                  <p className="mb-0">
                    <strong>Price: </strong>
                    {formatPrice(flight.price)}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Passenger Information */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Passenger Information</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={bookingData.travelers[0].name.firstName}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          name: {
                            ...bookingData.travelers[0].name,
                            firstName: e.target.value
                          }
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={bookingData.travelers[0].name.lastName}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          name: {
                            ...bookingData.travelers[0].name,
                            lastName: e.target.value
                          }
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      required
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={bookingData.travelers[0].dateOfBirth}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          dateOfBirth: e.target.value
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      required
                      value={bookingData.travelers[0].gender}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          gender: e.target.value
                        }]
                      })}
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Contact Information */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Contact Information</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      required
                      type="email"
                      value={bookingData.travelers[0].contact.emailAddress}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          contact: {
                            ...bookingData.travelers[0].contact,
                            emailAddress: e.target.value
                          }
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      required
                      type="tel"
                      value={bookingData.travelers[0].contact.phones[0].number}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          contact: {
                            ...bookingData.travelers[0].contact,
                            phones: [{
                              ...bookingData.travelers[0].contact.phones[0],
                              number: e.target.value.replace(/\D/g, '')
                            }]
                          }
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Passport Information */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Passport Information</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Passport Number</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={bookingData.travelers[0].documents[0].number}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          documents: [{
                            ...bookingData.travelers[0].documents[0],
                            number: e.target.value
                          }]
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.travelers[0].documents[0].expiryDate}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          documents: [{
                            ...bookingData.travelers[0].documents[0],
                            expiryDate: e.target.value
                          }]
                        }]
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Issuing Country</Form.Label>
                    <Form.Select
                      required
                      value={bookingData.travelers[0].documents[0].issuanceCountry}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          documents: [{
                            ...bookingData.travelers[0].documents[0],
                            issuanceCountry: e.target.value
                          }]
                        }]
                      })}
                    >
                      <option value="">Select Country</option>
                      {countryOptions.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nationality</Form.Label>
                    <Form.Select
                      required
                      value={bookingData.travelers[0].documents[0].nationality}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        travelers: [{
                          ...bookingData.travelers[0],
                          documents: [{
                            ...bookingData.travelers[0].documents[0],
                            nationality: e.target.value
                          }]
                        }]
                      })}
                    >
                      <option value="">Select Nationality</option>
                      {countryOptions.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-grid">
            <Button 
              type="submit" 
              variant="primary"
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
});

export default BookingModal;