import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Card } from 'react-bootstrap';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const API_URL = 'http://localhost:5000/api'; // Replace with your actual API URL
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ['places'];

const HistoricalPlacesApp = () => {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [''],
    location: { type: 'Point', coordinates: [] }, // Updated for GeoJSON
    openingHours: '',
    ticketPrices: [{ type: 'foreigner', price: 0 }, { type: 'native', price: 0 }, { type: 'student', price: 0 }],
    isActive: true,
  });
  const [mapCenter, setMapCenter] = useState({ lat: 30.0444, lng: 31.2357 }); // Default to Cairo, Egypt

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get(`${API_URL}/historicalplace`);
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const handleTicketPriceChange = (index, field, value) => {
    setFormData(prev => {
      const newTicketPrices = [...prev.ticketPrices];
      newTicketPrices[index] = { ...newTicketPrices[index], [field]: value };
      return { ...prev, ticketPrices: newTicketPrices };
    });
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latLng;
    setMapCenter({ lat: lat(), lng: lng() });
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [lng, lat()], // Save as [longitude, latitude]
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlace) {
        await axios.put(`${API_URL}/historicalplace/${selectedPlace._id}`, formData);
      } else {
        await axios.post(`${API_URL}/historicalplace`, formData);
      }
      fetchPlaces();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      images: [''],
      location: { type: 'Point', coordinates: [] },
      openingHours: '',
      ticketPrices: [{ type: 'foreigner', price: 0 }, { type: 'native', price: 0 }, { type: 'student', price: 0 }],
      isActive: true,
    });
    setSelectedPlace(null);
    setMapCenter({ lat: 30.0444, lng: 31.2357 }); // Reset to default center
  };

  const handleEdit = (place) => {
    setSelectedPlace(place);
    setFormData({
      name: place.name || '',
      description: place.description || '',
      images: place.images || [''],
      location: place.location || { type: 'Point', coordinates: [] },
      openingHours: place.openingHours || '',
      ticketPrices: place.ticketPrices || [{ type: 'foreigner', price: 0 }, { type: 'native', price: 0 }, { type: 'student', price: 0 }],
      isActive: place.isActive !== undefined ? place.isActive : true,
    });
    setMapCenter({ lat: place.location.coordinates[1], lng: place.location.coordinates[0] });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/historicalplace/${id}`);
      fetchPlaces();
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Historical Places</h1>
      <Row>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
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
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Images (URLs)</Form.Label>
              {formData.images.map((image, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="mb-2"
                  required
                />
              ))}
              <Button variant="secondary" size="sm" onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}>
                Add Image URL
              </Button>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <LoadScript
  googleMapsApiKey={googleMapsApiKey}
  libraries={libraries}
>

                <GoogleMap
                  mapContainerStyle={{ height: '400px', width: '100%' }}
                  center={mapCenter}
                  zoom={15}
                  onClick={handleMapClick}
                >
                  {formData.location.coordinates.length > 0 && (
                    <Marker position={{ lat: mapCenter.lat, lng: mapCenter.lng }} />
                  )}
                </GoogleMap>
              </LoadScript>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Opening Hours</Form.Label>
              <Form.Control
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ticket Prices</Form.Label>
              {formData.ticketPrices.map((ticket, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    value={ticket.type}
                    onChange={(e) => handleTicketPriceChange(index, 'type', e.target.value)}
                    className="me-2"
                    required
                  />
                  <Form.Control
                    type="number"
                    value={ticket.price}
                    onChange={(e) => handleTicketPriceChange(index, 'price', parseFloat(e.target.value))}
                    required
                  />
                </div>
              ))}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Active"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {selectedPlace ? 'Update Place' : 'Add Place'}
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <ListGroup>
            {places.map((place) => (
              <ListGroup.Item key={place._id}>
                <Card>
                  <Card.Body>
                    <Card.Title>{place.name}</Card.Title>
                    <Card.Text>{place.description}</Card.Text>
                    <Button variant="info" onClick={() => handleEdit(place)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(place._id)}>Delete</Button>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default HistoricalPlacesApp;
