import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Alert
} from "react-bootstrap";
import { Link } from 'react-router-dom';
import {
  FaCopy,
  FaEnvelope,
  FaCalendarCheck,
  FaCalendar,
  FaComment,
  FaWallet,
  FaInfoCircle,
  FaStar,
  FaMedal,
  FaCrown,
  FaRegSmile,
  FaBookmark,
  FaRegBookmark,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTag,
  FaBell,
  FaChevronRight,
  FaRoute // Added the missing icon
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar";
import ItineraryComment from "../../components/ItineraryComment";
import EventPaymentModal from "./EventPaymentModal";
import StripeWrapper from "../../components/StripeWrapper";
import { requestEventNotification } from "../../pages/tourist/eventNotificationService";

const ViewEvents = () => {
  // State declarations
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
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [touristLevel, setTouristLevel] = useState(1);
  const [searchParams] = useSearchParams();
  const [sharedItem, setSharedItem] = useState(null);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const NotifyMeButton = ({ item, type }) => {
    const [isRequested, setIsRequested] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleNotifyRequest = async () => {
      try {
        setIsLoading(true);
        const userId = getUserId();
        await requestEventNotification(item._id, type, userId);
        setIsRequested(true);
        alert(
          "You will be notified when this event starts accepting bookings!"
        );
      } catch (error) {
        console.error("Error requesting notification:", error);
        alert("Failed to set up notification. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Button
        variant={isRequested ? "success" : "outline-primary"}
        onClick={handleNotifyRequest}
        disabled={isLoading || isRequested}
        className="me-2"
      >
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : isRequested ? (
          <>
            <FaBell className="me-2" />
            Notification Set
          </>
        ) : (
          <>
            <FaBell className="me-2" />
            Notify Me
          </>
        )}
      </Button>
    );
  };

  const handleApplyPromoCode = async (itemPrice) => {
    if (!promoCode.trim()) return;

    setValidatingPromo(true);
    setPromoError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products/validate-promo",
        {
          code: promoCode,
          userId: getUserId(),
          amount: itemPrice,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setAppliedPromo({
          code: promoCode,
          discount: response.data.discount,
        });
        setPromoCode("");
        return response.data.discount;
      }
    } catch (error) {
      setPromoError(
        error.response?.data?.message || "Failed to apply promo code"
      );
      return 0;
    } finally {
      setValidatingPromo(false);
    }
  };

  // Utility functions
  const getUserSpecificKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return `tourist_${user?.username}`;
  };

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

  const fetchLoyaltyStatus = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const response = await axios.get(
        `http://localhost:5000/api/tourist/loyalty/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setLoyaltyPoints(response.data.loyaltyStatus.points);
        setTouristLevel(response.data.loyaltyStatus.level);
      }
    } catch (error) {
      console.error("Error fetching loyalty status:", error);
    }
  };

  // Bookmark-related functions
  const BookmarkButton = ({ item, type }) => (
    <Button
      variant={
        bookmarkedEvents.includes(item._id) ? "primary" : "outline-primary"
      }
      onClick={() => handleBookmark(item, type)}
      disabled={bookmarkedEvents.includes(item._id)}
      className="me-2"
    >
      {bookmarkedEvents.includes(item._id) ? (
        <>
          <FaBookmark className="me-2" />
          Saved
        </>
      ) : (
        <>
          <FaRegBookmark className="me-2" />
          Save
        </>
      )}
    </Button>
  );

  const handleBookmark = async (event, type) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/tourist/bookmark-event",
        {
          eventId: event._id,
          eventType: type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setBookmarkedEvents((prev) => [...prev, event._id]);
        alert("Event bookmarked successfully!");
      }
    } catch (error) {
      if (error.response?.data?.message === "Event already bookmarked") {
        setBookmarkedEvents((prev) =>
          prev.includes(event._id) ? prev : [...prev, event._id]
        );
      } else {
        console.error("Error bookmarking event:", error);
        alert(error.response?.data?.message || "Failed to bookmark event");
      }
    }
  };

  // Effect for fetching bookmarked events
  useEffect(() => {
    const fetchBookmarkedEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/tourist/saved-events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && response.data.savedEvents) {
          const bookmarkedIds = response.data.savedEvents.map(
            (event) => event._id
          );
          setBookmarkedEvents(bookmarkedIds);
        }
      } catch (error) {
        console.error("Error fetching bookmarked events:", error);
        setBookmarkedEvents([]);
      }
    };

    fetchBookmarkedEvents();
  }, []); // Effect for shared items
  useEffect(() => {
    const itemType = searchParams.get("type");
    const itemId = searchParams.get("id");

    if (itemType && itemId) {
      const findItem = () => {
        switch (itemType) {
          case "historicalplace":
            return historicalPlaces.find((place) => place._id === itemId);
          case "activities":
            return activities.find((activity) => activity._id === itemId);
          case "itineraries":
            return itineraries.find((itinerary) => itinerary._id === itemId);
          default:
            return null;
        }
      };

      const item = findItem();
      if (item) {
        setSharedItem({ type: itemType, data: item });
      }
    }
  }, [searchParams, historicalPlaces, activities, itineraries]);

  const updateWalletStorage = (wallet) => {
    const userKey = getUserSpecificKey();
    const touristData = JSON.parse(localStorage.getItem(userKey)) || {};
    localStorage.setItem(
      userKey,
      JSON.stringify({
        ...touristData,
        wallet: wallet,
      })
    );
  };

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
        const userKey = getUserSpecificKey();
        localStorage.setItem(
          userKey,
          JSON.stringify({
            wallet: response.data.tourist.wallet,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {
          console.error("No token or user found");
          setLoading(false);
          return;
        }

        try {
          const profileResponse = await axios.get(
            `http://localhost:5000/api/tourist/profile/${user.username}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (profileResponse.data.tourist) {
            setUserWallet(profileResponse.data.tourist.wallet);
            const userKey = `tourist_${user.username}`;
            localStorage.setItem(
              userKey,
              JSON.stringify({
                ...JSON.parse(localStorage.getItem(userKey) || "{}"),
                wallet: profileResponse.data.tourist.wallet,
              })
            );
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
        }

        const storedPoints = JSON.parse(localStorage.getItem("loyaltyPoints"));
        const storedLevel = JSON.parse(localStorage.getItem("touristLevel"));
        if (storedPoints && storedLevel) {
          setLoyaltyPoints(storedPoints);
          setTouristLevel(storedLevel);
        }

        const [historicalRes, activitiesRes, itinerariesRes, categoriesRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/historicalplace", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/activities", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/itineraries", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/activities/category", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetchLoyaltyStatus(),
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
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleStorageChange = (e) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && e.key === `tourist_${user.username}`) {
        try {
          const newData = JSON.parse(e.newValue);
          if (newData && typeof newData.wallet !== "undefined") {
            setUserWallet(newData.wallet);
          }
        } catch (error) {
          console.error("Error parsing storage data:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  const getItemPrice = (item, type, discount = 0) => {
    let basePrice;
    switch (type) {
      case "HistoricalPlace":
        basePrice = item.ticketPrices?.price || 100;
        break;
      case "Activity":
        basePrice = item.price || 0;
        break;
      case "Itinerary":
        basePrice = item.totalPrice || 0;
        break;
      default:
        basePrice = 0;
    }

    if (discount > 0) {
      return basePrice - (basePrice * discount) / 100;
    }
    return basePrice;
  };
  const handleBooking = (item, type, e, promoCode, discountedPrice) => {
    e.preventDefault();

    if (!bookingDate) {
      alert("Please select a date");
      return;
    }

    // Ensure consistent date handling
    const selectedDate = new Date(bookingDate);
    console.log("Selected date:", {
      original: bookingDate,
      parsed: selectedDate,
      iso: selectedDate.toISOString(),
      local: selectedDate.toLocaleDateString(),
    });

    setSelectedEvent({
      item,
      type,
      promoCode,
      finalPrice: discountedPrice || getItemPrice(item, type),
      formattedDate: selectedDate.toISOString(), // Store ISO string
    });
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentMethod, paymentIntent) => {
    const { item, type, promoCode, finalPrice, formattedDate } = selectedEvent;
    const userId = getUserId();

    try {
      // Use the ISO string date directly
      const bookingData = {
        userId,
        bookingType: type,
        itemId: item._id,
        bookingDate: formattedDate, // Use the stored ISO string
        promoCode,
        paymentMethod,
        paymentIntentId: paymentIntent?.id,
      };

      console.log("Sending booking data:", bookingData);

      const bookingResponse = await axios.post(
        "http://localhost:5000/api/bookings/create",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (bookingResponse.data.success) {
        if (paymentMethod === "wallet") {
          const deductResponse = await axios.post(
            `http://localhost:5000/api/tourist/wallet/deduct/${userId}`,
            {
              amount: finalPrice,
              bookingId: bookingResponse.data.data._id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          setUserWallet(deductResponse.data.currentBalance);
          updateWalletStorage(deductResponse.data.currentBalance);
        }

        alert("Booking successful!");
        await fetchUserProfile();
        await fetchLoyaltyStatus();
        setShowPaymentModal(false);
        setSelectedEvent(null);
        setBookingDate("");
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to complete booking"
      );
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
  // Add this PromoCodeInput component to be used in your cards
  const PromoCodeInput = ({ basePrice, onPromoApplied }) => {
    const [code, setCode] = useState("");
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState("");
    const [applied, setApplied] = useState(null);

    const handleApply = async () => {
      if (!code.trim()) return;
      setValidating(true);
      setError("");

      try {
        const response = await axios.post(
          "http://localhost:5000/api/products/validate-promo",
          {
            code,
            userId: getUserId(),
            amount: basePrice,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          const discount = response.data.discount;
          const discountedPrice = basePrice - (basePrice * discount) / 100;
          setApplied({
            code,
            discount,
            finalPrice: discountedPrice,
          });
          onPromoApplied(discount, code);
          setCode("");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to apply promo code");
      } finally {
        setValidating(false);
      }
    };

    return (
      <div className="mb-3">
        <h6>Promo Code</h6>
        {applied ? (
          <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
            <div>
              <Badge bg="success" className="me-2">
                <FaTag className="me-1" />
                {applied.code}
              </Badge>
              <span className="text-success">{applied.discount}% OFF</span>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                setApplied(null);
                onPromoApplied(0, null);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Enter promo code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button
              variant="outline-primary"
              onClick={handleApply}
              disabled={validating || !code.trim()}
            >
              {validating ? <Spinner animation="border" size="sm" /> : "Apply"}
            </Button>
          </div>
        )}
        {error && <div className="text-danger mt-2 small">{error}</div>}
      </div>
    );
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
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/tourist/view-events?type=${item.type}&id=${item._id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleEmailShare = (item) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/tourist/view-events?type=${item.type}&id=${item._id}`;
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

  const getBadgeIcon = (touristLevel) => {
    switch (touristLevel) {
      case 1:
        return <FaStar className="me-2 text-info" size={24} />;
      case 2:
        return <FaMedal className="me-2 text-success" size={24} />;
      case 3:
        return <FaCrown className="me-2 text-warning" size={24} />;
      case 0:
      default:
        return <FaRegSmile className="me-2 text-secondary" size={24} />;
    }
  };

  const LoyaltyInfo = () => (
    <div className="bg-light p-4 rounded shadow-sm d-flex align-items-center justify-content-between mb-4 w-100">
      <div className="d-flex align-items-center">
        <div className="me-4 d-flex align-items-center">
          {getBadgeIcon(touristLevel)}
          <div>
            <h4 className="mb-0">Level {touristLevel}</h4>
            <small className="text-muted">Tourist Status</small>
          </div>
        </div>
        <div className="border-start ps-4">
          <h4 className="mb-0">{loyaltyPoints.toLocaleString()} Points</h4>
          <small className="text-muted">
            Earn{" "}
            <span className="fw-bold">
              {touristLevel === 1 ? "0.5x" : touristLevel === 2 ? "1x" : "1.5x"}
            </span>{" "}
            points on purchases
          </small>
        </div>
      </div>
      <div className="d-flex align-items-center">
        <div className="text-end">
          {touristLevel < 3 && (
            <>
              <small className="text-muted d-block">Next Level</small>
              <div className="fw-bold text-primary">
                {touristLevel === 1
                  ? "Level 2 (100,000 points)"
                  : "Level 3 (500,000 points)"}
              </div>
              <div
                className="progress mt-1"
                style={{ width: "200px", height: "6px" }}
              >
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{
                    width: `${
                      (loyaltyPoints / (touristLevel === 1 ? 100000 : 500000)) *
                      100
                    }%`,
                  }}
                  aria-valuenow={
                    (loyaltyPoints / (touristLevel === 1 ? 100000 : 500000)) *
                    100
                  }
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </>
          )}
          {touristLevel === 3 && (
            <div className="text-success">
              <FaCrown className="me-2" />
              Maximum Level Achieved
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const HistoricalPlaceCard = ({
    place,
    onBooking,
    bookingDate,
    setBookingDate,
  }) => {
    const [discountedPrice, setDiscountedPrice] = useState(null);
    const [activePromoCode, setActivePromoCode] = useState(null);

    return (
      <Card className="mb-3 h-100 shadow-sm">
        <Card.Body>
          <Card.Title>{place.name}</Card.Title>
          <Card.Text>{place.description}</Card.Text>
          <Card.Text>
            <FaCalendar className="me-2" />
            <strong>Opening Hours:</strong> {place.openingHours}
          </Card.Text>
          <Card.Text>
            <FaDollarSign className="me-2" />
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

          <PromoCodeInput
            basePrice={getItemPrice(place, "HistoricalPlace")}
            onPromoApplied={(discount, code) => {
              if (discount > 0) {
                const basePrice = getItemPrice(place, "HistoricalPlace");
                setDiscountedPrice(basePrice - (basePrice * discount) / 100);
                setActivePromoCode(code);
              } else {
                setDiscountedPrice(null);
                setActivePromoCode(null);
              }
            }}
          />

          <Form.Group className="mb-3">
            <Form.Label>Select Visit Date</Form.Label>
            <Form.Control
              type="date"
              value={bookingDate} // Use the prop value
              onChange={(e) => setBookingDate(e.target.value)} // Call the main component's setter
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </Form.Group>
          <div className="d-flex gap-2 mt-3">
            <NotifyMeButton item={place} type="HistoricalPlace" />
            <BookmarkButton item={place} type="HistoricalPlace" />
            <BookmarkButton item={place} type="HistoricalPlace" />
            <Button
              variant="primary"
              onClick={(e) =>
                onBooking(
                  place,
                  "HistoricalPlace",
                  e,
                  activePromoCode,
                  discountedPrice
                )
              }
              disabled={!bookingDate}
            >
              <FaCalendarCheck className="me-2" />
              Book Now{" "}
              {discountedPrice ? (
                <>
                  <span className="text-decoration-line-through">
                    ${getItemPrice(place, "HistoricalPlace")}
                  </span>{" "}
                  ${discountedPrice.toFixed(2)}
                </>
              ) : (
                `$${getItemPrice(place, "HistoricalPlace")}`
              )}
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
  };
  const ActivityCard = ({
    activity,
    onBooking,
    bookingDate,
    setBookingDate,
  }) => {
    const [discountedPrice, setDiscountedPrice] = useState(null);
    const [activePromoCode, setActivePromoCode] = useState(null);

    return (
      <Card className="mb-3 h-100 shadow-sm">
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
            <strong>Category:</strong>{" "}
            {activity.category?.name || "No Category"}
          </Card.Text>
          <Card.Text>
            <FaDollarSign className="me-2" />
            <strong>Price:</strong> ${activity.price}
          </Card.Text>
          {activity.location && (
            <Card.Text>
              <FaMapMarkerAlt className="me-2" />
              <strong>Location:</strong>{" "}
              {typeof activity.location === "object" &&
              activity.location.coordinates
                ? activity.location.coordinates.join(", ")
                : typeof activity.location === "string"
                ? activity.location
                : "No location"}
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

          <PromoCodeInput
            basePrice={getItemPrice(activity, "Activity")}
            onPromoApplied={(discount, code) => {
              if (discount > 0) {
                const basePrice = getItemPrice(activity, "Activity");
                setDiscountedPrice(basePrice - (basePrice * discount) / 100);
                setActivePromoCode(code);
              } else {
                setDiscountedPrice(null);
                setActivePromoCode(null);
              }
            }}
          />

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
            <NotifyMeButton item={activity} type="Activity" />
            <BookmarkButton item={activity} type="Activity" />
            <BookmarkButton item={activity} type="Activity" />
            <Button
              variant="primary"
              onClick={(e) =>
                onBooking(
                  activity,
                  "Activity",
                  e,
                  activePromoCode,
                  discountedPrice
                )
              }
              disabled={!bookingDate}
            >
              {bookingLoading && bookingItemId === activity._id ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FaCalendarCheck className="me-2" />
              )}
              Book Now{" "}
              {discountedPrice ? (
                <>
                  <span className="text-decoration-line-through">
                    ${getItemPrice(activity, "Activity")}
                  </span>{" "}
                  ${discountedPrice.toFixed(2)}
                </>
              ) : (
                `$${getItemPrice(activity, "Activity")}`
              )}
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
  };
  const ItineraryCard = ({
    itinerary,
    onBooking,
    bookingDate,
    setBookingDate,
  }) => {
    const [discountedPrice, setDiscountedPrice] = useState(null);
    const [activePromoCode, setActivePromoCode] = useState(null);

    return (
      <Card className="mb-3 h-100 shadow-sm">
        <Card.Body>
          <Card.Title>{itinerary.name}</Card.Title>
          <Card.Text>
            <strong>Language:</strong> {itinerary.language}
          </Card.Text>
          <Card.Text>
            <FaDollarSign className="me-2" />
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

          <PromoCodeInput
            basePrice={getItemPrice(itinerary, "Itinerary")}
            onPromoApplied={(discount, code) => {
              if (discount > 0) {
                const basePrice = getItemPrice(itinerary, "Itinerary");
                setDiscountedPrice(basePrice - (basePrice * discount) / 100);
                setActivePromoCode(code);
              } else {
                setDiscountedPrice(null);
                setActivePromoCode(null);
              }
            }}
          />

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
            <NotifyMeButton item={itinerary} type="Itinerary" />
            <BookmarkButton item={itinerary} type="Itinerary" />
            <BookmarkButton item={itinerary} type="Itinerary" />
            <Button
              variant="primary"
              onClick={(e) =>
                onBooking(
                  itinerary,
                  "Itinerary",
                  e,
                  activePromoCode,
                  discountedPrice
                )
              }
              disabled={!bookingDate}
            >
              {bookingLoading && bookingItemId === itinerary._id ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FaCalendarCheck className="me-2" />
              )}
              Book Now{" "}
              {discountedPrice ? (
                <>
                  <span className="text-decoration-line-through">
                    ${getItemPrice(itinerary, "Itinerary")}
                  </span>{" "}
                  ${discountedPrice.toFixed(2)}
                </>
              ) : (
                `$${getItemPrice(itinerary, "Itinerary")}`
              )}
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
  };
  const renderSharedContent = () => {
    if (!sharedItem) return null;

    const { type, data } = sharedItem;
    switch (type) {
      case "historicalplace":
        return (
          <Row>
            <Col md={12}>
              <HistoricalPlaceCard
                place={data}
                onBooking={handleBooking} // Add this here too
              />
            </Col>
          </Row>
        );
      case "activities":
        return (
          <Row>
            <Col md={12}>
              <ActivityCard activity={data} />
            </Col>
          </Row>
        );
      case "itineraries":
        return (
          <Row>
            <Col md={12}>
              <ItineraryCard
                itinerary={data}
                onBooking={handleBooking}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
              />
            </Col>
          </Row>
        );
      default:
        return null;
    }
  };

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

  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '60vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '3rem'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }} className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="light" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="events-page">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/tourist" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small" />
                  </Link>
                </span>
                <span>
                  Events <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4">Discover Amazing Events</h1>
            </div>
          </Container>
        </div>

        <section className="py-5">
          <Container>
            {/* Wallet and Loyalty Display */}
            <div className="bg-light p-4 rounded shadow-sm mb-4">
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <FaWallet className="text-primary me-3" size={32} />
                    <div>
                      <h4 className="mb-1">Wallet Balance</h4>
                      <h3 className="mb-0">${userWallet.toFixed(2)}</h3>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="border-start">
                  <div className="d-flex align-items-center">
                    {getBadgeIcon(touristLevel)}
                    <div>
                      <h4 className="mb-1">Level {touristLevel}</h4>
                      <p className="mb-0">{loyaltyPoints.toLocaleString()} Points</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Search and Filter Section */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, category, or tags"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 bg-light"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="border-0 bg-light"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Shared Content or Regular Content */}
            {sharedItem ? (
              <div className="mt-4">{renderSharedContent()}</div>
            ) : (
              <>
                {/* Historical Places Section */}
                {filteredHistoricalPlaces.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-4 d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      Historical Places
                    </h2>
                    <Row className="g-4">
                      {filteredHistoricalPlaces.map((place) => (
                        <Col md={4} key={place._id}>
                          <HistoricalPlaceCard
                            place={place}
                            onBooking={handleBooking}
                            bookingDate={bookingDate}
                            setBookingDate={setBookingDate}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Activities Section */}
                {filteredActivities.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-4 d-flex align-items-center">
                      <FaCalendarCheck className="me-2 text-primary" />
                      Activities
                    </h2>
                    <Row className="g-4">
                      {filteredActivities.map((activity) => (
                        <Col md={4} key={activity._id}>
                          <ActivityCard
                            activity={activity}
                            onBooking={handleBooking}
                            bookingDate={bookingDate}
                            setBookingDate={setBookingDate}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Itineraries Section */}
                {filteredItineraries.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-4 d-flex align-items-center">
                      <FaRoute className="me-2 text-primary" />
                      Itineraries
                    </h2>
                    <Row className="g-4">
                      {filteredItineraries.map((itinerary) => (
                        <Col md={4} key={itinerary._id}>
                          <ItineraryCard
                            itinerary={itinerary}
                            onBooking={handleBooking}
                            bookingDate={bookingDate}
                            setBookingDate={setBookingDate}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* No Results Message */}
                {filteredHistoricalPlaces.length === 0 &&
                  filteredActivities.length === 0 &&
                  filteredItineraries.length === 0 && (
                  <div className="text-center py-5">
                    <FaInfoCircle size={48} className="text-muted mb-3" />
                    <h3>No events found</h3>
                    <p className="text-muted">Try adjusting your search criteria</p>
                    <Button variant="primary" onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('');
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </Container>
        </section>

        {/* Call to Action Section */}
        <section className="py-5 bg-light">
          <Container>
            <div 
              className="text-center p-5 position-relative rounded-lg"
              style={{
                backgroundImage: 'url("/images/bg_2.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '10px'
              }}
            >
              <div style={overlayStyle}></div>
              <div className="position-relative" style={{ zIndex: 2 }}>
                <h2 className="text-white mb-4">Ready for Your Next Adventure?</h2>
                <p className="text-white mb-4">Explore our curated collection of experiences and create lasting memories</p>
                <Button variant="primary" size="lg" as={Link} to="/tourist/profile">
                  View My Bookings
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Payment Modal */}
        <StripeWrapper>
          <EventPaymentModal
            show={showPaymentModal}
            onHide={() => setShowPaymentModal(false)}
            totalAmount={selectedEvent?.finalPrice || 0}
            walletBalance={userWallet}
            onPaymentComplete={handlePaymentComplete}
            eventDetails={{
              name: selectedEvent?.item?.name,
              type: selectedEvent?.type,
            }}
            appliedPromoCode={selectedEvent?.promoCode}
          />
        </StripeWrapper>
      </div>
    </>
  );
};

export default ViewEvents;