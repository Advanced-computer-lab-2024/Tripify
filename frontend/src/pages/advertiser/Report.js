import React, { useState, useEffect } from "react";
import { Container, Card, Table, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdvertiserNavbar from "./AdvertiserNavbar";

const TouristReport = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    const fetchTouristReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        const decodedToken = jwtDecode(token);
        const advertiserId = decodedToken._id;
        if (!advertiserId) {
          throw new Error("Invalid token. Advertiser ID missing.");
        }

        let url = `http://localhost:5000/api/advertiser/${advertiserId}/tourist-report`;
        if (dateRange === "custom" && customStartDate && customEndDate) {
          url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
        }

        const response = await axios.get(url);
        setReport(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTouristReport();
  }, [dateRange, customStartDate, customEndDate]);

  const getAttendedTouristCountPerActivity = (activityId) => {
    if (!report || !report.bookings) return 0;
    return report.bookings.filter(
      (booking) => booking.itemId?._id === activityId && booking.status === "attended"
    ).length;
  };

  const calculateTotals = () => {
    if (!report || !report.activities) return {
      totalActivities: 0,
      totalTourists: 0,
      averageAttendance: 0,
      completionRate: 0
    };

    const totalActivities = report.activities.length;
    const totalTourists = report.totalTourists;
    const totalAttended = report.bookings?.filter(b => b.status === "attended").length || 0;
    const totalBookings = report.bookings?.length || 0;
    
    return {
      totalActivities,
      totalTourists,
      averageAttendance: totalActivities ? (totalAttended / totalActivities).toFixed(1) : 0,
      completionRate: totalBookings ? ((totalAttended / totalBookings) * 100).toFixed(1) : 0
    };
  };

  const groupActivitiesByMonth = () => {
    if (!report || !report.activities) return [];
    
    const grouped = report.activities.reduce((acc, activity) => {
      const date = new Date(activity.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          totalActivities: 0,
          totalAttendees: 0,
        };
      }
      
      acc[monthYear].totalActivities += 1;
      acc[monthYear].totalAttendees += getAttendedTouristCountPerActivity(activity._id);
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const filterActivitiesByName = (activities) => {
    if (!nameFilter) return activities;
    return activities.filter((activity) =>
      activity.name.toLowerCase().includes(nameFilter.toLowerCase())
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

  const totals = calculateTotals();
  const monthlyData = groupActivitiesByMonth();
  const filteredActivities = filterActivitiesByName(report?.activities || []);

  return (
    <div className="min-h-screen bg-gray-50">
        <AdvertiserNavbar/>
      <div style={{ paddingTop: "64px" }}>
        <Container className="py-4">
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: "#FF6F00", color: "#FFF" }}>
              <h4 className="mb-0">Tourist Activity Report</h4>
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
                    <Form.Label>Filter by Activity Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter activity name..."
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
                          <Card.Title>Total Activities</Card.Title>
                          <h3 className="text-primary">{totals.totalActivities}</h3>
                          <small className="text-muted">Activities Created</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center h-100 border-primary">
                        <Card.Body>
                          <Card.Title>Total Tourists</Card.Title>
                          <h3 className="text-primary">{totals.totalTourists}</h3>
                          <small className="text-muted">Registered Tourists</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center h-100 border-success">
                        <Card.Body>
                          <Card.Title>Average Attendance</Card.Title>
                          <h3 className="text-success">{totals.averageAttendance}</h3>
                          <small className="text-muted">Tourists per Activity</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center h-100 border-info">
                        <Card.Body>
                          <Card.Title>Completion Rate</Card.Title>
                          <h3 className="text-info">{totals.completionRate}%</h3>
                          <small className="text-muted">Booking Completion</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <h5>Monthly Activities Overview</h5>
                    <Table striped bordered hover responsive>
                      <thead className="bg-light">
                        <tr>
                          <th>Month</th>
                          <th>Total Activities</th>
                          <th>Total Attendees</th>
                          <th>Average Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((data, index) => (
                          <tr key={index}>
                            <td>{data.month}</td>
                            <td>{data.totalActivities}</td>
                            <td>{data.totalAttendees}</td>
                            <td>
                              {(data.totalAttendees / data.totalActivities).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <div>
                    <h5>Activity Details</h5>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="bg-light">
                          <tr>
                            <th>Date</th>
                            <th>Activity Name</th>
                            <th>Description</th>
                            <th>Attended Tourists</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredActivities.map((activity) => (
                            <tr key={activity._id}>
                              <td>
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </td>
                              <td>{activity.name}</td>
                              <td>{activity.description}</td>
                              <td>{getAttendedTouristCountPerActivity(activity._id)}</td>
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

export default TouristReport;