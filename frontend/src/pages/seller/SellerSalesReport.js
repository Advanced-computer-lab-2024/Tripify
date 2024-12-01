import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Row,
  Col,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SellerSalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      navigate("/auth");
      return;
    }
    fetchSalesData();
  }, [dateRange, customStartDate, customEndDate, navigate]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !user.id || !token) {
        setError("Authentication required. Please login again.");
        navigate("/auth");
        return;
      }

      let url = `http://localhost:5000/api/products/seller-sales/${user.id}`;

      if (dateRange === "custom" && customStartDate && customEndDate) {
        url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSalesData(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch sales data");
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch sales data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totals = salesData.reduce(
      (acc, sale) => {
        const grossRevenue = sale.totalPrice;
        const appFee = grossRevenue * 0.1; // 10% app fee
        const netRevenue = grossRevenue - appFee;

        return {
          grossRevenue: acc.grossRevenue + grossRevenue,
          appFees: acc.appFees + appFee,
          netRevenue: acc.netRevenue + netRevenue,
          totalSales: acc.totalSales + sale.quantity,
        };
      },
      { grossRevenue: 0, appFees: 0, netRevenue: 0, totalSales: 0 }
    );

    return totals;
  };

  const groupSalesByMonth = () => {
    const grouped = salesData.reduce((acc, sale) => {
      const date = new Date(sale.purchaseDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          grossRevenue: 0,
          netRevenue: 0,
          sales: 0,
        };
      }

      acc[monthYear].grossRevenue += sale.totalPrice;
      acc[monthYear].netRevenue += sale.totalPrice * 0.9;
      acc[monthYear].sales += sale.quantity;

      return acc;
    }, {});

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const totals = calculateTotals();
  const monthlyData = groupSalesByMonth();

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Seller Sales Report</h4>
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

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Row className="mb-4 g-3">
                <Col md={3}>
                  <Card className="text-center h-100 border-primary">
                    <Card.Body>
                      <Card.Title>Total Sales</Card.Title>
                      <h3 className="text-primary">{totals.totalSales}</h3>
                      <small className="text-muted">Items Sold</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100 border-primary">
                    <Card.Body>
                      <Card.Title>Gross Revenue</Card.Title>
                      <h3 className="text-primary">
                        ${totals.grossRevenue.toFixed(2)}
                      </h3>
                      <small className="text-muted">Total Revenue</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100 border-danger">
                    <Card.Body>
                      <Card.Title>App Fees (10%)</Card.Title>
                      <h3 className="text-danger">
                        ${totals.appFees.toFixed(2)}
                      </h3>
                      <small className="text-muted">Platform Commission</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100 border-success">
                    <Card.Body>
                      <Card.Title>Net Revenue</Card.Title>
                      <h3 className="text-success">
                        ${totals.netRevenue.toFixed(2)}
                      </h3>
                      <small className="text-muted">After App Fees</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="mb-4">
                <h5>Monthly Sales Overview</h5>
                <Table striped bordered hover responsive>
                  <thead className="bg-light">
                    <tr>
                      <th>Month</th>
                      <th>Sales Count</th>
                      <th>Gross Revenue</th>
                      <th>Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((data, index) => (
                      <tr key={index}>
                        <td>{data.month}</td>
                        <td>{data.sales}</td>
                        <td>${data.grossRevenue.toFixed(2)}</td>
                        <td>${data.netRevenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div>
                <h5>Detailed Sales History</h5>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="bg-light">
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Gross Amount</th>
                        <th>App Fee (10%)</th>
                        <th>Net Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((sale) => (
                        <tr key={sale._id}>
                          <td>
                            {new Date(sale.purchaseDate).toLocaleDateString()}
                          </td>
                          <td>{sale.productId?.name || "Product Deleted"}</td>
                          <td>{sale.quantity}</td>
                          <td>${sale.totalPrice.toFixed(2)}</td>
                          <td className="text-danger">
                            ${(sale.totalPrice * 0.1).toFixed(2)}
                          </td>
                          <td className="text-success">
                            ${(sale.totalPrice * 0.9).toFixed(2)}
                          </td>
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
  );
};

export default SellerSalesReport;
