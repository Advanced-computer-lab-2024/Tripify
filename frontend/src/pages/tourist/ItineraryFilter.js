import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Dropdown } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Navbar from "./components/Navbar";

import {
  FaChevronRight,
  FaFilter,
  FaSort,
  FaLanguage,
  FaTags,
  FaCalendar,
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaSearch,
  FaInfoCircle
} from "react-icons/fa";
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
  const [sortOption, setSortOption] = useState("default");

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
    applySorting(filtered);
  };

  const applySorting = (itineraries) => {
    let sorted = [...itineraries];
    switch (sortOption) {
      case "priceAsc":
        sorted.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      default:
        // No sorting
        break;
    }
    setFilteredItineraries(sorted);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    applySorting(filteredItineraries);
  };

  return (
    <>
  <Navbar/>
    <div className="itinerary-filter-page">
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '8rem 0 4rem 0',
          marginBottom: '2rem'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        ></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Link to="/tourist" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </Link>
              </span>
              <span>
                Itinerary Filter <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Find Your Perfect Itinerary</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Filter Section */}
        <Row>
          <Col lg={4}>
            <Card 
              className="shadow-sm mb-4" 
              style={{ 
                borderRadius: '15px',
                border: 'none'
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaFilter className="text-primary me-2" size={24} />
                  <h3 className="mb-0">Filter Options</h3>
                </div>

                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <FaMoneyBillWave className="me-2" />
                      Budget Limit
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="budget"
                      value={filters.budget}
                      onChange={handleFilterChange}
                      placeholder="Enter maximum price"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <FaCalendar className="me-2" />
                      Preferred Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <FaTags className="me-2" />
                      Preferences
                    </Form.Label>
                    <Form.Select
                      multiple
                      name="preferences"
                      value={filters.preferences}
                      onChange={handlePreferenceChange}
                      style={{
                        border: '2px solid #eee',
                        borderRadius: '10px'
                      }}
                    >
                      {preferenceOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Hold Ctrl (Cmd) to select multiple preferences
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <FaLanguage className="me-2" />
                      Language
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="language"
                      value={filters.language}
                      onChange={handleFilterChange}
                      placeholder="Enter preferred language"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                    />
                  </Form.Group>

                  <div className="d-grid gap-3">
                    <Button 
                      variant="primary"
                      onClick={applyFilters}
                      className="rounded-pill"
                      style={{
                        backgroundColor: '#1089ff',
                        border: 'none',
                        padding: '0.75rem'
                      }}
                    >
                      <FaSearch className="me-2" />
                      Apply Filters
                    </Button>

                    <Dropdown>
                      <Dropdown.Toggle 
                        variant="light" 
                        className="w-100 rounded-pill"
                        style={{
                          border: '2px solid #eee',
                          padding: '0.75rem'
                        }}
                      >
                        <FaSort className="me-2" />
                        Sort By Price
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleSortChange("default")}>
                          Default
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange("priceAsc")}>
                          Price: Low to High
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange("priceDesc")}>
                          Price: High to Low
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Results Section */}
          <Col lg={8}>
            <Row className="g-4">
              {filteredItineraries.length === 0 ? (
                <Col xs={12}>
                  <Card 
                    className="text-center p-5" 
                    style={{ 
                      borderRadius: '15px',
                      border: 'none'
                    }}
                  >
                    <Card.Body>
                      <FaInfoCircle size={48} className="text-muted mb-3" />
                      <h4>No Itineraries Found</h4>
                      <p className="text-muted">Try adjusting your filters to find more options.</p>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                filteredItineraries.map((itinerary) => (
                  <Col key={itinerary._id} md={6}>
                    <Card 
                      className="h-100 shadow-hover" 
                      style={{
                        borderRadius: '15px',
                        border: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div 
                        className="card-img-top"
                        style={{
                          height: '200px',
                          backgroundImage: `url("/images/services-2.jpg")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderTopLeftRadius: '15px',
                          borderTopRightRadius: '15px',
                          position: 'relative'
                        }}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                            borderTopLeftRadius: '15px',
                            borderTopRightRadius: '15px'
                          }}
                        />
                        <div 
                          className="p-4 text-white"
                          style={{ position: 'relative', zIndex: 2 }}
                        >
                          <h4 className="mb-0">{itinerary.name}</h4>
                        </div>
                      </div>

                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center">
                            <FaMoneyBillWave className="text-primary me-2" />
                            <strong>${itinerary.totalPrice}</strong>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaLanguage className="text-primary me-2" />
                            <span>{itinerary.language}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <FaTags className="text-primary me-2" />
                            <strong>Preferences:</strong>
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {itinerary.preferenceTags.map((tag) => (
                              <span 
                                key={tag._id}
                                className="badge bg-light text-dark"
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '20px',
                                  border: '1px solid #eee'
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Link 
                          to={`/tourist/view-events`}
                          className="btn btn-primary w-100 rounded-pill"
                          style={{
                            backgroundColor: '#1089ff',
                            border: 'none'
                          }}
                        >
                          <FaMapMarkedAlt className="me-2" />
                          View Details
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
    </>

  );
};

export default ItineraryFilter;
