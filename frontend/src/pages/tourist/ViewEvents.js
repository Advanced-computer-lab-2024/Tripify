import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';

const ViewEvents = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historicalRes, activitiesRes, itinerariesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/historicalplace'),
          axios.get('http://localhost:5000/api/activities'),
          axios.get('http://localhost:5000/api/itineraries')
        ]);

        setHistoricalPlaces(historicalRes.data);
        setActivities(activitiesRes.data);
        setItineraries(itinerariesRes.data);
        setLoading(false); // Stop loading when data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {/* Section: Historical Places */}
      <h2>Historical Places</h2>
      <Row>
        {historicalPlaces.map((place) => (
          <Col md={4} key={place._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{place.name}</Card.Title>
                <Card.Text>{place.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Section: Activities */}
      <h2>Activities</h2>
      <Row>
        {activities.map((activity) => (
          <Col md={4} key={activity._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{activity.name}</Card.Title>
                <Card.Text>{activity.details}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Section: Itineraries */}
      <h2>Upcoming Itineraries</h2>
      <Row>
        {itineraries.map((itinerary) => (
          <Col md={4} key={itinerary._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{itinerary.title}</Card.Title>
                <Card.Text>{itinerary.description}</Card.Text>
                <Card.Text>Price: ${itinerary.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ViewEvents;
