import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import { FaCopy, FaEnvelope } from "react-icons/fa";

const ViewEvents = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historicalRes, activitiesRes, itinerariesRes, categoriesRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/historicalplace"),
            axios.get("http://localhost:5000/api/activities"),
            axios.get("http://localhost:5000/api/itineraries"),
            axios.get("http://localhost:5000/api/activities/category"),
          ]);

        // Filter out flagged content for non-admin users
        const userRole = localStorage.getItem("userRole");
        const isAdmin = userRole === "admin";

        const filterFlagged = (items) => {
          return isAdmin ? items : items.filter((item) => !item.flagged);
        };

        setHistoricalPlaces(filterFlagged(historicalRes.data));
        setActivities(filterFlagged(activitiesRes.data));
        setItineraries(filterFlagged(itinerariesRes.data));
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleSearch = (data, query) => {
    return data.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query.toLowerCase());
      const categoryMatch = item.category?.name
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const tagsMatch =
        item.tags?.some((tag) =>
          tag?.name?.toLowerCase().includes(query.toLowerCase())
        ) || false;
      const preferenceTagsMatch =
        item.preferenceTags?.some((tag) =>
          tag?.name?.toLowerCase().includes(query.toLowerCase())
        ) || false;

      return nameMatch || categoryMatch || tagsMatch || preferenceTagsMatch;
    });
  };

  const handleShare = (item) => {
    const url = `http://localhost:3000/${item.type}/${item._id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleEmailShare = (item) => {
    const url = `http://localhost:3000/${item.type}/${item._id}`;
    window.location.href = `mailto:?subject=Check out this ${item.type}&body=Here is the link: ${url}`;
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const filteredActivities = categoryFilter
    ? handleSearch(activities, searchQuery).filter(
        (activity) => activity.category?.name === categoryFilter
      )
    : handleSearch(activities, searchQuery);

  const filteredHistoricalPlaces = handleSearch(historicalPlaces, searchQuery);
  const filteredItineraries = handleSearch(itineraries, searchQuery);

  return (
    <Container className="mt-5">
      <Form.Control
        type="text"
        placeholder="Search by name, category, or tags"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      <Form.Select
        aria-label="Filter by category for activities"
        value={categoryFilter}
        onChange={handleCategoryFilterChange}
        className="mb-4"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category._id} value={category.name}>
            {category.name}
          </option>
        ))}
      </Form.Select>

      <h2>Historical Places</h2>
      <Row>
        {filteredHistoricalPlaces.map((place) => (
          <Col md={4} key={place._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{place.name}</Card.Title>
                <Card.Text>{place.description}</Card.Text>
                <Card.Text>{place.images}</Card.Text>
                <Card.Text>{place.openingHours}</Card.Text>
                <Card.Text>{place.ticketPrices?.price || "100$"}</Card.Text>
                <Card.Text>
                  {place.tags?.map((tag) => tag.name).join(", ") ||
                    "No tag yet"}
                </Card.Text>
                <div className="d-flex gap-2">
                  <Button
                    variant="link"
                    onClick={() =>
                      handleShare({ ...place, type: "historicalplace" })
                    }
                  >
                    <FaCopy /> Copy Link
                  </Button>
                  <Button
                    variant="link"
                    onClick={() =>
                      handleEmailShare({ ...place, type: "historicalplace" })
                    }
                  >
                    <FaEnvelope /> Email
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h2>Activities</h2>
      <Row>
        {filteredActivities.map((activity) => (
          <Col md={4} key={activity._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{activity.name}</Card.Title>
                <Card.Text>{activity.description}</Card.Text>
                <Card.Text>{activity.date}</Card.Text>
                <Card.Text>
                  Category: {activity.category?.name || "No Category"}
                </Card.Text>
                <Card.Text>
                  Tags:{" "}
                  {activity.tags?.map((tag) => tag.name).join(", ") || "No Tag"}
                </Card.Text>
                <Card.Text>Price: {activity.price}$</Card.Text>
                <Card.Text>Booking: {activity.bookingOpen}</Card.Text>
                <Card.Text>
                  Location: {activity.location?.coordinates}
                </Card.Text>
                <div className="d-flex gap-2">
                  <Button
                    variant="link"
                    onClick={() =>
                      handleShare({ ...activity, type: "activities" })
                    }
                  >
                    <FaCopy /> Copy Link
                  </Button>
                  <Button
                    variant="link"
                    onClick={() =>
                      handleEmailShare({ ...activity, type: "activities" })
                    }
                  >
                    <FaEnvelope /> Email
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h2>Itineraries</h2>
      <Row>
        {filteredItineraries.map((itinerary) => (
          <Col md={4} key={itinerary._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{itinerary.name}</Card.Title>
                <Card.Text>Language: {itinerary.language}</Card.Text>
                <Card.Text>Price: {itinerary.totalPrice}$</Card.Text>
                <Card.Text>
                  Activities:{" "}
                  {itinerary.activities?.map((act) => act.name).join(", ") ||
                    "No Activities"}
                </Card.Text>
                <Card.Text>
                  Tags:{" "}
                  {itinerary.preferenceTags
                    ?.map((tag) => tag.name)
                    .join(", ") || "No Tags"}
                </Card.Text>
                <Card.Text>
                  Available Dates:{" "}
                  {itinerary.availableDates
                    ?.map(
                      (date) =>
                        `${date.date} - ${date.availableTimes.join(", ")}`
                    )
                    .join(", ") || "No Available Dates"}
                </Card.Text>
                <div className="d-flex gap-2">
                  <Button
                    variant="link"
                    onClick={() =>
                      handleShare({ ...itinerary, type: "itineraries" })
                    }
                  >
                    <FaCopy /> Copy Link
                  </Button>
                  <Button
                    variant="link"
                    onClick={() =>
                      handleEmailShare({ ...itinerary, type: "itineraries" })
                    }
                  >
                    <FaEnvelope /> Email
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ViewEvents;
