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
    const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
    const [sortBy, setSortBy] = useState(''); // Criteria for sorting

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
        sortFilteredActivities(filtered); // Sort after filtering
    };

    const sortFilteredActivities = (activitiesToSort) => {
        if (sortBy) {
            const sortedActivities = [...activitiesToSort].sort((a, b) => {
                if (sortBy === 'price') {
                    return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
                } else if (sortBy === 'rating') {
                    return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
                }
                return 0;
            });
            setFilteredActivities(sortedActivities);
        }
    };

    const handleSort = (criteria) => {
        setSortBy(criteria);
        sortFilteredActivities(filteredActivities); // Sort the currently filtered activities
    };

    const formatDate = (dateString) => {
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

            <h2>Sort Activities</h2>
            <div>
                <label>
                    <input
                        type="radio"
                        value="asc"
                        checked={sortOrder === 'asc'}
                        onChange={() => setSortOrder('asc')}
                    />
                    Ascending
                </label>
                <label>
                    <input
                        type="radio"
                        value="desc"
                        checked={sortOrder === 'desc'}
                        onChange={() => setSortOrder('desc')}
                    />
                    Descending
                </label>
            </div>
            <div>
                <button onClick={() => handleSort('price')}>Sort by Price</button>
                <button onClick={() => handleSort('rating')}>Sort by Rating</button>
            </div>

            <h2>Activities</h2>
            <ul>
                {filteredActivities.map(activity => (
                    <li key={activity._id}>
                        {activity.name} - Budget: {activity.budget}, Price: {activity.price}, Rating: {activity.rating}, Date: {formatDate(activity.date)}, Category: {activity.category}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityList;
