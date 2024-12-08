import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaStar, FaDollarSign, FaArchive, FaEdit, FaTrash, FaImage, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import SellerNavbar from './SellerNavbar';

const API_URL = "http://localhost:5000/api";

function SellerProductPage() {
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
// Get user info from JWT token
const token = localStorage.getItem("token");
const decodedToken = token ? jwtDecode(token) : null;
const userId = decodedToken?._id; // Changed from .id to ._id to match token structure
const userType = 'Seller';
const merchantEmail = decodedToken?.email; // Added to get merchant email

// Validate we have required user info
useEffect(() => {
    if (!userId || !userType) {
        console.error('Missing user information:', { userId, userType });
        // Optionally redirect to login or show error
    }
}, [userId, userType]);

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
        const activeProducts = response.data.products.filter(product => {
            // Check if product is not archived and has createdBy data
            if (!product.isArchived && product.createdBy) {
                return product.createdBy.user === decodedToken._id;
            }
            // For legacy products without createdBy, check the old seller field
            if (!product.isArchived && !product.createdBy) {
                return product.seller === decodedToken._id;
            }
            return false;
        });
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
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    
    // Create product data object
    const productData = new FormData();
    
    // Add basic fields
    productData.append('name', formElements.name.value);
    productData.append('description', formElements.description.value);
    productData.append('price', formElements.price.value);
    productData.append('quantity', formElements.quantity.value);
    
    // Add created by data and merchant email
    productData.append('userId', decodedToken._id);
    productData.append('userType', 'Seller');
    productData.append('merchantEmail', decodedToken.email); // Add merchant email

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
        if (error.response?.data) {
            console.log("Server error details:", error.response.data);
        }
        alert(error.response?.data?.message || "Error adding product");
    }
};

const handleEditProduct = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Add user information from decoded token
    formData.append('userId', userId);
    formData.append('userType', userType);
    formData.append('merchantEmail', merchantEmail); // Add merchant email

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

  const handleAddReview = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reviewData = Object.fromEntries(formData.entries());
    reviewData.rating = Number(reviewData.rating);

    try {
      const response = await axios.post(
        `${API_URL}/products/${selectedProduct._id}/reviews`,
        reviewData,
        axiosConfig
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === selectedProduct._id ? response.data.product : product
        )
      );

      setShowReviewModal(false);
      alert("Review added successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      alert(error.response?.data?.message || "Failed to add review");
    }
  };

  const handleArchiveProduct = async (productId) => {
    try {
      await axios.put(
        `${API_URL}/products/${productId}/archive`,
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

  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    padding: "8rem 0 4rem 0",
    marginBottom: "2rem"
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1
  };

  return (
    <div className="seller-product-page">
      <SellerNavbar />
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: "relative", zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">Manage Your Products</p>
            <h1 className="display-4 mb-0">Product Catalog</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Search and Filter Section */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col lg={3}>
                <div className="search-box">
                  <FaSearch className="text-muted position-absolute ms-3" style={{ top: '12px' }}/>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-5"
                    style={{ borderRadius: '50px' }}
                  />
                </div>
              </Col>
              <Col lg={2}>
                <Form.Select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  style={{ borderRadius: '50px' }}
                >
                  <option value={0}>All Ratings</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}+ Stars
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Control
                  type="number"
                  placeholder="Min Price"
                  value={priceFilter.min}
                  onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                  style={{ borderRadius: '50px' }}
                />
              </Col>
              <Col lg={2}>
                <Form.Control
                  type="number"
                  placeholder="Max Price"
                  value={priceFilter.max}
                  onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                  style={{ borderRadius: '50px' }}
                />
              </Col>
              <Col lg={3} className="text-end">
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                  className="me-2 rounded-pill"
                  style={{ padding: '10px 20px' }}
                >
                  <FaPlus className="me-2" />
                  Add Product
                </Button>
                <Link
                  to="/archived-products"
                  className="btn btn-secondary rounded-pill"
                  style={{ padding: '10px 20px' }}
                >
                  <FaArchive className="me-2" />
                  Archived
                </Link>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Products Grid */}
        <Row className="g-4">
          {filteredProducts.map((product) => (
            <Col lg={4} md={6} key={product._id}>
              <Card className="h-100 shadow-sm hover-card" style={{
                transition: "transform 0.2s",
                borderRadius: "15px",
                overflow: "hidden"
              }}>
                <div style={{ height: "200px", overflow: "hidden" }}>
                  {product.productImage && product.productImage[0] ? (
                    <Card.Img
                      variant="top"
                      src={product.productImage[0].path}
                      style={{ height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                      <FaImage size={40} className="text-muted" />
                    </div>
                  )}
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{product.name}</Card.Title>
                    {product.isArchived && (
                      <Badge bg="secondary">Archived</Badge>
                    )}
                  </div>
                  <Card.Text className="text-muted">{product.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 text-primary">${product.price}</h5>
                    <div className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={16}
                          className={i < Math.round(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length) ? "text-warning" : "text-muted"}
                        />
                      ))}
                    </div>
                  </div>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Quantity:</span>
                      <span className="fw-bold">{product.quantity}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Total Sales:</span>
                      <span className="fw-bold">{product.totalSales}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Reviews:</span>
                      <span className="fw-bold">{product.reviews.length}</span>
                    </ListGroup.Item>
                  </ListGroup>
                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      className="rounded-pill"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit className="me-2" />
                      Edit Product
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="rounded-pill"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <FaTrash className="me-2" />
                      Delete Product
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Add/Edit Modals with enhanced styling */}
      {/* ... [Keep the modal code but update styling to match] ... */}
    </div>
  );
};

export default SellerProductPage;