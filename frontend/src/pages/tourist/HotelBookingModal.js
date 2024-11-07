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
import axios from "axios";

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
    const [bookingData, setBookingData] = useState({
      guests: [
        {
          id: "1",
          name: {
            title: "Mr",
            firstName: "",
            lastName: "",
          },
          contact: {
            phone: "",
            email: "",
          },
          address: {
            lines: [""],
            postalCode: "",
            cityName: "",
            countryCode: "",
          },
        },
      ],
    });

    const [bookingError, setBookingError] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Calculate number of nights
    const getNights = () => {
      const checkIn = new Date(searchParams.checkInDate);
      const checkOut = new Date(searchParams.checkOutDate);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    // Calculate total price
    const getTotalPrice = () => {
      if (!hotel?.offers?.[0]?.price?.total) return null;
      const pricePerNight = parseFloat(hotel.offers[0].price.total);
      const nights = getNights();
      return {
        total: (pricePerNight * nights).toFixed(2),
        currency: hotel.offers[0].price.currency,
      };
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setBookingLoading(true);
      setBookingError(null);

      try {
        // Get the offer ID
        const offerId = hotel.offers[0].id;

        // Format guests data
        const formattedGuests = [
          {
            name: {
              title: bookingData.guests[0].name.title,
              firstName: bookingData.guests[0].name.firstName,
              lastName: bookingData.guests[0].name.lastName,
            },
            contact: {
              phone: bookingData.guests[0].contact.phone,
              email: bookingData.guests[0].contact.email,
            },
          },
        ];

        // Make booking request
        const bookingResponse = await axios.post(
          "http://localhost:5000/api/hotels/book",
          {
            offerId,
            guests: formattedGuests,
          }
        );

        alert(
          `Booking successful!\nReference: ${bookingResponse.data.data.id}`
        );
        onHide();
      } catch (err) {
        console.error("Booking error:", err.response?.data);
        setBookingError(
          err.response?.data?.error?.[0]?.detail ||
            "Unable to complete booking. Please try again."
        );
      } finally {
        setBookingLoading(false);
      }
    };
    // Update guest information
    const updateGuestInfo = (index, field, value) => {
      setBookingData((prev) => {
        const newGuests = [...prev.guests];
        const fields = field.split(".");
        let current = newGuests[index];
        for (let i = 0; i < fields.length - 1; i++) {
          current = current[fields[i]];
        }
        current[fields[fields.length - 1]] = value;
        return { ...prev, guests: newGuests };
      });
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
                    <strong>Check-in:</strong> {searchParams.checkInDate}
                  </p>
                  <p className="mb-1">
                    <strong>Check-out:</strong> {searchParams.checkOutDate}
                  </p>
                  <p className="mb-1">
                    <strong>Guests:</strong> {searchParams.adults}
                  </p>
                  <p className="mb-0">
                    <strong>Rooms:</strong> {searchParams.rooms}
                  </p>
                </Col>
                <Col md={6} className="text-md-end">
                  <p className="mb-1">
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
            {Array.from({ length: parseInt(searchParams.adults) }).map(
              (_, index) => (
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
                            value={bookingData.guests[index]?.name.title}
                            onChange={(e) =>
                              updateGuestInfo(
                                index,
                                "name.title",
                                e.target.value
                              )
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
                            value={bookingData.guests[index]?.name.firstName}
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
                            value={bookingData.guests[index]?.name.lastName}
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
                                value={bookingData.guests[index]?.contact.email}
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
                                value={bookingData.guests[index]?.contact.phone}
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
                                value={
                                  bookingData.guests[index]?.address.lines[0]
                                }
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
                                value={
                                  bookingData.guests[index]?.address.cityName
                                }
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
                                value={
                                  bookingData.guests[index]?.address.postalCode
                                }
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
                                value={
                                  bookingData.guests[index]?.address.countryCode
                                }
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
                                  <option
                                    key={country.code}
                                    value={country.code}
                                  >
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
              )
            )}

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                disabled={bookingLoading}
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
