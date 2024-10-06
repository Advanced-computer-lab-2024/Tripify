import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Table,
  Badge,
  Alert,
  ListGroup,
} from "react-bootstrap";

const AdvertiserActivities = () => {
  const [advertiserUsername, setAdvertiserUsername] = useState("");
  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/activities");
      setAllActivities(response.data);
    } catch (error) {
      setError("Error fetching activities. Please try again later.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtered = allActivities.filter((activity) => {
      return (
        activity.createdBy &&
        activity.createdBy.username &&
        activity.createdBy.username.toLowerCase() ===
          advertiserUsername.toLowerCase()
      );
    });

    if (filtered.length === 0) {
      setError(`No activities found for advertiser "${advertiserUsername}".`);
    } else {
      setError("");
    }
    setFilteredActivities(filtered);
  };

  const getUniqueAdvertisers = () => {
    const advertisers = allActivities
      .filter((activity) => activity.createdBy)
      .map((activity) => activity.createdBy)
      .filter(
        (advertiser, index, self) =>
          index === self.findIndex((t) => t._id === advertiser._id)
      );
    return advertisers;
  };

  return (
    <Container>
      <h2 className="my-4">Advertiser Activities</h2>
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group>
          <Form.Label>Advertiser Username</Form.Label>
          <Form.Control
            type="text"
            value={advertiserUsername}
            onChange={(e) => setAdvertiserUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" className="mt-2">
          Search Activities
        </Button>
      </Form>

      {error && (
        <Alert variant="warning" className="mt-3">
          {error}
        </Alert>
      )}

      <h3 className="mt-4">Available Advertisers:</h3>
      <ListGroup className="mb-4">
        {getUniqueAdvertisers().map((advertiser) => (
          <ListGroup.Item key={advertiser._id}>
            {advertiser.username} (Company: {advertiser.companyName})
          </ListGroup.Item>
        ))}
      </ListGroup>

      {filteredActivities.length > 0 && (
        <>
          <h3>Activities for {advertiserUsername}:</h3>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Category</th>
                <th>Tags</th>
                <th>Booking Open</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => (
                <tr key={activity._id}>
                  <td>{activity.name}</td>
                  <td>{activity.description}</td>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>{activity.time}</td>
                  <td>${activity.price}</td>
                  <td>{activity.category?.name || "N/A"}</td>
                  <td>
                    {activity.tags?.map((tag) => (
                      <Badge bg="info" className="me-1" key={tag._id}>
                        {tag.name}
                      </Badge>
                    )) || "N/A"}
                  </td>
                  <td>{activity.bookingOpen ? "Yes" : "No"}</td>
                  <td>
                    {activity.location
                      ? `${activity.location.coordinates[1]}, ${activity.location.coordinates[0]}`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default AdvertiserActivities;
