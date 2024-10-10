import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Alert } from 'react-bootstrap';

const UserDisplay = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    userType: ''
  });
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if user is editing
  const [hasChanges, setHasChanges] = useState(false); // Track changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUserDetailChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
    setHasChanges(true); // Mark as changed
  };

  // Handle changes for previous work entries
  const handlePreviousWorkChange = (index, field, value) => {
    const updatedPreviousWork = [...userDetails.previousWork];
    updatedPreviousWork[index] = {
      ...updatedPreviousWork[index],
      [field]: value
    };
    setUserDetails(prevState => ({
      ...prevState,
      previousWork: updatedPreviousWork
    }));
    setHasChanges(true); // Mark as changed
  };

  // Add a new previous work entry
  const addPreviousWorkEntry = () => {
    const updatedPreviousWork = [...(userDetails.previousWork || []), { jobTitle: '', company: '', description: '' }];
    setUserDetails(prevState => ({
      ...prevState,
      previousWork: updatedPreviousWork
    }));
    setHasChanges(true); // Mark as changed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUserDetails(null);

    const { username, email, userType } = formData;

    try {
      const response = await axios.get(`http://localhost:5000/api/${userType.toLowerCase()}/account`, {
        params: { username, email }
      });
      setUserDetails(response.data); // Set user details after fetching
      setIsEditing(false); // Ensure editing is off when details are displayed
    } catch (err) {
      setError('Failed to fetch user details. Please check your input.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    const { userType } = formData;

    // Check if userDetails has a valid id
    if (!userDetails || !userDetails.id) {
      setError('Cannot save changes: User ID is missing.');
      console.log("User details:", userDetails); // Log user details for debugging
      return;
    }

    try {
      // API call to update user details
      await axios.put(`http://localhost:5000/api/${userType.toLowerCase()}/account/${userDetails.id}`, userDetails);
      setHasChanges(false); // Reset the changes flag
      alert('Changes saved successfully.');
    } catch (error) {
      setError('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">User Details</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Account Type</Form.Label>
          <Form.Select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="">Select Account Type</option>
            <option value="TourGuide">Tour Guide</option>
            <option value="Seller">Seller</option>
            <option value="Advertiser">Advertiser</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Fetching...' : 'Get User Details'}
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {userDetails && (
        <div className="mt-4">
          <h3>User Details:</h3>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={userDetails.username}
                readOnly={!isEditing}
                onChange={handleUserDetailChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userDetails.email}
                readOnly={!isEditing}
                onChange={handleUserDetailChange}
              />
            </Form.Group>

            {formData.userType === 'TourGuide' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobileNumber"
                    value={userDetails.mobileNumber}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Years of Experience</Form.Label>
                  <Form.Control
                    type="number"
                    name="yearsOfExperience"
                    value={userDetails.yearsOfExperience}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Previous Work</Form.Label>
                  {userDetails.previousWork && userDetails.previousWork.map((work, index) => (
                    <div key={index}>
                      <Form.Control
                        type="text"
                        placeholder="Job Title"
                        value={work.jobTitle}
                        readOnly={!isEditing}
                        onChange={(e) => handlePreviousWorkChange(index, 'jobTitle', e.target.value)}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Company"
                        value={work.company}
                        readOnly={!isEditing}
                        onChange={(e) => handlePreviousWorkChange(index, 'company', e.target.value)}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Description"
                        value={work.description}
                        readOnly={!isEditing}
                        onChange={(e) => handlePreviousWorkChange(index, 'description', e.target.value)}
                      />
                      {isEditing && (
                        <Button variant="danger" onClick={() => {
                          const updatedPreviousWork = [...userDetails.previousWork];
                          updatedPreviousWork.splice(index, 1); // Remove the current entry
                          setUserDetails(prevState => ({
                            ...prevState,
                            previousWork: updatedPreviousWork
                          }));
                        }}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="secondary" onClick={addPreviousWorkEntry}>Add Previous Work</Button>
                  )}
                </Form.Group>
              </>
            )}

            {formData.userType === 'Seller' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={userDetails.name}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={userDetails.description}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>
              </>
            )}

            {formData.userType === 'Advertiser' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyName"
                    value={userDetails.companyName}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyDescription"
                    value={userDetails.companyDescription}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={userDetails.website}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hotline</Form.Label>
                  <Form.Control
                    type="text"
                    name="hotline"
                    value={userDetails.hotline}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Logo</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyLogo"
                    value={userDetails.companyLogo}
                    readOnly={!isEditing}
                    onChange={handleUserDetailChange}
                  />
                </Form.Group>
              </>
            )}

            {/* Show Update button only after user details are displayed */}
            {!isEditing && (
              <Button variant="warning" className="mt-3" onClick={() => setIsEditing(true)}>
                Update User
              </Button>
            )}

            {/* Show Save Changes button only when editing and if there are changes */}
            {isEditing && hasChanges && (
              <Button variant="success" className="mt-3" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            )}
          </Form>
        </div>
      )}
    </div>
  );
};

export default UserDisplay;
