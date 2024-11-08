import React, { memo } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaStar, FaBed, FaUsers, FaCalendarAlt } from "react-icons/fa";

const HotelCard = memo(({ hotel, onBook, formatPrice, searchParams }) => {
  // Safely access hotel data
  const hotelData = hotel?.hotel || {};
  const offerData = hotel?.offers?.[0] || {};

  // Calculate nights
  const getNights = () => {
    const checkIn = new Date(searchParams.checkInDate);
    const checkOut = new Date(searchParams.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="mb-3 shadow-sm hover-shadow">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={8}>
            {/* Hotel Name and Rating */}
            <h5 className="mb-2">
              {hotelData.name}
              {hotelData.rating && (
                <span className="ms-2">
                  {[...Array(parseInt(hotelData.rating))].map((_, i) => (
                    <FaStar key={i} className="text-warning" />
                  ))}
                </span>
              )}
            </h5>

            {/* Location */}
            <p className="text-muted mb-2">
              {hotelData.address?.cityName}, {hotelData.address?.countryCode}
            </p>

            {/* Stay Details */}
            <div className="small text-muted mb-2">
              <div className="mb-1">
                <FaCalendarAlt className="me-2" />
                Check-in: {formatDate(searchParams.checkInDate)}
              </div>
              <div className="mb-1">
                <FaCalendarAlt className="me-2" />
                Check-out: {formatDate(searchParams.checkOutDate)}
              </div>
              <div className="mb-1">
                <FaUsers className="me-2" />
                {searchParams.adults} Guests
              </div>
              <div>
                <FaBed className="me-2" />
                {searchParams.rooms}{" "}
                {searchParams.rooms === 1 ? "Room" : "Rooms"}
              </div>
            </div>

            {/* Room Type */}
            {offerData.room?.type && (
              <div className="small">
                <strong>Room Type:</strong> {offerData.room.type}
              </div>
            )}

            {/* Cancellation Policy */}
            {offerData.policies?.cancellation?.description && (
              <div className="small text-muted mt-1">
                <strong>Cancellation:</strong>{" "}
                {offerData.policies.cancellation.description}
              </div>
            )}
          </Col>

          {/* Price and Booking */}
          <Col md={4} className="text-end">
            <div className="h3 mb-1">{formatPrice(offerData.price)}</div>
            <div className="text-muted small mb-3">
              per night • {getNights()} nights total
            </div>
            <div className="d-grid">
              <Button variant="primary" onClick={() => onBook(hotel)}>
                Book Now
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

export default HotelCard;
