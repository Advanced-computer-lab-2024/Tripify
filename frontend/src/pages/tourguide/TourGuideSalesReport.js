import React, { useState, useEffect } from "react";
import { Card, Table, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TourGuideSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformFees: 0,
    netRevenue: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const decoded = jwtDecode(token);
      const guideId = decoded._id;

      const response = await axios.get(
        `http://localhost:5000/api/bookings/guide/${guideId}/sales`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const bookings = response.data.data.bookings;
      const processedData = processBookingsData(bookings);

      setSalesData(processedData.monthlyData);
      setSummary(processedData.summary);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError(error.message || "Error loading sales data");
    } finally {
      setLoading(false);
    }
  };

  const processBookingsData = (bookings) => {
    const monthlyDataMap = new Map();
    let totalRevenue = 0;

    bookings.forEach((booking) => {
      if (booking.status === "attended" || booking.status === "confirmed") {
        const date = new Date(booking.bookingDate);
        const monthYear = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        const amount = booking.itemId?.totalPrice || 0;

        if (monthlyDataMap.has(monthYear)) {
          const existing = monthlyDataMap.get(monthYear);
          existing.revenue += amount;
          existing.bookings += 1;
          monthlyDataMap.set(monthYear, existing);
        } else {
          monthlyDataMap.set(monthYear, {
            month: monthYear,
            revenue: amount,
            bookings: 1,
          });
        }

        totalRevenue += amount;
      }
    });

    const platformFees = totalRevenue * 0.1; // 10% platform fee
    const netRevenue = totalRevenue - platformFees;

    return {
      monthlyData: Array.from(monthlyDataMap.values()).sort(
        (a, b) => new Date(b.month) - new Date(a.month)
      ),
      summary: {
        totalRevenue,
        platformFees,
        netRevenue,
        totalBookings: bookings.length,
      },
    };
  };

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
    <div className="p-4">
      <h2 className="mb-4">Sales Report</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Revenue</h6>
              <h3 className="text-primary">
                ${summary.totalRevenue.toFixed(2)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Platform Fees (10%)</h6>
              <h3 className="text-danger">
                -${summary.platformFees.toFixed(2)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Net Revenue</h6>
              <h3 className="text-success">${summary.netRevenue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Bookings</h6>
              <h3 className="text-info">{summary.totalBookings}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-4">Monthly Revenue Breakdown</h4>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Revenue</th>
                  <th>Platform Fee (10%)</th>
                  <th>Net Revenue</th>
                  <th>Bookings</th>
                  <th>Average Revenue Per Booking</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((month) => (
                  <tr key={month.month}>
                    <td>{month.month}</td>
                    <td>${month.revenue.toFixed(2)}</td>
                    <td className="text-danger">
                      -${(month.revenue * 0.1).toFixed(2)}
                    </td>
                    <td className="text-success">
                      ${(month.revenue * 0.9).toFixed(2)}
                    </td>
                    <td>{month.bookings}</td>
                    <td>${(month.revenue / month.bookings).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-dark">
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>${summary.totalRevenue.toFixed(2)}</strong>
                  </td>
                  <td>
                    <strong>-${summary.platformFees.toFixed(2)}</strong>
                  </td>
                  <td>
                    <strong>${summary.netRevenue.toFixed(2)}</strong>
                  </td>
                  <td>
                    <strong>{summary.totalBookings}</strong>
                  </td>
                  <td>
                    <strong>
                      $
                      {(summary.totalRevenue / summary.totalBookings).toFixed(
                        2
                      )}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TourGuideSalesReport;
