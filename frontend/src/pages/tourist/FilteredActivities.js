import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  Dropdown,
} from "react-bootstrap";

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
    <Container className="mt-5">
      <h2 className="mb-4">Upcoming Activities</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Max Budget</Form.Label>
            <Form.Control
              type="number"
              name="budget"
              value={filters.budget}
              onChange={handleFilterChange}
              placeholder="Enter max price"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Date From</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Min Rating</Form.Label>
            <Form.Control
              type="number"
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              placeholder="Enter min rating"
              min="0"
              max="5"
              step="0.1"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={3}>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </Col>
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
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
      <Row>
        {filteredActivities.map((activity) => (
          <Col md={4} key={activity._id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{activity.name}</Card.Title>
                <Card.Text>{activity.description}</Card.Text>
                <Card.Text>Price: ${activity.price}</Card.Text>
                <Card.Text>
                  Date: {new Date(activity.date).toLocaleDateString()}
                </Card.Text>
                <Card.Text>Category: {activity.category?.name}</Card.Text>
                <Card.Text>Rating: {activity.rating || "N/A"}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FilteredActivities;
