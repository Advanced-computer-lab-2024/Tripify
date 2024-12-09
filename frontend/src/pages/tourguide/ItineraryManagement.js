import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Alert,
  Card,
  Badge,
  Spinner
} from "react-bootstrap";
import { 
  FaRoute, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaChevronRight,
  FaLanguage,
  FaDollarSign,
  FaTags,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaWheelchair,
  FaDeaf,
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import TourguideNavbar from './TourguideNavbar';
const ItineraryManagement = () => {
  const [itineraries, setItineraries] = useState([]);
  const [preferenceTags, setPreferenceTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    totalPrice: 0,
    pickupLocation: "",
    dropoffLocation: "",
    timeline: [{ activity: "", startTime: "", endTime: "" }],
    availableDates: [{ date: "", availableTimes: [""] }],
    accessibility: {
      wheelchairAccessible: false,
      hearingImpaired: false,
      visuallyImpaired: false,
    },
    preferenceTags: [],
    isActive: true,
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const decoded = jwtDecode(token);
      setUserInfo(decoded);
      console.log("Decoded User Info:", userInfo);

      await Promise.all([fetchItineraries(), fetchPreferenceTags()]);
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "Please log in to manage itineraries.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItineraries = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/itineraries",
        getAuthConfig()
      );

      // Log the response to debug
      console.log("Fetched itineraries:", response.data);

      setItineraries(response.data);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      throw error;
    }
  };

  const fetchPreferenceTags = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/preference-tags",
        getAuthConfig()
      );
      setPreferenceTags(response.data);
    } catch (error) {
      console.error("Error fetching preference tags:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTimelineChange = (index, field, value) => {
    const newTimeline = [...formData.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setFormData((prevState) => ({ ...prevState, timeline: newTimeline }));
  };

  const handleAvailableDatesChange = (index, field, value) => {
    const newAvailableDates = [...formData.availableDates];
    if (field === "availableTimes") {
      newAvailableDates[index] = {
        ...newAvailableDates[index],
        [field]: value.split(","),
      };
    } else {
      newAvailableDates[index] = {
        ...newAvailableDates[index],
        [field]: value,
      };
    }
    setFormData((prevState) => ({
      ...prevState,
      availableDates: newAvailableDates,
    }));
  };

  const handleAccessibilityChange = (field) => {
    setFormData((prevState) => ({
      ...prevState,
      accessibility: {
        ...prevState.accessibility,
        [field]: !prevState.accessibility[field],
      },
    }));
  };

  const handlePreferenceTagChange = (tagId) => {
    setFormData((prevState) => {
      const updatedTags = prevState.preferenceTags.includes(tagId)
        ? prevState.preferenceTags.filter((id) => id !== tagId)
        : [...prevState.preferenceTags, tagId];
      return { ...prevState, preferenceTags: updatedTags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itineraryData: {
          ...formData,
          preferenceTags: formData.preferenceTags,
        },
        tourGuideId: userInfo._id, // Add the tourGuideId from userInfo
      };

      const config = getAuthConfig();

      if (currentItinerary) {
        // For updates, we don't need to wrap in itineraryData
        await axios.put(
          `http://localhost:5000/api/itineraries/${currentItinerary._id}`,
          formData, // Send formData directly for updates
          config
        );
      } else {
        // For creation, we need both itineraryData and tourGuideId
        await axios.post(
          "http://localhost:5000/api/itineraries",
          payload,
          config
        );
      }

      await fetchItineraries();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving itinerary:", error);
      setError(error.response?.data?.message || "Error saving itinerary");
    }
  };
  const handleEdit = (itinerary) => {
    setCurrentItinerary(itinerary);
    setFormData({
      name: itinerary.name,
      language: itinerary.language,
      totalPrice: itinerary.totalPrice,
      pickupLocation: itinerary.pickupLocation,
      dropoffLocation: itinerary.dropoffLocation,
      timeline: itinerary.timeline,
      availableDates: itinerary.availableDates,
      accessibility: itinerary.accessibility,
      preferenceTags: itinerary.preferenceTags.map((tag) => tag._id),
      isActive: itinerary.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/itineraries/${id}`,
          getAuthConfig()
        );
        fetchItineraries();
      } catch (error) {
        console.error("Error deleting itinerary:", error);
        setError(error.response?.data?.message || "Error deleting itinerary");
      }
    }
  };

  const resetForm = () => {
    setCurrentItinerary(null);
    setFormData({
      name: "",
      language: "",
      totalPrice: 0,
      pickupLocation: "",
      dropoffLocation: "",
      timeline: [{ activity: "", startTime: "", endTime: "" }],
      availableDates: [{ date: "", availableTimes: [""] }],
      accessibility: {
        wheelchairAccessible: false,
        hearingImpaired: false,
        visuallyImpaired: false,
      },
      preferenceTags: [],
      isActive: true,
    });
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

  return (
    <>
      <TourguideNavbar />
      <div className="itinerary-management">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/guide" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  Itineraries <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Manage Itineraries</h1>
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
                    <FaRoute size={24} />
                  </div>
                  <div>
                    <h3 className="mb-0">My Itineraries</h3>
                    {userInfo && (
                      <p className="text-muted mb-0">
                        Guide: {userInfo.username}
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
                  Add New Itinerary
                </Button>
              </div>

              {error && (
                <Alert variant="danger" className="rounded-3">
                  <FaExclamationTriangle className="me-2" />
                  {error}
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading itineraries...</p>
                </div>
              ) : itineraries.length === 0 ? (
                <div className="text-center py-5">
                  <FaRoute size={48} className="text-muted mb-3" />
                  <h4>No Itineraries Found</h4>
                  <p className="text-muted mb-4">Start by creating your first itinerary!</p>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="rounded-pill px-4"
                    style={{
                      backgroundColor: '#1089ff',
                      border: 'none'
                    }}
                  >
                    <FaPlus className="me-2" />
                    Create Itinerary
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Language</th>
                        <th>Price</th>
                        <th>Tags</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itineraries.map((itinerary) => (
                        <tr key={itinerary._id}>
                          <td className="fw-bold">{itinerary.name}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaLanguage className="text-primary me-2" />
                              {itinerary.language}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaDollarSign className="text-success me-2" />
                              ${itinerary.totalPrice}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {itinerary.preferenceTags.map((tag) => (
                                <Badge 
                                  key={tag._id}
                                  bg="info" 
                                  className="rounded-pill"
                                  style={{
                                    backgroundColor: '#1089ff',
                                    fontWeight: 'normal'
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg={itinerary.isActive ? "success" : "secondary"}
                              className="rounded-pill"
                            >
                              {itinerary.isActive ? (
                                <><FaCheck className="me-1" /> Active</>
                              ) : (
                                <><FaTimes className="me-1" /> Inactive</>
                              )}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="light"
                                className="rounded-pill"
                                onClick={() => handleEdit(itinerary)}
                              >
                                <FaEdit className="me-2" />
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                className="rounded-pill"
                                onClick={() => handleDelete(itinerary._id)}
                              >
                                <FaTrash className="me-2" />
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
        </Container>

        {/* Form Modal */}
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>
              <div className="d-flex align-items-center">
                <FaRoute className="text-primary me-2" />
                {currentItinerary ? "Edit Itinerary" : "Add New Itinerary"}
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaRoute className="me-2" />
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
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaLanguage className="me-2" />
                      Language
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="language"
                      value={formData.language}
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
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaDollarSign className="me-2" />
                      Total Price
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="totalPrice"
                      value={formData.totalPrice}
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
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaMapMarkerAlt className="me-2" />
                      Pickup Location
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
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

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaMapMarkerAlt className="me-2" />
                      Drop-off Location
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
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

                <Col xs={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h5 className="d-flex align-items-center mb-3">
                        <FaClock className="me-2" />
                        Timeline
                      </h5>
                      {formData.timeline.map((item, index) => (
                        <Row key={index} className="mb-3">
                          <Col md={6}>
                            <Form.Control
                              type="text"
                              placeholder="Activity"
                              value={item.activity}
                              onChange={(e) => handleTimelineChange(index, "activity", e.target.value)}
                              className="rounded-pill"
                              style={{
                                padding: '0.75rem 1.25rem',
                                border: '2px solid #eee'
                              }}
                            />
                          </Col>
                          <Col md={3}>
                            <Form.Control
                              type="time"
                              value={item.startTime}
                              onChange={(e) => handleTimelineChange(index, "startTime", e.target.value)}
                              className="rounded-pill"
                              style={{
                                padding: '0.75rem 1.25rem',
                                border: '2px solid #eee'
                              }}
                            />
                          </Col>
                          <Col md={3}>
                            <Form.Control
                              type="time"
                              value={item.endTime}
                              onChange={(e) => handleTimelineChange(index, "endTime", e.target.value)}
                              className="rounded-pill"
                              style={{
                                padding: '0.75rem 1.25rem',
                                border: '2px solid #eee'
                              }}
                            />
                          </Col>
                        </Row>
                      ))}
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          timeline: [...prev.timeline, { activity: "", startTime: "", endTime: "" }]
                        }))}
                      >
                        <FaPlus className="me-2" />
                        Add Timeline Item
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h5 className="d-flex align-items-center mb-3">
                        <FaCalendarAlt className="me-2" />
                        Available Dates
                      </h5>
                      {formData.availableDates.map((item, index) => (
                        <Row key={index} className="mb-3">
                          <Col md={6}>
                            <Form.Control
                              type="date"
                              value={item.date}
                              onChange={(e) => handleAvailableDatesChange(index, "date", e.target.value)}
                              className="rounded-pill"
                              style={{
                                padding: '0.75rem 1.25rem',
                                border: '2px solid #eee'
                              }}
                            />
                            </Col>
                          <Col md={6}>
                            <Form.Control
                              type="text"
                              placeholder="Available Times (comma-separated)"
                              value={item.availableTimes.join(",")}
                              onChange={(e) => handleAvailableDatesChange(index, "availableTimes", e.target.value)}
                              className="rounded-pill"
                              style={{
                                padding: '0.75rem 1.25rem',
                                border: '2px solid #eee'
                              }}
                            />
                          </Col>
                        </Row>
                      ))}
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          availableDates: [...prev.availableDates, { date: "", availableTimes: [""] }]
                        }))}
                      >
                        <FaPlus className="me-2" />
                        Add Available Date
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h5 className="d-flex align-items-center mb-3">
                        <FaWheelchair className="me-2" />
                        Accessibility Options
                      </h5>
                      <div className="d-flex flex-wrap gap-4">
                        <Form.Check
                          type="checkbox"
                          label="Wheelchair Accessible"
                          checked={formData.accessibility.wheelchairAccessible}
                          onChange={() => handleAccessibilityChange("wheelchairAccessible")}
                          className="user-select-none"
                        />
                        <Form.Check
                          type="checkbox"
                          label="Hearing Impaired"
                          checked={formData.accessibility.hearingImpaired}
                          onChange={() => handleAccessibilityChange("hearingImpaired")}
                          className="user-select-none"
                        />
                        <Form.Check
                          type="checkbox"
                          label="Visually Impaired"
                          checked={formData.accessibility.visuallyImpaired}
                          onChange={() => handleAccessibilityChange("visuallyImpaired")}
                          className="user-select-none"
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h5 className="d-flex align-items-center mb-3">
                        <FaTags className="me-2" />
                        Preference Tags
                      </h5>
                      <div className="d-flex flex-wrap gap-3">
                        {preferenceTags.map((tag) => (
                          <Form.Check
                            key={tag._id}
                            type="checkbox"
                            label={tag.name}
                            checked={formData.preferenceTags.includes(tag._id)}
                            onChange={() => handlePreferenceTagChange(tag._id)}
                            className="user-select-none"
                          />
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="user-select-none"
                  />
                </Col>
              </Row>

              <div className="d-flex gap-2 mt-4">
                <Button
                  variant="light"
                  className="rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes className="me-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-pill px-4"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none'
                  }}
                >
                  <FaCheck className="me-2" />
                  {currentItinerary ? "Update Itinerary" : "Create Itinerary"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default ItineraryManagement;