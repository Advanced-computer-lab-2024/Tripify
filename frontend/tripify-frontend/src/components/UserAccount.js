// src/components/UserAccount.js
import React, { useState } from 'react';
import axios from 'axios';

const UserAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getUserDetails = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.get(`http://localhost:5000/profile/details`, {
        params: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        },
      });
      setUserDetails(res.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('User not found or error retrieving details. Please check your inputs.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.put(`http://localhost:5000/profile/${userDetails._id}`, userDetails);
      setSuccess('User updated successfully!');
      setUserDetails(res.data); // Update state with new user details
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

  return (
    <div>
      <h1>User Account</h1>
      <form onSubmit={getUserDetails}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Account Type</option>
          <option value="tourguide">Tour Guide</option>
          <option value="advertiser">Advertiser</option>
          <option value="seller">Seller</option>
        </select>
        <button type="submit">Get User</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userDetails && (
        <form onSubmit={handleUpdate}>
          <h2>Account Details</h2>
          <p>Name: 
            <input 
              type="text" 
              value={userDetails.name} 
              onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })} 
            />
          </p>
          <p>Email: 
            <input 
              type="email" 
              value={userDetails.email} 
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })} 
            />
          </p>
          <p>Role: {userDetails.role}</p>
          <button type="submit">Save Changes</button>
        </form>
      )}

      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default UserAccount;
