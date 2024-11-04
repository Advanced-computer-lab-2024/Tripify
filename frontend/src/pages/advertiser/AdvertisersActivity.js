import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Table,
  Badge,
  Alert,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

const AdvertiserActivities = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertiserActivities();
  }, []);

  const getAdvertiserFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid authentication token');
    }
  };

  const fetchAdvertiserActivities = async () => {
    try {
      const advertiser = getAdvertiserFromToken();
      setAdvertiserInfo(advertiser);

      const token = localStorage.getItem('token');
      
      // Updated endpoint to match the new route
      const response = await axios.get(
        "http://localhost:5000/api/advertiser/activities/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setActivities(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching activities:", error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your activities');
      } else if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(error.response?.data?.message || "Error fetching activities. Please try again later.");
      }
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="warning" className="mt-3">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="my-4">My Activities</h2>
      {advertiserInfo && (
        <Alert variant="info" className="mt-3">
          Showing activities for: {advertiserInfo.username}
        </Alert>
      )}

      {activities.length === 0 ? (
        <Alert variant="info">No activities found.</Alert>
      ) : (
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
            {activities.map((activity) => (
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
      )}
    </Container>
  );
};

export default AdvertiserActivities;
