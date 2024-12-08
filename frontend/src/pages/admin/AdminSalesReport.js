import React, { useState, useEffect } from "react";
import { Card, Table, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const AdminSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platformRevenue, setPlatformRevenue] = useState({
    itineraries: 0,
    activities: 0,
    products: 0,
    historicalPlaces: 0,
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [itineraryRes, activityRes, productRes, historicalRes] =
        await Promise.all([
          axios.get("http://localhost:5000/api/admin/sales/itineraries", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/sales/activities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/sales/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/sales/historical", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      // Calculate 10% platform fee from each category
      const revenue = {
        itineraries: calculatePlatformFee(itineraryRes.data),
        activities: calculatePlatformFee(activityRes.data),
        products: calculatePlatformFee(productRes.data),
        historicalPlaces: calculatePlatformFee(historicalRes.data),
      };

      setPlatformRevenue(revenue);
    } catch (err) {
      setError("Failed to fetch sales data. Please try again.");
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlatformFee = (sales) => {
    const totalSales = sales.reduce(
      (sum, sale) => sum + (sale.totalPrice || 0),
      0
    );
    return totalSales * 0.1; // 10% platform fee
  };

  const calculateTotalRevenue = () => {
    return Object.values(platformRevenue).reduce(
      (sum, value) => sum + value,
      0
    );
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
      <h2 className="mb-4">Platform Revenue Report (10% from all sales)</h2>

      <Card className="mb-4">
        <Card.Body>
          <div className="text-center mb-4">
            <h3>Total Platform Revenue</h3>
            <h2 className="text-success">
              ${calculateTotalRevenue().toFixed(2)}
            </h2>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Category</th>
                <th>Platform Revenue (10%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Itineraries</td>
                <td className="text-end">
                  ${platformRevenue.itineraries.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Activities</td>
                <td className="text-end">
                  ${platformRevenue.activities.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Products</td>
                <td className="text-end">
                  ${platformRevenue.products.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Historical Places</td>
                <td className="text-end">
                  ${platformRevenue.historicalPlaces.toFixed(2)}
                </td>
              </tr>
              <tr className="table-dark fw-bold">
                <td>Total Platform Revenue</td>
                <td className="text-end">
                  ${calculateTotalRevenue().toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSalesReport;
