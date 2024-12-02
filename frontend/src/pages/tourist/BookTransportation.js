import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
  Spinner
} from "react-bootstrap";
import { Link } from 'react-router-dom';
import {
  FaCar,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaMapMarkerAlt,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaCog
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const BookTransportation = () => {
  const navigate = useNavigate();
  const [transportations, setTransportations] = useState([]);
  const [filteredTransportations, setFilteredTransportations] = useState([]);
  const [filters, setFilters] = useState({
    vehicleType: "",
    priceRange: "",
    capacity: "",
    dateFrom: "",
    dateTo: "",
    features: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const vehicleTypes = ["Car", "Van", "Bus", "Minibus", "Limousine"];
  const priceRanges = [
    { label: "$0 - $50", min: 0, max: 50 },
    { label: "$51 - $100", min: 51, max: 100 },
    { label: "$101 - $200", min: 101, max: 200 },
    { label: "$201 - $500", min: 201, max: 500 },
    { label: "$501+", min: 501, max: 99999 },
  ];
  const features = [
    "Air Conditioning",
    "WiFi",
    "GPS",
    "Entertainment System",
    "Luggage Space",
    "Wheelchair Accessible",
    "Child Seats Available",
    "Driver Included",
  ];

  useEffect(() => {
    fetchTransportations();
  }, []);

  const fetchTransportations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/transportation");
      setTransportations(response.data);
      setFilteredTransportations(response.data);
    } catch (err) {
      setError("Failed to fetch transportation listings");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureFilterChange = (feature) => {
    setFilters(prev => {
      const updatedFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: updatedFeatures };
    });
  };

  const calculateTotalPrice = (price, startDate, endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return days * price;
  };

  const applyFilters = () => {
    let filtered = transportations;

    if (filters.vehicleType) {
      filtered = filtered.filter(t => t.vehicleType === filters.vehicleType);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      filtered = filtered.filter(t => t.price >= min && t.price <= max);
    }

    if (filters.capacity) {
      filtered = filtered.filter(t => t.capacity >= Number(filters.capacity));
    }

    if (filters.dateFrom && filters.dateTo) {
      const startDate = new Date(filters.dateFrom);
      const endDate = new Date(filters.dateTo);
      filtered = filtered.filter(t => {
        const availStart = new Date(t.availabilityStart);
        const availEnd = new Date(t.availabilityEnd);
        return availStart <= startDate && availEnd >= endDate && t.status === "available";
      });
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter(t =>
        filters.features.every(feature => t.features.includes(feature))
      );
    }

    setFilteredTransportations(filtered);
  };

  const resetFilters = () => {
    setFilters({
      vehicleType: "",
      priceRange: "",
      capacity: "",
      dateFrom: "",
      dateTo: "",
      features: [],
    });
    setFilteredTransportations(transportations);
  };

  const handleBooking = async (transport) => {
    if (!filters.dateFrom || !filters.dateTo) {
      setError("Please select both start and end dates");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decoded = jwtDecode(token);
      const totalPrice = calculateTotalPrice(
        transport.price,
        filters.dateFrom,
        filters.dateTo
      );

      if (isNaN(totalPrice) || totalPrice <= 0) {
        setError("Invalid date range selected");
        return;
      }

      const bookingData = {
        transportationId: transport._id,
        touristId: decoded._id,
        startDate: new Date(filters.dateFrom).toISOString(),
        endDate: new Date(filters.dateTo).toISOString(),
        totalPrice,
        status: "pending",
      };

      await axios.post(
        "http://localhost:5000/api/transportation/book",
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(`Booking request sent successfully! Total price: $${totalPrice}`);
      fetchTransportations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book transportation");
    }
  };

  return (
    <>
  <Navbar/>
    <div className="transportation-booking-page">
      {/* Hero Section */}
      <div 
        className="position-relative py-8"
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '8rem 0 4rem 0',
          marginBottom: '2rem'
        }}
      >
        <div 
          className="position-absolute inset-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        />
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <Link to="/tourist" className="text-white text-decoration-none">
                Home <FaChevronRight className="small mx-2" />
              </Link>
              <span>
                Book Transportation <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Find Your Perfect Ride</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}

        {/* Filter Card */}
        <Card className="shadow-sm mb-5" style={{ borderRadius: '15px', border: 'none' }}>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaFilter className="text-primary me-2" size={24} />
              <h3 className="mb-0">Filter Options</h3>
            </div>

            <Form>
              <Row className="g-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCar className="me-2" />
                      Vehicle Type
                    </Form.Label>
                    <Form.Select
                      name="vehicleType"
                      value={filters.vehicleType}
                      onChange={handleFilterChange}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    >
                      <option value="">All Types</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaDollarSign className="me-2" />
                      Price Range
                    </Form.Label>
                    <Form.Select
                      name="priceRange"
                      value={filters.priceRange}
                      onChange={handleFilterChange}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    >
                      <option value="">All Prices</option>
                      {priceRanges.map((range, index) => (
                        <option key={index} value={`${range.min}-${range.max}`}>
                          {range.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaUsers className="me-2" />
                      Minimum Capacity
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="capacity"
                      value={filters.capacity}
                      onChange={handleFilterChange}
                      placeholder="Min. passengers"
                      min="1"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      From Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      To Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      min={filters.dateFrom}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCog className="me-2" />
                      Features
                    </Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      {features.map((feature) => (
                        <Form.Check
                          key={feature}
                          type="checkbox"
                          label={feature}
                          checked={filters.features.includes(feature)}
                          onChange={() => handleFeatureFilterChange(feature)}
                          className="user-select-none"
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <div className="d-flex gap-2">
                    <Button
                      onClick={applyFilters}
                      className="rounded-pill px-4"
                      style={{
                        backgroundColor: '#1089ff',
                        border: 'none'
                      }}
                    >
                      <FaSearch className="me-2" />
                      Apply Filters
                    </Button>
                    <Button
                      variant="light"
                      onClick={resetFilters}
                      className="rounded-pill px-4"
                      style={{
                        border: '2px solid #eee'
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Row className="g-4">
            {filteredTransportations.length === 0 ? (
              <Col xs={12}>
                <Card className="text-center p-5" style={{ borderRadius: '15px', border: 'none' }}>
                  <Card.Body>
                    <FaCar size={48} className="text-muted mb-3" />
                    <h4>No Vehicles Available</h4>
                    <p className="text-muted">Try adjusting your filters to see more options.</p>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              filteredTransportations.map((transport) => (
                <Col md={4} key={transport._id}>
                  <Card 
                    className="h-100 shadow-hover" 
                    style={{
                      borderRadius: '15px',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Card.Body className="p-4">
                      <Card.Title className="mb-3 d-flex justify-content-between align-items-center">
                        <span>{transport.vehicleType} - {transport.model}</span>
                        <Badge 
                          bg={transport.status === 'available' ? 'success' : 'danger'}
                          className="rounded-pill"
                        >
                          {transport.status === 'available' ? 'Available' : 'Unavailable'}
                        </Badge>
                      </Card.Title>

                      <Card.Text>
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex align-items-center">
                            <FaUsers className="text-primary me-2" />
                            <span>
                              <strong>Capacity:</strong> {transport.capacity} passengers
                            </span>
                          </div>

                          <div className="d-flex align-items-center">
                            <FaDollarSign className="text-primary me-2" />
                            <span>
                              <strong>Price:</strong> ${transport.price}/day
                            </span>
                          </div>

                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="text-primary me-2" />
                            <div>
                              <div>
                                <strong>Available From:</strong>{" "}
                                {new Date(transport.availabilityStart).toLocaleDateString()}
                              </div>
                              <div>
                                <strong>Until:</strong>{" "}
                                {new Date(transport.availabilityEnd).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="text-primary me-2" />
                            <div>
                              <div>
                                <strong>Pickup:</strong> {transport.pickupLocation}
                              </div>
                              <div>
                                <strong>Dropoff:</strong> {transport.dropoffLocation}
                              </div>
                            </div>
                          </div>

                          <div>
                            <strong>Features:</strong>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {transport.features.map((feature, index) => (
                                <Badge 
                                  key={index}
                                  bg="light" 
                                  text="dark"
                                  className="rounded-pill"
                                  style={{
                                    border: '1px solid #dee2e6',
                                    padding: '0.5rem 1rem'
                                  }}
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <strong>Description:</strong>
                            <p className="text-muted mt-1 mb-0">
                              {transport.description}
                            </p>
                          </div>
                        </div>
                      </Card.Text>

                      {filters.dateFrom && filters.dateTo && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <div className="fw-bold text-primary mb-2">
                            Total Price for Selected Dates:
                          </div>
                          <div className="h4 mb-0">
                            ${calculateTotalPrice(
                              transport.price,
                              filters.dateFrom,
                              filters.dateTo
                            ).toFixed(2)}
                          </div>
                        </div>
                      )}

                      <Button
                        variant={transport.status === 'available' ? 'primary' : 'secondary'}
                        onClick={() => handleBooking(transport)}
                        disabled={
                          transport.status !== "available" ||
                          !filters.dateFrom ||
                          !filters.dateTo
                        }
                        className="w-100 mt-4 rounded-pill"
                        style={{
                          backgroundColor: transport.status === 'available' ? '#1089ff' : undefined,
                          border: 'none',
                          padding: '0.75rem'
                        }}
                      >
                        {transport.status !== "available"
                          ? "Unavailable"
                          : !filters.dateFrom || !filters.dateTo
                          ? "Select Dates to Book"
                          : "Book Now"}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </Container>
    </div>
    </>

  );
};

export default BookTransportation;