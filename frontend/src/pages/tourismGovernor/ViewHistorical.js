import React, { useState, useEffect } from "react";
import axios from "axios";
import GovernorNavbar from './GovernorNavbar';
import {
  Container,
  Form,
  Button,
  Table,
  Modal,
  Alert,
  Badge,
  Card,
  Row,
  Col,
  Spinner
} from "react-bootstrap";
import { 
  FaLandmark,
  FaPlus,
  FaPencilAlt,
  FaTrash,
  FaChevronRight,
  FaMapMarkerAlt,
  FaClock,
  FaTag,
  FaUser,
  FaCheck,
  FaTimes,
  FaTicketAlt,
  FaImages
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const HistoricalPlacesManagement = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [tags, setTags] = useState([]);
  const [tourismGovernors, setTourismGovernors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
      setUserInfo(decoded);
      setIsAdmin(decoded.role === 'admin');

      if (decoded.role !== 'governor' && decoded.role !== 'admin') {
        throw new Error('Unauthorized access - Governor or Admin role required');
      }

      await Promise.all([
        fetchHistoricalPlaces(),
        fetchTags(),
        decoded.role === 'admin' ? fetchTourismGovernors() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "Please log in with appropriate permissions to manage historical places.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalPlaces = async () => {
    try {
      const endpoint = isAdmin 
        ? "http://localhost:5000/api/historicalplace"
        : "http://localhost:5000/api/toursimGovernor/my-places";
      
      const response = await axios.get(endpoint, getAuthConfig());
      setHistoricalPlaces(response.data.places || response.data);
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
    }
  };

  const fetchTourismGovernors = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/toursimGovernor",
        getAuthConfig()
      );
      setTourismGovernors(response.data);
    } catch (error) {
      console.error("Error fetching tourism governors:", error);
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
        const endpoint = isAdmin
          ? `http://localhost:5000/api/historicalplace/${currentPlace._id}`
          : `http://localhost:5000/api/toursimGovernor/places/${currentPlace._id}`;
        response = await axios.put(endpoint, payload, config);
      } else {
        const endpoint = isAdmin
          ? "http://localhost:5000/api/historicalplace"
          : "http://localhost:5000/api/toursimGovernor/places";
        response = await axios.post(endpoint, payload, config);
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
        const endpoint = isAdmin
          ? `http://localhost:5000/api/historicalplace/${id}`
          : `http://localhost:5000/api/toursimGovernor/places/${id}`;
        
        await axios.delete(endpoint, getAuthConfig());
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
      createdBy: place.createdBy?._id || "",
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
      createdBy: "",
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

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading places...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
     <GovernorNavbar />
    <div className="places-management">
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Link to="/governor" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </Link>
              </span>
              <span>
                Historical Places <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Historical Places Management</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {error ? (
          <Alert variant="danger" className="rounded-3 shadow-sm">
            {error}
          </Alert>
        ) : (
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
                    <FaLandmark size={24} />
                  </div>
                  <div>
                    <h3 className="mb-0">Manage Historical Places</h3>
                    {userInfo && (
                      <p className="text-muted mb-0">
                        Logged in as {isAdmin ? "Admin" : "Tourism Governor"}: {userInfo.username}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="rounded-pill px-4"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none'
                  }}
                >
                  <FaPlus className="me-2" />
                  Add New Place
                </Button>
              </div>

              {/* Table Section */}
              {historicalPlaces.length === 0 ? (
                <Alert variant="info" className="rounded-3">
                  No historical places found.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Location</th>
                        <th>Opening Hours</th>
                        <th>Tags</th>
                        {isAdmin && <th>Created By</th>}
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalPlaces.map((place) => (
                        <tr key={place._id}>
                          <td className="fw-bold">{place.name}</td>
                          <td>{place.description}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="text-danger me-2" />
                              {place.location}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaClock className="text-warning me-2" />
                              {place.openingHours}
                            </div>
                          </td>
                          <td>
                            {place.tags.map((tag) => (
                              <Badge 
                                key={tag._id}
                                bg="info" 
                                className="me-1 mb-1"
                                style={{
                                  backgroundColor: '#1089ff',
                                  fontWeight: 'normal'
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </td>
                          {isAdmin && (
                            <td>
                              <div className="d-flex align-items-center">
                                <FaUser className="text-primary me-2" />
                                {place.createdBy?.username || "N/A"}
                              </div>
                            </td>
                          )}
                          <td>
                            <Badge 
                              bg={place.isActive ? "success" : "secondary"}
                              className="rounded-pill"
                            >
                              {place.isActive ? (
                                <><FaCheck className="me-1" /> Active</>
                              ) : (
                                <><FaTimes className="me-1" /> Inactive</>
                              )}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="light"
                              size="sm"
                              onClick={() => handleEdit(place)}
                              className="me-2 rounded-pill"
                            >
                              <FaPencilAlt className="me-1" /> Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(place._id)}
                              className="rounded-pill"
                            >
                              <FaTrash className="me-1" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Form Modal */}
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)} 
          size="lg"
          centered
        >
          <Modal.Header 
            closeButton 
            className="bg-light"
            style={{ borderBottom: 'none' }}
          >
            <Modal.Title className="d-flex align-items-center">
              <FaLandmark className="text-primary me-2" />
              {currentPlace ? "Edit Historical Place" : "Add New Historical Place"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <FaLandmark className="me-2" />
                      Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <FaMapMarkerAlt className="me-2" />
                      Location
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    border: '2px solid #eee',
                    borderRadius: '15px'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <FaImages className="me-2" />
                  Images (comma-separated URLs)
                </Form.Label>
                <Form.Control
                  type="text"
                  name="images"
                  value={formData.images.join(', ')}
                  onChange={handleImageChange}
                  placeholder="http://example.com/image1.jpg, http://example.com/image2.jpg"
                  className="rounded-pill"
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: '2px solid #eee'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <FaClock className="me-2" />
                  Opening Hours
                </Form.Label>
                <Form.Control
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  required
                  className="rounded-pill"
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: '2px solid #eee'
                  }}
                />
              </Form.Group>

              <h5 className="mt-4 d-flex align-items-center">
                <FaTicketAlt className="me-2" />
                Ticket Prices
              </h5>
              <Row>
                {formData.ticketPrices.map((ticket, index) => (
                  <Col md={4} key={ticket.type}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => handleTicketPriceChange(index, e.target.value)}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <h5 className="mt-4 d-flex align-items-center">
                <FaTag className="me-2" />
                Tags
              </h5>
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

              {isAdmin && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <FaUser className="me-2" />
                    Created By
                  </Form.Label>
                  <Form.Select
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    required
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  >
                    <option value="">Select Tourism Governor</option>
                    {tourismGovernors.map((governor) => (
                      <option key={governor._id} value={governor._id}>
                        {governor.username}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

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
                <Button 
                  variant="light"
                  onClick={() => setShowModal(false)} 
                  className="me-2 rounded-pill px-4"
                >
                  <FaTimes className="me-2" />
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  type="submit"
                  className="rounded-pill px-4"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none'
                  }}
                >
                  <FaCheck className="me-2" />
                  {currentPlace ? "Update Place" : "Create Place"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
    </>
  );
};

export default HistoricalPlacesManagement;