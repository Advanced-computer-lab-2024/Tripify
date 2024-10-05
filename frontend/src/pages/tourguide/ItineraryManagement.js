import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, ListGroup, Alert } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:5000/api';

function ItineraryManagement() {
  const [itineraries, setItineraries] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newItinerary, setNewItinerary] = useState({
    name: '',
    activities: [],
    language: '',
    totalPrice: '',
    availableDates: [],
    accessibility: {
      wheelchairAccessible: false,
      hearingImpaired: false,
      visuallyImpaired: false
    },
    pickupLocation: {
      type: 'Point',
      coordinates: ['', '']
    },
    dropoffLocation: {
      type: 'Point',
      coordinates: ['', '']
    }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItineraries();
    fetchActivities();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/itineraries`);
      setItineraries(response.data);
    } catch (err) {
      setError('Failed to fetch itineraries');
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/activities`);
      setActivities(response.data);
    } catch (err) {
      setError('Failed to fetch activities');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (e) => {
    const selectedActivities = Array.from(e.target.selectedOptions, option => option.value);
    setNewItinerary(prev => ({ ...prev, activities: selectedActivities }));
  };

  const handleAccessibilityChange = (e) => {
    const { name, checked } = e.target;
    setNewItinerary(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, [name]: checked }
    }));
  };

  const handleLocationChange = (locationType, e) => {
    const { name, value } = e.target;
    setNewItinerary(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        coordinates: name === 'longitude' 
          ? [value, prev[locationType].coordinates[1]]
          : [prev[locationType].coordinates[0], value]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itineraryToSubmit = {
        ...newItinerary,
        totalPrice: parseFloat(newItinerary.totalPrice),
        pickupLocation: {
          ...newItinerary.pickupLocation,
          coordinates: newItinerary.pickupLocation.coordinates.map(coord => parseFloat(coord))
        },
        dropoffLocation: {
          ...newItinerary.dropoffLocation,
          coordinates: newItinerary.dropoffLocation.coordinates.map(coord => parseFloat(coord))
        }
      };
      await axios.post(`${API_BASE_URL}/itineraries`, itineraryToSubmit);
      fetchItineraries();
      setNewItinerary({
        name: '',
        activities: [],
        language: '',
        totalPrice: '',
        availableDates: [],
        accessibility: {
          wheelchairAccessible: false,
          hearingImpaired: false,
          visuallyImpaired: false
        },
        pickupLocation: {
          type: 'Point',
          coordinates: ['', '']
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: ['', '']
        }
      });
    } catch (err) {
      setError('Failed to create itinerary');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Itinerary Management</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col md={6}>
          <h2>Create New Itinerary</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newItinerary.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Activities</Form.Label>
              <Form.Control
                as="select"
                multiple
                name="activities"
                value={newItinerary.activities}
                onChange={handleActivityChange}
                required
              >
                {activities.map(activity => (
                  <option key={activity._id} value={activity._id}>
                    {activity.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={newItinerary.language}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Total Price</Form.Label>
              <Form.Control
                type="number"
                name="totalPrice"
                value={newItinerary.totalPrice}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Accessibility</Form.Label>
              <Form.Check
                type="checkbox"
                label="Wheelchair Accessible"
                name="wheelchairAccessible"
                checked={newItinerary.accessibility.wheelchairAccessible}
                onChange={handleAccessibilityChange}
              />
              <Form.Check
                type="checkbox"
                label="Hearing Impaired"
                name="hearingImpaired"
                checked={newItinerary.accessibility.hearingImpaired}
                onChange={handleAccessibilityChange}
              />
              <Form.Check
                type="checkbox"
                label="Visually Impaired"
                name="visuallyImpaired"
                checked={newItinerary.accessibility.visuallyImpaired}
                onChange={handleAccessibilityChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pickup Location</Form.Label>
              <Form.Control
                type="number"
                name="longitude"
                placeholder="Longitude"
                value={newItinerary.pickupLocation.coordinates[0]}
                onChange={(e) => handleLocationChange('pickupLocation', e)}
                required
              />
              <Form.Control
                type="number"
                name="latitude"
                placeholder="Latitude"
                value={newItinerary.pickupLocation.coordinates[1]}
                onChange={(e) => handleLocationChange('pickupLocation', e)}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Dropoff Location</Form.Label>
              <Form.Control
                type="number"
                name="longitude"
                placeholder="Longitude"
                value={newItinerary.dropoffLocation.coordinates[0]}
                onChange={(e) => handleLocationChange('dropoffLocation', e)}
                required
              />
              <Form.Control
                type="number"
                name="latitude"
                placeholder="Latitude"
                value={newItinerary.dropoffLocation.coordinates[1]}
                onChange={(e) => handleLocationChange('dropoffLocation', e)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Create Itinerary
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <h2>Existing Itineraries</h2>
          <ListGroup>
            {itineraries.map(itinerary => (
              <ListGroup.Item key={itinerary._id}>
                <h3>{itinerary.name}</h3>
                <p>Language: {itinerary.language}</p>
                <p>Total Price: ${itinerary.totalPrice}</p>
                <p>Activities: {itinerary.activities.length}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default ItineraryManagement;