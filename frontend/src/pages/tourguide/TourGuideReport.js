import React, { useState, useEffect } from "react";
import { Container, Card, Table, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
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

        let url = `http://localhost:5000/api/tourguide/${guideId}/get-report`;
        if (dateRange === "custom" && customStartDate && customEndDate) {
          url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
        }

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
  }, [dateRange, customStartDate, customEndDate]);

  const calculateStats = () => {
    if (!report.bookings || !report.itineraries) return {
      totalItineraries: 0,
      totalTourists: 0,
      averageGroupSize: 0,
      completionRate: 0
    };

    const totalItineraries = report.itinerariesCount;
    const totalTourists = report.totalTourists;
    const completedBookings = report.bookings.filter(b => b.status === "completed").length;
    const totalBookings = report.bookings.length;

    return {
      totalItineraries,
      totalTourists,
      averageGroupSize: totalItineraries ? (totalTourists / totalItineraries).toFixed(1) : 0,
      completionRate: totalBookings ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0
    };
  };

  const groupItinerariesByMonth = () => {
    if (!report.itineraries) return [];
    
    const grouped = report.itineraries.reduce((acc, itinerary) => {
      const date = new Date(itinerary.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          totalItineraries: 0,
          totalTourists: 0,
        };
      }
      
      acc[monthYear].totalItineraries += 1;
      acc[monthYear].totalTourists += itinerary.attendeesCount || 0;
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const filterItinerariesByName = (itineraries) => {
    if (!nameFilter) return itineraries;
    return itineraries.filter((itinerary) =>
      itinerary.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
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

  const stats = calculateStats();
  const monthlyData = groupItinerariesByMonth();
  const filteredItineraries = filterItinerariesByName(report.itineraries || []);

  return (
    <div className="min-h-screen bg-gray-50">
       <TourguideNavbar/>
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
                  <Row className="mb-4 g-3">
                    <Col md={3}>
                      <Card className="text-center h-100 border-primary">
                        <Card.Body>
                          <Card.Title>Total Itineraries</Card.Title>
                          <h3 className="text-primary">{stats.totalItineraries}</h3>
                          <small className="text-muted">Itineraries Created</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center h-100 border-primary">
                        <Card.Body>
                          <Card.Title>Total Tourists</Card.Title>
                          <h3 className="text-primary">{stats.totalTourists}</h3>
                          <small className="text-muted">Tourists Guided</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center h-100 border-success">
                        <Card.Body>
                          <Card.Title>Average Group Size</Card.Title>
                          <h3 className="text-success">{stats.averageGroupSize}</h3>
                          <small className="text-muted">Tourists per Itinerary</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center h-100 border-info">
                        <Card.Body>
                          <Card.Title>Completion Rate</Card.Title>
                          <h3 className="text-info">{stats.completionRate}%</h3>
                          <small className="text-muted">Tour Completion</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <h5>Monthly Overview</h5>
                    <Table striped bordered hover responsive>
                      <thead className="bg-light">
                        <tr>
                          <th>Month</th>
                          <th>Total Itineraries</th>
                          <th>Total Tourists</th>
                          <th>Average Group Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((data, index) => (
                          <tr key={index}>
                            <td>{data.month}</td>
                            <td>{data.totalItineraries}</td>
                            <td>{data.totalTourists}</td>
                            <td>
                              {(data.totalTourists / data.totalItineraries).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

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
                              <td>{itinerary.description || 'No description'}</td>
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