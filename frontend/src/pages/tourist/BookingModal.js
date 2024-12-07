import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const countryOptions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "JP", name: "Japan" },
  { code: "EG", name: "Egypt" },
  // Add more countries as needed
];

const BookingModal = ({ show, onHide, flight, formatPrice }) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState({
    passengers: [
      {
        name: {
          title: "Mr",
          firstName: "",
          lastName: "",
        },
        contact: {
          phone: "",
          email: "",
        },
        passport: {
          number: "",
          expiryDate: "",
          issuingCountry: "",
          nationality: "",
        },
        dateOfBirth: "",
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleInputChange = (index, field, value) => {
    setBooking((prev) => {
      const newPassengers = [...prev.passengers];
      const fields = field.split(".");
      let current = newPassengers[index];

      for (let i = 0; i < fields.length - 1; i++) {
        if (!current[fields[i]]) {
          current[fields[i]] = {};
        }
        current = current[fields[i]];
      }
      current[fields[fields.length - 1]] = value;

      return { ...prev, passengers: newPassengers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("Please log in to book a flight");
      }

      // Save booking to database
      const dbBooking = await axios.post(
        "http://localhost:5000/api/flights/bookings",
        {
          userId,
          flightDetails: {
            id: flight.id,
            itineraries: flight.itineraries,
            price: flight.price,
          },
          passengers: booking.passengers,
          numberOfPassengers: booking.passengers.length,
          status: "confirmed",
        }
      );

      if (!dbBooking.data.success) {
        throw new Error("Failed to save booking");
      }

      alert("Flight booked successfully!");
      onHide();
      navigate("/tourist/flight-bookings");
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to complete booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="mb-4">
          <h5>Flight Details</h5>
          <p className="mb-2">
            From: {flight.itineraries[0].segments[0].departure.iataCode}
            To:{" "}
            {
              flight.itineraries[0].segments[
                flight.itineraries[0].segments.length - 1
              ].arrival.iataCode
            }
          </p>
          <p className="mb-2">
            Departure:{" "}
            {new Date(
              flight.itineraries[0].segments[0].departure.at
            ).toLocaleString()}
          </p>
          <p className="mb-2">Price: {formatPrice(flight.price)}</p>
        </div>

        <Form onSubmit={handleSubmit}>
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="mb-4">
              <h6 className="border-bottom pb-2">
                Passenger {index + 1} Information
              </h6>

              {/* Personal Information */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">Personal Information</h6>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <Form.Select
                        required
                        value={passenger.name.title}
                        onChange={(e) =>
                          handleInputChange(index, "name.title", e.target.value)
                        }
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Miss">Miss</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={passenger.name.firstName}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "name.firstName",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={passenger.name.lastName}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "name.lastName",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        required
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Passport Information */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">Passport Information</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Passport Number</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={passenger.passport.number}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "passport.number",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Expiry Date</Form.Label>
                      <Form.Control
                        required
                        type="date"
                        value={passenger.passport.expiryDate}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "passport.expiryDate",
                            e.target.value
                          )
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Issuing Country</Form.Label>
                      <Form.Select
                        required
                        value={passenger.passport.issuingCountry}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "passport.issuingCountry",
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nationality</Form.Label>
                      <Form.Select
                        required
                        value={passenger.passport.nationality}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "passport.nationality",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select Nationality</option>
                        {countryOptions.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Contact Information */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">Contact Information</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        required
                        type="email"
                        value={passenger.contact.email}
                        onChange={(e) =>
                          handleInputChange(
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
                        value={passenger.contact.phone}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "contact.phone",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>
          ))}

          <div className="d-grid">
            <Button type="submit" disabled={loading}>
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
};

export default BookingModal;
