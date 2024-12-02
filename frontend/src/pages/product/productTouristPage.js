import React, { useState, useEffect } from "react";
import Navbar from "../tourist/components/Navbar";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  ListGroup,
  Spinner,
  Badge
} from "react-bootstrap";
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaStar,
  FaDollarSign,
  FaChevronRight,
  FaFilter,
  FaShoppingBag,
  FaUser,
  FaGlobe,
  FaComments,
  FaBox
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ProductTouristPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currencyRates = {
    USD: 1,
    EGP: 49.10,
    SAR: 3.75,
    AED: 3.67,
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.user?._id || decoded.userId || decoded.id || decoded._id,
          name: decoded.user?.name || decoded.name,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, ratingFilter, priceFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        alert("Please log in to view products");
      }
    } finally {
      setLoading(false);
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

  const handleAddReview = async (event) => {
    event.preventDefault();
    
    if (!user) {
      alert("Please log in to add a review");
      return;
    }

    const formData = new FormData(event.target);
    const reviewData = {
      rating: Number(formData.get('rating')),
      comment: formData.get('comment'),
      reviewerId: user.id,
      reviewerName: user.name
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/products/${selectedProduct._id}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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
      if (error.response?.status === 401) {
        alert("Please log in to add a review");
      } else {
        alert("Failed to add review. Please try again.");
      }
    }
  };

  const convertPrice = (price) => {
    return (price * currencyRates[currency]).toFixed(2);
  };

  const handleReviewClick = (product) => {
    if (!user) {
      alert("Please log in to add a review");
      return;
    }
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-warning" : "text-muted"}
      />
    ));
  };

  return (
    <>
  <Navbar/>
    <div className="product-tourist-page">
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '8rem 0 4rem 0',
          marginBottom: '2rem'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        ></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Link to="/tourist" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </Link>
              </span>
              <span>
                Products <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Explore Products</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Filter Card */}
        <Card className="shadow-sm mb-5" style={{ borderRadius: '15px', border: 'none' }}>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaFilter className="text-primary me-2" size={24} />
              <h3 className="mb-0">Filter Products</h3>
            </div>

            <Row className="g-4">
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaSearch className="me-2" />
                    Search Products
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaStar className="me-2" />
                    Minimum Rating
                  </Form.Label>
                  <Form.Select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(Number(e.target.value))}
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  >
                    <option value={0}>All Ratings</option>
                    <option value={1}>1+ Stars</option>
                    <option value={2}>2+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={5}>5 Stars</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaDollarSign className="me-2" />
                    Price Range
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      value={priceFilter.min}
                      onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      value={priceFilter.max}
                      onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaGlobe className="me-2" />
                    Currency
                  </Form.Label>
                  <Form.Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  >
                    <option value="USD">USD</option>
                    <option value="EGP">EGP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Row className="g-4">
            {filteredProducts.length === 0 ? (
              <Col xs={12}>
                <Card className="text-center p-5" style={{ borderRadius: '15px', border: 'none' }}>
                  <Card.Body>
                    <FaShoppingBag size={48} className="text-muted mb-3" />
                    <h4>No Products Found</h4>
                    <p className="text-muted">Try adjusting your filters to see more products.</p>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              filteredProducts.map((product) => (
                <Col md={6} lg={4} key={product._id}>
                  <Card 
                    className="h-100 shadow-hover" 
                    style={{
                      borderRadius: '15px',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div 
                      className="card-img-top"
                      style={{
                        height: '200px',
                        backgroundImage: `url(${product.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px'
                      }}
                    />
                    
                    <Card.Body className="p-4">
                      <Card.Title className="h4 mb-3">{product.name}</Card.Title>
                      
                      <div className="d-flex flex-column gap-2 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <FaDollarSign className="text-primary me-2" />
                            <span className="h5 mb-0">
                              {convertPrice(product.price)} {currency}
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaBox className="text-primary me-2" />
                            <span>{product.quantity} in stock</span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center">
                          <FaUser className="text-primary me-2" />
                          <span>Seller: {product.seller}</span>
                        </div>

                        <div>
                          <div className="mb-1">Rating:</div>
                          <div className="d-flex align-items-center gap-2">
                            {product.reviews.length > 0 ? (
                              <>
                                {renderStars(
                                  product.reviews.reduce((sum, review) => sum + review.rating, 0) /
                                  product.reviews.length
                                )}
                                <span className="text-muted">
                                  ({product.reviews.length} reviews)
                                </span>
                              </>
                            ) : (
                              <span className="text-muted">No ratings yet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-muted mb-4">{product.description}</p>

                      <Button
                          variant="primary"
                          onClick={() => handleReviewClick(product)}
                          className="w-100 rounded-pill"
                          style={{
                            backgroundColor: '#1089ff',
                            border: 'none',
                            padding: '0.75rem'
                          }}
                        >
                          <FaComments className="me-2" />
                          Add Review
                        </Button>
                      </Card.Body>

                      <Card.Footer 
                        className="p-4 bg-light"
                        style={{ 
                          borderBottomLeftRadius: '15px',
                          borderBottomRightRadius: '15px',
                          border: 'none',
                          borderTop: '1px solid #eee'
                        }}
                      >
                        <h5 className="mb-3 d-flex align-items-center">
                          <FaComments className="me-2" />
                          Reviews
                        </h5>
                        {product.reviews.length > 0 ? (
                          <ListGroup variant="flush">
                            {product.reviews.map((review, index) => (
                              <ListGroup.Item 
                                key={index}
                                className="px-0 py-3"
                                style={{
                                  backgroundColor: 'transparent',
                                  borderColor: '#eee'
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="d-flex align-items-center">
                                    <FaUser className="text-primary me-2" />
                                    <strong>{review.reviewerName}</strong>
                                  </div>
                                  <div>
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                <p className="mb-1">{review.comment}</p>
                                <small className="text-muted">
                                  {new Date(review.timestamp).toLocaleDateString()}
                                </small>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted mb-0">No reviews yet.</p>
                        )}
                      </Card.Footer>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}
        </Container>

        {/* Review Modal */}
        <Modal 
          show={showReviewModal} 
          onHide={() => setShowReviewModal(false)}
          centered
        >
          <Modal.Header 
            closeButton
            className="border-0 pb-0"
          >
            <Modal.Title>
              <div className="d-flex align-items-center">
                <FaComments className="text-primary me-2" />
                Add Review for {selectedProduct?.name}
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-4">
            <Form onSubmit={handleAddReview}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Rating</Form.Label>
                <Form.Select 
                  name="rating" 
                  required
                  className="rounded-pill"
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: '2px solid #eee'
                  }}
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Comment</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="comment" 
                  required
                  rows={4}
                  className="rounded-3"
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: '2px solid #eee'
                  }}
                  placeholder="Share your experience with this product..."
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  type="submit"
                  className="rounded-pill"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none',
                    padding: '0.75rem'
                  }}
                >
                  <FaComments className="me-2" />
                  Submit Review
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
      </>

    );
};

export default ProductTouristPage;