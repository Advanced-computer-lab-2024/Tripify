import React, { useState, useEffect } from "react";
import { Card, Table, Row, Col, Spinner, Alert, Form, Button } from "react-bootstrap";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import AdvertiserNavbar from "./AdvertiserNavbar";

const AdvertiserSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformFees: 0,
    netRevenue: 0,
    totalBookings: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    activityName: "",
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode(token);
      const advertiserId = decoded._id;

      const activitiesResponse = await axios.get(
        `http://localhost:5000/api/advertiser/activities/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const activityIds = activitiesResponse.data.map((activity) => activity._id);
      const allBookings = [];
      for (const activityId of activityIds) {
        const bookingsResponse = await axios.get(
          `http://localhost:5000/api/bookings/item/Activity/${activityId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        allBookings.push(
          ...bookingsResponse.data.data.map((booking) => ({
            ...booking,
            activityName: activitiesResponse.data.find(
              (activity) => activity._id === booking.itemId
            )?.name || "Unknown Activity",
            price: activitiesResponse.data.find(
              (activity) => activity._id === booking.itemId
            )?.price || 0,
          }))
        );
      }

      const totalRevenue = allBookings.reduce(
        (sum, booking) =>
          ["attended", "confirmed"].includes(booking.status)
            ? sum + (booking.price || 0)
            : sum,
        0
      );
      const platformFees = totalRevenue * 0.1;
      const netRevenue = totalRevenue - platformFees;

      setSummary({
        totalRevenue,
        platformFees,
        netRevenue,
        totalBookings: allBookings.length,
      });
      setBookings(allBookings);
      setFilteredBookings(allBookings); // Initially, all bookings are shown
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError(error.message || "Error loading sales data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    const filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      const matchesStartDate =
        !filters.startDate || bookingDate >= new Date(filters.startDate);
      const matchesEndDate =
        !filters.endDate || bookingDate <= new Date(filters.endDate);
      const matchesActivityName =
        filters.activityName === "" ||
        booking.activityName?.toLowerCase().includes(filters.activityName.toLowerCase());

      return matchesStartDate && matchesEndDate && matchesActivityName;
    });

    setFilteredBookings(filtered);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </div>
    );

  return (
    <div>
      <AdvertiserNavbar />
      {/* Ensure padding to prevent content overlap */}
      <div className="p-4 mt-5">
        <h2 className="text-center mb-4">Advertiser Sales Report</h2>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="p-3 text-center shadow-sm">
              <h6>Total Revenue</h6>
              <h4 className="text-success">${summary.totalRevenue.toFixed(2)}</h4>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center shadow-sm">
              <h6>Platform Fees</h6>
              <h4 className="text-danger">${summary.platformFees.toFixed(2)}</h4>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center shadow-sm">
              <h6>Net Revenue</h6>
              <h4 className="text-primary">${summary.netRevenue.toFixed(2)}</h4>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center shadow-sm">
              <h6>Total Bookings</h6>
              <h4>{summary.totalBookings}</h4>
            </Card>
          </Col>
        </Row>
        <Form className="p-4 bg-light rounded shadow-sm mb-4">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Activity Name</Form.Label>
                <Form.Control
                  type="text"
                  name="activityName"
                  value={filters.activityName}
                  onChange={handleFilterChange}
                  placeholder="Filter by Activity Name"
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            className="mt-3"
            onClick={() => setFilteredBookings(bookings)}
          >
            Reset Filters
          </Button>
        </Form>
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th>Booking Date</th>
              <th>Status</th>
              <th>Activity Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td>{booking.status}</td>
                  <td>{booking.activityName}</td>
                  <td>${booking.price.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No bookings match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AdvertiserSalesReport;
