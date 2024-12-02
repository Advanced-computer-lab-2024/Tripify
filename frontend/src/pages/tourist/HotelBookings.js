import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";

import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Badge
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHotel,
  FaUsers,
  FaBed,
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChevronRight,
  FaInfoCircle,
  FaCreditCard,
  FaCheck
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
    <>
  <Navbar/>
    <div className="hotel-bookings-page">
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
                Hotel Bookings <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">My Hotel Bookings</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Action Button */}
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
                <h3 className="mb-0">Your Hotel Reservations</h3>
              </div>
              <Button
                variant="light"
                onClick={() => navigate("/tourist/book-hotel")}
                className="rounded-pill px-4"
              >
                <FaArrowLeft className="me-2" />
                Book New Hotel
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
              borderRadius: '15px',
              border: 'none'
            }}
          >
            <Card.Body>
              <FaInfoCircle size={48} className="text-muted mb-3" />
              <h4>No Hotel Bookings Found</h4>
              <p className="text-muted mb-4">You haven't made any hotel reservations yet.</p>
              <Button
                onClick={() => navigate("/tourist/book-hotel")}
                className="rounded-pill px-4"
                style={{
                  backgroundColor: '#1089ff',
                  border: 'none'
                }}
              >
                <FaHotel className="me-2" />
                Book Your First Hotel
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
                    borderRadius: '15px',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div 
                    className="card-header d-flex justify-content-between align-items-center p-4"
                    style={{
                      background: 'linear-gradient(to right, #1089ff, #0056b3)',
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px'
                    }}
                  >
                    <div className="d-flex align-items-center text-white">
                      <FaHotel className="me-2" size={20} />
                      <h5 className="mb-0">{booking.hotelDetails.name}</h5>
                    </div>
                    <Badge 
                      bg={booking.status === "confirmed" ? "success" : "secondary"}
                      className="px-3 py-2 rounded-pill"
                    >
                      {booking.status === "confirmed" ? (
                        <><FaCheck className="me-1" /> Confirmed</>
                      ) : (
                        booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                      )}
                    </Badge>
                  </div>

                  <Card.Body className="p-4">
                    <Row>
                      <Col md={6}>
                        <div className="mb-3 d-flex align-items-center">
                          <FaCalendarAlt className="text-primary me-3" size={20} />
                          <div>
                            <div className="text-muted mb-1">Check-in</div>
                            <strong>{formatDate(booking.checkInDate)}</strong>
                          </div>
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                          <FaCalendarAlt className="text-primary me-3" size={20} />
                          <div>
                            <div className="text-muted mb-1">Check-out</div>
                            <strong>{formatDate(booking.checkOutDate)}</strong>
                          </div>
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                          <FaMapMarkerAlt className="text-primary me-3" size={20} />
                          <div>
                            <div className="text-muted mb-1">Location</div>
                            <strong>{booking.hotelDetails.cityCode}</strong>
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="mb-3 d-flex align-items-center">
                          <FaUsers className="text-primary me-3" size={20} />
                          <div>
                            <div className="text-muted mb-1">Guests</div>
                            <strong>{booking.numberOfGuests} persons</strong>
                          </div>
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                          <FaBed className="text-primary me-3" size={20} />
                          <div>
                            <div className="text-muted mb-1">Rooms</div>
                            <strong>{booking.numberOfRooms} rooms</strong>
                          </div>
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                          <FaCreditCard className="text-primary me-3" size={20} />
                          <div>
                            <div className="text-muted mb-1">Total Price</div>
                            <strong>
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: booking.totalPrice.currency || "USD",
                              }).format(booking.totalPrice.amount)}
                            </strong>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {booking.guests && booking.guests[0] && (
                      <div className="mt-4 p-4 bg-light rounded-3">
                        <h6 className="text-primary mb-3">Primary Guest Details</h6>
                        <Row>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Guest Name:</strong>{" "}
                              {`${booking.guests[0].name.title} ${booking.guests[0].name.firstName} ${booking.guests[0].name.lastName}`}
                            </div>
                          </Col>
                          {booking.guests[0].contact && (
                            <Col md={6}>
                              <div className="mb-2">
                                <strong>Contact:</strong>{" "}
                                {booking.guests[0].contact.email} | {booking.guests[0].contact.phone}
                              </div>
                            </Col>
                          )}
                        </Row>
                      </div>
                    )}
                  </Card.Body>

                  <Card.Footer 
                    className="text-muted py-3 px-4"
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderBottomLeftRadius: '15px',
                      borderBottomRightRadius: '15px',
                      borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <small>Booking ID: {booking._id}</small>
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

export default HotelBookings;
