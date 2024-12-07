import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Offcanvas,
  Modal,
  Form
} from "react-bootstrap";
import {
  FaShoppingCart,
  FaTrash,
  FaHeart,
  FaPlus,
  FaMinus,
  FaWallet,
  FaTag
} from "react-icons/fa";
import PaymentSelection from "../../components/PaymentSelection";
import StripeWrapper from "../../components/StripeWrapper";

const API_URL = "http://localhost:5000/api";
const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  // Add cart-related states
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [userWallet, setUserWallet] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const currencyRates = {
    USD: 1,
    EGP: 49.1,
    SAR: 3.75,
    AED: 3.67,
  };

  useEffect(() => {
    initializeUser();
  }, []);

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
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const initializeUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view your wishlist");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded._id || decoded.user?._id;
      setUserId(userId);
      await fetchUserProfile();
      fetchWishlist(userId);
    } catch (error) {
      console.error("Token decode error:", error);
      setError("Invalid session. Please login again.");
      setLoading(false);
    }
  };

  const getUserSpecificKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return `tourist_${user?.username}`;
  };

  const handlePurchase = async (paymentMethod, paymentIntent) => {
    setProcessingPurchase(true);
    try {
      if (paymentMethod === "card") {
        // Handle Stripe card payment
        for (const item of cart) {
          await axios.post(
            `${API_URL}/products/purchase`,
            {
              userId,
              productId: item._id,
              quantity: item.quantity,
              paymentMethod: "card",
              stripePaymentId: paymentIntent.id,
              promoCode: appliedPromo?.code,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      } else if (paymentMethod === "wallet") {
        // Handle wallet payment
        if (userWallet < getCartTotal()) {
          throw new Error("Insufficient wallet balance");
        }
  
        for (const item of cart) {
          await axios.post(
            `${API_URL}/products/purchase`,
            {
              userId,
              productId: item._id,
              quantity: item.quantity,
              paymentMethod: "wallet",
              promoCode: appliedPromo?.code,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
  
        // Update wallet balance
        const newBalance = userWallet - getCartTotal();
        setUserWallet(newBalance);
  
        // Update localStorage
        const userKey = getUserSpecificKey();
        const touristData = JSON.parse(localStorage.getItem(userKey)) || {};
        localStorage.setItem(
          userKey,
          JSON.stringify({
            ...touristData,
            wallet: newBalance,
          })
        );
      } else if (paymentMethod === "cod") {
        // Handle cash on delivery
        for (const item of cart) {
          await axios.post(
            `${API_URL}/products/purchase`,
            {
              userId,
              productId: item._id,
              quantity: item.quantity,
              paymentMethod: "cod",
              promoCode: appliedPromo?.code,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      } else {
        throw new Error("Invalid payment method");
      }
  
      // Clear cart and close modal on successful purchase
      setCart([]);
      setShowCart(false);
      setShowPaymentModal(false);
      setAppliedPromo(null);
  
      // Refresh products to update stock
      await fetchWishlist(userId); // Changed from fetchProducts to fetchWishlist
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
      setPromoError(error.response?.data?.message || "Failed to apply promo code");
    } finally {
      setValidatingPromo(false);
    }
  };

  const fetchWishlist = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const wishlistWithProducts = response.data.wishlist.products.map(item => ({
        ...item,
        productDetails: item.productId
      }));
      
      setWishlistItems(wishlistWithProducts);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to load wishlist items");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${userId}/product/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setWishlistItems(prevItems => 
        prevItems.filter(item => item.productId._id !== productId)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Failed to remove item from wishlist");
    }
  };

  // Local cart functions
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
    alert("Product added to cart successfully!");
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const product = cart.find((p) => p._id === productId);
    if (!product) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.min(Math.max(1, newQuantity), item.quantity),
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

  const WalletDisplay = () => (
    <div className="bg-light p-3 rounded shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center">
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
    </div>
  );


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
    <Container className="py-5">
      {/* Wallet Balance Display */}
      <div className="bg-light p-3 rounded shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center">
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
      </div>
  
      {/* Wishlist Header */}
      <div className="d-flex align-items-center mb-4">
        <FaHeart className="text-danger me-2" size={24} />
        <h2 className="mb-0">My Wishlist</h2>
      </div>
  
      {/* Wishlist Content */}
      {wishlistItems.length === 0 ? (
        <Alert variant="info">
          Your wishlist is empty. Browse our products to add items to your wishlist!
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {wishlistItems.map((item) => {
            const product = item.productId;
            return (
              <Col key={product._id}>
                <Card className="h-100">
                  {product.productImage && product.productImage[0] && (
                    <Card.Img
                      variant="top"
                      src={product.productImage[0].path}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>{product.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">{currency} {(product.price * currencyRates[currency]).toFixed(2)}</h5>
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
                        onClick={() => addToCart(product)}
                      >
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => removeFromWishlist(product._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                  {product.reviews && (
                    <Card.Footer>
                      <small className="text-muted">
                        Rating:{" "}
                        {product.reviews.length > 0
                          ? `${(
                              product.reviews.reduce(
                                (sum, r) => sum + r.rating,
                                0
                              ) / product.reviews.length
                            ).toFixed(1)} / 5`
                          : "No ratings yet"}
                        ({product.reviews.length} reviews)
                      </small>
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
  
      {/* Cart Offcanvas */}
      <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
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
                      {currency} {(getCartTotal() * currencyRates[currency]).toFixed(2)}
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
                      {currency} {(userWallet * currencyRates[currency]).toFixed(2)}
                    </span>
                  </div>
  
                  <Button
                    variant="primary"
                    className="w-100"
                    disabled={cart.length === 0}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
  
      {/* Payment Modal */}
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
    </Container>
  );
};

export default WishlistPage;