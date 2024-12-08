import React, { useState, useEffect } from "react";
import { Card, Table, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

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
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error)
    return (
      <Alert variant="danger" className="mt-5">
        {error}
      </Alert>
    );

  return (
    <div className="p-4">
      <h2 className="mb-4">Advertiser Sales Report</h2>
      <Row>
        <Col>Total Revenue: ${summary.totalRevenue.toFixed(2)}</Col>
        <Col>Platform Fees: ${summary.platformFees.toFixed(2)}</Col>
        <Col>Net Revenue: ${summary.netRevenue.toFixed(2)}</Col>
        <Col>Total Bookings: {summary.totalBookings}</Col>
      </Row>
      <Form className="my-4">
        <Row>
          <Col md={4}>
            <Form.Control
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Start Date"
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="End Date"
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              name="activityName"
              value={filters.activityName}
              onChange={handleFilterChange}
              placeholder="Filter by Activity Name"
            />
          </Col>
        </Row>
      </Form>
      <Table striped bordered className="mt-4">
        <thead>
          <tr>
            <th>Booking Date</th>
            <th>Status</th>
            <th>Activity Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking) => (
            <tr key={booking._id}>
              <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
              <td>{booking.status}</td>
              <td>{booking.activityName}</td>
              <td>${booking.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdvertiserSalesReport;
