import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaMapMarkerAlt,
  FaTag,
  FaChevronLeft,
  FaFilter,
  FaDollarSign,
  FaCalendarCheck
} from 'react-icons/fa';
import Navbar from './Navbar';

const TagFilterHistoricalPlaces = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [placesResponse, tagsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/historicalplace', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/tags', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setHistoricalPlaces(placesResponse.data);
        setAllTags(tagsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlaces = historicalPlaces.filter(place => 
    selectedTags.length === 0 || 
    place.tags?.some(tag => selectedTags.includes(tag._id))
  );

  const handleTagSelect = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container className="py-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/tourist/view-events')}
            className="d-flex align-items-center"
          >
            <FaChevronLeft className="me-2" />
            Back to Events
          </Button>
          <h2 className="mb-0">
            <FaFilter className="me-2" />
            Filter Historical Places by Tags
          </h2>
        </div>

        {/* Tags Selection Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Select Tags to Filter</h5>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {allTags.map(tag => (
                <Button
                  key={tag._id}
                  variant={selectedTags.includes(tag._id) ? "primary" : "outline-primary"}
                  onClick={() => handleTagSelect(tag._id)}
                  className="d-flex align-items-center"
                >
                  <FaTag className="me-2" />
                  {tag.name}
                </Button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="d-flex justify-content-end">
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="text-decoration-none"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Results Section */}
        <div className="mb-4">
          <h4 className="mb-3">
            {filteredPlaces.length} Historical Place{filteredPlaces.length !== 1 ? 's' : ''} Found
          </h4>
          <Row className="g-4">
            {filteredPlaces.map(place => (
              <Col md={4} key={place._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{place.name}</Card.Title>
                    <Card.Text>{place.description}</Card.Text>
                    <div className="mb-3">
                      <FaDollarSign className="me-2" />
                      <strong>Entry Fee:</strong> ${place.ticketPrices?.price || 'N/A'}
                    </div>
                    <div className="mb-3">
                      <FaMapMarkerAlt className="me-2" />
                      <strong>Location:</strong> {place.location || 'N/A'}
                    </div>
                    <div className="mb-3">
                      <h6>Tags:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {place.tags?.map(tag => (
                          <Badge 
                            key={tag._id} 
                            bg={selectedTags.includes(tag._id) ? "primary" : "secondary"}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      as={Link} 
                      to={`/tourist/view-events?type=historicalplace&id=${place._id}`}
                      className="w-100"
                    >
                      <FaCalendarCheck className="me-2" />
                      View Details & Book
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {filteredPlaces.length === 0 && (
            <div className="text-center py-5">
              <h5>No historical places found matching the selected tags</h5>
              <Button 
                variant="primary" 
                onClick={clearFilters}
                className="mt-3"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default TagFilterHistoricalPlaces;