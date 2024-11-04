import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import axios from "axios";

const ContentModeration = () => {
  const [content, setContent] = useState({ activities: [], itineraries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterFlagged, setFilterFlagged] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [activitiesRes, itinerariesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/activities"),
        axios.get("http://localhost:5000/api/itineraries"),
      ]);

      setContent({
        activities: activitiesRes.data,
        itineraries: itinerariesRes.data,
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching content");
      setLoading(false);
    }
  };

  const handleFlag = async (type, id, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/${type}/${id}/flag`, {
        flagged: !currentStatus,
      });

      // Update local state
      setContent((prev) => ({
        ...prev,
        [type]: prev[type].map((item) =>
          item._id === id ? { ...item, flagged: !currentStatus } : item
        ),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Error flagging content");
    }
  };

  const filteredContent = {
    activities: content.activities.filter(
      (item) => !filterFlagged || item.flagged
    ),
    itineraries: content.itineraries.filter(
      (item) => !filterFlagged || item.flagged
    ),
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Content Moderation</h2>

      <Form.Check
        type="switch"
        id="flag-filter"
        label="Show only flagged content"
        checked={filterFlagged}
        onChange={(e) => setFilterFlagged(e.target.checked)}
        className="mb-4"
      />

      <h3>Activities</h3>
      <Row className="mb-4">
        {filteredContent.activities.map((activity) => (
          <Col md={4} key={activity._id} className="mb-3">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <Card.Title>{activity.name}</Card.Title>
                  {activity.flagged && <Badge bg="danger">Flagged</Badge>}
                </div>
                <Card.Text>{activity.description}</Card.Text>
                <Card.Text>Price: ${activity.price}</Card.Text>
                <Card.Text>Category: {activity.category?.name}</Card.Text>
                <Button
                  variant={activity.flagged ? "warning" : "danger"}
                  onClick={() =>
                    handleFlag("activities", activity._id, activity.flagged)
                  }
                >
                  {activity.flagged ? "Unflag Activity" : "Flag Activity"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h3>Itineraries</h3>
      <Row>
        {filteredContent.itineraries.map((itinerary) => (
          <Col md={4} key={itinerary._id} className="mb-3">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <Card.Title>{itinerary.name}</Card.Title>
                  {itinerary.flagged && <Badge bg="danger">Flagged</Badge>}
                </div>
                <Card.Text>Price: ${itinerary.totalPrice}</Card.Text>
                <Card.Text>Language: {itinerary.language}</Card.Text>
                <Button
                  variant={itinerary.flagged ? "warning" : "danger"}
                  onClick={() =>
                    handleFlag("itineraries", itinerary._id, itinerary.flagged)
                  }
                >
                  {itinerary.flagged ? "Unflag Itinerary" : "Flag Itinerary"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ContentModeration;
