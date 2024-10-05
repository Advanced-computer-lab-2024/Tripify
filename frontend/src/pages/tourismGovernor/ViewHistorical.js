import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const HistoricalPlacesPage = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', location: '' });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/historicalplace';

  // Fetch all historical places
  const fetchHistoricalPlaces = async () => {
    try {
      const response = await axios.get(API_URL);
      setHistoricalPlaces(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching data');
    }
  };

  // Create a new historical place
  const createPlace = async () => {
    try {
      const response = await axios.post(API_URL, formData);
      setHistoricalPlaces([...historicalPlaces, response.data]);
      setFormData({ name: '', description: '', location: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating place');
    }
  };

  // Update a historical place
  const updatePlace = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData);
      setHistoricalPlaces(
        historicalPlaces.map((place) => (place._id === id ? response.data : place))
      );
      setSelectedPlace(null);
      setFormData({ name: '', description: '', location: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating place');
    }
  };

  // Delete a historical place
  const deletePlace = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setHistoricalPlaces(historicalPlaces.filter((place) => place._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting place');
    }
  };

  // Fetch historical places on component mount
  useEffect(() => {
    fetchHistoricalPlaces();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for create or update
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPlace) {
      updatePlace(selectedPlace._id);
    } else {
      createPlace();
    }
  };

  // Handle edit button click
  const handleEdit = (place) => {
    setSelectedPlace(place);
    setFormData({ name: place.name, description: place.description, location: place.location });
  };

  return (
    <Container>
      <h1 className="my-4 text-center">Historical Places Management</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={{ span: 6, offset: 3 }}>
          <Card>
            <Card.Body>
              <h3>{selectedPlace ? 'Edit Historical Place' : 'Add New Historical Place'}</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formDescription" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formLocation" className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  {selectedPlace ? 'Update' : 'Create'} Place
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
  {historicalPlaces.map((place) => (
    <Col md={4} key={place._id} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>{place.name}</Card.Title>
          <Card.Text>
            <strong>Description: </strong>{place.description}
            <br />
            {/* Render location details correctly */}
            <strong>Location: </strong>
            {place.location && place.location.coordinates ? (
              <span>
                {`Lat: ${place.location.coordinates[1]}, Lng: ${place.location.coordinates[0]}`}
              </span>
            ) : (
              <span>Location not available</span>
            )}
          </Card.Text>
          <Button variant="warning" onClick={() => handleEdit(place)} className="me-2">
            Edit
          </Button>
          <Button variant="danger" onClick={() => deletePlace(place._id)}>
            Delete
          </Button>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>

    </Container>
  );
};

export default HistoricalPlacesPage;
