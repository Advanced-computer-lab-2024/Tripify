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
  Alert,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

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

  return (
    <Container>
      <h1 className="my-4">Itinerary Management</h1>
      {userInfo && (
        <Alert variant="info" className="mb-3">
          Logged in as: {userInfo.username}
        </Alert>
      )}

      <Button onClick={() => setShowModal(true)} className="mb-3">
        Add New Itinerary
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Language</th>
            <th>Total Price</th>
            <th>Preference Tags</th>
            <th>Created By</th>
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
                {itinerary.preferenceTags.map((tag) => tag.name).join(", ")}
              </td>
              <td>{itinerary.createdBy?.username || "N/A"}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleEdit(itinerary)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(itinerary._id)}
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
            {currentItinerary ? "Edit Itinerary" : "Add New Itinerary"}
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
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total Price</Form.Label>
              <Form.Control
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pickup Location</Form.Label>
              <Form.Control
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Drop-off Location</Form.Label>
              <Form.Control
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <h5 className="mt-3">Timeline</h5>
            {formData.timeline.map((item, index) => (
              <Row key={index} className="mb-3">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Activity"
                    value={item.activity}
                    onChange={(e) =>
                      handleTimelineChange(index, "activity", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={item.startTime}
                    onChange={(e) =>
                      handleTimelineChange(index, "startTime", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={item.endTime}
                    onChange={(e) =>
                      handleTimelineChange(index, "endTime", e.target.value)
                    }
                  />
                </Col>
              </Row>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="mb-3"
              onClick={() =>
                setFormData((prevState) => ({
                  ...prevState,
                  timeline: [
                    ...prevState.timeline,
                    { activity: "", startTime: "", endTime: "" },
                  ],
                }))
              }
            >
              Add Timeline Item
            </Button>

            <h5 className="mt-3">Available Dates</h5>
            {formData.availableDates.map((item, index) => (
              <Row key={index} className="mb-3">
                <Col>
                  <Form.Control
                    type="date"
                    value={item.date}
                    onChange={(e) =>
                      handleAvailableDatesChange(index, "date", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Available Times (comma-separated)"
                    value={item.availableTimes.join(",")}
                    onChange={(e) =>
                      handleAvailableDatesChange(
                        index,
                        "availableTimes",
                        e.target.value
                      )
                    }
                  />
                </Col>
              </Row>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="mb-3"
              onClick={() =>
                setFormData((prevState) => ({
                  ...prevState,
                  availableDates: [
                    ...prevState.availableDates,
                    { date: "", availableTimes: [""] },
                  ],
                }))
              }
            >
              Add Available Date
            </Button>

            <h5 className="mt-3">Accessibility</h5>
            <Form.Check
              type="checkbox"
              label="Wheelchair Accessible"
              checked={formData.accessibility.wheelchairAccessible}
              onChange={() => handleAccessibilityChange("wheelchairAccessible")}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              label="Hearing Impaired"
              checked={formData.accessibility.hearingImpaired}
              onChange={() => handleAccessibilityChange("hearingImpaired")}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              label="Visually Impaired"
              checked={formData.accessibility.visuallyImpaired}
              onChange={() => handleAccessibilityChange("visuallyImpaired")}
              className="mb-3"
            />

            <h5 className="mt-3">Preference Tags</h5>
            <div className="mb-3">
              {preferenceTags.map((tag) => (
                <Form.Check
                  key={tag._id}
                  inline
                  type="checkbox"
                  label={tag.name}
                  checked={formData.preferenceTags.includes(tag._id)}
                  onChange={() => handlePreferenceTagChange(tag._id)}
                  className="me-3 mb-2"
                />
              ))}
            </div>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentItinerary ? "Update Itinerary" : "Create Itinerary"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ItineraryManagement;
