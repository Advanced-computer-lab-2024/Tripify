import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Alert } from 'react-bootstrap';
import { jwtDecode } from "jwt-decode";

const AdvertiserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
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

  const fetchUserProfile = async () => {
    try {
      const user = getUserFromToken();
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/advertiser/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUserDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your profile');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to fetch profile. Please try again.');
      }
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
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/advertiser/profile/${userDetails.username}`,
        userDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setError(null);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5">
        <Alert variant="info">Loading...</Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Profile</h2>

      {userDetails && (
        <div className="mt-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={userDetails.username}
                readOnly
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-light' : ''}
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
                className={!isEditing ? 'bg-light' : ''}
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
                className={!isEditing ? 'bg-light' : ''}
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
                className={!isEditing ? 'bg-light' : ''}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant={isEditing ? "secondary" : "primary"} 
                onClick={handleEditToggle}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>

              {isEditing && (
                <Button variant="success" onClick={handleUpdate}>
                  Save Changes
                </Button>
              )}
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default AdvertiserProfile;