import React, { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

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
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h2 className="mb-4">Create Transportation Listing</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Vehicle Type</Form.Label>
              <Form.Select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Toyota Hiace 2022"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacity (number of passengers)</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Enter passenger capacity"
                required
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price per day (USD)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter daily rate"
                required
                min="0"
                step="0.01"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Availability Start</Form.Label>
              <Form.Control
                type="date"
                name="availabilityStart"
                value={formData.availabilityStart}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Availability End</Form.Label>
              <Form.Control
                type="date"
                name="availabilityEnd"
                value={formData.availabilityEnd}
                onChange={handleInputChange}
                required
                min={formData.availabilityStart}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pickup Location</Form.Label>
              <Form.Control
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                placeholder="Enter pickup location"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dropoff Location</Form.Label>
              <Form.Control
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleInputChange}
                placeholder="Enter dropoff location"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter vehicle description and terms"
                required
                rows={3}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Features</Form.Label>
              <div className="d-grid gap-2">
                {features.map((feature) => (
                  <Form.Check
                    key={feature}
                    type="checkbox"
                    label={feature}
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeaturesChange(feature)}
                    className="mb-2"
                  />
                ))}
              </div>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Listing"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/advertiser/transportation")}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateTransportationListing;
