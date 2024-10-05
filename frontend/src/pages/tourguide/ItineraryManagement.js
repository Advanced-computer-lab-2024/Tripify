import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const ItineraryPage = () => {
  const [itineraries, setItineraries] = useState([]);
  const [tourGuides, setTourGuides] = useState([]);
  const [preferenceTags, setPreferenceTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [formData, setFormData] = useState({
    itineraryData: {
      name: '',
      language: '',
      totalPrice: 0,
      pickupLocation: '',
      dropoffLocation: '',
      isActive: true,
      timeline: [{ activity: '', startTime: '', endTime: '' }],
      availableDates: [{ date: '', availableTimes: [''] }],
      accessibility: {
        wheelchairAccessible: false,
        hearingImpaired: false,
        visuallyImpaired: false,
      },
      preferenceTags: [],
      createdBy: '', // Added createdBy
    },
  });

  useEffect(() => {
    fetchItineraries();
    fetchTourGuides();
    fetchPreferenceTags(); // Fetching preference tags
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/itineraries');
      setItineraries(response.data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  const fetchTourGuides = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tourguide');
      setTourGuides(response.data);
    } catch (error) {
      console.error('Error fetching tour guides:', error);
    }
  };

  const fetchPreferenceTags = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/preferenceTags');
      setPreferenceTags(response.data);
    } catch (error) {
      console.error('Error fetching preference tags:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      itineraryData: {
        ...prevState.itineraryData,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleTimelineChange = (index, field, value) => {
    const updatedTimeline = formData.itineraryData.timeline.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData((prevState) => ({
      ...prevState,
      itineraryData: {
        ...prevState.itineraryData,
        timeline: updatedTimeline,
      },
    }));
  };

  const handleAvailableDatesChange = (index, field, value) => {
    const updatedAvailableDates = formData.itineraryData.availableDates.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData((prevState) => ({
      ...prevState,
      itineraryData: {
        ...prevState.itineraryData,
        availableDates: updatedAvailableDates,
      },
    }));
  };

  const handlePreferenceTagChange = (tagId) => {
    const currentTags = formData.itineraryData.preferenceTags;
    if (currentTags.includes(tagId)) {
      setFormData((prevState) => ({
        ...prevState,
        itineraryData: {
          ...prevState.itineraryData,
          preferenceTags: currentTags.filter((tag) => tag !== tagId),
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        itineraryData: {
          ...prevState.itineraryData,
          preferenceTags: [...currentTags, tagId],
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { itineraryData: formData.itineraryData };
      if (currentItinerary) {
        await axios.put(`http://localhost:5000/api/itineraries/${currentItinerary._id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/itineraries', payload);
      }
      fetchItineraries();
      setShowModal(false);
      setCurrentItinerary(null);
      resetFormData();
    } catch (error) {
      console.error('Error saving itinerary:', error);
    }
  };

  const resetFormData = () => {
    setFormData({
      itineraryData: {
        name: '',
        language: '',
        totalPrice: 0,
        pickupLocation: '',
        dropoffLocation: '',
        isActive: true,
        timeline: [{ activity: '', startTime: '', endTime: '' }],
        availableDates: [{ date: '', availableTimes: [''] }],
        accessibility: {
          wheelchairAccessible: false,
          hearingImpaired: false,
          visuallyImpaired: false,
        },
        preferenceTags: [],
        createdBy: '', // Reset createdBy
      },
    });
  };

  const handleEdit = (itinerary) => {
    setCurrentItinerary(itinerary);
    setFormData({
      itineraryData: {
        name: itinerary.name,
        language: itinerary.language,
        totalPrice: itinerary.totalPrice,
        pickupLocation: itinerary.pickupLocation,
        dropoffLocation: itinerary.dropoffLocation,
        isActive: itinerary.isActive,
        timeline: itinerary.timeline,
        availableDates: itinerary.availableDates,
        accessibility: itinerary.accessibility,
        preferenceTags: itinerary.preferenceTags,
        createdBy: itinerary.createdBy || '', // Handle createdBy
      },
    });
    setShowModal(true);
  };

  return (
    <Container>
      <Button onClick={() => setShowModal(true)}>Add New Itinerary</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Language</th>
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {itineraries.map((itinerary) => (
            <tr key={itinerary._id}>
              <td>{itinerary.name}</td>
              <td>{itinerary.language}</td>
              <td>{itinerary.totalPrice}</td>
              <td>
                <Button onClick={() => handleEdit(itinerary)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentItinerary ? 'Edit Itinerary' : 'Add New Itinerary'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.itineraryData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={formData.itineraryData.language}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total Price</Form.Label>
              <Form.Control
                type="number"
                name="totalPrice"
                value={formData.itineraryData.totalPrice}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pickup Location</Form.Label>
              <Form.Control
                type="text"
                name="pickupLocation"
                value={formData.itineraryData.pickupLocation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dropoff Location</Form.Label>
              <Form.Control
                type="text"
                name="dropoffLocation"
                value={formData.itineraryData.dropoffLocation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Created By</Form.Label>
              <Form.Control
                type="text"
                name="createdBy"
                value={formData.itineraryData.createdBy}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Timeline</Form.Label>
              {formData.itineraryData.timeline.map((item, index) => (
                <div key={index}>
                  <Form.Control
                    type="text"
                    placeholder="Activity"
                    value={item.activity}
                    onChange={(e) => handleTimelineChange(index, 'activity', e.target.value)}
                    required
                  />
                  <Form.Control
                    type="text"
                    placeholder="Start Time"
                    value={item.startTime}
                    onChange={(e) => handleTimelineChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <Form.Control
                    type="text"
                    placeholder="End Time"
                    value={item.endTime}
                    onChange={(e) => handleTimelineChange(index, 'endTime', e.target.value)}
                    required
                  />
                </div>
              ))}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Available Dates</Form.Label>
              {formData.itineraryData.availableDates.map((dateItem, index) => (
                <div key={index}>
                  <Form.Control
                    type="date"
                    placeholder="Date"
                    value={dateItem.date}
                    onChange={(e) => handleAvailableDatesChange(index, 'date', e.target.value)}
                    required
                  />
                  <Form.Control
                    type="text"
                    placeholder="Available Times"
                    value={dateItem.availableTimes.join(', ')}
                    onChange={(e) => handleAvailableDatesChange(index, 'availableTimes', e.target.value.split(', '))}
                    required
                  />
                </div>
              ))}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Accessibility</Form.Label>
              <Form.Check
                type="checkbox"
                label="Wheelchair Accessible"
                name="wheelchairAccessible"
                checked={formData.itineraryData.accessibility.wheelchairAccessible}
                onChange={handleInputChange}
              />
              <Form.Check
                type="checkbox"
                label="Hearing Impaired"
                name="hearingImpaired"
                checked={formData.itineraryData.accessibility.hearingImpaired}
                onChange={handleInputChange}
              />
              <Form.Check
                type="checkbox"
                label="Visually Impaired"
                name="visuallyImpaired"
                checked={formData.itineraryData.accessibility.visuallyImpaired}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preference Tags</Form.Label>
              {preferenceTags.map((tag) => (
                <Form.Check
                  key={tag._id}
                  type="checkbox"
                  label={tag.name}
                  checked={formData.itineraryData.preferenceTags.includes(tag._id)}
                  onChange={() => handlePreferenceTagChange(tag._id)}
                />
              ))}
            </Form.Group>
            <Button variant="primary" type="submit">
              {currentItinerary ? 'Update Itinerary' : 'Add Itinerary'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ItineraryPage;
