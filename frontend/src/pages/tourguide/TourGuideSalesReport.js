import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Spinner, Alert, Row, Col, Form, Container } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TourguideNavbar from "./TourguideNavbar";

const TourGuideSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformFees: 0,
    netRevenue: 0,
    totalBookings: 0,
    itinerarySummary: {}
  });

  const [nameFilter, setNameFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode(token);
      const guideId = decoded._id;

      const response = await axios.get(
        `http://localhost:5000/api/bookings/guide/${guideId}/sales`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchedBookings = response.data.data.bookings;
      setSummary(response.data.data.summary);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError(error.message || "Error loading sales data");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const nameMatch = booking.itineraryName.toLowerCase().includes(nameFilter.toLowerCase());
      const startDateMatch = !startDate || bookingDate >= new Date(startDate);
      const endDateMatch = !endDate || bookingDate <= new Date(endDate);
      return nameMatch && startDateMatch && endDateMatch;
    });
  }, [bookings, nameFilter, startDate, endDate]);

  const filteredSummary = useMemo(() => ({
    totalRevenue: filteredBookings.reduce((sum, booking) => sum + booking.itemId.totalPrice, 0),
    platformFees: filteredBookings.reduce((sum, booking) => sum + (booking.itemId.totalPrice * 0.1), 0),
    netRevenue: filteredBookings.reduce((sum, booking) => sum + (booking.itemId.totalPrice * 0.9), 0),
    totalBookings: filteredBookings.length
  }), [filteredBookings]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <TourguideNavbar />
      <Container style={{ marginTop: "80px" }}>
        {/* Filters */}
        <Card className="mb-4">
          <Card.Header>
            <Card.Title>Filters</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Search Itineraries</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search itineraries..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Total Revenue</h6>
                <h3 className="text-success mb-0">
                  ${filteredSummary.totalRevenue.toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Platform Fees</h6>
                <h3 className="text-danger mb-0">
                  -${filteredSummary.platformFees.toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Net Revenue</h6>
                <h3 className="text-success mb-0">
                  ${filteredSummary.netRevenue.toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Total Bookings</h6>
                <h3 className="mb-0">{filteredSummary.totalBookings}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bookings Table */}
        <Card>
          <Card.Body>
            <h3 className="mb-4">Booking Details</h3>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Itinerary</th>
                  <th>Tags</th>
                  <th className="text-end">Total Revenue</th>
                  <th className="text-end">Platform Fee</th>
                  <th className="text-end">Net Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>{booking.itineraryName}</td>
                    <td>
                      {booking.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary me-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td className="text-end">${booking.itemId.totalPrice.toFixed(2)}</td>
                    <td className="text-end text-danger">-${(booking.itemId.totalPrice * 0.1).toFixed(2)}</td>
                    <td className="text-end text-success">${(booking.itemId.totalPrice * 0.9).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === "attended"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TourGuideSalesReport;
