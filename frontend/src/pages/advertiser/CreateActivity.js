import React, { useState, useCallback, useEffect } from "react";
import { 
  Form, 
  Button, 
  Container, 
  Row, 
  Col, 
  Card,
  Alert,
  Spinner,
  Badge
} from "react-bootstrap";
import { 
  FaPlus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaTags,
  FaPercent,
  FaCheck,
  FaChevronRight,
  FaBookOpen,
  FaList
} from "react-icons/fa";

import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MapComponent from './MapComponent'; 
import AdvertiserNavbar from './AdvertiserNavbar';

const CreateActivity = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    price: "",
    category: "",
    tags: [],
    discounts: "",
    bookingOpen: false,
    location: null,
  });
  const [marker, setMarker] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
if (!googleMapsApiKey) {
  console.error('Google Maps API key is missing');
}
  useEffect(() => {
    return () => {
      setMarker(null);
      setFormData(prev => ({ ...prev, location: null }));
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/activities/category"),
          axios.get("http://localhost:5000/api/tags"),
        ]);

        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    setFormData((prev) => ({ ...prev, location: { lat, lng } }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "tags") {
      const selectedTags = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prev) => ({ ...prev, tags: selectedTags }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleTagSelection = (tagId) => {
    setFormData((prev) => {
      const updatedTags = prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: updatedTags };
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "description",
      "date",
      "time",
      "price",
      "category",
      "location",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the ${field} field.`);
        return false;
      }
    }
    return true;
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded); // Let's see what's in the token
      
      // Try different possible ID fields that might be in your token
      const userId = decoded._id || decoded.id || decoded.sub || decoded.userId;
      
      if (!userId) {
        throw new Error('No user ID found in token');
      }
      
      console.log('Extracted userId:', userId); // Verify the extracted ID
      return userId;
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid authentication token');
    }
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
    if (!validateForm()) return;

    try {
      const userId = getUserIdFromToken();
      console.log('User ID for activity creation:', userId); // Verify ID before request
      
      const geoJsonLocation = {
        type: "Point",
        coordinates: [formData.location.lng, formData.location.lat],
      };

      const activityData = {
        ...formData,
        location: geoJsonLocation,
        price: parseFloat(formData.price),
        createdBy: userId,
      };

      console.log('Activity data being sent:', activityData); // Log the full payload

      const token = localStorage.getItem('token');
      const response = await axios.post(
        "http://localhost:5000/api/activities",
        activityData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("Server response:", response.data);
      alert("Activity created successfully!");
    } catch (error) {
      console.error("Error creating activity:", error);
      if (error.message === 'No authentication token found') {
        alert('Please log in to create an activity');
      } else if (error.message === 'No user ID found in token') {
        alert('Unable to identify user. Please log in again.');
      } else {
        alert(
          `Error creating activity: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <>
      <AdvertiserNavbar />
      <div className="create-activity">
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
                  Create Activity <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Create New Activity</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading form data...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="rounded-3 shadow-sm">
              {error}
            </Alert>
          ) : (
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
                    <FaPlus size={24} />
                  </div>
                  <h3 className="mb-0">Activity Details</h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaList className="me-2" />
                          Activity Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
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
                          <FaDollarSign className="me-2" />
                          Price
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
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
                          rows={3}
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          style={{
                            border: '2px solid #eee',
                            borderRadius: '15px'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaCalendarAlt className="me-2" />
                          Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
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
                          <FaClock className="me-2" />
                          Time
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
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
                          <FaList className="me-2" />
                          Category
                        </Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="rounded-pill"
                          style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid #eee'
                          }}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaPercent className="me-2" />
                          Discounts
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="discounts"
                          value={formData.discounts}
                          onChange={handleInputChange}
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
                        <Form.Label className="fw-bold">
                          <FaTags className="me-2" />
                          Tags
                        </Form.Label>
                        <div className="d-flex flex-wrap gap-3">
                          {tags.map((tag) => (
                            <Form.Check
                              key={tag._id}
                              type="checkbox"
                              label={tag.name}
                              checked={formData.tags.includes(tag._id)}
                              onChange={() => handleTagSelection(tag._id)}
                              className="user-select-none"
                            />
                          ))}
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
  <Form.Group>
    <Form.Label className="fw-bold">
      <FaMapMarkerAlt className="me-2" />
      Location
    </Form.Label>
    <div className="rounded-3 overflow-hidden">
      <MapComponent 
        onMapClick={handleMapClick} 
        marker={marker} 
        googleMapsApiKey={googleMapsApiKey}
      />
    </div>
    {marker && (
      <p className="mt-2 text-muted">
        <FaMapMarkerAlt className="me-2" />
        Selected Location: Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
      </p>
    )}
  </Form.Group>
</Col>

                    <Col md={12}>
                      <Form.Group className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          name="bookingOpen"
                          checked={formData.bookingOpen}
                          onChange={handleInputChange}
                          id="booking-checkbox"
                          className="me-2"
                        />
                        <Form.Label htmlFor="booking-checkbox" className="mb-0">
                          <FaBookOpen className="me-2" />
                          Open for Booking
                        </Form.Label>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <Button
                      type="submit"
                      className="rounded-pill px-4"
                      style={{
                        backgroundColor: '#1089ff',
                        border: 'none',
                        padding: '0.75rem 1.5rem'
                      }}
                    >
                      <FaPlus className="me-2" />
                      Create Activity
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </>
  );
};

export default CreateActivity;
