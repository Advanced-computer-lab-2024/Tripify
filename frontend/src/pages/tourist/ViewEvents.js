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
          <Card.Title>{itinerary.name}</Card.Title>
          <Card.Text>Timeline:</Card.Text>
          {itinerary.timeline.length > 0 ? (
            itinerary.timeline.map((activity, index) => (
              <Card.Text key={index}>
                Activity: {activity.activity} <br />
                Start Time: {activity.startTime} <br />
                End Time: {activity.endTime}
              </Card.Text>
            ))
          ) : (
            <Card.Text>No activities planned.</Card.Text>
          )}
          
          <Card.Text>Language: {itinerary.language}</Card.Text>
          <Card.Text>Total Price: {itinerary.totalPrice}</Card.Text>

          <Card.Text>Available Dates:</Card.Text>
          {itinerary.availableDates.length > 0 ? (
            itinerary.availableDates.map((date, index) => (
              <Card.Text key={index}>
                Date: {date.date.toString()} <br />
                Available Times: {date.availableTimes.join(", ")}
              </Card.Text>
            ))
          ) : (
            <Card.Text>No available dates.</Card.Text>
          )}
          
          <Card.Text>Accessibility:</Card.Text>
          <Card.Text>Wheelchair Accessible: {itinerary.accessibility.wheelchairAccessible ? 'Yes' : 'No'}</Card.Text>
          <Card.Text>Hearing Impaired: {itinerary.accessibility.hearingImpaired ? 'Yes' : 'No'}</Card.Text>
          <Card.Text>Visually Impaired: {itinerary.accessibility.visuallyImpaired ? 'Yes' : 'No'}</Card.Text>

          <Card.Text>Pickup Location: {itinerary.pickupLocation}</Card.Text>
          <Card.Text>Dropoff Location: {itinerary.dropoffLocation}</Card.Text>
          <Card.Text>Created By: {itinerary.createdBy}</Card.Text>
          <Card.Text>Is Active: {itinerary.isActive ? 'Yes' : 'No'}</Card.Text>
          <Card.Text>Preference Tags: {itinerary.preferenceTags.join(", ")}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>

    </Container>
  );
};

export default ViewEvents;
