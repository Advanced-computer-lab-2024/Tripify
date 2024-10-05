import React, { useState, useEffect } from "react";
import axios from "axios";

const HistoricalPlacesFilter = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [placesResponse, tagsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/historicalplace"),
          axios.get("http://localhost:5000/api/tags"),
        ]);

        const tagsMap = new Map(tagsResponse.data.map((tag) => [tag._id, tag]));

        const placesWithTagNames = placesResponse.data.map((place) => ({
          ...place,
          tags: place.tags.map(
            (tagId) => tagsMap.get(tagId) || { _id: tagId, name: "Unknown Tag" }
          ),
        }));

        setHistoricalPlaces(placesWithTagNames);
        setFilteredPlaces(placesWithTagNames);
        setTags(tagsResponse.data);
      } catch (err) {
        setError("Error fetching data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPlaces(historicalPlaces);
    } else {
      const filtered = historicalPlaces.filter((place) =>
        place.tags.some((tag) => selectedTags.includes(tag._id))
      );
      setFilteredPlaces(filtered);
    }
  }, [selectedTags, historicalPlaces]);

  const handleTagChange = (tagId) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Historical Places</h2>

      <div className="mb-4">
        <h4>Filter by Tags:</h4>
        {tags.map((tag) => (
          <label key={tag._id} className="me-3">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag._id)}
              onChange={() => handleTagChange(tag._id)}
              className="me-1"
            />
            {tag.name}
          </label>
        ))}
      </div>

      <div className="row">
        {filteredPlaces.map((place) => (
          <div key={place._id} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={place.images[0]}
                className="card-img-top"
                alt={place.name}
              />
              <div className="card-body">
                <h5 className="card-title">{place.name}</h5>
                <p className="card-text">
                  {place.description.substring(0, 100)}...
                </p>
                <p className="card-text">
                  <small className="text-muted">
                    Opening Hours: {place.openingHours}
                  </small>
                </p>
                <div>
                  {place.tags.map((tag) => (
                    <span key={tag._id} className="badge bg-secondary me-1">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalPlacesFilter;
