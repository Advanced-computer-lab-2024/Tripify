import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ItineraryList = () => {
    const [itineraries, setItineraries] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order

    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/itineraries');
                setItineraries(response.data);
            } catch (error) {
                console.error("Error fetching itineraries:", error);
            }
        };
        fetchItineraries();
    }, []);

    const sortItineraries = (criteria) => {
        const sortedItineraries = [...itineraries].sort((a, b) => {
            if (criteria === 'price') {
                return sortOrder === 'asc' ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
            } else if (criteria === 'rating') {
                return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            }
            return 0;
        });
        setItineraries(sortedItineraries);
    };

    return (
        <div>
            <h1>Itinerary List</h1>
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
                <button onClick={() => sortItineraries('price')}>Sort by Price</button>
                <button onClick={() => sortItineraries('rating')}>Sort by Rating</button>
            </div>
            <h2>Itineraries</h2>
            <ul>
                {itineraries.map(itinerary => (
                    <li key={itinerary._id}>{itinerary.name} - Total Price: {itinerary.totalPrice}, Rating: {itinerary.rating}</li>
                ))}
            </ul>
        </div>
    );
};

export default ItineraryList;
