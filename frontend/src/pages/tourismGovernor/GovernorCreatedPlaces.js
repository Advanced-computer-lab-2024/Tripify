import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Badge, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

function GovernorCreatedPlaces() {
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [governorInfo, setGovernorInfo] = useState(null);

  useEffect(() => {
    fetchGovernorPlaces();
  }, []);

  const getGovernorFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded); // Debug log
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid authentication token');
    }
  };

  const fetchGovernorPlaces = async () => {
    try {
      const governor = getGovernorFromToken();
      setGovernorInfo(governor);

      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        "http://localhost:5000/api/tourismgovernor/my-places",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched places:", response.data);
      setPlaces(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching places:", error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your historical places');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(`Error fetching historical places: ${error.response?.data?.message || error.message}`);
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
      <h2 className="my-4">My Historical Places</h2>
      
      {governorInfo && (
        <Alert variant="info" className="mb-4">
          Showing historical places for Tourism Governor: {governorInfo.username}
        </Alert>
      )}

      {places.length === 0 ? (
        <Alert variant="info">
          You haven't created any historical places yet.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Ticket Prices</th>
                <th>Opening Hours</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place._id}>
                  <td>{place.name}</td>
                  <td>{place.description}</td>
                  <td>{place.location}</td>
                  <td>
                    {place.ticketPrices?.map((price, index) => (
                      <p key={index} className="mb-1">
                        <strong>{price.type}:</strong> ${price.amount}
                      </p>
                    )) || 'No ticket prices available'}
                  </td>
                  <td>
                    {Array.isArray(place.openingHours) && place.openingHours.length > 0 ? (
                      place.openingHours.map((hours, index) => (
                        <p key={index} className="mb-1">
                          <strong>{hours.day}:</strong> {hours.open} - {hours.close}
                        </p>
                      ))
                    ) : (
                      <p className="mb-0">No opening hours available</p>
                    )}
                  </td>
                  <td>
                    {place.tags?.map((tag) => (
                      <Badge bg="info" className="me-1 mb-1" key={tag._id}>
                        {tag.name}
                      </Badge>
                    )) || 'No tags'}
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

export default GovernorCreatedPlaces;