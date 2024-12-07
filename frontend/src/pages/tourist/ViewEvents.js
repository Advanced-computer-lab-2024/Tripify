import React, { useEffect, useState } from "react";
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
} from "react-bootstrap";
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
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import ItineraryComment from "../../components/ItineraryComment";

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
  const handleBooking = async (item, type, e, promoCode, discountedPrice) => {
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

    const basePrice = getItemPrice(item, type);
    let appliedDiscount = 0;
    const finalPrice = discountedPrice || getItemPrice(item, type);

    if (promoCode) {
      const discount = await handleApplyPromoCode(basePrice);
      if (discount > 0) {
        appliedDiscount = discount;
        finalPrice = getItemPrice(item, type, discount);
      }
    }

    if (userWallet < finalPrice) {
      alert(
        `Insufficient funds in your wallet. Required: $${finalPrice}, Available: $${userWallet}`
      );
      return;
    }

    setBookingItemId(item._id);
    setBookingLoading(true);

    try {
      const formattedBookingDate = new Date(bookingDate);
      formattedBookingDate.setHours(12, 0, 0, 0);

      const bookingData = {
        userId,
        bookingType: type,
        itemId: item._id,
        bookingDate: formattedBookingDate.toISOString(),
        promoCode: promoCode, // Use the passed promoCode
      };

      if (type === "Itinerary") {
        bookingData.guideId = item.createdBy;
      }

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
        try {
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

          if (deductResponse.data.success) {
            setUserWallet(deductResponse.data.currentBalance);
            setLoyaltyPoints(deductResponse.data.totalPoints);
            setTouristLevel(deductResponse.data.newLevel);
            localStorage.setItem(
              "loyaltyPoints",
              JSON.stringify(deductResponse.data.totalPoints)
            );
            localStorage.setItem(
              "touristLevel",
              JSON.stringify(deductResponse.data.newLevel)
            );

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
            await fetchUserProfile();
            await fetchLoyaltyStatus();

            // Handle email notification
            const user = JSON.parse(localStorage.getItem("user"));
            const userEmail = user ? user.email : null;

            if (userEmail) {
              const emailMessage = `
  <h3>Booking Confirmation</h3>
  <p>Thank you for booking with us!</p>
  <p><strong>Booking Details:</strong></p>
  <p><strong>Event:</strong> ${item.name}</p>
  <p><strong>Type:</strong> ${type}</p>
  <p><strong>Date:</strong> ${formattedBookingDate.toDateString()}</p>
  <p><strong>Original Price:</strong> $${getItemPrice(item, type)}</p>
  ${promoCode ? `<p><strong>Promo Code Applied:</strong> ${promoCode}</p>` : ""}
  <p><strong>Final Price:</strong> $${finalPrice}</p>
  <p>Your wallet has been charged, and the booking is now confirmed.</p>
  <p>If you have any questions or need further assistance, feel free to contact us.</p>
`;

              try {
                await axios.post("http://localhost:5000/api/notify", {
                  email: userEmail,
                  message: emailMessage,
                });
                console.log("Receipt email sent successfully!");
              } catch (emailError) {
                console.error("Error sending receipt email:", emailError);
              }
            }
          }
        } catch (paymentError) {
          console.error("Payment error:", paymentError);
          await cancelBooking(bookingResponse.data.data._id);
          alert(
            paymentError.response?.data?.message ||
              "Payment failed. Booking has been cancelled."
          );
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Error creating booking");
    } finally {
      setBookingLoading(false);
      setBookingItemId(null);
      setBookingDate("");
      setPromoCode("");
      setAppliedPromo(null);
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
  const ActivityCard = ({ activity }) => (
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
          <strong>Category:</strong> {activity.category?.name || "No Category"}
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
          <BookmarkButton item={activity} type="Activity" />
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
          <BookmarkButton item={itinerary} type="Itinerary" />
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
              <ItineraryCard itinerary={data} />
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

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{sharedItem ? "Shared Event" : "Available Events"}</h1>
        <div className="bg-light p-3 rounded shadow-sm d-flex align-items-center">
          <FaWallet className="me-2 text-primary" size={24} />
          <div>
            <h4 className="mb-0">Wallet Balance: ${userWallet}</h4>
            <small className="text-muted">Available for bookings</small>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3">
        <LoyaltyInfo />
      </div>

      {sharedItem ? (
        <div className="mt-4">{renderSharedContent()}</div>
      ) : (
        <>
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

          {filteredHistoricalPlaces.length > 0 && (
            <div className="mb-5">
              <h2 className="mb-4">Historical Places</h2>
              <Row>
                {filteredHistoricalPlaces.map((place) => (
                  <Col md={4} key={place._id}>
                    <HistoricalPlaceCard
                      place={place}
                      onBooking={handleBooking}
                      bookingDate={bookingDate} // Pass the date state
                      setBookingDate={setBookingDate} // Pass the date setter
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

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
        </>
      )}
    </Container>
  );
};

export default ViewEvents;
