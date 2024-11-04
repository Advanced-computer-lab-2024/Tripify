import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Badge, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

function TourGuideItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserItineraries();
  }, []);

  const getUserFromToken = () => {
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

  const fetchUserItineraries = async () => {
    try {
      const user = getUserFromToken();
      setUserInfo(user);

      const token = localStorage.getItem('token');
      
      // Updated endpoint to match the new route
      const response = await axios.get(
        "http://localhost:5000/api/tourguide/my-itineraries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched itineraries:", response.data);
      setItineraries(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your itineraries');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(`Error fetching itineraries: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="my-4">My Itineraries</h2>
      
      {userInfo && (
        <Alert variant="info" className="mb-4">
          Showing itineraries for: {userInfo.username}
        </Alert>
      )}

      {itineraries.length === 0 ? (
        <Alert variant="info">
          You haven't created any itineraries yet.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Language</th>
                <th>Total Price</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>Preference Tags</th>
                <th>Accessibility</th>
                <th>Timeline</th>
              </tr>
            </thead>
            <tbody>
              {itineraries.map((itinerary) => (
                <tr key={itinerary._id}>
                  <td>{itinerary.name}</td>
                  <td>{itinerary.language}</td>
                  <td>${itinerary.totalPrice}</td>
                  <td>{itinerary.pickupLocation}</td>
                  <td>{itinerary.dropoffLocation}</td>
                  <td>
                    {itinerary.preferenceTags.map((tag) => (
                      <Badge bg="info" className="me-1" key={tag._id}>
                        {tag.name}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    {itinerary.accessibility.wheelchairAccessible && (
                      <Badge bg="primary" className="me-1">
                        Wheelchair
                      </Badge>
                    )}
                    {itinerary.accessibility.hearingImpaired && (
                      <Badge bg="warning" text="dark" className="me-1">
                        Hearing
                      </Badge>
                    )}
                    {itinerary.accessibility.visuallyImpaired && (
                      <Badge bg="danger" className="me-1">
                        Visual
                      </Badge>
                    )}
                  </td>
                  <td>
                    <ul className="list-unstyled mb-0">
                      {itinerary.timeline.map((item, index) => (
                        <li key={index} className="mb-1">
                          <small>
                            <strong>{item.activity}:</strong> {item.startTime} - {item.endTime}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default TourGuideItineraries;