import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ActivityList = () => {
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [minRating, setMinRating] = useState('');
    const [maxRating, setMaxRating] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(''); 
    const [category, setCategory] = useState('');
    const [activities, setActivities] = useState([]); // All activities
    const [filteredActivities, setFilteredActivities] = useState([]); // Filtered activities

    // Fetch all activities when the component mounts
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/activities');
                setActivities(response.data);
                setFilteredActivities(response.data); // Set filteredActivities to all activities initially
            } catch (error) {
                console.error("Error fetching activities:", error);
            }
        };

        fetchActivities();
    }, []);

    const handleFilter = (e) => {
        e.preventDefault(); 
        const filtered = activities.filter(activity => {
            let matches = true;
            if (category && activity.category !== category) {
                matches = false;
            }
            if (minBudget && activity.budget < Number(minBudget)) {
                matches = false;
            }
            if (maxBudget && activity.budget > Number(maxBudget)) {
                matches = false;
            }
            if (minRating && activity.rating < Number(minRating)) {
                matches = false;
            }
            if (maxRating && activity.rating > Number(maxRating)) {
                matches = false;
            }
            if (startDate && new Date(activity.date) < new Date(startDate)) {
                matches = false;
            }
            if (endDate && new Date(activity.date) > new Date(endDate)) {
                matches = false;
            }
            return matches;
        });
        setFilteredActivities(filtered);
    };
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options); // Use 'en-GB' for DD/MM/YYYY format
    };
    const s = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options); // Use 'en-GB' for DD/MM/YYYY format
    };
    

    return (
        <div>
            <h1>Activity Filter</h1>
            <form onSubmit={handleFilter}>
                <div>
                    <label>Min Budget:</label>
                    <input type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
                </div>
                <div>
                    <label>Max Budget:</label>
                    <input type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
                </div>
                <div>
                    <label>Min Rating:</label>
                    <input type="number" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
                </div>
                <div>
                    <label>Max Rating:</label>
                    <input type="number" value={maxRating} onChange={(e) => setMaxRating(e.target.value)} />
                </div>
                <div>
                    <label>Start Date:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label>End Date:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                    <label>Category:</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <button type="submit">Filter Activities</button>
            </form>

            <h2>Activities</h2>
            <ul>
                {filteredActivities.map(activity => (
                    <li key={activity._id}>{activity.name} - Budget: {activity.budget}, Rating: {activity.rating}, Date:: {formatDate(activity.date)}, Category: {activity.category}</li>
                ))}
            </ul>
        </div>
    );
};


export default ActivityList;
