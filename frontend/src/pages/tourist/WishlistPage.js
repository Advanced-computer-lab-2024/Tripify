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
import { Link } from 'react-router-dom';
import {
  FaShoppingCart,
  FaTrash,
  FaHeart,
  FaPlus,
  FaMinus,
  FaWallet,
  FaTag,
  FaChevronRight
} from "react-icons/fa";
import Navbar from "./components/Navbar";
import PaymentSelection from "../../components/PaymentSelection";
import StripeWrapper from "../../components/StripeWrapper";

const API_URL = "http://localhost:5000/api";

const WishlistPage = () => {
  // Add the missing state variable
  const [processingPurchase, setProcessingPurchase] = useState(false);
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [userWallet, setUserWallet] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '60vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '3rem'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

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

      setCart([]);
      setShowCart(false);
      setShowPaymentModal(false);
      setAppliedPromo(null);
      await fetchWishlist(userId);
      alert("Purchase successful!");

    } catch (error) {
      console.error("Purchase error:", error);
      alert(error.response?.data?.message || error.message || "Failed to complete purchase");
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
      <>
        <Navbar />
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }} className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="light" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Container>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <Alert variant="danger" className="mt-5">{error}</Alert>
          </Container>
        </div>
      </>
    );
  }


  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/tourist" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small" />
                  </Link>
                </span>
                <span>
                  Wishlist <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4">My Wishlist</h1>
            </div>
          </Container>
        </div>

        <section className="py-5">
          <Container>
            {/* Wallet Balance Display */}
            <div className="bg-light p-4 rounded shadow-sm mb-5">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaWallet className="text-primary me-3" size={32} />
                  <div>
                    <h4 className="mb-1">Wallet Balance</h4>
                    <h3 className="mb-0">{currency} {(userWallet * currencyRates[currency]).toFixed(2)}</h3>
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
                    className="position-relative px-4"
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

            {/* Wishlist Content */}
            {wishlistItems.length === 0 ? (
              <div className="text-center py-5">
                <FaHeart className="text-danger mb-3" size={48} />
                <h3>Your wishlist is empty</h3>
                <p className="text-muted">Browse our products to add items to your wishlist!</p>
                <Link to="/tourist/products" className="btn btn-primary px-4 py-2">
                  Explore Products
                </Link>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {wishlistItems.map((item) => {
                  const product = item.productId;
                  return (
                    <Col key={product._id}>
                      <Card className="h-100 shadow-sm hover-shadow">
                        {product.productImage && product.productImage[0] && (
                          <Card.Img
                            variant="top"
                            src={product.productImage[0].path}
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                        )}
                        <Card.Body>
                          <Card.Title className="h5 mb-3">{product.name}</Card.Title>
                          <Card.Text className="text-muted">{product.description}</Card.Text>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 text-primary">
                              {currency} {(product.price * currencyRates[currency]).toFixed(2)}
                            </h5>
                            <Badge bg={product.quantity > 0 ? "success" : "danger"}>
                              {product.quantity > 0 ? `In Stock: ${product.quantity}` : "Out of Stock"}
                            </Badge>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              variant="primary"
                              className="flex-grow-1 py-2"
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
                          <Card.Footer className="bg-white">
                            <small className="text-muted">
                              Rating:{" "}
                              {product.reviews.length > 0
                                ? `${(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} / 5`
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
          </Container>
        </section>

        {/* Call to Action Section */}
        <section className="py-5">
          <Container>
            <div 
              className="text-center p-5 position-relative"
              style={{
                backgroundImage: 'url("/images/bg_2.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '10px'
              }}
            >
              <div style={overlayStyle}></div>
              <div className="position-relative" style={{ zIndex: 2 }}>
                <h2 className="text-white mb-4">Discover More Amazing Products</h2>
                <p className="text-white mb-4">Explore our collection and find your next favorite items</p>
                <Link to="/tourist/products" className="btn btn-primary px-4 py-3">
                  Browse Collection
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Cart Offcanvas */}
        <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
          {/* ... (keep existing Offcanvas content) ... */}
        </Offcanvas>

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
          {/* ... (keep existing Modal content) ... */}
        </Modal>
      </div>
    </>
  );
};

export default WishlistPage;