import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Badge,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import {
  FaHotel,
  FaUsers,
  FaBed,
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HotelBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.user?._id || decoded.userId || decoded.id || decoded._id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${nights} ${nights === 1 ? "night" : "nights"}`;
  };

  const fetchBookings = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to view bookings");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/hotels/bookings/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Hotel bookings:", response.data);
      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching hotel bookings:", error);
      alert("Error loading hotel bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Hotel Bookings</h2>
        <Button
          variant="outline-primary"
          onClick={() => navigate("/tourist/book-hotel")}
        >
          <FaArrowLeft className="me-2" />
          Back to Hotel Booking
        </Button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h4>No hotel bookings found</h4>
            <p>You haven't made any hotel bookings yet.</p>
            <Button
              variant="primary"
              onClick={() => navigate("/tourist/book-hotel")}
            >
              Book a Hotel
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <Card key={booking._id} className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                <div className="d-flex align-items-center">
                  <FaHotel className="me-2" size={20} />
                  <h5 className="mb-0">Hotel Booking</h5>
                </div>
                <Badge
                  bg={booking.status === "confirmed" ? "success" : "secondary"}
                  className="px-3 py-2"
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </Badge>
              </Card.Header>

              <Card.Body>
                <h4 className="mb-4">{booking.hotelDetails.name}</h4>

                <Row>
                  <Col md={6}>
                    <div className="mb-3 d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-primary" />
                      <div>
                        <strong>Check-in:</strong>{" "}
                        {formatDate(booking.checkInDate)}
                      </div>
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-primary" />
                      <div>
                        <strong>Check-out:</strong>{" "}
                        {formatDate(booking.checkOutDate)}
                      </div>
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      <div>
                        <strong>City Code:</strong>{" "}
                        {booking.hotelDetails.cityCode}
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Duration:</strong>{" "}
                      {calculateDuration(
                        booking.checkInDate,
                        booking.checkOutDate
                      )}
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                      <FaUsers className="me-2 text-primary" />
                      <div>
                        <strong>Guests:</strong> {booking.numberOfGuests}
                      </div>
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                      <FaBed className="me-2 text-primary" />
                      <div>
                        <strong>Rooms:</strong> {booking.numberOfRooms}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Total Price:</strong>{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: booking.totalPrice.currency || "USD",
                      }).format(booking.totalPrice.amount)}
                    </div>
                  </Col>
                </Row>

                {booking.guests && booking.guests[0] && (
                  <div className="border-top pt-3 mt-3">
                    <div className="mb-2">
                      <strong>Primary Guest:</strong>{" "}
                      {`${booking.guests[0].name.title} ${booking.guests[0].name.firstName} ${booking.guests[0].name.lastName}`}
                    </div>
                    {booking.guests[0].contact && (
                      <div className="text-muted">
                        <strong>Contact:</strong>{" "}
                        {booking.guests[0].contact.email} |{" "}
                        {booking.guests[0].contact.phone}
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>

              <Card.Footer className="text-muted bg-light">
                <small>Booking ID: {booking._id}</small>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default HotelBookings;
