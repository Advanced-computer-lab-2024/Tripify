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
  Badge,
  Collapse,
} from "react-bootstrap";
import {
  FaCopy,
  FaEnvelope,
  FaCalendarCheck,
  FaCalendar,
  FaComment,
  FaWallet,
  FaInfoCircle,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import ItineraryComment from "../../components/ItineraryComment";

const ViewEvents = () => {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingItemId, setBookingItemId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [userWallet, setUserWallet] = useState(0);
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        console.error("No token or user found");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/tourist/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.tourist) {
        setUserWallet(response.data.tourist.wallet);
        // Update localStorage with the latest wallet balance
        const touristData = JSON.parse(localStorage.getItem("tourist")) || {};
        localStorage.setItem(
          "tourist",
          JSON.stringify({
            ...touristData,
            wallet: response.data.tourist.wallet,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user's wallet balance from stored tourist data
        const touristData = JSON.parse(localStorage.getItem("tourist"));
        if (touristData && touristData.wallet !== undefined) {
          setUserWallet(touristData.wallet);
        }

        const [historicalRes, activitiesRes, itinerariesRes, categoriesRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/historicalplace"),
            axios.get("http://localhost:5000/api/activities"),
            axios.get("http://localhost:5000/api/itineraries"),
            axios.get("http://localhost:5000/api/activities/category"),
          ]);

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

  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded._id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const getItemPrice = (item, type) => {
    switch (type) {
      case "HistoricalPlace":
        return item.ticketPrices?.price || 100;
      case "Activity":
        return item.price || 0;
      case "Itinerary":
        return item.totalPrice || 0;
      default:
        return 0;
    }
  };

  const handleBooking = async (item, type, e) => {
    e.preventDefault();

    if (bookingLoading) return;

    const userId = getUserId();
    if (!userId) {
      alert("Please log in to book");
      return;
    }

    if (!bookingDate) {
      alert("Please select a date");
      return;
    }

    // Get item price and check balance
    const bookingCost = getItemPrice(item, type);
    if (userWallet < bookingCost) {
      alert(
        `Insufficient funds in your wallet. You need $${bookingCost} but have $${userWallet}`
      );
      return;
    }

    setBookingItemId(item._id);
    setBookingLoading(true);

    try {
      const formattedBookingDate = new Date(bookingDate);
      formattedBookingDate.setHours(12, 0, 0, 0);

      // First create the booking
      const bookingResponse = await axios.post(
        "http://localhost:5000/api/bookings/create",
        {
          userId,
          bookingType: type,
          itemId: item._id,
          bookingDate: formattedBookingDate.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (bookingResponse.data.success) {
        try {
          // Then deduct from wallet
          const deductResponse = await axios.post(
            `http://localhost:5000/api/tourist/wallet/deduct/${userId}`,
            { amount: bookingCost },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (deductResponse.data.success) {
            // Update wallet balance in state and localStorage
            setUserWallet(deductResponse.data.currentBalance);

            // Update stored tourist data
            const touristData =
              JSON.parse(localStorage.getItem("tourist")) || {};
            localStorage.setItem(
              "tourist",
              JSON.stringify({
                ...touristData,
                wallet: deductResponse.data.currentBalance,
              })
            );

            alert(
              "Booking successful! Amount has been deducted from your wallet."
            );
            await fetchUserProfile(); // Refresh user profile to get updated wallet balance
          } else {
            // If payment fails, cancel the booking
            await cancelBooking(bookingResponse.data.data._id);
            alert("Booking failed: Payment could not be processed");
          }
        } catch (paymentError) {
          console.error("Payment error:", paymentError);
          await cancelBooking(bookingResponse.data.data._id);
          alert(
            paymentError.response?.data?.message ||
              "Payment failed. Booking has been cancelled."
          );
        }
      } else {
        alert(
          bookingResponse.data.message || "Booking failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Error creating booking");
    } finally {
      setBookingLoading(false);
      setBookingItemId(null);
      setBookingDate(""); // Reset booking date after completion
    }
  };
  const cancelBooking = async (bookingId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/bookings/cancel/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const fetchUserBookings = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("User bookings:", response.data);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

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

  const toggleComments = (itineraryId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [itineraryId]: !prev[itineraryId],
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeRemaining = (bookingDate) => {
    const now = new Date();
    const bookingTime = new Date(bookingDate);
    const diff = bookingTime - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} days and ${hours} hours`;
    }
    return `${hours} hours`;
  };

  const canCancelBooking = (bookingDate) => {
    const now = new Date();
    const bookingTime = new Date(bookingDate);
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    return hoursUntilBooking >= 48;
  };

  const HistoricalPlaceCard = ({ place }) => (
    <Card className="mb-3 h-100">
      <Card.Body>
        <Card.Title>{place.name}</Card.Title>
        <Card.Text>{place.description}</Card.Text>
        <Card.Text>
          <FaCalendar className="me-2" />
          <strong>Opening Hours:</strong> {place.openingHours}
        </Card.Text>
        <Card.Text>
          <strong>Price:</strong> ${getItemPrice(place, "HistoricalPlace")}
        </Card.Text>
        {place.tags?.length > 0 && (
          <div className="mb-3">
            {place.tags.map((tag) => (
              <Badge bg="secondary" className="me-1" key={tag._id}>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Select Visit Date</Form.Label>
          <Form.Control
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </Form.Group>
        <div className="d-flex gap-2 mt-3">
          <Button
            variant="primary"
            onClick={(e) => handleBooking(place, "HistoricalPlace", e)}
            disabled={bookingLoading && bookingItemId === place._id}
          >
            {bookingLoading && bookingItemId === place._id ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaCalendarCheck className="me-2" />
            )}
            Book Now (${getItemPrice(place, "HistoricalPlace")})
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => handleShare({ ...place, type: "historicalplace" })}
          >
            <FaCopy className="me-2" />
            Share
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() =>
              handleEmailShare({ ...place, type: "historicalplace" })
            }
          >
            <FaEnvelope className="me-2" />
            Email
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const ActivityCard = ({ activity }) => (
    <Card className="mb-3 h-100">
      <Card.Body>
        <Card.Title>{activity.name}</Card.Title>
        <Card.Text>{activity.description}</Card.Text>
        {activity.date && (
          <Card.Text className="text-primary">
            <FaCalendar className="me-2" />
            <strong>Event Date:</strong> {formatDate(activity.date)}
          </Card.Text>
        )}
        <Card.Text>
          <strong>Category:</strong> {activity.category?.name || "No Category"}
        </Card.Text>
        <Card.Text>
          <strong>Price:</strong> ${activity.price}
        </Card.Text>
        {activity.location && (
          <Card.Text>
            <strong>Location:</strong>{" "}
            {activity.location?.coordinates?.join(", ") || "No location"}
          </Card.Text>
        )}
        {activity.tags?.length > 0 && (
          <div className="mb-3">
            {activity.tags.map((tag) => (
              <Badge bg="secondary" className="me-1" key={tag._id}>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Select Booking Date</Form.Label>
          <Form.Control
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
          {activity.date && (
            <Form.Text className="text-muted">
              Note: This activity is scheduled for {formatDate(activity.date)}
            </Form.Text>
          )}
        </Form.Group>
        <div className="d-flex gap-2 mt-3">
          <Button
            variant="primary"
            onClick={(e) => handleBooking(activity, "Activity", e)}
            disabled={bookingLoading && bookingItemId === activity._id}
          >
            {bookingLoading && bookingItemId === activity._id ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaCalendarCheck className="me-2" />
            )}
            Book Now (${activity.price})
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => handleShare({ ...activity, type: "activities" })}
          >
            <FaCopy className="me-2" />
            Share
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() =>
              handleEmailShare({ ...activity, type: "activities" })
            }
          >
            <FaEnvelope className="me-2" />
            Email
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const ItineraryCard = ({ itinerary }) => (
    <Card className="mb-3 h-100">
      <Card.Body>
        <Card.Title>{itinerary.name}</Card.Title>
        <Card.Text>
          <strong>Language:</strong> {itinerary.language}
        </Card.Text>
        <Card.Text>
          <strong>Price:</strong> ${itinerary.totalPrice}
        </Card.Text>
        {itinerary.activities?.length > 0 && (
          <Card.Text>
            <strong>Included Activities:</strong>
            <br />
            {itinerary.activities.map((act) => act.name).join(", ")}
          </Card.Text>
        )}
        {itinerary.availableDates?.length > 0 && (
          <div className="mb-3">
            <strong>Available Dates:</strong>
            <div className="available-dates mt-2">
              {itinerary.availableDates.map((dateObj, index) => (
                <Badge bg="info" className="me-2 mb-2" key={index}>
                  {formatDate(dateObj.date)}
                  {dateObj.availableTimes?.length > 0 && (
                    <span className="ms-1">
                      ({dateObj.availableTimes.join(", ")})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {itinerary.preferenceTags?.length > 0 && (
          <div className="mb-3">
            {itinerary.preferenceTags.map((tag) => (
              <Badge bg="secondary" className="me-1" key={tag._id}>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Select Tour Date</Form.Label>
          <Form.Control
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
          {itinerary.availableDates?.length > 0 && (
            <Form.Text className="text-muted">
              Note: Please select from the available dates above
            </Form.Text>
          )}
        </Form.Group>
        <div className="d-flex gap-2 mt-3">
          <Button
            variant="primary"
            onClick={(e) => handleBooking(itinerary, "Itinerary", e)}
            disabled={bookingLoading && bookingItemId === itinerary._id}
          >
            {bookingLoading && bookingItemId === itinerary._id ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaCalendarCheck className="me-2" />
            )}
            Book Now (${itinerary.totalPrice})
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => handleShare({ ...itinerary, type: "itineraries" })}
          >
            <FaCopy className="me-2" />
            Share
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() =>
              handleEmailShare({ ...itinerary, type: "itineraries" })
            }
          >
            <FaEnvelope className="me-2" />
            Email
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => toggleComments(itinerary._id)}
          >
            <FaComment />{" "}
            {expandedComments[itinerary._id]
              ? "Hide Comments"
              : "Show Comments"}
          </Button>
        </div>
        <Collapse in={expandedComments[itinerary._id]}>
          <div className="mt-3">
            <ItineraryComment itineraryId={itinerary._id} />
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );

  const filteredActivities = categoryFilter
    ? handleSearch(activities, searchQuery).filter(
        (activity) => activity.category?.name === categoryFilter
      )
    : handleSearch(activities, searchQuery);

  const filteredHistoricalPlaces = handleSearch(historicalPlaces, searchQuery);
  const filteredItineraries = handleSearch(
    itineraries.filter((itinerary) => itinerary.isActive === true),
    searchQuery
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Available Events</h1>
        <div className="bg-light p-3 rounded shadow-sm d-flex align-items-center">
          <FaWallet className="me-2 text-primary" size={24} />
          <div>
            <h4 className="mb-0">Wallet Balance: ${userWallet}</h4>
            <small className="text-muted">Available for bookings</small>
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-white rounded shadow-sm">
        <Form.Control
          type="text"
          placeholder="Search by name, category, or tags"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        <Form.Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Historical Places Section */}
      {filteredHistoricalPlaces.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-4">Historical Places</h2>
          <Row>
            {filteredHistoricalPlaces.map((place) => (
              <Col md={4} key={place._id}>
                <HistoricalPlaceCard place={place} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Activities Section */}
      {filteredActivities.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-4">Activities</h2>
          <Row>
            {filteredActivities.map((activity) => (
              <Col md={4} key={activity._id}>
                <ActivityCard activity={activity} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Itineraries Section */}
      {filteredItineraries.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-4">Itineraries</h2>
          <Row>
            {filteredItineraries.map((itinerary) => (
              <Col md={4} key={itinerary._id}>
                <ItineraryCard itinerary={itinerary} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {filteredHistoricalPlaces.length === 0 &&
        filteredActivities.length === 0 &&
        filteredItineraries.length === 0 && (
          <div className="text-center mt-5 p-5 bg-light rounded">
            <FaInfoCircle size={48} className="text-muted mb-3" />
            <h3>No events found matching your search criteria.</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}
    </Container>
  );
};

export default ViewEvents;
