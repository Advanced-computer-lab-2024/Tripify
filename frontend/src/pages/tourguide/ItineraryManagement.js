import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Navbar, Alert } from 'react-bootstrap';
import axios from 'axios';

const ItineraryPage = () => {
  const [itineraries, setItineraries] = useState([]);
  const [tourGuides, setTourGuides] = useState([]);
  const [preferenceTags, setPreferenceTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [alert, setAlert] = useState(null);
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
      createdBy: '',
    },
  });

  useEffect(() => {
    fetchItineraries();
    fetchTourGuides();
    fetchPreferenceTags();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/itineraries');
      setItineraries(response.data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      showAlert('Error fetching itineraries', 'danger');
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
      const response = await axios.get('http://localhost:5000/api/preference-Tags');
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
        showAlert('Itinerary updated successfully', 'success');
      } else {
        await axios.post('http://localhost:5000/api/itineraries', payload);
        showAlert('Itinerary added successfully', 'success');
      }
      fetchItineraries();
      setShowModal(false);
      setCurrentItinerary(null);
      resetFormData();
    } catch (error) {
      console.error('Error saving itinerary:', error);
      showAlert('Error saving itinerary', 'danger');
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
        createdBy: '',
      },
    });
  };

  const handleEdit = (itinerary) => {
    setCurrentItinerary(itinerary);
    setFormData({
      itineraryData: {
        ...itinerary,
        preferenceTags: itinerary.preferenceTags.map(tag => tag._id),
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (itineraryId) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await axios.delete(`http://localhost:5000/api/itineraries/${itineraryId}`);
        fetchItineraries();
        showAlert('Itinerary deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting itinerary:', error);
        showAlert('Error deleting itinerary', 'danger');
      }
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Itinerary Management</Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        {alert && (
          <Alert variant={alert.type} className="mb-4">
            {alert.message}
          </Alert>
        )}

        <Row className="mb-4">
          <Col>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add New Itinerary
            </Button>
          </Col>
        </Row>

        <Table striped bordered hover responsive>
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
                <td>${itinerary.totalPrice}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(itinerary)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(itinerary._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{currentItinerary ? 'Edit Itinerary' : 'Add New Itinerary'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
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
                </Col>
                <Col md={6}>
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
                </Col>
              </Row>

              <Row>
                <Col md={4}>
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
                </Col>
                <Col md={4}>
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
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Drop-off Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="dropoffLocation"
                      value={formData.itineraryData.dropoffLocation}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  name="isActive"
                  checked={formData.itineraryData.isActive}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Timeline</Form.Label>
                {formData.itineraryData.timeline.map((item, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        placeholder="Activity"
                        value={item.activity}
                        onChange={(e) => handleTimelineChange(index, 'activity', e.target.value)}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        placeholder="Start Time"
                        value={item.startTime}
                        onChange={(e) => handleTimelineChange(index, 'startTime', e.target.value)}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        placeholder="End Time"
                        value={item.endTime}
                        onChange={(e) => handleTimelineChange(index, 'endTime', e.target.value)}
                        required
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      itineraryData: {
                        ...prevState.itineraryData,
                        timeline: [
                          ...prevState.itineraryData.timeline,
                          { activity: '', startTime: '', endTime: '' },
                        ],
                      },
                    }))
                  }
                >
                  Add Timeline
                </Button>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Available Dates</Form.Label>
                {formData.itineraryData.availableDates.map((item, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={4}>
                      <Form.Control
                        type="date"
                        value={item.date}
                        onChange={(e) => handleAvailableDatesChange(index, 'date', e.target.value)}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        placeholder="Available Times (comma separated)"
                        value={item.availableTimes.join(',')}
                        onChange={(e) => handleAvailableDatesChange(index, 'availableTimes', e.target.value.split(','))}
                        required
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      itineraryData: {
                        ...prevState.itineraryData,
                        availableDates: [
                          ...prevState.itineraryData.availableDates,
                          { date: '', availableTimes: [''] },
                        ],
                      },
                    }))
                  }
                >
                  Add Available Date
                </Button>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Accessibility Options</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Wheelchair Accessible"
                  checked={formData.itineraryData.accessibility.wheelchairAccessible}
                  onChange={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      itineraryData: {
                        ...prevState.itineraryData,
                        accessibility: {
                          ...prevState.itineraryData.accessibility,
                          wheelchairAccessible: !prevState.itineraryData.accessibility.wheelchairAccessible,
                        },
                      },
                    }))
                  }
                />
                <Form.Check
                  type="checkbox"
                  label="Hearing Impaired"
                  checked={formData.itineraryData.accessibility.hearingImpaired}
                  onChange={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      itineraryData: {
                        ...prevState.itineraryData,
                        accessibility: {
                          ...prevState.itineraryData.accessibility,
                          hearingImpaired: !prevState.itineraryData.accessibility.hearingImpaired,
                        },
                      },
                    }))
                  }
                />
                <Form.Check
                  type="checkbox"
                  label="Visually Impaired"
                  checked={formData.itineraryData.accessibility.visuallyImpaired}
                  onChange={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      itineraryData: {
                        ...prevState.itineraryData,
                        accessibility: {
                          ...prevState.itineraryData.accessibility,
                          visuallyImpaired: !prevState.itineraryData.accessibility.visuallyImpaired,
                        },
                      },
                    }))
                  }
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
    </>
  );
};

export default ItineraryPage;
