import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Badge,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FaPlus,
  FaPencilAlt,
  FaTrash,
  FaStar,
  FaMapMarkerAlt,
  FaArrowLeft
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeliveryAddresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tourist/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      setError('Failed to fetch addresses');
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = editingAddress 
        ? `http://localhost:5000/api/tourist/address/${editingAddress._id}`
        : 'http://localhost:5000/api/tourist/address';
      
      const method = editingAddress ? 'put' : 'post';
      
      const response = await axios[method](endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchAddresses();
        handleCloseModal();
        alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save address');
      console.error('Error saving address:', error);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tourist/address/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchAddresses();
        alert('Address deleted successfully!');
      } catch (error) {
        setError('Failed to delete address');
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tourist/address/${addressId}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      await fetchAddresses();
    } catch (error) {
      setError('Failed to set default address');
      console.error('Error setting default address:', error);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      isDefault: false
    });
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate(-1)}
              className="rounded-pill"
            >
              <FaArrowLeft className="me-2" />
              Back
            </Button>
            <h1 className="mb-0">My Delivery Addresses</h1>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" />
            Add New Address
          </Button>
        </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        {addresses.map((address) => (
          <Col md={6} lg={4} key={address._id} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">
                      {address.label}
                      {address.isDefault && (
                        <Badge bg="success" className="ms-2">Default</Badge>
                      )}
                    </h5>
                  </div>
                  <div>
                    {!address.isDefault && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                        className="me-2"
                      >
                        <FaStar className="me-1" />
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <FaMapMarkerAlt className="me-2 text-primary" />
                  <div className="ms-4">
                    <p className="mb-1">{address.street}</p>
                    <p className="mb-1">{address.city}, {address.state}</p>
                    <p className="mb-1">{address.country}, {address.postalCode}</p>
                  </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(address)}
                  >
                    <FaPencilAlt className="me-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(address._id)}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address Label</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Home, Work, etc."
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street address"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Set as default address"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DeliveryAddresses;