import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  ListGroup,
  Badge
} from "react-bootstrap";

const API_URL = "http://localhost:5000/api";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Get user info from JWT token
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken?._id;
  const userType = 'Admin'; // Hardcoded to Admin
  const merchantEmail = decodedToken?.email;

  // Validate we have required user info
  useEffect(() => {
    if (!userId) {
      console.error('Missing user information:', { userId });
      // Optionally redirect to login or show error
    }
  }, [userId]);

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    if (token && decodedToken?._id) {
      fetchProducts();
    }
  }, [token]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, ratingFilter, priceFilter]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, axiosConfig);
      // Admin sees all non-archived products
      const activeProducts = response.data.products.filter(product => !product.isArchived);
      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (ratingFilter > 0) {
      filtered = filtered.filter((product) => {
        const avgRating =
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length;
        return avgRating >= ratingFilter;
      });
    }

    if (priceFilter.min !== "") {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(priceFilter.min)
      );
    }
    if (priceFilter.max !== "") {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(priceFilter.max)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    const formElements = event.target.elements;
    
    const productData = new FormData();
    
    // Add basic fields
    productData.append('name', formElements.name.value);
    productData.append('description', formElements.description.value);
    productData.append('price', formElements.price.value);
    productData.append('quantity', formElements.quantity.value);
    
    // Add created by data and merchant email from JWT
    productData.append('userId', userId);
    productData.append('userType', 'Admin');
    productData.append('merchantEmail', merchantEmail); // Automatically use email from JWT

    // Add image files
    const imageFiles = formElements.productImage.files;
    for (let i = 0; i < imageFiles.length; i++) {
        productData.append('productImage', imageFiles[i]);
    }

    try {
        const response = await axios.post(`${API_URL}/products`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        fetchProducts();
        setShowAddModal(false);
    } catch (error) {
        console.error("Error adding product:", error);
        alert(error.response?.data?.message || "Error adding product");
    }
};

const handleEditProduct = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Add user information and merchant email from JWT
    formData.append('userId', userId);
    formData.append('userType', 'Admin');
    formData.append('merchantEmail', merchantEmail);

    try {
        const response = await axios.put(
            `${API_URL}/products/${selectedProduct._id}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        fetchProducts();
        setShowEditModal(false);
    } catch (error) {
        console.error("Error editing product:", error);
        alert(error.response?.data?.message || "Error editing product");
    }
};

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_URL}/products/${productId}`, axiosConfig);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(error.response?.data?.message || "Error deleting product");
      }
    }
  };

  const handleArchiveProduct = async (productId) => {
    try {
      await axios.put(
        `${API_URL}/products/archive/${productId}`,
        {
          isArchived: true
        },
        axiosConfig
      );
      fetchProducts();
    } catch (error) {
      console.error("Error archiving product:", error);
      alert(error.response?.data?.message || "Error archiving product");
    }
  };

  return (
    <Container>
      <h1 className="my-4">Admin Product Management</h1>
  
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
          >
            <option value={0}>All Ratings</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}+ Stars
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Min Price"
            value={priceFilter.min}
            onChange={(e) =>
              setPriceFilter({ ...priceFilter, min: e.target.value })
            }
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Max Price"
            value={priceFilter.max}
            onChange={(e) =>
              setPriceFilter({ ...priceFilter, max: e.target.value })
            }
          />
        </Col>
        <Col md={3}>
          <Button onClick={() => setShowAddModal(true)}>Add New Product</Button>
        </Col>
        <Col md={2}>
          <Link
            to="http://localhost:3000/products/archived"
            className="btn btn-secondary w-100"
          >
            View Archived
          </Link>
        </Col>
      </Row>
  
      <Row>
        {filteredProducts.map((product) => (
          <Col md={6} lg={4} key={product._id} className="mb-4">
            <Card>
              {product.productImage && product.productImage[0] ? (
                product.productImage.map((image, index) => (
                  <Card.Img
                    key={index}
                    variant="top"
                    src={image.path}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                ))
              ) : (
                <Card.Img variant="top" src={product.imageUrl} />
              )}
              <Card.Body>
                {product.isArchived && (
                  <Badge bg="secondary" className="mb-2">
                    Archived
                  </Badge>
                )}
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text>Price: ${product.price}</Card.Text>
                <Card.Text>Quantity: {product.quantity}</Card.Text>
                <Card.Text>Total Sales: {product.totalSales}</Card.Text>
                <Card.Text>
                  Created by: {product.createdBy ? `${product.createdBy.userType} (${product.createdBy.user})` : 'Unknown'}
                </Card.Text>
                <Card.Text>
        Merchant Email: {product.merchantEmail || 'Not set'}
    </Card.Text>
                <Card.Text>
                  Average Rating:{" "}
                  {product.reviews.length > 0
                    ? (
                        product.reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / product.reviews.length
                      ).toFixed(1)
                    : "No ratings yet"}{" "}
                  ({product.reviews.length} reviews)
                </Card.Text>
                
                {/* Admin has full control over all products */}
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => handleArchiveProduct(product._id)}
                >
                  Archive
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Delete
                </Button>
              </Card.Body>
              <Card.Footer>
                <h5>Reviews</h5>
                {product.reviews.length > 0 ? (
                  <ListGroup variant="flush">
                    {product.reviews.map((review, index) => (
                      <ListGroup.Item key={index}>
                        <div>
                          <strong>Rating: {review.rating}/5</strong>
                        </div>
                        <div>
                          <strong>Reviewer:</strong> {review.reviewerName}
                        </div>
                        <div>{review.comment}</div>
                        <small className="text-muted">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No reviews yet.</p>
                )}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
  
      {/* Add Product Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" name="price" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" name="quantity" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Images</Form.Label>
              <Form.Control
                type="file"
                name="productImage"
                accept="image/*"
                multiple
                required
              />
            </Form.Group>
            <Button type="submit">Add Product</Button>
          </Form>
        </Modal.Body>
      </Modal>
  
      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                defaultValue={selectedProduct?.name}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                defaultValue={selectedProduct?.description}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                defaultValue={selectedProduct?.price}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                defaultValue={selectedProduct?.quantity}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Images</Form.Label>
              <Form.Control
                type="file"
                name="productImage"
                accept="image/*"
                multiple
              />
            </Form.Group>
            <Button type="submit">Update Product</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default AdminProductPage;