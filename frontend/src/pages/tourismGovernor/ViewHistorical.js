import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
} from "react-bootstrap";

const HistoricalPlacesManagement = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [tags, setTags] = useState([]);
  const [tourismGovernors, setTourismGovernors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
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
    createdBy: "",
  });

  useEffect(() => {
    fetchHistoricalPlaces();
    fetchTags();
    fetchTourismGovernors();
  }, []);

  const fetchHistoricalPlaces = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/historicalplace");
      setHistoricalPlaces(response.data);
    } catch (error) {
      console.error("Error fetching historical places:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tags");
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchTourismGovernors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tourismgovernor");
      setTourismGovernors(response.data);
    } catch (error) {
      console.error("Error fetching tourism governors:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags,
        images: formData.images,
      };

      console.log("Submitting payload:", payload);  // Log the payload

      let response;
      if (currentPlace) {
        response = await axios.put(
          `http://localhost:5000/api/historicalplace/${currentPlace._id}`,
          payload
        );
      } else {
        response = await axios.post("http://localhost:5000/api/historicalplace", payload);
      }

      console.log("API response:", response.data);  // Log the response

      fetchHistoricalPlaces();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving historical place:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    }
  };

  const handleEdit = (place) => {
    setCurrentPlace(place);
    setFormData({
      name: place.name,
      description: place.description,
      images: place.images,
      location: place.location,
      openingHours: place.openingHours,
      ticketPrices: place.ticketPrices,
      isActive: place.isActive,
      tags: place.tags.map((tag) => tag._id),
      createdBy: place.createdBy?._id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this historical place?")) {
      try {
        await axios.delete(`http://localhost:5000/api/historicalplace/${id}`);
        fetchHistoricalPlaces();
      } catch (error) {
        console.error("Error deleting historical place:", error);
      }
    }
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
      createdBy: "",
    });
  };

  return (
    <Container>
      <h1 className="my-4">Historical Places Management</h1>
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Add New Historical Place
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Opening Hours</th>
            <th>Tags</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {historicalPlaces.map((place) => (
            <tr key={place._id}>
              <td>{place.name}</td>
              <td>{place.location}</td>
              <td>{place.openingHours}</td>
              <td>{place.tags.map((tag) => tag.name).join(", ")}</td>
              <td>{place.createdBy?.username || "N/A"}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleEdit(place)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(place._id)}
                  className="ml-2"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPlace ? "Edit Historical Place" : "Add New Historical Place"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Images (comma-separated URLs)</Form.Label>
              <Form.Control
                type="text"
                name="images"
                value={formData.images.join(', ')}
                onChange={handleImageChange}
                placeholder="http://example.com/image1.jpg, http://example.com/image2.jpg"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Opening Hours</Form.Label>
              <Form.Control
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <h5 className="mt-3">Ticket Prices</h5>
            {formData.ticketPrices.map((ticket, index) => (
              <Form.Group key={ticket.type}>
                <Form.Label>{ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}</Form.Label>
                <Form.Control
                  type="number"
                  value={ticket.price}
                  onChange={(e) => handleTicketPriceChange(index, e.target.value)}
                  required
                />
              </Form.Group>
            ))}

            <h5 className="mt-3">Tags</h5>
            {tags.map((tag) => (
              <Form.Check
                key={tag._id}
                type="checkbox"
                label={tag.name}
                checked={formData.tags.includes(tag._id)}
                onChange={() => handleTagChange(tag._id)}
              />
            ))}

            <Form.Group>
              <Form.Label>Created By</Form.Label>
              <Form.Control
                as="select"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Tourism Governor</option>
                {tourismGovernors.map((governor) => (
                  <option key={governor._id} value={governor._id}>
                    {governor.username}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {currentPlace ? "Update Historical Place" : "Create Historical Place"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default HistoricalPlacesManagement;