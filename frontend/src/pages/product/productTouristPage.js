import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Badge,
  ListGroup,
  Alert,
  Spinner,
  Nav,
  Tab,
  InputGroup,
} from "react-bootstrap";
import {
  FaWallet,
  FaShoppingCart,
  FaStar,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const API_URL = "http://localhost:5000/api";

function ProductTouristPage() {
  // State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userWallet, setUserWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [currency, setCurrency] = useState("USD");
  const [activeTab, setActiveTab] = useState("products");

  // Modal States
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [processingPurchase, setProcessingPurchase] = useState(false);

  // Currency conversion rates
  const currencyRates = {
    USD: 1,
    EGP: 49.1,
    SAR: 3.75,
    AED: 3.67,
  };

  useEffect(() => {
    initializeUser();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, ratingFilter, priceFilter]);

  const initializeUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to access this page");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded._id || decoded.user?._id;
      setUserId(userId);
      fetchUserWallet(userId);
    } catch (error) {
      console.error("Token decode error:", error);
      setError("Invalid session. Please login again.");
    }
  };

  const fetchUserWallet = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const touristData = JSON.parse(localStorage.getItem("tourist"));
      if (touristData?.wallet !== undefined) {
        setUserWallet(touristData.wallet);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      const activeProducts = response.data.products.filter(
        (p) => !p.isArchived
      );
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
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
          product.reviews && product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            : 0;
        return avgRating >= ratingFilter;
      });
    }

    if (priceFilter.min) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(priceFilter.min)
      );
    }

    if (priceFilter.max) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(priceFilter.max)
      );
    }

    setFilteredProducts(filtered);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    setProcessingPurchase(true);
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      // Get the correct user ID from the token
      const userId = decoded._id || decoded.user?._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      console.log("Purchase attempt:", {
        userId,
        productId: selectedProduct._id,
        quantity: purchaseQuantity,
      });

      // Create the purchase
      const purchaseResponse = await axios.post(
        `${API_URL}/products/purchase`,
        {
          userId,
          productId: selectedProduct._id,
          quantity: purchaseQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (purchaseResponse.data.success) {
        // Update wallet balance in localStorage
        const touristData = JSON.parse(localStorage.getItem("tourist")) || {};
        const newBalance = purchaseResponse.data.data.newBalance;

        localStorage.setItem(
          "tourist",
          JSON.stringify({
            ...touristData,
            wallet: newBalance,
          })
        );

        setUserWallet(newBalance);
        setShowPurchaseModal(false);
        await fetchProducts(); // Refresh products
        alert("Purchase successful!");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to complete purchase";
      alert(errorMessage);
    } finally {
      setProcessingPurchase(false);
    }
  };
  const handleReview = async () => {
    if (!selectedProduct || !rating) return;

    try {
      await axios.post(
        `${API_URL}/products/${selectedProduct._id}/review`,
        {
          reviewerName: userId,
          rating,
          comment: review,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Review submitted successfully!");
      setShowReviewModal(false);
      await fetchProducts(); // Refresh products to show new review
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const convertPrice = (price) => {
    return (price * currencyRates[currency]).toFixed(2);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Wallet Balance Display */}
      <div className="bg-light p-3 rounded shadow-sm mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaWallet className="text-primary me-2" size={24} />
          <div>
            <h4 className="mb-0">Wallet Balance</h4>
            <h3 className="mb-0">${userWallet.toFixed(2)}</h3>
          </div>
        </div>
        <Form.Select
          className="w-auto"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="EGP">EGP</option>
          <option value="SAR">SAR</option>
          <option value="AED">AED</option>
        </Form.Select>
      </div>

      {/* Filters */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
          >
            <option value={0}>All Ratings</option>
            <option value={1}>1+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars</option>
          </Form.Select>
        </Col>
        <Col md={5}>
          <InputGroup>
            <Form.Control
              type="number"
              placeholder="Min Price"
              value={priceFilter.min}
              onChange={(e) =>
                setPriceFilter({ ...priceFilter, min: e.target.value })
              }
            />
            <Form.Control
              type="number"
              placeholder="Max Price"
              value={priceFilter.max}
              onChange={(e) =>
                setPriceFilter({ ...priceFilter, max: e.target.value })
              }
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredProducts.map((product) => (
          <Col key={product._id}>
            <Card className="h-100">
              {product.imageUrl && (
                <Card.Img
                  variant="top"
                  src={product.imageUrl}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    {currency} {convertPrice(product.price)}
                  </h5>
                  <Badge bg={product.quantity > 0 ? "success" : "danger"}>
                    {product.quantity > 0
                      ? `In Stock: ${product.quantity}`
                      : "Out of Stock"}
                  </Badge>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-grow-1"
                    disabled={product.quantity === 0}
                    onClick={() => {
                      setSelectedProduct(product);
                      setPurchaseQuantity(1);
                      setShowPurchaseModal(true);
                    }}
                  >
                    <FaShoppingCart className="me-2" />
                    Purchase
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setSelectedProduct(product);
                      setRating(0);
                      setReview("");
                      setShowReviewModal(true);
                    }}
                  >
                    <FaStar className="me-2" />
                    Review
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer>
                <small className="text-muted">
                  Rating:{" "}
                  {product.reviews && product.reviews.length > 0
                    ? `${(
                        product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                        product.reviews.length
                      ).toFixed(1)} / 5`
                    : "No ratings yet"}
                  ({product.reviews ? product.reviews.length : 0} reviews)
                </small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Purchase Modal */}
      <Modal
        show={showPurchaseModal}
        onHide={() => setShowPurchaseModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <h5>{selectedProduct.name}</h5>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={selectedProduct.quantity}
                  value={purchaseQuantity}
                  onChange={(e) =>
                    setPurchaseQuantity(
                      Math.min(
                        selectedProduct.quantity,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                />
              </Form.Group>
              <div className="d-flex justify-content-between mb-3">
                <span>Total Price:</span>
                <strong>
                  ${(selectedProduct.price * purchaseQuantity).toFixed(2)}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Your Balance:</span>
                <strong
                  className={
                    userWallet >= selectedProduct.price * purchaseQuantity
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  ${userWallet.toFixed(2)}
                </strong>
              </div>
              {userWallet < selectedProduct.price * purchaseQuantity && (
                <Alert variant="danger">Insufficient wallet balance</Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPurchaseModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={
              !selectedProduct ||
              processingPurchase ||
              userWallet < selectedProduct.price * purchaseQuantity
            }
          >
            {processingPurchase ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <FaShoppingCart className="me-2" />
                Confirm Purchase
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <h5>{selectedProduct.name}</h5>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`cursor-pointer ${
                        star <= rating ? "text-warning" : "text-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                      size={24}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReview} disabled={!rating}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-5">
          <FaSearch size={48} className="text-muted mb-3" />
          <h4>No Products Found</h4>
          <p className="text-muted">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </Container>
  );
}

export default ProductTouristPage;
