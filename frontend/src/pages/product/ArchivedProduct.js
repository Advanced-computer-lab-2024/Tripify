import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArchivedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unarchiving, setUnarchiving] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchivedProducts();
  }, []);

  const fetchArchivedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products/archived');
      setProducts(response.data.data.products);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch archived products');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (productId) => {
    try {
      setUnarchiving(productId);
      await axios.put(`http://localhost:5000/api/products/archive/${productId}`, {
        isArchived: false
      });
      
      // Remove the unarchived product from the list
      setProducts(products.filter(product => product._id !== productId));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unarchive product');
    } finally {
      setUnarchiving(null);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="mb-3"
        >
          ← Back to Products
        </Button>
        <h2>Archived Products</h2>
      </div>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {products.length === 0 ? (
        <Alert variant="info">
          No archived products found.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {products.map((product) => (
            <Col key={product._id}>
              <Card>
                {product.productImage && product.productImage[0] && (
                  <Card.Img
                    variant="top"
                    src={product.productImage[0].path}
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>
                    Price: ${product.price}
                    <br />
                    Quantity: {product.quantity}
                    <br />
                    Archived on: {new Date(product.archivedAt).toLocaleDateString()}
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleUnarchive(product._id)}
                    disabled={unarchiving === product._id}
                  >
                    {unarchiving === product._id ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Unarchiving...
                      </>
                    ) : (
                      'Unarchive Product'
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ArchivedProducts;