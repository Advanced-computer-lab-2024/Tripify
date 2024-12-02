import React, { useState, useCallback } from "react";
import Navbar from "./components/Navbar";

import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHotel,
  FaCalendarAlt,
  FaUsers,
  FaBed,
  FaSearch,
  FaChevronRight,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaHistory
} from "react-icons/fa";
import axios from "axios";
import HotelCard from "./HotelCard";
import HotelBookingModal from "./HotelBookingModal";

const HotelBooking = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    cityCode: "",
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    rooms: 1,
  });

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const formatPrice = useCallback((price) => {
    if (!price || !price.total) return "Price not available";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency || "USD",
    }).format(price.total);
  }, []);

  const handleCityChange = (e) => {
    let cityCode = e.target.value.toUpperCase();
    cityCode = cityCode.replace(/[^A-Z]/g, "").slice(0, 3);
    setSearchParams((prev) => ({
      ...prev,
      cityCode,
    }));
  };

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      if (searchParams.cityCode.length !== 3) {
        setError(
          "Please enter a valid 3-letter city code (e.g., NYC, LON, PAR)"
        );
        return;
      }

      setLoading(true);
      setError(null);
      setHotels([]);

      try {
        const response = await axios.post(
          "http://localhost:5000/api/hotels/search",
          searchParams
        );

        if (response.data.data) {
          setHotels(response.data.data);
          if (response.data.data.length === 0) {
            setError(
              "No hotels found for your criteria. Please try different dates or location."
            );
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.errors?.[0]?.detail ||
            "Unable to search hotels. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    },
    [searchParams]
  );

  const handleBookingClick = useCallback((hotel) => {
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  }, []);

  return (
    <>
  <Navbar/>
    <div className="hotel-booking-page">
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
                Book Hotel <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Search & Book Hotels</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* View Bookings Button */}
        <Card 
          className="shadow-sm mb-5" 
          style={{ 
            borderRadius: '15px',
            border: 'none',
            backgroundImage: 'url("/images/bg_2.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '15px',
              zIndex: 1
            }}
          />
          <Card.Body className="p-4 position-relative" style={{ zIndex: 2 }}>
            <div className="d-flex justify-content-between align-items-center text-white">
              <div className="d-flex align-items-center">
                <FaHotel className="me-3" size={30} />
                <h3 className="mb-0">Find Your Perfect Stay</h3>
              </div>
              <Button
                variant="light"
                onClick={() => navigate("/tourist/hotel-bookings")}
                className="rounded-pill px-4"
              >
                <FaHistory className="me-2" />
                View My Bookings
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Search Form */}
        <Card 
          className="shadow-sm mb-5" 
          style={{ 
            borderRadius: '15px',
            border: 'none'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaSearch className="text-primary me-3" size={24} />
              <h3 className="mb-0">Search Hotels</h3>
            </div>

            <Form onSubmit={handleSearch}>
              <Row className="g-4">
                {/* City Input */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaMapMarkerAlt className="me-2" />
                      City Code
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Enter city code (e.g., NYC, LON, PAR)"
                      value={searchParams.cityCode}
                      onChange={handleCityChange}
                      minLength={3}
                      maxLength={3}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee',
                        textTransform: "uppercase"
                      }}
                    />
                    <Form.Text className="text-muted">
                      Enter the 3-letter IATA code for your destination city
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Check-in Date */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      Check-in Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      required
                      value={searchParams.checkInDate}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        checkInDate: e.target.value
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Check-out Date */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      Check-out Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      required
                      value={searchParams.checkOutDate}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        checkOutDate: e.target.value
                      }))}
                      min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Number of Guests */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaUsers className="me-2" />
                      Number of Guests
                    </Form.Label>
                    <Form.Control
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={searchParams.adults}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        adults: parseInt(e.target.value)
                      }))}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                {/* Number of Rooms */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaBed className="me-2" />
                      Number of Rooms
                    </Form.Label>
                    <Form.Control
                      type="number"
                      required
                      min="1"
                      max="5"
                      value={searchParams.rooms}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        rooms: parseInt(e.target.value)
                      }))}
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
                    disabled={loading || searchParams.cityCode.length !== 3}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Searching Hotels...
                      </>
                    ) : (
                      <>
                        <FaSearch className="me-2" />
                        Search Hotels
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

        {/* Results Count */}
        {hotels.length > 0 && (
          <div className="mb-4">
            <h3 className="text-primary border-bottom pb-2">
              {hotels.length} Hotels Available
            </h3>
          </div>
        )}

        {/* Hotel Results */}
        {hotels.length > 0 ? (
          <Row className="g-4">
            {hotels.map((hotel) => (
              <Col md={6} key={hotel.hotel.hotelId}>
                <Card 
                  className="h-100 shadow-hover" 
                  style={{
                    borderRadius: '15px',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <Card.Body className="p-4">
                    <HotelCard
                      hotel={hotel}
                      onBook={handleBookingClick}
                      formatPrice={formatPrice}
                      searchParams={searchParams}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
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
              <h4>No Hotels Found</h4>
              <p className="text-muted">Search for hotels to see available options.</p>
            </Card.Body>
          </Card>
        )}

        {/* Booking Modal */}
        {selectedHotel && (
          <HotelBookingModal
            show={showBookingModal}
            onHide={() => setShowBookingModal(false)}
            hotel={selectedHotel}
            formatPrice={formatPrice}
            searchParams={searchParams}
          />
        )}
      </Container>
    </div>
    </>

  );
};

export default HotelBooking;
