import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Table,
  Modal,
  Alert,
  Badge  // Add this import
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

const HistoricalPlacesManagement = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [governorInfo, setGovernorInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [],
    location: "",
    openingHours: "",
    ticketPrices: [
      { type: "foreigner", price: 0 },
      { type: "native", price: 0 },
      { type: "student", price: 0 },
    ],
    isActive: true,
    tags: [],
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== 'governor') {
        throw new Error('Unauthorized access - Governor role required');
      }
      
      setGovernorInfo(decoded);
      await Promise.all([fetchHistoricalPlaces(), fetchTags()]);
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "Please log in as a governor to manage historical places.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalPlaces = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tourismgovernor/my-places",
        getAuthConfig()
      );
      setHistoricalPlaces(response.data.places || []);
    } catch (error) {
      console.error("Error fetching historical places:", error);
      throw new Error("Error fetching historical places. Please try again later.");
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tags",
        getAuthConfig()
      );
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      // Non-critical error, don't throw
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const payload = {
        ...formData,
        tags: formData.tags,
        images: formData.images,
      };

      const config = getAuthConfig();
      let response;

      if (currentPlace) {
        response = await axios.put(
          `http://localhost:5000/api/tourismgovernor/places/${currentPlace._id}`,
          payload,
          config
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/tourismgovernor/places",
          payload,
          config
        );
      }

      await fetchHistoricalPlaces();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving historical place:", error);
      setError(error.response?.data?.message || "Error saving historical place");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this historical place?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/tourismgovernor/places/${id}`,
          getAuthConfig()
        );
        await fetchHistoricalPlaces();
      } catch (error) {
        console.error("Error deleting historical place:", error);
        setError(error.response?.data?.message || "Error deleting historical place");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleTicketPriceChange = (index, value) => {
    const newTicketPrices = [...formData.ticketPrices];
    newTicketPrices[index].price = Number(value);
    setFormData((prevState) => ({ ...prevState, ticketPrices: newTicketPrices }));
  };
  
  const handleTagChange = (tagId) => {
    setFormData((prevState) => {
      const updatedTags = prevState.tags.includes(tagId)
        ? prevState.tags.filter((id) => id !== tagId)
        : [...prevState.tags, tagId];
      return { ...prevState, tags: updatedTags };
    });
  };
  
  const handleImageChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      images: value.split(',').map(url => url.trim()),
    }));
  };

  const handleEdit = (place) => {
    setCurrentPlace(place);
    setFormData({
      name: place.name,
      description: place.description,
      images: place.images || [],
      location: place.location,
      openingHours: place.openingHours,
      ticketPrices: place.ticketPrices,
      isActive: place.isActive,
      tags: place.tags.map((tag) => tag._id),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentPlace(null);
    setFormData({
      name: "",
      description: "",
      images: [],
      location: "",
      openingHours: "",
      ticketPrices: [
        { type: "foreigner", price: 0 },
        { type: "native", price: 0 },
        { type: "student", price: 0 },
      ],
      isActive: true,
      tags: [],
    });
    setError("");
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4">Historical Places Management</h1>
      {governorInfo && (
        <Alert variant="info" className="mb-3">
          Logged in as Tourism Governor: {governorInfo.username}
        </Alert>
      )}
      
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Add New Historical Place
      </Button>

      {historicalPlaces.length === 0 ? (
        <Alert variant="info">No historical places found.</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Opening Hours</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historicalPlaces.map((place) => (
                <tr key={place._id}>
                  <td>{place.name}</td>
                  <td>{place.description}</td>
                  <td>{place.location}</td>
                  <td>{place.openingHours}</td>
                  <td>{place.tags.map((tag) => tag.name).join(", ")}</td>
                  <td>
                    <Badge bg={place.isActive ? "success" : "secondary"}>
                      {place.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleEdit(place)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(place._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPlace ? "Edit Historical Place" : "Add New Historical Place"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Images (comma-separated URLs)</Form.Label>
              <Form.Control
                type="text"
                name="images"
                value={formData.images.join(', ')}
                onChange={handleImageChange}
                placeholder="http://example.com/image1.jpg, http://example.com/image2.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
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

            <h5 className="mt-4">Ticket Prices</h5>
            {formData.ticketPrices.map((ticket, index) => (
              <Form.Group key={ticket.type} className="mb-3">
                <Form.Label>
                  {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} Price
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticket.price}
                  onChange={(e) => handleTicketPriceChange(index, e.target.value)}
                  required
                />
              </Form.Group>
            ))}

            <h5 className="mt-4">Tags</h5>
            <div className="mb-3">
              {tags.map((tag) => (
                <Form.Check
                  key={tag._id}
                  inline
                  type="checkbox"
                  label={tag.name}
                  checked={formData.tags.includes(tag._id)}
                  onChange={() => handleTagChange(tag._id)}
                  className="me-3"
                />
              ))}
            </div>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="mt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentPlace ? "Update Place" : "Create Place"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default HistoricalPlacesManagement;