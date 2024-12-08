import React, { useState, useEffect } from "react";
import { Table, Container, Badge, Button, Alert } from "react-bootstrap";
import axios from "axios";

const ArchivedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = "http://localhost:5000/api";
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    fetchArchivedProducts();
  }, []);

  const fetchArchivedProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/products/archived`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Role": userRole,
        },
      });
  
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to load archived products");
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/products/${productId}/archive`,
        { isArchived: false },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "User-Role": userRole,
          } 
        }
      );

      if (response.data.success) {
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        throw new Error("Failed to unarchive product");
      }
    } catch (error) {
      console.error("Error unarchiving product:", error);
      setError(error.response?.data?.message || "Error unarchiving product");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-4">
      <h2>Archived Products</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {products.length === 0 ? (
        <Alert variant="info">No archived products found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price</th>
              {userRole === "admin" && <th>Merchant Email</th>}
              <th>Archived Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>${product.price.toFixed(2)}</td>
                {userRole === "admin" && (
                  <td>{product.merchantEmail || "Unknown Seller"}</td>
                )}
                <td>
                  {product.archivedAt 
                    ? new Date(product.archivedAt).toLocaleDateString()
                    : new Date(product.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUnarchive(product._id)}
                  >
                    Unarchive
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ArchivedProducts;