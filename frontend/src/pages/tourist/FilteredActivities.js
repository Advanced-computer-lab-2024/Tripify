import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Card, Button, Dropdown } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Navbar from "./components/Navbar";

import {
  FaChevronRight,
  FaFilter,
  FaSort,
  FaStar,
  FaCalendar,
  FaMoneyBillWave,
  FaList,
  FaSearch
} from "react-icons/fa";
import axios from "axios";

const FilteredActivities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    budget: "",
    date: "",
    category: "",
    rating: "",
  });
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    fetchActivities();
    fetchCategories();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/activities");
      setActivities(response.data);
      setFilteredActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/activities/category"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = activities;

    if (filters.budget) {
      filtered = filtered.filter(
        (activity) => activity.price <= parseFloat(filters.budget)
      );
    }

    if (filters.date) {
      filtered = filtered.filter(
        (activity) => new Date(activity.date) >= new Date(filters.date)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (activity) => activity.category?._id === filters.category
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(
        (activity) => activity.rating >= parseFloat(filters.rating)
      );
    }

    setFilteredActivities(filtered);
    applySorting(filtered);
  };

  const applySorting = (activities) => {
    let sorted = [...activities];
    switch (sortOption) {
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "ratingDesc":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // No sorting
        break;
    }
    setFilteredActivities(sorted);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    applySorting(filteredActivities);
  };

  return (
    <>
  <Navbar/>
    <div className="filtered-activities-page">
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
                Filtered Activities <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Explore Activities</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Filter Card */}
        <Card className="shadow-sm mb-5" style={{ borderRadius: '15px', border: 'none' }}>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaFilter className="text-primary me-2" size={24} />
              <h3 className="mb-0">Filter Activities</h3>
            </div>

            <Row className="g-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaMoneyBillWave className="me-2" />
                    Max Budget
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="budget"
                    value={filters.budget}
                    onChange={handleFilterChange}
                    placeholder="Enter max price"
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaCalendar className="me-2" />
                    Date From
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
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaList className="me-2" />
                    Category
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <FaStar className="me-2" />
                    Min Rating
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="rating"
                    value={filters.rating}
                    onChange={handleFilterChange}
                    placeholder="Enter min rating"
                    min="0"
                    max="5"
                    step="0.1"
                    className="rounded-pill"
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: '2px solid #eee'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <Button
                  onClick={applyFilters}
                  className="rounded-pill px-4 py-2"
                  style={{
                    backgroundColor: '#1089ff',
                    border: 'none'
                  }}
                >
                  <FaSearch className="me-2" />
                  Apply Filters
                </Button>
              </Col>
              <Col md={6} className="text-end">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-basic"
                    className="rounded-pill px-4 py-2"
                    style={{ border: '2px solid #eee' }}
                  >
                    <FaSort className="me-2" />
                    Sort By
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
                    <Dropdown.Item onClick={() => handleSortChange("ratingDesc")}>
                      Rating: Highest First
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Activities Grid */}
        <Row className="g-4">
          {filteredActivities.map((activity) => (
            <Col key={activity._id} lg={4} md={6}>
              <Card 
                className="h-100 shadow-hover" 
                style={{
                  borderRadius: '15px',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
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
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px'
                    }}
                  />
                  <div 
                    className="p-4"
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      color: 'white'
                    }}
                  >
                    <h4 className="mb-0">{activity.name}</h4>
                  </div>
                </div>

                <Card.Body className="p-4">
                  <p className="text-muted mb-3">{activity.description}</p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <FaMoneyBillWave className="text-primary me-2" />
                      <strong>${activity.price}</strong>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaCalendar className="text-primary me-2" />
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FaList className="text-primary me-2" />
                      <span>{activity.category?.name || "Uncategorized"}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaStar className="text-warning me-2" />
                      <span>{activity.rating || "N/A"}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredActivities.length === 0 && (
          <Card className="text-center p-5 mt-4" style={{ borderRadius: '15px', border: 'none' }}>
            <Card.Body>
              <FaSearch size={48} className="text-muted mb-3" />
              <h4>No Activities Found</h4>
              <p className="text-muted">Try adjusting your filters to find more activities.</p>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
    </>

  );
};

export default FilteredActivities;
