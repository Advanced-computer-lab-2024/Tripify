import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Card, Spinner, Alert } from 'react-bootstrap';

const FilterHistoricalPlaces = () => {
  const [tags, setTags] = useState([]); // List of tags for filtering
  const [selectedTags, setSelectedTags] = useState([]); // Tags selected by the user
  const [places, setPlaces] = useState([]); // Filtered historical places
  const [loading, setLoading] = useState(false); // Loading state for filtering
  const [error, setError] = useState(''); // Error state for error messages

  // Fetch available tags when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/api/tags')  // Assuming this is the correct endpoint
      .then(response => {
        setTags(response.data); // Set the tags data from the backend
      })
      .catch(error => {
        console.error('Error fetching tags:', error);
        setError('Error fetching tags. Please try again later.');
      });
  }, []);

  // Handle tag selection/deselection
  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTags(prevTags => 
      checked ? [...prevTags, value] : prevTags.filter(tag => tag !== value)
    );
  };

  // Handle the filtering process
  const handleFilter = () => {
    if (selectedTags.length === 0) {
      setError('Please select at least one tag to filter.');
      return;
    }
    setError('');  // Reset error message
    setPlaces([]);  // Clear previous results
    setLoading(true);

    // Make the request to the backend for filtered places
    const query = selectedTags.join(',');  // Join selected tags (IDs) into a query string

    // Ensure that selectedTags contains the correct tag IDs
    axios.get(`http://localhost:5000/api/historicalplace/filter-by-tags?tags=${query}`)
      .then(response => {
        setPlaces(response.data); // Set filtered places based on selected tags
      })
      .catch(error => {
        console.error('Error fetching filtered places:', error);
        setError('Error fetching filtered places. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Container>
      <h1 className="my-4">Filter Historical Places by Tag</h1>

      {/* Display error message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tags Selection Form */}
      <Form>
        <h3>Select Tags</h3>
        <Row>
          {tags.map(tag => (
            <Col key={tag._id} sm={4} md={3}>
              <Form.Check
                type="checkbox"
                label={tag.name}
                value={tag._id}  // Use tag ID as value
                onChange={handleTagChange}
              />
            </Col>
          ))}
        </Row>

        <Button 
          onClick={handleFilter} 
          className="mt-3" 
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            'Filter Places'
          )}
        </Button>
      </Form>

      {/* Display Filtered Places */}
      <h3 className="my-4">Filtered Historical Places</h3>
      <Row>
        {places.length === 0 ? (
          <p>No places found for the selected tags. Try selecting different tags.</p>
        ) : (
          places.map(place => (
            <Col key={place._id} sm={6} md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>{place.name}</Card.Title>
                  <Card.Text>{place.description}</Card.Text>
                  <Card.Text><strong>Tags:</strong> {place.tags.map(tag => tag.name).join(', ')}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default FilterHistoricalPlaces;
