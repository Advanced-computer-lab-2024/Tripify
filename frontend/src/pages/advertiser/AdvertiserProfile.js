import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Alert } from 'react-bootstrap';

const AdvertiserProfile = () => {
  const [advertisers, setAdvertisers] = useState([]); // State for storing the list of advertisers
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(''); // State for selected advertiser
  const [userDetails, setUserDetails] = useState(null); // State for advertiser details
  const [error, setError] = useState(null); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isEditing, setIsEditing] = useState(false); // State for edit mode

  useEffect(() => {
    // Fetch the list of advertisers when the component mounts
    const fetchAdvertisers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/advertiser'); // Adjust this endpoint as necessary
        setAdvertisers(response.data); // Set the list of advertisers
      } catch (err) {
        setError('Failed to fetch advertisers.');
      }
    };

    fetchAdvertisers();
  }, []);

  const handleAdvertiserSelect = async (e) => {
    const username = e.target.value;
    setSelectedAdvertiser(username);
    setIsLoading(true);
    setError(null);
    setUserDetails(null);
    setIsEditing(false); // Reset edit mode on selection change

    try {
      const response = await axios.get(`http://localhost:5000/api/advertiser/profile/${username}`); // Fetch details for the selected advertiser
      setUserDetails(response.data.advertiser); // Adjust based on how your backend returns the data
    } catch (err) {
      setError('Failed to fetch user details. Please try again.');
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
      await axios.put(`http://localhost:5000/api/advertiser/profile/${userDetails.username}`, userDetails); // Adjust this endpoint
      setError(null);
      setIsEditing(false);
      alert('Profile updated successfully!'); // Or handle success response accordingly
    } catch (err) {
      setError('Failed to update user details. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Advertiser Details</h2>

      <Form.Group className="mb-3">
        <Form.Label>Select Advertiser</Form.Label>
        <Form.Select onChange={handleAdvertiserSelect} value={selectedAdvertiser}>
          <option value="">Select an advertiser</option>
          {advertisers.map((advertiser) => (
            <option key={advertiser.username} value={advertiser.username}>
              {advertiser.username}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {isLoading && <Alert variant="info">Loading...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {userDetails && (
        <div className="mt-4">
          <h3>Advertiser Profile:</h3>
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
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={userDetails.companyName}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={userDetails.website}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hotline</Form.Label>
              <Form.Control
                type="text"
                name="hotline"
                value={userDetails.hotline}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleEditToggle}>
              {isEditing ? 'Cancel' : 'Edit'}
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

export default AdvertiserProfile;
