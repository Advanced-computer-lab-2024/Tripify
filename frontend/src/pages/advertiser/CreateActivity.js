import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const CreateActivity = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    price: '',
    category: '',
    tags: '',
    discounts: '',
    bookingOpen: false,
    location: null,
  });
  const [marker, setMarker] = useState(null);

  // Use environment variable for Google Maps API Key
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    setFormData(prev => ({ ...prev, location: { lat, lng } }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'description', 'date', 'time', 'price', 'category', 'location'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the ${field} field.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const geoJsonLocation = {
        type: 'Point',
        coordinates: [formData.location.lng, formData.location.lat],
      };

      const activityData = {
        ...formData,
        location: geoJsonLocation,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        price: parseFloat(formData.price), // Ensure price is sent as a number
      };

      console.log('Activity data being sent:', activityData);

      const response = await axios.post('http://localhost:5000/api/activities', activityData);
      console.log('Server response:', response.data);
      alert('Activity created successfully!');
    } catch (error) {
      console.error('Error creating activity:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        alert(`Error creating activity: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        alert('Error creating activity: No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        alert(`Error creating activity: ${error.message}`);
      }
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Create New Activity</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Activity Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Discounts</Form.Label>
              <Form.Control
                type="text"
                name="discounts"
                value={formData.discounts}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Booking Open"
                name="bookingOpen"
                checked={formData.bookingOpen}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
              <GoogleMap
                mapContainerStyle={{ height: '400px', width: '100%' }}
                center={{ lat: 30.0444, lng: 31.2357 }}
                zoom={10}
                onClick={handleMapClick}
              >
                {marker && <Marker position={marker} />}
              </GoogleMap>
            </LoadScript>
            <p className="mt-2">
              <strong>Selected Location:</strong>{' '}
              {marker ? `Lat: ${marker.lat.toFixed(6)}, Lng: ${marker.lng.toFixed(6)}` : 'None'}
            </p>
          </Col>
        </Row>
        <Button variant="primary" type="submit" className="mt-3">
          Create Activity
        </Button>
      </Form>
    </Container>
  );
};

export default CreateActivity;