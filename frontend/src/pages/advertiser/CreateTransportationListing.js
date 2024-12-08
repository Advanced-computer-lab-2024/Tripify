import React, { useState } from "react";
import { 
  Container, 
  Form, 
  Button, 
  Alert, 
  Card,
  Row,
  Col,
  Spinner 
} from "react-bootstrap";
import { 
  FaCar, 
  FaUsers, 
  FaDollarSign,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaList,
  FaCheckSquare,
  FaChevronRight,
  FaTimes,
  FaPlus,
  FaArrowLeft
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdvertiserNavbar from './AdvertiserNavbar';

const CreateTransportationListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleType: "",
    model: "",
    capacity: "",
    price: "",
    availabilityStart: "",
    availabilityEnd: "",
    pickupLocation: "",
    dropoffLocation: "",
    description: "",
    features: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const vehicleTypes = ["Car", "Van", "Bus", "Minibus", "Limousine"];

  const features = [
    "Air Conditioning",
    "WiFi",
    "GPS",
    "Entertainment System",
    "Luggage Space",
    "Wheelchair Accessible",
    "Child Seats Available",
    "Driver Included",
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFeaturesChange = (feature) => {
    setFormData((prev) => {
      const updatedFeatures = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: updatedFeatures };
    });
  };

  const validateForm = () => {
    if (!formData.vehicleType) return "Vehicle type is required";
    if (!formData.model) return "Model is required";
    if (!formData.capacity || formData.capacity <= 0)
      return "Valid capacity is required";
    if (!formData.price || formData.price <= 0)
      return "Valid price is required";
    if (!formData.availabilityStart) return "Start date is required";
    if (!formData.availabilityEnd) return "End date is required";
    if (
      new Date(formData.availabilityEnd) <= new Date(formData.availabilityStart)
    ) {
      return "End date must be after start date";
    }
    if (!formData.pickupLocation) return "Pickup location is required";
    if (!formData.dropoffLocation) return "Dropoff location is required";
    if (!formData.description) return "Description is required";
    return null;
  };
  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    padding: '8rem 0 4rem 0',
    marginBottom: '2rem'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decoded = jwtDecode(token);

      const response = await axios.post(
        "http://localhost:5000/api/transportation",
        {
          ...formData,
          advertiserId: decoded._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Transportation listing created successfully!");
      // Reset form
      setFormData({
        vehicleType: "",
        model: "",
        capacity: "",
        price: "",
        availabilityStart: "",
        availabilityEnd: "",
        pickupLocation: "",
        dropoffLocation: "",
        description: "",
        features: [],
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/advertiser/transportation");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdvertiserNavbar />
      <div className="create-transportation">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/advertiser" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  Create Transportation <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Create Transportation Listing</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-4">
              {/* Header Section */}
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="icon-circle me-3"
                  style={{
                    backgroundColor: '#1089ff',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <FaCar size={24} />
                </div>
                <h3 className="mb-0">Vehicle Details</h3>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCar className="me-2" />
                        Vehicle Type
                      </Form.Label>
                      <Form.Select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      >
                        <option value="">Select vehicle type</option>
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaList className="me-2" />
                        Model
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="e.g., Toyota Hiace 2022"
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaUsers className="me-2" />
                        Capacity (number of passengers)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        placeholder="Enter passenger capacity"
                        required
                        min="1"
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaDollarSign className="me-2" />
                        Price per day (USD)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter daily rate"
                        required
                        min="0"
                        step="0.01"
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCalendarAlt className="me-2" />
                        Availability Start
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="availabilityStart"
                        value={formData.availabilityStart}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCalendarAlt className="me-2" />
                        Availability End
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="availabilityEnd"
                        value={formData.availabilityEnd}
                        onChange={handleInputChange}
                        required
                        min={formData.availabilityStart}
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaMapMarkerAlt className="me-2" />
                        Pickup Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        placeholder="Enter pickup location"
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaMapMarkerAlt className="me-2" />
                        Dropoff Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="dropoffLocation"
                        value={formData.dropoffLocation}
                        onChange={handleInputChange}
                        placeholder="Enter dropoff location"
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter vehicle description and terms"
                        required
                        rows={3}
                        style={{
                          border: '2px solid #eee',
                          borderRadius: '15px'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCheckSquare className="me-2" />
                        Features
                      </Form.Label>
                      <div className="d-flex flex-wrap gap-3">
                        {features.map((feature) => (
                          <Form.Check
                            key={feature}
                            type="checkbox"
                            label={feature}
                            checked={formData.features.includes(feature)}
                            onChange={() => handleFeaturesChange(feature)}
                            className="user-select-none"
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 mt-4">
                  <Button
                    variant="light"
                    onClick={() => navigate("/advertiser/transportation")}
                    className="rounded-pill px-4"
                  >
                    <FaArrowLeft className="me-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-pill px-4"
                    style={{
                      backgroundColor: '#1089ff',
                      border: 'none'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaPlus className="me-2" />
                        Create Listing
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default CreateTransportationListing;