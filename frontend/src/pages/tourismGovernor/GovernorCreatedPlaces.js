import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Table, Badge } from "react-bootstrap";

function GovernorCreatedPlaces() {
  const [selectedGovernor, setSelectedGovernor] = useState("");
  const [allPlaces, setAllPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [governors, setGovernors] = useState([]); // State to hold tourism governors
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllPlaces();
    fetchGovernors(); // Fetch governors on component mount
  }, []);

  const fetchAllPlaces = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/historicalplace");
      console.log("All historical places:", response.data); // Debug log
      setAllPlaces(response.data);
    } catch (error) {
      console.error("Error fetching historical places:", error);
      setError("Error fetching historical places. Please try again later.");
    }
  };

  const fetchGovernors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tourismgovernor"); // Adjust this to your API endpoint
      console.log("All governors:", response.data); // Debug log
      setGovernors(response.data);
    } catch (error) {
      console.error("Error fetching governors:", error);
      setError("Error fetching governors. Please try again later.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for governor:", selectedGovernor); // Debug log
    const filtered = allPlaces.filter((place) => {
      return (
        place.createdBy?.username?.toLowerCase() === selectedGovernor.toLowerCase()
      );
    });
    console.log("Filtered places:", filtered); // Debug log
    if (filtered.length === 0) {
      setError("No historical places found for this governor.");
    } else {
      setError("");
    }
    setFilteredPlaces(filtered);
  };

  return (
    <Container>
      <h2 className="my-4">Historical Places</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Tourism Governor</Form.Label>
          <Form.Select
            value={selectedGovernor}
            onChange={(e) => setSelectedGovernor(e.target.value)}
            required
          >
            <option value="">Select a tourism governor</option>
            {governors.map((governor) => (
              <option key={governor._id} value={governor.username}>
                {governor.username}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button type="submit" className="mt-2">
          Search Historical Places
        </Button>
      </Form>

      {error && <p className="text-danger mt-3">{error}</p>}

      {filteredPlaces.length > 0 && (
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
            {filteredPlaces.map((place) => (
              <tr key={place._id}>
                <td>{place.name}</td>
                <td>{place.description}</td>
                <td>
                  {place.location}
                </td>
                <td>
                  {place.ticketPrices.map((price, index) => (
                    <p key={index}>
                      {price.type}: ${price.amount}
                    </p>
                  ))}
                </td>
                <td>
  {Array.isArray(place.openingHours) && place.openingHours.length > 0 ? (
    place.openingHours.map((hours, index) => (
      <p key={index}>
        {hours.day}: {hours.open} - {hours.close}
      </p>
    ))
  ) : (
    <p>No opening hours available</p>
  )}
</td>

                <td>
                  {place.tags.map((tag) => (
                    <Badge bg="info" className="me-1" key={tag._id}>
                      {tag.name}
                    </Badge>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default GovernorCreatedPlaces;
