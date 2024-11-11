import React, { useState, useEffect } from 'react';
import { Table, Container, Badge, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ArchivedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = "http://localhost:5000/api";
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchArchivedProducts();
  }, []);

  const fetchArchivedProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/products/archived`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'User-Role': userRole
          }
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching archived products:', error);
      setError('Failed to load archived products');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/products/${productId}/archive`,
        { isArchived: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove unarchived product from the displayed list
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error('Error unarchiving product:', error);
      setError('Error unarchiving product');
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
              {userRole === 'admin' && <th>Seller</th>}
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
                {userRole === 'admin' && (
                  <td>{product.seller?.username || 'Unknown Seller'}</td>
                )}
                <td>{new Date(product.updatedAt).toLocaleDateString()}</td>
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
