// src/components/UpdateUser.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../api';

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserById(id);
      setFormData(user);
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(id, formData);
    navigate('/'); // Navigate back to the user list after updating
  };

  return (
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
      <button type="submit">Update User</button>
    </form>
  );
};

export default UpdateUser;
