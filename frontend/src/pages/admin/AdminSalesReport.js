import React, { useState, useEffect } from "react";
import { Card, Table, Spinner, Alert, Row, Col, Form, Container } from "react-bootstrap";
import axios from "axios";
import AdminNavbar from "./AdminNavbar"; // Import the navbar component

const AdminSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawData, setRawData] = useState({
    bookings: [],
    purchases: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [salesData, setSalesData] = useState({
    itineraries: { total: 0, count: 0 },
    activities: { total: 0, count: 0 },
    historicalPlaces: { total: 0, count: 0 },
    products: { 
      total: 0, 
      count: 0,
      cancelledCount: 0,
      cancelledAmount: 0
    }
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Itinerary', label: 'Itineraries' },
    { value: 'Activity', label: 'Activities' },
    { value: 'HistoricalPlace', label: 'Historical Places' },
    { value: 'Product', label: 'Products' }
  ];

  useEffect(() => {
    fetchAllSalesData();
  }, [dateRange, selectedCategory]);

  const fetchAllSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [bookingsRes, purchasesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/bookings/all", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/products/purchase/all", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const bookings = bookingsRes.data.data || [];
      const purchases = purchasesRes.data.data || [];

      const filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        const dateInRange = bookingDate >= new Date(dateRange.startDate) && 
                           bookingDate <= new Date(dateRange.endDate);
        
        if (!dateInRange) return false;
        
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'Product') return false;
        return booking.bookingType === selectedCategory;
      });

      const filteredPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        const dateInRange = purchaseDate >= new Date(dateRange.startDate) && 
                           purchaseDate <= new Date(dateRange.endDate);
        
        if (!dateInRange) return false;
        
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'Product') return true;
        return false;
      });

      setRawData({ 
        bookings: filteredBookings, 
        purchases: filteredPurchases 
      });

      calculateSalesData(filteredBookings, filteredPurchases);

    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to fetch sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateSalesData = (bookings, purchases) => {
    const salesSummary = {
      itineraries: { total: 0, count: 0 },
      activities: { total: 0, count: 0 },
      historicalPlaces: { total: 0, count: 0 },
      products: { 
        total: 0, 
        count: 0,
        cancelledCount: 0,
        cancelledAmount: 0
      }
    };

    bookings.forEach(booking => {
      if (booking.status !== 'cancelled') {
        const price = Number(booking.itemId?.totalPrice || booking.itemId?.price || 0);
        const platformFee = price * 0.1;

        switch (booking.bookingType) {
          case 'Itinerary':
            salesSummary.itineraries.total += platformFee;
            salesSummary.itineraries.count++;
            break;
          case 'Activity':
            salesSummary.activities.total += platformFee;
            salesSummary.activities.count++;
            break;
          case 'HistoricalPlace':
            salesSummary.historicalPlaces.total += platformFee;
            salesSummary.historicalPlaces.count++;
            break;
        }
      }
    });

    purchases.forEach(purchase => {
      const price = Number(purchase.totalPrice || 0);
      if (purchase.status === 'cancelled') {
        salesSummary.products.cancelledCount++;
        salesSummary.products.cancelledAmount += price;
      } else {
        salesSummary.products.total += price * 0.1;
        salesSummary.products.count++;
      }
    });

    setSalesData(salesSummary);
  };

  const calculateTotalRevenue = () => {
    return Object.values(salesData).reduce(
      (sum, category) => sum + (typeof category.total === 'number' ? category.total : 0),
      0
    );
  };

  const calculateTotalTransactions = () => {
    return salesData.itineraries.count +
           salesData.activities.count +
           salesData.historicalPlaces.count +
           salesData.products.count;
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

  return (
    <>
      <AdminNavbar /> {/* Add the navbar */}
      <Container style={{ marginTop: "100px" }}> {/* Main content starts here */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-4">
          <Card.Header>
            <Card.Title>Filters</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
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
                  ${calculateTotalRevenue().toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Total Transactions</h6>
                <h3 className="mb-0">{calculateTotalTransactions()}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Cancelled Orders</h6>
                <h3 className="text-danger mb-0">
                  {salesData.products.cancelledCount}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Lost Revenue</h6>
                <h3 className="text-danger mb-0">
                  ${(salesData.products.cancelledAmount * 0.1).toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Detailed Revenue Table */}
        <Card className="mb-4">
          <Card.Body>
            <h3 className="mb-4">Revenue Breakdown</h3>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-end">Transactions</th>
                  <th className="text-end">Total Sales</th>
                  <th className="text-end">Platform Revenue (10%)</th>
                  <th className="text-end">Avg. Revenue per Transaction</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Itineraries</td>
                  <td className="text-end">{salesData.itineraries.count}</td>
                  <td className="text-end">${(salesData.itineraries.total * 10).toFixed(2)}</td>
                  <td className="text-end">${salesData.itineraries.total.toFixed(2)}</td>
                  <td className="text-end">
                    ${salesData.itineraries.count ? (salesData.itineraries.total / salesData.itineraries.count).toFixed(2) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td>Activities</td>
                  <td className="text-end">{salesData.activities.count}</td>
                  <td className="text-end">${(salesData.activities.total * 10).toFixed(2)}</td>
                  <td className="text-end">${salesData.activities.total.toFixed(2)}</td>
                  <td className="text-end">
                    ${salesData.activities.count ? (salesData.activities.total / salesData.activities.count).toFixed(2) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td>Historical Places</td>
                  <td className="text-end">{salesData.historicalPlaces.count}</td>
                  <td className="text-end">${(salesData.historicalPlaces.total * 10).toFixed(2)}</td>
                  <td className="text-end">${salesData.historicalPlaces.total.toFixed(2)}</td>
                  <td className="text-end">
                    ${salesData.historicalPlaces.count ? (salesData.historicalPlaces.total / salesData.historicalPlaces.count).toFixed(2) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td>Products</td>
                  <td className="text-end">{salesData.products.count}</td>
                  <td className="text-end">${(salesData.products.total * 10).toFixed(2)}</td>
                  <td className="text-end">${salesData.products.total.toFixed(2)}</td>
                  <td className="text-end">
                    ${salesData.products.count ? (salesData.products.total / salesData.products.count).toFixed(2) : '0.00'}
                  </td>
                </tr>
                <tr className="table-dark fw-bold">
                  <td>Total</td>
                  <td className="text-end">{calculateTotalTransactions()}</td>
                  <td className="text-end">${(calculateTotalRevenue() * 10).toFixed(2)}</td>
                  <td className="text-end">${calculateTotalRevenue().toFixed(2)}</td>
                  <td className="text-end">
                    ${calculateTotalTransactions() ? (calculateTotalRevenue() / calculateTotalTransactions()).toFixed(2) : '0.00'}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Cancelled Orders Table */}
        <Card>
          <Card.Body>
            <h3 className="mb-4">Cancelled Orders Details</h3>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-end">Cancelled Count</th>
                  <th className="text-end">Total Cancelled Amount</th>
                  <th className="text-end">Lost Platform Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Products</td>
                  <td className="text-end">{salesData.products.cancelledCount}</td>
                  <td className="text-end">${salesData.products.cancelledAmount.toFixed(2)}</td>
                  <td className="text-end text-danger">
                    ${(salesData.products.cancelledAmount * 0.1).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AdminSalesReport;
