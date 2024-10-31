import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get('http://localhost:5000/activities');
        setActivities(res.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/activities/${id}`);
      setActivities(activities.filter(activity => activity._id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <div>
      <h2>Activities</h2>
      <ul>
        {activities.map(activity => (
          <li key={activity._id}>
            <h3>{activity.name}</h3>
            <p>{activity.description}</p>
            <button onClick={() => handleDelete(activity._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
