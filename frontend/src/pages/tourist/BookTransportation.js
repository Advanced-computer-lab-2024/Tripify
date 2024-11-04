import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

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
      const response = await axios.get(
        "http://localhost:5000/api/transportation"
      );
      setTransportations(response.data);
      setFilteredTransportations(response.data);
    } catch (err) {
      setError("Failed to fetch transportation listings");
      console.error("Error fetching transportations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureFilterChange = (feature) => {
    setFilters((prev) => {
      const updatedFeatures = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: updatedFeatures };
    });
  };

  const calculateBookingDuration = (startDate, endDate) => {
    return Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
  };

  const calculateTotalPrice = (price, startDate, endDate) => {
    const days = calculateBookingDuration(startDate, endDate);
    return days * price;
  };

  const applyFilters = () => {
    let filtered = transportations;

    // Vehicle Type Filter
    if (filters.vehicleType) {
      filtered = filtered.filter((t) => t.vehicleType === filters.vehicleType);
    }

    // Price Range Filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      filtered = filtered.filter((t) => t.price >= min && t.price <= max);
    }

    // Capacity Filter
    if (filters.capacity) {
      filtered = filtered.filter((t) => t.capacity >= Number(filters.capacity));
    }

    // Date Filter
    if (filters.dateFrom && filters.dateTo) {
      const startDate = new Date(filters.dateFrom);
      const endDate = new Date(filters.dateTo);

      filtered = filtered.filter((t) => {
        const availStart = new Date(t.availabilityStart);
        const availEnd = new Date(t.availabilityEnd);
        return (
          availStart <= startDate &&
          availEnd >= endDate &&
          t.status === "available"
        );
      });
    }

    // Features Filter
    if (filters.features.length > 0) {
      filtered = filtered.filter((t) =>
        filters.features.every((feature) => t.features.includes(feature))
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

      // Format dates as ISO strings
      const startDate = new Date(filters.dateFrom);
      const endDate = new Date(filters.dateTo);

      // Calculate total price
      const totalPrice = calculateTotalPrice(
        transport.price,
        startDate,
        endDate
      );

      if (isNaN(totalPrice) || totalPrice <= 0) {
        setError("Invalid date range selected");
        return;
      }

      const bookingData = {
        transportationId: transport._id,
        touristId: decoded._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice,
        status: "pending",
      };

      const response = await axios.post(
        "http://localhost:5000/api/transportation/book",
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(
        `Booking request sent successfully! Total price: $${totalPrice}`
      );
      fetchTransportations(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book transportation");
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Alert variant="info">Loading transportation options...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Book Transportation</h2>

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

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Filter Options</h4>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Type</Form.Label>
                  <Form.Select
                    name="vehicleType"
                    value={filters.vehicleType}
                    onChange={handleFilterChange}
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
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Form.Select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleFilterChange}
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
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={filters.capacity}
                    onChange={handleFilterChange}
                    placeholder="Min. passengers"
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    min={filters.dateFrom}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Features</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Form.Check
                    key={feature}
                    type="checkbox"
                    label={feature}
                    checked={filters.features.includes(feature)}
                    onChange={() => handleFeatureFilterChange(feature)}
                    inline
                  />
                ))}
              </div>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Row>
        {filteredTransportations.length === 0 ? (
          <Col>
            <Alert variant="info">
              No transportation options found matching your criteria.
            </Alert>
          </Col>
        ) : (
          filteredTransportations.map((transport) => (
            <Col md={4} key={transport._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>
                    {transport.vehicleType} - {transport.model}
                  </Card.Title>
                  <Card.Text>
                    <div className="mb-2">
                      <strong>Capacity:</strong> {transport.capacity} passengers
                    </div>
                    <div className="mb-2">
                      <strong>Price:</strong> ${transport.price}/day
                    </div>
                    <div className="mb-2">
                      <strong>Available From:</strong>{" "}
                      {new Date(
                        transport.availabilityStart
                      ).toLocaleDateString()}
                    </div>
                    <div className="mb-2">
                      <strong>Available Until:</strong>{" "}
                      {new Date(transport.availabilityEnd).toLocaleDateString()}
                    </div>
                    <div className="mb-2">
                      <strong>Pickup:</strong> {transport.pickupLocation}
                    </div>
                    <div className="mb-2">
                      <strong>Dropoff:</strong> {transport.dropoffLocation}
                    </div>
                    <div className="mb-2">
                      <strong>Features:</strong>
                      <br />
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {transport.features.map((feature, index) => (
                          <Badge bg="info" key={index} className="me-1 mb-1">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Description:</strong>
                      <br />
                      {transport.description}
                    </div>
                    {filters.dateFrom && filters.dateTo && (
                      <div className="mt-3 p-2 bg-light rounded">
                        <div className="mb-2">
                          <strong>Your Booking:</strong>
                        </div>
                        <div className="small">
                          From:{" "}
                          {new Date(filters.dateFrom).toLocaleDateString()}
                          <br />
                          To: {new Date(filters.dateTo).toLocaleDateString()}
                          <br />
                          Duration:{" "}
                          {calculateBookingDuration(
                            filters.dateFrom,
                            filters.dateTo
                          )}{" "}
                          days
                          <br />
                          Total Price: $
                          {calculateTotalPrice(
                            transport.price,
                            filters.dateFrom,
                            filters.dateTo
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleBooking(transport)}
                    disabled={
                      transport.status !== "available" ||
                      !filters.dateFrom ||
                      !filters.dateTo
                    }
                    className="w-100"
                  >
                    {transport.status !== "available"
                      ? "Unavailable"
                      : !filters.dateFrom || !filters.dateTo
                      ? "Select Dates First"
                      : "Book Now"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default BookTransportation;
