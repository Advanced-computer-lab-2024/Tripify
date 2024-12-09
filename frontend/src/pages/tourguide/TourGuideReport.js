import React, { useState, useEffect } from "react";
import { Container, Card, Table, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import TourguideNavbar from "./TourguideNavbar";

const TourGuideReport = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    itineraries: [],
    bookings: [],
    totalTourists: 0,
    itinerariesCount: 0,
  });
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    const fetchTourGuideReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to view the report.");
        const decodedToken = jwtDecode(token);
        const guideId = decodedToken._id;
        if (!guideId) throw new Error("Invalid token. Unable to identify user.");

        const url = `http://localhost:5000/api/tourguide/${guideId}/get-report`;

        const response = await axios.get(url);
        setReport(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTourGuideReport();
  }, []);

  const filterItinerariesByDate = (itineraries) => {
    if (dateRange === "all") return itineraries;

    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (dateRange === "today") {
      startDate = new Date().setHours(0, 0, 0, 0);
      endDate = new Date().setHours(23, 59, 59, 999);
    } else if (dateRange === "week") {
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
      startDate = firstDayOfWeek;
      endDate = lastDayOfWeek;
    } else if (dateRange === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    }

    return itineraries.filter((itinerary) => {
      const itineraryDate = new Date(itinerary.createdAt);
      return itineraryDate >= startDate && itineraryDate <= endDate;
    });
  };

  const filterItinerariesByName = (itineraries) => {
    if (!nameFilter) return itineraries;
    return itineraries.filter((itinerary) =>
      itinerary.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  };

  const calculateTotalAttendees = (itineraries) => {
    return itineraries.reduce((total, itinerary) => total + (itinerary.attendeesCount || 0), 0);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const filteredItineraries = filterItinerariesByDate(
    filterItinerariesByName(report.itineraries || [])
  );
  const totalAttendees = calculateTotalAttendees(filteredItineraries);

  return (
    <div className="min-h-screen bg-gray-50">
      <TourguideNavbar />
      <div style={{ paddingTop: "64px" }}>
        <Container className="py-4">
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: "#FF6F00", color: "#FFF" }}>
              <h4 className="mb-0">Tour Guide Report</h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date Range</Form.Label>
                    <Form.Select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="mb-2"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="custom">Custom Range</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {dateRange === "custom" && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Custom Range</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                        <Form.Control
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                )}
              </Row>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Filter by Itinerary Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter itinerary name..."
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Card className="text-center h-100 border-success">
                        <Card.Body>
                          <Card.Title>Total Attendees</Card.Title>
                          <h3 className="text-success">{totalAttendees}</h3>
                          <small className="text-muted">Across all filtered itineraries</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <div>
                    <h5>Itinerary Details</h5>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="bg-light">
                          <tr>
                            <th>Date</th>
                            <th>Itinerary Name</th>
                            <th>Description</th>
                            <th>Attendees</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItineraries.map((itinerary) => (
                            <tr key={itinerary._id}>
                              <td>
                                {new Date(itinerary.createdAt).toLocaleDateString()}
                              </td>
                              <td>{itinerary.name}</td>
                              <td>{itinerary.description || "No description"}</td>
                              <td>{itinerary.attendeesCount || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default TourGuideReport;
