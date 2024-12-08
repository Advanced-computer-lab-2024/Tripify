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
  Alert,
  Spinner,
  InputGroup,
  Offcanvas,
} from "react-bootstrap";
import {
  FaWallet,
  FaShoppingCart,
  FaStar,
  FaSearch,
  FaTrash,
  FaPlus,
  FaMinus,
  FaTag,
  FaHeart
} from "react-icons/fa";
import PaymentSelection from "../../components/PaymentSelection";
import StripeWrapper from "../../components/StripeWrapper";

const API_URL = "http://localhost:5000/api";

function ProductTouristPage() {
  // Existing states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userWallet, setUserWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [currency, setCurrency] = useState("USD");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [processingPurchase, setProcessingPurchase] = useState(false);
  // Add these new state variables at the top with your other states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // New cart-related states
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Currency conversion rates (existing)
  const currencyRates = {
    USD: 1,
    EGP: 49.1,
    SAR: 3.75,
    AED: 3.67,
  };
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setValidatingPromo(true);
    setPromoError("");

    try {
      const response = await axios.post(
        `${API_URL}/products/validate-promo`,
        {
          code: promoCode,
          userId,
          amount: getCartTotal(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setAppliedPromo({
          code: promoCode,
          discount: response.data.discount,
        });
        setPromoCode("");
      }
    } catch (error) {
      setPromoError(
        error.response?.data?.message || "Failed to apply promo code"
      );
    } finally {
      setValidatingPromo(false);
    }
  };

  // Existing useEffects and functions
  useEffect(() => {
    initializeUser();
    fetchProducts();
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);


  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, ratingFilter, priceFilter]);

  // Keep all your existing functions here...
  const getUserSpecificKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return `tourist_${user?.username}`;
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/wishlist/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWishlist(response.data.wishlist?.products || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const toggleWishlist = async (product) => {
    try {
      const isInWishlist = wishlist.some(item => item.productId?._id === product._id);
      
      if (isInWishlist) {
        await axios.delete(`${API_URL}/wishlist/${userId}/product/${product._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post(`${API_URL}/wishlist/add`, {
          userId,
          productId: product._id,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      await fetchWishlist(); // Refresh wishlist
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(error.response?.data?.message || "Failed to update wishlist");
    }
  };


  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        console.error("No token or user found");
        return;
      }

      const response = await axios.get(
        `${API_URL}/tourist/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.tourist) {
        setUserWallet(response.data.tourist.wallet);
        const userKey = getUserSpecificKey();
        localStorage.setItem(
          userKey,
          JSON.stringify({
            wallet: response.data.tourist.wallet,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Replace your existing initializeUser function with this:
  const initializeUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to access this page");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded._id || decoded.user?._id;
      setUserId(userId);
      await fetchUserProfile(); // Replace fetchUserWallet with fetchUserProfile
    } catch (error) {
      console.error("Token decode error:", error);
      setError("Invalid session. Please login again.");
    }
  };

  const fetchUserWallet = async (userId) => {
    try {
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

  // New cart functions
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.quantity),
              }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.min(Math.max(1, newQuantity), product.quantity),
            }
          : item
      )
    );
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    if (appliedPromo) {
      return subtotal - (subtotal * appliedPromo.discount) / 100;
    }
    return subtotal;
  };
  const handlePurchase = async (paymentMethod, paymentIntent) => {
    setProcessingPurchase(true);
    try {
      // Create an array to track products that will be out of stock
      const outOfStockProducts = [];
      
      // Common purchase processing function
      const processPurchase = async (item) => {
        // First process the purchase
        await axios.post(
          `${API_URL}/products/purchase`,
          {
            userId,
            productId: item._id,
            quantity: item.quantity,
            paymentMethod,
            stripePaymentId: paymentMethod === 'card' ? paymentIntent.id : undefined,
            promoCode: appliedPromo?.code,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        // Get full product details to check stock and get creator info
        try {
          const productResponse = await axios.get(
            `${API_URL}/products/${item._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
  
          console.log('Full product response data:', productResponse.data);
  
          const fullProduct = productResponse.data;
  
          // Check if product will be out of stock and has necessary data
          if (fullProduct && fullProduct.createdBy && (fullProduct.quantity - item.quantity) === 0) {
            outOfStockProducts.push({
              productId: fullProduct._id,
              productName: fullProduct.name,
              merchantEmail: fullProduct.merchantEmail,
              createdBy: {
                user: fullProduct.createdBy.user,
                userType: fullProduct.createdBy.userType
              }
            });
            
            console.log('Added to outOfStockProducts:', {
              productId: fullProduct._id,
              productName: fullProduct.name,
              createdBy: fullProduct.createdBy
            });
          }
        } catch (error) {
          console.error('Product fetch error:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            productId: item._id
          });
        }
      };
    
      // Check wallet balance if using wallet payment
      if (paymentMethod === "wallet" && userWallet < getCartTotal()) {
        throw new Error("Insufficient wallet balance");
      }
    
      // Process all items in cart
      for (const item of cart) {
        await processPurchase(item);
      }
    
      // Update wallet balance if using wallet payment
      if (paymentMethod === "wallet") {
        const newBalance = userWallet - getCartTotal();
        setUserWallet(newBalance);
        const userKey = getUserSpecificKey();
        const touristData = JSON.parse(localStorage.getItem(userKey)) || {};
        localStorage.setItem(
          userKey,
          JSON.stringify({
            ...touristData,
            wallet: newBalance,
          })
        );
      }
  
      // Send both email alerts and notifications for out-of-stock products
      if (outOfStockProducts.length > 0) {
        for (const product of outOfStockProducts) {
          // Send email alert
          try {
            await axios.post(
              `${API_URL}/products/stock-alert`,
              {
                merchantEmail: product.merchantEmail,
                productName: product.productName,
                productId: product.productId
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            console.log(`Email stock alert sent for product: ${product.productName}`);
          } catch (emailError) {
            console.error(`Failed to send email alert for ${product.productName}:`, emailError);
          }
  
          // Send in-app notification if we have valid createdBy data
          if (product.createdBy && product.createdBy.user && product.createdBy.userType) {
            try {
              const notificationPayload = {
                recipients: [{
                  userId: product.createdBy.user,
                  userType: product.createdBy.userType
                }],
                title: 'Product Out of Stock',
                message: `Your product "${product.productName}" is now out of stock and needs immediate attention.`,
                type: 'stock_alert',
                priority: 'high',
                link: `/merchant/products/${product.productId}`
              };
  
              console.log('Sending notification with payload:', notificationPayload);
  
              const notificationResponse = await axios.post(
                `${API_URL}/notify`,
                notificationPayload,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
  
              console.log('Notification response:', notificationResponse.data);
            } catch (notifyError) {
              console.error('Notification error details:', {
                response: notifyError.response?.data,
                status: notifyError.response?.status,
                message: notifyError.message,
                payload: product.createdBy
              });
            }
          } else {
            console.error('Missing or invalid createdBy data:', product);
          }
        }
      }
    
      // Clear cart and close modals
      setCart([]);
      setShowCart(false);
      setShowPaymentModal(false);
      setAppliedPromo(null);
    
      // Refresh products
      await fetchProducts();
    
      alert("Purchase successful!");
    } catch (error) {
      console.error("Purchase error:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to complete purchase"
      );
    } finally {
      setProcessingPurchase(false);
    }
  };
  // Add this effect to handle storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      const userKey = getUserSpecificKey();
      if (e.key === userKey) {
        try {
          const newData = JSON.parse(e.newValue);
          if (newData && typeof newData.wallet !== "undefined") {
            setUserWallet(newData.wallet);
          }
        } catch (error) {
          console.error("Error parsing storage data:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleReview = async () => {
    if (!rating || !selectedProduct) return;

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
      await fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
    }
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
        <div className="d-flex gap-3">
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
          <Button
            variant="primary"
            onClick={() => setShowCart(true)}
            className="position-relative"
          >
            <FaShoppingCart className="me-2" />
            Cart
            {cart.length > 0 && (
              <Badge
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle"
              >
                {cart.length}
              </Badge>
            )}
          </Button>
        </div>
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
              <div className="position-relative">
                {product.productImage && product.productImage[0] && (
                  <Card.Img
                    variant="top"
                    src={product.productImage[0].path}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <Button
                  variant={wishlist.some(item => item.productId?._id === product._id) ? "danger" : "outline-danger"}
                  className="position-absolute top-0 end-0 m-2"
                  onClick={() => toggleWishlist(product)}
                >
                  <FaHeart />
                </Button>
              </div>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    {currency} {(product.price * currencyRates[currency]).toFixed(2)}
                  </h5>
                  <Badge bg={product.quantity > 0 ? "success" : "danger"}>
                    {product.quantity > 0 ? `In Stock: ${product.quantity}` : "Out of Stock"}
                  </Badge>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-grow-1"
                    disabled={product.quantity === 0}
                    onClick={() => addToCart(product)}
                  >
                    <FaShoppingCart className="me-2" />
                    Add to Cart
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
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StripeWrapper>
            <PaymentSelection
              totalAmount={getCartTotal()}
              walletBalance={userWallet}
              onPaymentComplete={handlePurchase}
              onPaymentError={(error) => alert(error)}
              selectedCurrency={currency}
            />
          </StripeWrapper>
        </Modal.Body>
      </Modal>

      {/* Cart Offcanvas */}
      <Offcanvas
        show={showCart}
        onHide={() => setShowCart(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shopping Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cart.length === 0 ? (
            <Alert variant="info">Your cart is empty</Alert>
          ) : (
            <>
              {cart.map((item) => (
                <Card key={item._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex">
                      {item.productImage && item.productImage[0] && (
                        <img
                          src={item.productImage[0].path}
                          alt={item.name}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                          className="me-3"
                        />
                      )}
                      <div className="flex-grow-1">
                        <Card.Title className="h6">{item.name}</Card.Title>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateCartQuantity(item._id, item.quantity - 1)
                              }
                            >
                              <FaMinus size={12} />
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateCartQuantity(item._id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.availableQuantity}
                            >
                              <FaPlus size={12} />
                            </Button>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                        <div className="text-end text-primary fw-bold">
                          {currency}{" "}
                          {(
                            item.price *
                            currencyRates[currency] *
                            item.quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              <div className="border-top pt-3 mt-3">
                {/* Promo Code Section */}
                <div className="mb-3">
                  <h6 className="mb-2">Promo Code</h6>
                  {appliedPromo ? (
                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                      <div>
                        <Badge bg="success" className="me-2">
                          <FaTag className="me-1" />
                          {appliedPromo.code}
                        </Badge>
                        <span className="text-success">
                          {appliedPromo.discount}% OFF
                        </span>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setAppliedPromo(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button
                        variant="outline-primary"
                        onClick={handleApplyPromoCode}
                        disabled={validatingPromo || !promoCode.trim()}
                      >
                        {validatingPromo ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                  {promoError && (
                    <Alert variant="danger" className="mt-2 py-2">
                      {promoError}
                    </Alert>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>
                      {currency}{" "}
                      {(
                        cart.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        ) * currencyRates[currency]
                      ).toFixed(2)}
                    </span>
                  </div>

                  {appliedPromo && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount ({appliedPromo.discount}%):</span>
                      <span>
                        -{currency}{" "}
                        {(
                          ((cart.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          ) *
                            appliedPromo.discount) /
                            100) *
                          currencyRates[currency]
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">Final Total:</span>
                    <span className="fw-bold">
                      {currency}{" "}
                      {(getCartTotal() * currencyRates[currency]).toFixed(2)}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span>Wallet Balance:</span>
                    <span
                      className={`fw-bold ${
                        userWallet >= getCartTotal()
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {currency}{" "}
                      {(userWallet * currencyRates[currency]).toFixed(2)}
                    </span>
                  </div>

                  {userWallet < getCartTotal() && (
                    <Alert variant="danger" className="mb-3">
                      Insufficient wallet balance
                    </Alert>
                  )}

                  <Button
                    variant="primary"
                    className="w-100"
                    disabled={cart.length === 0}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Proceed to Checkout (${currency} $
                    {(getCartTotal() * currencyRates[currency]).toFixed(2)})
                  </Button>
                </div>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

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
