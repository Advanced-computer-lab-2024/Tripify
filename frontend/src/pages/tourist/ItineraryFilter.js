import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

const ItineraryFilter = () => {
  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [filters, setFilters] = useState({
    budget: "",
    date: "",
    preferences: [],
    language: "",
  });
  const [preferenceOptions, setPreferenceOptions] = useState([]);

  useEffect(() => {
    fetchItineraries();
    fetchPreferenceTags();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/itineraries");
      setItineraries(response.data);
      setFilteredItineraries(response.data);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  const fetchPreferenceTags = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/preference-tags"
      );
      setPreferenceOptions(response.data);
    } catch (error) {
      console.error("Error fetching preference tags:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFilters((prevFilters) => ({
      ...prevFilters,
      preferences: value,
    }));
  };

  const applyFilters = () => {
    let filtered = itineraries;

    if (filters.budget) {
      filtered = filtered.filter(
        (itinerary) => itinerary.totalPrice <= parseFloat(filters.budget)
      );
    }

    if (filters.date) {
      filtered = filtered.filter((itinerary) =>
        itinerary.availableDates.some((date) =>
          date.date.startsWith(filters.date)
        )
      );
    }

    if (filters.preferences.length > 0) {
      filtered = filtered.filter((itinerary) =>
        filters.preferences.every((pref) =>
          itinerary.preferenceTags.some((tag) => tag._id === pref)
        )
      );
    }

    if (filters.language) {
      filtered = filtered.filter(
        (itinerary) =>
          itinerary.language.toLowerCase() === filters.language.toLowerCase()
      );
    }

    setFilteredItineraries(filtered);
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Itinerary Filter</h2>
      <Row>
        <Col md={3}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Budget (Max Price)</Form.Label>
              <Form.Control
                type="number"
                name="budget"
                value={filters.budget}
                onChange={handleFilterChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferences</Form.Label>
              <Form.Select
                multiple
                name="preferences"
                value={filters.preferences}
                onChange={handlePreferenceChange}
              >
                {preferenceOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Form>
        </Col>
        <Col md={9}>
          <Row>
            {filteredItineraries.map((itinerary) => (
              <Col md={4} key={itinerary._id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{itinerary.name}</Card.Title>
                    <Card.Text>
                      Price: ${itinerary.totalPrice}
                      <br />
                      Language: {itinerary.language}
                      <br />
                      Preferences:{" "}
                      {itinerary.preferenceTags
                        .map((tag) => tag.name)
                        .join(", ")}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ItineraryFilter;
