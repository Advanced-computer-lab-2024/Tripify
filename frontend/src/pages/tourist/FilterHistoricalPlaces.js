import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Card, Spinner, Alert } from 'react-bootstrap';

const FilterHistoricalPlaces = () => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tags');
        console.log('Fetched tags:', response.data);
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError('Error fetching tags. Please try again later.');
      }
    };

    fetchTags();
  }, []);

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTags(prevTags => 
      checked ? [...prevTags, value] : prevTags.filter(tag => tag !== value)
    );
  };

  const handleFilter = async () => {
    if (selectedTags.length === 0) {
      setError('Please select at least one tag to filter.');
      return;
    }

    setError('');
    setLoading(true);
    setPlaces([]); // Clear previous results immediately
    setHasSearched(true);

    try {
      const query = selectedTags.join(',');
      console.log('Sending query with tags:', query);
      
      const response = await axios.get(`http://localhost:5000/api/historicalplace/filter-by-tags`, {
        params: { tags: query }
      });

      console.log('Received places:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setPlaces(response.data);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.error('Error fetching filtered places:', error);
      setPlaces([]); // Ensure places are cleared on error
      if (error.response?.status === 404) {
        // Handle 404 specifically (no places found)
        setError('No historical places found for the selected tags.');
      } else {
        setError(error.response?.data?.message || 'Error fetching filtered places. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h1 className="mb-4">Filter Historical Places by Tag</h1>

          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <Form className="mb-4">
            <h3 className="mb-3">Select Tags</h3>
            <Row className="g-3">
              {tags.map(tag => (
                <Col key={tag._id} sm={4} md={3}>
                  <Form.Check
                    type="checkbox"
                    id={`tag-${tag._id}`}
                    label={tag.name}
                    value={tag._id}
                    onChange={handleTagChange}
                    className="mb-2"
                  />
                </Col>
              ))}
            </Row>

            <Button 
              onClick={handleFilter} 
              className="mt-4" 
              disabled={loading || selectedTags.length === 0}
              variant="primary"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Filtering...
                </>
              ) : (
                'Filter Places'
              )}
            </Button>
          </Form>

          <h3 className="mb-4">Historical Places</h3>
          <Row className="g-4">
            {!hasSearched ? (
              <Col>
                <Alert variant="info">
                  Select tags and click Filter to see historical places.
                </Alert>
              </Col>
            ) : loading ? (
              <Col>
                <Alert variant="info">Loading places...</Alert>
              </Col>
            ) : places.length === 0 ? (
              <Col>
                <Alert variant="warning">
                  No historical places found for the selected tags. Try selecting different tags.
                </Alert>
              </Col>
            ) : (
              places.map(place => (
                <Col key={place._id} sm={6} md={4}>
                  <Card className="h-100">
                    {place.images && place.images[0] && (
                      <Card.Img 
                        variant="top" 
                        src={place.images[0]}
                        alt={place.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{place.name}</Card.Title>
                      <Card.Text>{place.description}</Card.Text>
                      <Card.Text>
                        <strong>Location:</strong> {place.location}
                      </Card.Text>
                      <Card.Text>
                        <strong>Opening Hours:</strong> {place.openingHours}
                      </Card.Text>
                      <Card.Text>
                        <strong>Tags:</strong> {place.tags.map(tag => tag.name).join(', ')}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FilterHistoricalPlaces;