import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
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
      setActivities((prevActivities) => prevActivities.filter((activity) => activity._id !== selectedActivity._id));
      setShowDeleteModal(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleViewLocation = (activity) => {
    setSelectedActivity(activity);
    setShowLocationModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingActivity(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedActivity(null);
  };

  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setSelectedActivity(null);
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
      handleCloseModal();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingActivity((prevActivity) => ({
      ...prevActivity,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Activity List</h2>
      <Table striped bordered hover responsive>
        <thead className="thead-dark">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity._id}>
              <td>{activity.name}</td>
              <td>{activity.description}</td>
              <td>{activity.category?.name || 'No Category'}</td>
              <td>{activity.date}</td>
              <td>{activity.time}</td>
              <td>{activity.price}</td>
              <td className="text-center">
                <FaEdit
                  className="text-primary mx-2"
                  role="button"
                  onClick={() => handleEdit(activity)}
                  size={20}
                />
                <FaMapMarkerAlt
                  className="text-info mx-2"
                  role="button"
                  onClick={() => handleViewLocation(activity)}
                  size={20}
                />
                <FaTrashAlt
                  className="text-danger mx-2"
                  role="button"
                  onClick={() => handleDelete(activity)}
                  size={20}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Activity Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editingActivity?.name || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editingActivity?.description || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={editingActivity?.date || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={editingActivity?.time || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={editingActivity?.price || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this activity?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Location Viewer Modal */}
      <Modal show={showLocationModal} onHide={handleCloseLocationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Activity Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedActivity?.location && (
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
              <GoogleMap
                mapContainerStyle={{ height: '400px', width: '100%' }}
                center={{
                  lat: selectedActivity.location.coordinates[1],
                  lng: selectedActivity.location.coordinates[0],
                }}
                zoom={10}
              >
                <Marker position={{
                  lat: selectedActivity.location.coordinates[1],
                  lng: selectedActivity.location.coordinates[0],
                }} />
              </GoogleMap>
            </LoadScript>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLocationModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ActivityList;
