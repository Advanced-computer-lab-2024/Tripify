import React, { useState, useCallback } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaHotel,
  FaCalendarAlt,
  FaUsers,
  FaBed,
  FaSearch,
} from "react-icons/fa";
import axios from "axios";
import HotelCard from "./HotelCard";
import HotelBookingModal from "./HotelBookingModal";

const HotelBooking = () => {
  // Search states
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

  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Format price helper
  const formatPrice = useCallback((price) => {
    if (!price || !price.total) return "Price not available";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency || "USD",
    }).format(price.total);
  }, []);

  // Handle city input
  const handleCityChange = (e) => {
    let cityCode = e.target.value.toUpperCase();
    // Limit to 3 characters for IATA city codes
    cityCode = cityCode.replace(/[^A-Z]/g, "").slice(0, 3);
    setSearchParams((prev) => ({
      ...prev,
      cityCode,
    }));
  };

  // Handle search
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
    <Container className="py-4">
      {/* Search Form */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <Card.Title className="h4 mb-0">Search Hotels</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              {/* City Input */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    <FaHotel className="me-2" />
                    City Code (3 letters, e.g., NYC, LON, PAR)
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Enter city code"
                      value={searchParams.cityCode}
                      onChange={handleCityChange}
                      minLength={3}
                      maxLength={3}
                      style={{ textTransform: "uppercase" }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        setSearchParams((prev) => ({ ...prev, cityCode: "" }))
                      }
                    >
                      Clear
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Enter the 3-letter IATA code for your destination city
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Other form fields remain the same */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    Check-in Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={searchParams.checkInDate}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        checkInDate: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    Check-out Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={searchParams.checkOutDate}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        checkOutDate: e.target.value,
                      }))
                    }
                    min={
                      searchParams.checkInDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaUsers className="me-2" />
                    Number of Guests
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={searchParams.adults}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        adults: parseInt(e.target.value),
                      }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaBed className="me-2" />
                    Number of Rooms
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    max="5"
                    value={searchParams.rooms}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        rooms: parseInt(e.target.value),
                      }))
                    }
                  />
                </Form.Group>
              </Col>

              {/* Search Button */}
              <Col xs={12}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading || searchParams.cityCode.length !== 3}
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
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Results Count */}
      {hotels.length > 0 && (
        <Alert variant="info" className="mb-4">
          Found {hotels.length} hotels matching your criteria
        </Alert>
      )}

      {/* Hotel Results */}
      {hotels.length > 0 && (
        <>
          <h2 className="h4 mb-3">Available Hotels</h2>
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.hotel.hotelId}
              hotel={hotel}
              onBook={handleBookingClick}
              formatPrice={formatPrice}
              searchParams={searchParams}
            />
          ))}
        </>
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
  );
};

export default HotelBooking;
