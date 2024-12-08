import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Card,
  Alert,
  Spinner,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import { 
  FaEdit, 
  FaTrashAlt, 
  FaMapMarkerAlt,
  FaChevronRight,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaTags,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import AdvertiserNavbar from './AdvertiserNavbar';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/activities');
      setActivities(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to fetch activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowModal(true);
  };

  const handleDelete = (activity) => {
    setSelectedActivity(activity);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/activities/${selectedActivity._id}`);
      setActivities((prevActivities) => 
        prevActivities.filter((activity) => activity._id !== selectedActivity._id)
      );
      setShowDeleteModal(false);
      setSelectedActivity(null);
      setSuccess("Activity deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity. Please try again.');
    }
  };

  const handleViewLocation = (activity) => {
    setSelectedActivity(activity);
    setShowLocationModal(true);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/activities/${editingActivity._id}`,
        editingActivity
      );
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity._id === response.data._id ? response.data : activity
        )
      );
      setShowModal(false);
      setSuccess("Activity updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error updating activity:', error);
      setError('Failed to update activity. Please try again.');
    }
  };

  return (
    <>
      <AdvertiserNavbar />
      <div className="activities-page">
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
                  Activities <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Manage Activities</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-4">
              {/* Header Section */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
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
                    <FaTags size={24} />
                  </div>
                  <h3 className="mb-0">Your Activities</h3>
                </div>
                <Link 
                  to="/advertiser/create-activity"
                  className="btn btn-primary rounded-pill px-4"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none'
                  }}
                >
                  <FaPlus className="me-2" />
                  Add New Activity
                </Link>
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

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <Alert variant="info" className="rounded-3">
                  No activities found.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Date & Time</th>
                        <th>Price</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity) => (
                        <tr key={activity._id}>
                          <td className="fw-bold">{activity.name}</td>
                          <td>{activity.description}</td>
                          <td>
                            <Badge 
                              bg="info" 
                              className="rounded-pill"
                              style={{
                                backgroundColor: '#1089ff',
                                fontWeight: 'normal'
                              }}
                            >
                              {activity.category?.name || 'No Category'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="text-primary me-2" />
                              {activity.date}
                              <FaClock className="text-warning ms-3 me-2" />
                              {activity.time}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaDollarSign className="text-success me-1" />
                              {activity.price}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="light"
                                className="rounded-pill"
                                onClick={() => handleEdit(activity)}
                              >
                                <FaEdit className="me-2" />
                                Edit
                              </Button>
                              <Button
                                variant="light"
                                className="rounded-pill"
                                onClick={() => handleViewLocation(activity)}
                              >
                                <FaMapMarkerAlt className="me-2" />
                                Location
                              </Button>
                              <Button
                                variant="danger"
                                className="rounded-pill"
                                onClick={() => handleDelete(activity)}
                              >
                                <FaTrashAlt className="me-2" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Edit Modal */}
          <Modal 
            show={showModal} 
            onHide={() => setShowModal(false)}
            centered
          >
            <Modal.Header 
              closeButton 
              className="bg-light"
            >
              <Modal.Title className="d-flex align-items-center">
                <FaEdit className="text-primary me-2" />
                Edit Activity
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editingActivity?.name || ''}
                    onChange={(e) => setEditingActivity({
                      ...editingActivity,
                      name: e.target.value
                    })}
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={editingActivity?.description || ''}
                    onChange={(e) => setEditingActivity({
                      ...editingActivity,
                      description: e.target.value
                    })}
                    style={{
                      border: '2px solid #eee',
                      borderRadius: '15px'
                    }}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={editingActivity?.date || ''}
                        onChange={(e) => setEditingActivity({
                          ...editingActivity,
                          date: e.target.value
                        })}
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
                      <Form.Label className="fw-bold">Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={editingActivity?.time || ''}
                        onChange={(e) => setEditingActivity({
                          ...editingActivity,
                          time: e.target.value
                        })}
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label className="fw-bold">Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editingActivity?.price || ''}
                    onChange={(e) => setEditingActivity({
                      ...editingActivity,
                      price: e.target.value
                    })}
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="light"
                className="rounded-pill"
                onClick={() => setShowModal(false)}
              >
                <FaTimes className="me-2" />
                Cancel
              </Button>
              <Button
                variant="primary"
                className="rounded-pill"
                onClick={handleSaveChanges}
                style={{
                  backgroundColor: '#1089ff',
                  border: 'none'
                }}
              >
                <FaSave className="me-2" />
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Delete Modal */}
          <Modal 
            show={showDeleteModal} 
            onHide={() => setShowDeleteModal(false)}
            centered
          >
            <Modal.Header 
              closeButton 
              className="bg-danger text-white"
            >
              <Modal.Title className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                Confirm Deletion
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <p className="mb-0">Are you sure you want to delete this activity? This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="light"
                className="rounded-pill"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes className="me-2" />
                Cancel
              </Button>
              <Button
                variant="danger"
                className="rounded-pill"
                onClick={confirmDelete}
              >
                <FaTrashAlt className="me-2" />
                Delete Activity
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Location Modal */}
          <Modal 
            show={showLocationModal} 
            onHide={() => setShowLocationModal(false)}
            centered
            size="lg"
          >
            <Modal.Header 
              closeButton 
              className="bg-light"
            >
              <Modal.Title className="d-flex align-items-center">
                <FaMapMarkerAlt className="text-primary me-2" />
                Activity Location
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              {selectedActivity?.location && (
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                  <GoogleMap
                    mapContainerStyle={{ height: '400px', width: '100%' }}
                    center={{
                      lat: selectedActivity.location.coordinates[1],
                      lng: selectedActivity.location.coordinates[0],
                    }}
                    zoom={15}
                  >
                    <Marker 
                      position={{
                        lat: selectedActivity.location.coordinates[1],
                        lng: selectedActivity.location.coordinates[0],
                      }} 
                    />
                  </GoogleMap>
                </LoadScript>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="light"
                className="rounded-pill"
                onClick={() => setShowLocationModal(false)}
              >
                <FaTimes className="me-2" />
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default ActivityList;