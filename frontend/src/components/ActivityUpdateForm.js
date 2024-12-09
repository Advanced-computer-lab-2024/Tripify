<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityUpdateForm = ({ match }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/activities/${match.params.id}`);
        setFormData(res.data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchActivity();
  }, [match.params.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/activities/${match.params.id}`, formData);
      console.log('Activity Updated:', res.data);
    } catch (error) {
      console.error('Error updating activity:', error);
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
      <button type="submit">Update Activity</button>
    </form>
  );
};

export default ActivityUpdateForm;
=======
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityUpdateForm = ({ match }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/activities/${match.params.id}`);
        setFormData(res.data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchActivity();
  }, [match.params.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/activities/${match.params.id}`, formData);
      console.log('Activity Updated:', res.data);
    } catch (error) {
      console.error('Error updating activity:', error);
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
      <button type="submit">Update Activity</button>
    </form>
  );
};

export default ActivityUpdateForm;
>>>>>>> jwtdemo
