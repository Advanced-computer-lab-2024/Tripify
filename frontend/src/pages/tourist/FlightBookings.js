import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlane,
  FaUsers,
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChevronRight,
  FaInfoCircle,
  FaCreditCard,
  FaCheck,
  FaClock
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
    <>
      <Navbar />
      <div className="flight-bookings-page">
        {/* Hero Section */}
        <div
          style={{
            backgroundImage: 'url("/images/bg_1.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            padding: "8rem 0 4rem 0",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }}
          ></div>
          <Container style={{ position: "relative", zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/tourist" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  Flight Bookings <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">My Flight Bookings</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          {/* Action Button */}
          <Card
            className="shadow-sm mb-5"
            style={{
              borderRadius: "15px",
              border: "none",
              backgroundImage: 'url("/images/bg_2.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                borderRadius: "15px",
                zIndex: 1,
              }}
            />
            <Card.Body className="p-4 position-relative" style={{ zIndex: 2 }}>
              <div className="d-flex justify-content-between align-items-center text-white">
                <div className="d-flex align-items-center">
                  <FaPlane className="me-3" size={30} />
                  <h3 className="mb-0">Your Flight Reservations</h3>
                </div>
                <Button
                  variant="light"
                  onClick={() => navigate("/tourist/book-flight")}
                  className="rounded-pill px-4"
                >
                  <FaArrowLeft className="me-2" />
                  Book New Flight
                </Button>
              </div>
            </Card.Body>
          </Card>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <Card
              className="text-center p-5 shadow-sm"
              style={{
                borderRadius: "15px",
                border: "none",
              }}
            >
              <Card.Body>
                <FaInfoCircle size={48} className="text-muted mb-3" />
                <h4>No Flight Bookings Found</h4>
                <p className="text-muted mb-4">
                  You haven't made any flight reservations yet.
                </p>
                <Button
                  onClick={() => navigate("/tourist/book-flight")}
                  className="rounded-pill px-4"
                  style={{
                    backgroundColor: "#1089ff",
                    border: "none",
                  }}
                >
                  <FaPlane className="me-2" />
                  Book Your First Flight
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {bookings.map((booking) => (
                <Col xs={12} key={booking._id}>
                  <Card
                    className="shadow-hover"
                    style={{
                      borderRadius: "15px",
                      border: "none",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      className="card-header d-flex justify-content-between align-items-center p-4"
                      style={{
                        background: "linear-gradient(to right, #1089ff, #0056b3)",
                        borderTopLeftRadius: "15px",
                        borderTopRightRadius: "15px",
                      }}
                    >
                      <div className="d-flex align-items-center text-white">
                        <FaPlane className="me-2" size={20} />
                        <h5 className="mb-0">Flight Booking</h5>
                      </div>
                      <Badge
                        bg={booking.status === "confirmed" ? "success" : "secondary"}
                        className="px-3 py-2 rounded-pill"
                      >
                        {booking.status === "confirmed" ? (
                          <>
                            <FaCheck className="me-1" /> Confirmed
                          </>
                        ) : (
                          booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)
                        )}
                      </Badge>
                    </div>

                    <Card.Body className="p-4">
                      {booking.flightDetails.itineraries.map((itinerary, idx) => (
                        <div key={idx} className="mb-4">
                          <h6 className="text-primary mb-3">
                            Flight {idx + 1} Details
                          </h6>
                          {itinerary.segments.map((segment, segIdx) => (
                            <Row key={segIdx} className="mb-3">
                              <Col md={6}>
                                <div className="mb-3 d-flex align-items-center">
                                  <FaCalendarAlt className="text-primary me-3" size={20} />
                                  <div>
                                    <div className="text-muted mb-1">Departure</div>
                                    <strong>
                                      {formatDate(segment.departure.at)} ({segment.departure.iataCode})
                                    </strong>
                                  </div>
                                </div>
                                <div className="mb-3 d-flex align-items-center">
                                  <FaCalendarAlt className="text-primary me-3" size={20} />
                                  <div>
                                    <div className="text-muted mb-1">Arrival</div>
                                    <strong>
                                      {formatDate(segment.arrival.at)} ({segment.arrival.iataCode})
                                    </strong>
                                  </div>
                                </div>
                                <div className="mb-3 d-flex align-items-center">
                                  <FaClock className="text-primary me-3" size={20} />
                                  <div>
                                    <div className="text-muted mb-1">Duration</div>
                                    <strong>{formatDuration(segment.duration)}</strong>
                                  </div>
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="mb-3 d-flex align-items-center">
                                  <FaPlane className="text-primary me-3" size={20} />
                                  <div>
                                    <div className="text-muted mb-1">Flight</div>
                                    <strong>
                                      {segment.carrierCode}
                                      {segment.number}
                                    </strong>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      ))}

                      <div className="mt-4 p-4 bg-light rounded-3">
                        <h6 className="text-primary mb-3">Booking Details</h6>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3 d-flex align-items-center">
                              <FaUsers className="text-primary me-3" size={20} />
                              <div>
                                <div className="text-muted mb-1">Passengers</div>
                                <strong>{booking.numberOfPassengers} persons</strong>
                              </div>
                            </div>
                            <div className="mb-3 d-flex align-items-center">
                              <FaCreditCard className="text-primary me-3" size={20} />
                              <div>
                                <div className="text-muted mb-1">Total Price</div>
                                <strong>
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: booking.flightDetails.price.currency,
                                  }).format(booking.flightDetails.price.total)}
                                </strong>
                              </div>
                            </div>
                          </Col>
                          {booking.passengers && booking.passengers[0] && (
                            <Col md={6}>
                              <div className="mb-2">
                                <strong>Primary Passenger:</strong>{" "}
                                {`${booking.passengers[0].name.title} ${booking.passengers[0].name.firstName} ${booking.passengers[0].name.lastName}`}
                              </div>
                              <div className="text-muted">
                                <strong>Contact:</strong>{" "}
                                {booking.passengers[0].contact.email} |{" "}
                                {booking.passengers[0].contact.phone}
                              </div>
                            </Col>
                          )}
                        </Row>
                      </div>
                    </Card.Body>

                    <Card.Footer
                      className="text-muted py-3 px-4"
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderBottomLeftRadius: "15px",
                        borderBottomRightRadius: "15px",
                        borderTop: "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      <small>
                        Booking Reference: {booking.bookingReference || booking._id}
                      </small>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default FlightBookings;