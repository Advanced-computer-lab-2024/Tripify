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
  FaPlane,
  FaUsers,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FlightBookings = () => {
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
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    if (typeof duration === "string" && duration.includes("PT")) {
      return duration.replace("PT", "").toLowerCase();
    }
    return duration;
  };

  const fetchBookings = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to view bookings");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/flights/bookings/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching flight bookings:", error);
      alert("Error loading flight bookings");
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
        <h2>My Flight Bookings</h2>
        <Button
          variant="outline-primary"
          onClick={() => navigate("/tourist/book-flight")}
        >
          <FaArrowLeft className="me-2" />
          Back to Flight Booking
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
            <h4>No flight bookings found</h4>
            <p>You haven't made any flight bookings yet.</p>
            <Button
              variant="primary"
              onClick={() => navigate("/tourist/book-flight")}
            >
              Book a Flight
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <Card key={booking._id} className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                <div className="d-flex align-items-center">
                  <FaPlane className="me-2" size={20} />
                  <h5 className="mb-0">Flight Booking</h5>
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
                {booking.flightDetails.itineraries.map((itinerary, idx) => (
                  <div key={idx} className="mb-4">
                    <h5 className="mb-3">Flight {idx + 1}</h5>
                    <Row>
                      <Col md={6}>
                        {itinerary.segments.map((segment, segIdx) => (
                          <div key={segIdx} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaPlane className="me-2 text-primary" />
                              <strong>
                                {segment.carrierCode}
                                {segment.number}
                              </strong>
                            </div>
                            <div className="ms-4">
                              <div className="mb-2">
                                <FaCalendarAlt className="me-2 text-primary" />
                                <strong>Departure:</strong>{" "}
                                {formatDate(segment.departure.at)}(
                                {segment.departure.iataCode})
                              </div>
                              <div className="mb-2">
                                <FaCalendarAlt className="me-2 text-primary" />
                                <strong>Arrival:</strong>{" "}
                                {formatDate(segment.arrival.at)}(
                                {segment.arrival.iataCode})
                              </div>
                              <div>
                                <FaClock className="me-2 text-primary" />
                                <strong>Duration:</strong>{" "}
                                {formatDuration(segment.duration)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </Col>
                    </Row>
                  </div>
                ))}

                <div className="border-top pt-3">
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <FaUsers className="me-2 text-primary" />
                        <strong>Passengers:</strong>{" "}
                        {booking.numberOfPassengers}
                      </div>
                      <div>
                        <strong>Total Price:</strong>{" "}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: booking.flightDetails.price.currency,
                        }).format(booking.flightDetails.price.total)}
                      </div>
                    </Col>
                    <Col md={6}>
                      {booking.passengers && booking.passengers[0] && (
                        <div>
                          <div className="mb-2">
                            <strong>Primary Passenger:</strong>{" "}
                            {`${booking.passengers[0].name.title} ${booking.passengers[0].name.firstName} ${booking.passengers[0].name.lastName}`}
                          </div>
                          <div className="text-muted">
                            <strong>Contact:</strong>{" "}
                            {booking.passengers[0].contact.email} |{" "}
                            {booking.passengers[0].contact.phone}
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </div>
              </Card.Body>

              <Card.Footer className="text-muted bg-light">
                <small>
                  Booking Reference: {booking.bookingReference || booking._id}
                </small>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default FlightBookings;
