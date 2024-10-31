import React, { useState } from 'react';
import axios from 'axios';

const ActivityForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/activities', formData);
      console.log('Activity Created:', res.data);
      // Refresh the page or update state if necessary
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Activity Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <button type="submit">Create Activity</button>
    </form>
  );
};

export default ActivityForm;
