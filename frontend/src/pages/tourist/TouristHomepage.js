import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Dropdown, Badge } from "react-bootstrap";
import {
  FaPlane,
  FaHotel,
  FaCar,
  FaMap,
  FaShoppingBag,
  FaExclamationCircle,
  FaUser,
  FaLock,
  FaBookmark,
  FaMapMarkerAlt,
  FaBell,
  FaEye,
  FaCheck
} from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { format } from 'date-fns';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      let userId = null;
      if (decoded.tourist) {
        userId = decoded.tourist._id;
      } else if (decoded.user) {
        userId = decoded.user._id;
      } else if (decoded._id) {
        userId = decoded._id;
      }
      return { userId, userType: 'Tourist' };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userInfo = getUserInfo();
      if (!userInfo) return;

      const response = await axios.get(`http://localhost:5000/api/notifications`, {
        params: {
          userId: userInfo.userId,
          userType: userInfo.userType,
          page: 1,
          limit: 5 // Show only latest 5 notifications in dropdown
        }
      });

      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return;

      const response = await axios.get(`http://localhost:5000/api/notifications/unread/count`, {
        params: {
          userId: userInfo.userId,
          userType: userInfo.userType
        }
      });

      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const userInfo = getUserInfo();
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          params: { userId: userInfo.userId }
        }
      );
      
      // Update local state
      setNotifications(notifications.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (show) {
      fetchNotifications();
    }
  }, [show]);

  useEffect(() => {
    fetchUnreadCount();
    // Set up polling for unread count
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ cursor: 'pointer' }}
      className="position-relative d-inline-block"
    >
      <FaBell size={24} className="text-primary" />
      {unreadCount > 0 && (
        <Badge 
          bg="danger" 
          className="position-absolute"
          style={{ 
            top: '-8px', 
            right: '-8px',
            borderRadius: '50%',
            minWidth: '18px',
            height: '18px',
            padding: '2px',
            fontSize: '0.75rem'
          }}
        >
          {unreadCount}
        </Badge>
      )}
    </div>
  ));

  return (
    <Dropdown onToggle={(nextShow) => setShow(nextShow)}>
      <Dropdown.Toggle as={CustomToggle} id="notification-dropdown" />

      <Dropdown.Menu align="end" className="notification-dropdown" style={{ width: '350px', maxHeight: '500px', overflow: 'auto' }}>
        <div className="px-3 py-2 d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Notifications</h6>
          <Link to="/tourist/notifications" className="text-primary text-decoration-none">
            <small>View All</small>
          </Link>
        </div>
        <Dropdown.Divider />
        
        {loading ? (
          <div className="text-center py-3">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-3 text-muted">No notifications</div>
        ) : (
          <>
            {notifications.map(notification => (
              <Dropdown.Item 
                key={notification._id}
                className={`px-3 py-2 border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                onClick={() => notification.link && window.location.navigate(notification.link)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="pe-2">
                    <div className="fw-bold">{notification.title}</div>
                    <div className="small text-muted">{notification.message}</div>
                    <div className="small text-muted">
                      {format(new Date(notification.createdAt), 'PPp')}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="py-0 px-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                    >
                      <FaCheck size={12} />
                    </Button>
                  )}
                </div>
              </Dropdown.Item>
            ))}
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};


const TouristHomePage = () => {
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Tourist";

  const menuItems = [
    {
      to: "/tourist/view-events",
      label: "View Events",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/saved-events", // Moved to main services
      label: "Saved Events",
      icon: <FaBookmark />,
      variant: "primary",
    },
    {
      to: "/tourist/my-profile",
      label: "My Profile",
      icon: <FaUser />,
      variant: "primary",
    },
    {
      to: "/tourist/book-flight",
      label: "Book a Flight",
      icon: <FaPlane />,
      variant: "primary",
    },
    {
      to: "/tourist/book-hotel",
      label: "Book a Hotel",
      icon: <FaHotel />,
      variant: "primary",
    },
    {
      to: "/tourist/book-transportation",
      label: "Book Transportation",
      icon: <FaCar />,
      variant: "primary",
    },
    {
      to: "/tourist/delivery-addresses",
      label: "Delivery Addresses",
      icon: <FaMapMarkerAlt />,
      variant: "primary",
    },
    {
      to: "/tourist/itinerary-filter",
      label: "Itinerary Filter",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/filtered-activities",
      label: "Filtered Activities",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/products",
      label: "View Products",
      icon: <FaShoppingBag />,
      variant: "primary",
    },
    {
      to: "/tourist/purchases",
      label: "My Purchases",
      icon: <FaShoppingBag />,
      variant: "primary",
    },
    {
      to: "/tourist/view-bookings",
      label: "View Bookings",
      icon: <FaMap />,
      variant: "primary",
    },
    // Support items
    {
      to: "/tourist/change-password",
      label: "Change My Password",
      icon: <FaLock />,
      variant: "primary",
    },
    {
      to: "/tourist/complaints",
      label: "File a Complaint",
      icon: <FaExclamationCircle />,
      variant: "danger",
    },
    {
      to: "/tourist/my-complaints",
      label: "My Complaints",
      icon: <FaExclamationCircle />,
      variant: "primary",
    }
  ];

  // Updated grouping to include saved events in Main Services
  const menuCategories = {
    "Main Services": menuItems.slice(0, 11), // First 11 items including saved events
    "Support": menuItems.slice(11) // Remaining items
  };

  // Rest of the component remains the same...
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4 position-relative">
            {/* Add NotificationBell to the top right */}
            <div className="position-absolute" style={{ top: 0, right: 0, padding: '1rem' }}>
              <NotificationBell />
            </div>
            <h1 className="mb-3">Welcome to the Tourist Homepage</h1>
            <p className="text-muted">Welcome back, {username}!</p>
          </div>

          {Object.entries(menuCategories).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="mb-3 text-primary border-bottom pb-2">
                {category}
              </h3>
              <Row className="g-4 justify-content-center">
                {items.map((item) => (
                  <Col xs={12} sm={6} md={4} key={item.to}>
                    <Link
                      to={item.to}
                      className={`btn btn-${item.variant} w-100 d-flex align-items-center justify-content-center gap-2 p-3`}
                      style={{
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                      aria-label={item.label}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 8px rgba(0,0,0,0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Col>
                ))}
              </Row>

              {category === "Main Services" && (
                <div className="text-center mt-4">
                  <Link to="/tourist/filter-historical-places">
                    <Button variant="outline-primary" aria-label="Filter Historical Places">
                      Filter Historical Places by Tags
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TouristHomePage;