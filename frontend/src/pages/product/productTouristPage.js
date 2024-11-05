import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  ListGroup,
} from "react-bootstrap";

const API_URL = "http://localhost:5000/api"; // Adjust this to your backend URL

function ProductTouristPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currency, setCurrency] = useState("USD");

  // Currency rates
  const currencyRates = {
    USD: 1,
    EGP: 49.10,
    SAR: 3.75,
    AED: 3.67,
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, ratingFilter, priceFilter]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products);
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

  const handleAddReview = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reviewData = Object.fromEntries(formData.entries());

    reviewData.rating = Number(reviewData.rating);

    try {
      const response = await axios.post(
        `${API_URL}/products/${selectedProduct._id}`,
        reviewData
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
      alert("Failed to add review. Please try again.");
    }
  };

  // Convert price based on selected currency
  const convertPrice = (price) => {
    return (price * currencyRates[currency]).toFixed(2);
  };

  return (
    <Container>
      <h1 className="my-4">Product Catalog</h1>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
        <Col md={3}>
          <Form.Control
            type="number"
            placeholder="Min Price"
            value={priceFilter.min}
            onChange={(e) =>
              setPriceFilter({ ...priceFilter, min: e.target.value })
            }
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="number"
            placeholder="Max Price"
            value={priceFilter.max}
            onChange={(e) =>
              setPriceFilter({ ...priceFilter, max: e.target.value })
            }
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EGP">EGP</option>
            <option value="SAR">SAR</option>
            <option value="AED">AED</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filteredProducts.map((product) => (
          <Col md={6} lg={4} key={product._id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={product.imageUrl} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text>Price: {convertPrice(product.price)} {currency}</Card.Text>
                <Card.Text>Quantity: {product.quantity}</Card.Text>
                <Card.Text>Seller: {product.seller}</Card.Text>
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
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowReviewModal(true);
                  }}
                >
                  Add Review
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

      {/* Add Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Review for {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddReview}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name (Tourist ID)</Form.Label>
              <Form.Control
                type="text"
                name="reviewerName"
                required
                placeholder="Enter your Tourist ID"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select name="rating" required>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control as="textarea" name="comment" required />
            </Form.Group>
            <Button type="submit">Submit Review</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProductTouristPage;
