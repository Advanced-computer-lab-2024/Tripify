// src/components/CreateUser.js
import React, { useState } from 'react';
import axios from 'axios';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '', // e.g., Tour Guide, Advertiser, Seller
  });
  const [error, setError] = useState(null);  // State to hold error message
  const [success, setSuccess] = useState(null); // State to hold success message

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    setSuccess(null); // Reset success state
    try {
      const res = await axios.post('http://localhost:5000/profile', formData);
      console.log('User Created:', res.data);
      setSuccess('User created successfully!'); // Set success message
      setFormData({ name: '', email: '', role: '' }); // Clear form
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user. Please try again.'); // Set error message
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
          <option value="">Select Role</option>
          <option value="Tour Guide">Tour Guide</option>
          <option value="Advertiser">Advertiser</option>
          <option value="Seller">Seller</option>
        </select>
        <button type="submit">Create User</button>
      </form>

      {success && <p style={{ color: 'green' }}>{success}</p>} {/* Success message */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Error message */}
    </div>
  );
};

export default CreateUser;
