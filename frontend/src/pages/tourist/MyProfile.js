import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Alert } from "react-bootstrap";

const MyProfile = () => {
  const [tourists, setTourists] = useState([]); // State for storing the list of tourists
  const [selectedTourist, setSelectedTourist] = useState(""); // State for selected tourist
  const [userDetails, setUserDetails] = useState(null); // State for user details
  const [error, setError] = useState(null); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isEditing, setIsEditing] = useState(false); // State for edit mode

  useEffect(() => {
    // Fetch the list of tourists when the component mounts
    const fetchTourists = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tourist"); // Adjust this endpoint as necessary
        setTourists(response.data); // Set the list of tourists
      } catch (err) {
        setError("Failed to fetch tourists.");
      }
    };

    fetchTourists();
  }, []);

  const handleTouristSelect = async (e) => {
    const username = e.target.value;
    setSelectedTourist(username);
    setIsLoading(true);
    setError(null);
    setUserDetails(null);
    setIsEditing(false); // Reset edit mode on selection change

    try {
      const response = await axios.get(
        `http://localhost:5000/api/tourist/profile/${username}`
      ); // Fetch details for the selected tourist
      setUserDetails(response.data.tourist); // Adjust based on how your backend returns the data
    } catch (err) {
      setError("Failed to fetch user details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tourist/profile/${userDetails.username}`,
        userDetails
      ); // Adjust this endpoint
      setError(null);
      setIsEditing(false);
      alert("Profile updated successfully!"); // Or handle success response accordingly
    } catch (err) {
      setError("Failed to update user details. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Tourist Details</h2>

      <Form.Group className="mb-3">
        <Form.Label>Select Tourist</Form.Label>
        <Form.Select onChange={handleTouristSelect} value={selectedTourist}>
          <option value="">Select a tourist</option>
          {tourists.map((tourist) => (
            <option key={tourist.username} value={tourist.username}>
              {tourist.username}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {isLoading && <Alert variant="info">Loading...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {userDetails && (
        <div className="mt-4">
          <h3>User Details:</h3>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={userDetails.username} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobileNumber"
                value={userDetails.mobileNumber}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nationality</Form.Label>
              <Form.Control
                type="text"
                name="nationality"
                value={userDetails.nationality}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={userDetails.dob?.substring(0, 10)}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Status</Form.Label>
              <Form.Control
                type="text"
                name="jobStatus"
                value={userDetails.jobStatus}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            {userDetails.jobStatus === "job" && (
              <Form.Group className="mb-3">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                  type="text"
                  name="jobTitle"
                  value={userDetails.jobTitle}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Wallet Balance</Form.Label>
              <Form.Control type="number" value={userDetails.wallet || 0} readOnly />
            </Form.Group>

            <Button variant="primary" onClick={handleEditToggle}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>

            {isEditing && (
              <Button variant="success" onClick={handleUpdate} className="ms-2">
                Save Changes
              </Button>
            )}
          </Form>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
