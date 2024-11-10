import React, { useState, memo } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FaCalendarAlt, FaUsers, FaBed, FaDollarSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const countryOptions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "AE", name: "United Arab Emirates" },
];

const HotelBookingModal = memo(
  ({ show, onHide, hotel, formatPrice, searchParams }) => {
    const navigate = useNavigate(); // Add useNavigate hook

    const [bookingData, setBookingData] = useState({
      guests: Array(searchParams.adults)
        .fill()
        .map((_, index) => ({
          id: index + 1,
          name: {
            title: "Mr",
            firstName: "",
            lastName: "",
          },
          contact:
            index === 0
              ? {
                  phone: "",
                  email: "",
                }
              : null,
          address:
            index === 0
              ? {
                  lines: [""],
                  postalCode: "",
                  cityName: "",
                  countryCode: "",
                }
              : null,
        })),
    });

    const [bookingError, setBookingError] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

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

    const getNights = () => {
      const checkIn = new Date(searchParams.checkInDate);
      const checkOut = new Date(searchParams.checkOutDate);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    const getTotalPrice = () => {
      if (!hotel?.offers?.[0]?.price?.total) return null;
      const pricePerNight = parseFloat(hotel.offers[0].price.total);
      const nights = getNights();
      return {
        total: (pricePerNight * nights).toFixed(2),
        currency: hotel.offers[0].price.currency,
      };
    };

    const updateGuestInfo = (index, field, value) => {
      setBookingData((prev) => {
        const newGuests = [...prev.guests];
        const fields = field.split(".");
        let current = newGuests[index];

        for (let i = 0; i < fields.length - 1; i++) {
          if (!current[fields[i]]) {
            current[fields[i]] = {};
          }
          current = current[fields[i]];
        }
        current[fields[fields.length - 1]] = value;

        return { ...prev, guests: newGuests };
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setBookingLoading(true);
      setBookingError(null);

      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        const formattedGuests = bookingData.guests.map((guest) => ({
          name: {
            title: guest.name.title,
            firstName: guest.name.firstName,
            lastName: guest.name.lastName,
          },
          contact: guest.contact || bookingData.guests[0].contact,
        }));

        const totalPrice = getTotalPrice();

        const response = await axios.post(
          "http://localhost:5000/api/hotels/book",
          {
            guests: formattedGuests,
            userId,
            hotelDetails: {
              hotelId: hotel.hotel.hotelId,
              name: hotel.hotel.name,
              cityCode: searchParams.cityCode,
              rating: hotel.hotel.rating,
            },
            offerId: hotel.offers[0].id,
            checkInDate: searchParams.checkInDate,
            checkOutDate: searchParams.checkOutDate,
            numberOfGuests: searchParams.adults,
            numberOfRooms: searchParams.rooms,
            totalPrice: {
              amount: parseFloat(totalPrice.total),
              currency: totalPrice.currency,
            },
          }
        );

        if (response.data.success) {
          alert("Booking successful!");
          onHide();
          // Change this line to redirect to hotel bookings instead
          navigate("/tourist/hotel-bookings");
        } else {
          throw new Error(response.data.error?.[0]?.detail || "Booking failed");
        }
      } catch (err) {
        console.error("Booking error:", err);
        setBookingError(
          err.message || "Unable to complete booking. Please try again."
        );
      } finally {
        setBookingLoading(false);
      }
    };

    const validateForm = () => {
      for (const guest of bookingData.guests) {
        if (!guest.name.firstName || !guest.name.lastName) {
          return false;
        }
        if (guest.contact && (!guest.contact.phone || !guest.contact.email)) {
          return false;
        }
        if (
          guest.address &&
          (!guest.address.lines[0] ||
            !guest.address.cityName ||
            !guest.address.postalCode ||
            !guest.address.countryCode)
        ) {
          return false;
        }
      }
      return true;
    };
    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Complete Your Hotel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingError && (
            <Alert variant="danger" className="mb-3">
              {bookingError}
            </Alert>
          )}

          {/* Hotel Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Booking Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Hotel:</strong> {hotel.hotel.name}
                  </p>
                  <p className="mb-1">
                    <FaCalendarAlt className="me-2" />
                    <strong>Check-in:</strong> {searchParams.checkInDate}
                  </p>
                  <p className="mb-1">
                    <FaCalendarAlt className="me-2" />
                    <strong>Check-out:</strong> {searchParams.checkOutDate}
                  </p>
                  <p className="mb-1">
                    <FaUsers className="me-2" />
                    <strong>Guests:</strong> {searchParams.adults}
                  </p>
                  <p className="mb-0">
                    <FaBed className="me-2" />
                    <strong>Rooms:</strong> {searchParams.rooms}
                  </p>
                </Col>
                <Col md={6} className="text-md-end">
                  <p className="mb-1">
                    <FaDollarSign className="me-2" />
                    <strong>Price per night:</strong>
                    <br />
                    {formatPrice(hotel.offers[0].price)}
                  </p>
                  {getTotalPrice() && (
                    <p className="mb-0">
                      <strong>Total for {getNights()} nights:</strong>
                      <br />
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: getTotalPrice().currency,
                      }).format(getTotalPrice().total)}
                    </p>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Booking Form */}
          <Form onSubmit={handleSubmit}>
            {bookingData.guests.map((guest, index) => (
              <Card key={index} className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">Guest {index + 1} Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    {/* Title */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Select
                          required
                          value={guest.name.title}
                          onChange={(e) =>
                            updateGuestInfo(index, "name.title", e.target.value)
                          }
                        >
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                          <option value="Dr">Dr</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* First Name */}
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={guest.name.firstName}
                          onChange={(e) =>
                            updateGuestInfo(
                              index,
                              "name.firstName",
                              e.target.value
                            )
                          }
                        />
                      </Form.Group>
                    </Col>

                    {/* Last Name */}
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={guest.name.lastName}
                          onChange={(e) =>
                            updateGuestInfo(
                              index,
                              "name.lastName",
                              e.target.value
                            )
                          }
                        />
                      </Form.Group>
                    </Col>

                    {/* Contact Information - Only for first guest */}
                    {index === 0 && (
                      <>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              required
                              type="email"
                              value={guest.contact?.email || ""}
                              onChange={(e) =>
                                updateGuestInfo(
                                  index,
                                  "contact.email",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                              required
                              type="tel"
                              value={guest.contact?.phone || ""}
                              onChange={(e) =>
                                updateGuestInfo(
                                  index,
                                  "contact.phone",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        {/* Address */}
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              required
                              type="text"
                              value={guest.address?.lines[0] || ""}
                              onChange={(e) =>
                                updateGuestInfo(
                                  index,
                                  "address.lines.0",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              required
                              type="text"
                              value={guest.address?.cityName || ""}
                              onChange={(e) =>
                                updateGuestInfo(
                                  index,
                                  "address.cityName",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                              required
                              type="text"
                              value={guest.address?.postalCode || ""}
                              onChange={(e) =>
                                updateGuestInfo(
                                  index,
                                  "address.postalCode",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Country</Form.Label>
                            <Form.Select
                              required
                              value={guest.address?.countryCode || ""}
                              onChange={(e) =>
                                updateGuestInfo(
                                  index,
                                  "address.countryCode",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Country</option>
                              {countryOptions.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            ))}

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                disabled={bookingLoading || !validateForm()}
                size="lg"
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
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
);

export default HotelBookingModal;
