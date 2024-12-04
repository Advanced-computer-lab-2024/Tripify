import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FaCheck,
  FaQuestionCircle,
  FaCompass
} from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { format } from 'date-fns';
import VacationGuide from "../../components/VacationGuide";
import GuideButton from "../../components/GuideButton";

// Custom hook for managing notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getUserInfo = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.tourist?._id || decoded.user?._id || decoded._id;
      return userId ? { userId, userType: 'Tourist' } : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/notifications`, {
        params: {
          userId: userInfo.userId,
          userType: userInfo.userType,
          page: 1,
          limit: 5
        }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getUserInfo]);

  const fetchUnreadCount = useCallback(async () => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    try {
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
  }, [getUserInfo]);

  const markAsRead = async (notificationId) => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { params: { userId: userInfo.userId } }
      );
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead
  };
};

// NotificationBell Component
const NotificationBell = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead
  } = useNotifications();

  useEffect(() => {
    if (show) {
      fetchNotifications();
    }
  }, [show, fetchNotifications]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

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
    <Dropdown onToggle={setShow}>
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
                onClick={() => notification.link && navigate(notification.link)}
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
// Styled Button Component for consistency
const StyledMenuButton = ({ to, label, icon, variant, onClick, className = '' }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`btn btn-${variant} w-100 d-flex align-items-center justify-content-center p-3 ${className}`}
    style={{
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      height: "100%",
      minHeight: "100px",
      flexDirection: "column",
      gap: "10px"
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    }}
  >
    <div className="icon-container">{icon}</div>
    <span className="text-center">{label}</span>
  </Link>
);

// Main TouristHomePage Component
const TouristHomePage = () => {
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Tourist";
  const [showGuide, setShowGuide] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const menuCategories = {
    "Main Services": [
      {
        to: "/tourist/view-events",
        label: "View Events",
        icon: <FaMap size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/saved-events",
        label: "Saved Events",
        icon: <FaBookmark size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/my-profile",
        label: "My Profile",
        icon: <FaUser size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/book-flight",
        label: "Book a Flight",
        icon: <FaPlane size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/book-hotel",
        label: "Book a Hotel",
        icon: <FaHotel size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/book-transportation",
        label: "Book Transportation",
        icon: <FaCar size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/delivery-addresses",
        label: "Delivery Addresses",
        icon: <FaMapMarkerAlt size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/itinerary-filter",
        label: "Itinerary Filter",
        icon: <FaCompass size={24} />,
        variant: "info",
      },
      {
        to: "/tourist/filtered-activities",
        label: "Filtered Activities",
        icon: <FaMap size={24} />,
        variant: "info",
      },
      {
        to: "/tourist/products",
        label: "View Products",
        icon: <FaShoppingBag size={24} />,
        variant: "primary",
      },
      {
        to: "/tourist/purchases",
        label: "My Purchases",
        icon: <FaShoppingBag size={24} />,
        variant: "primary",
      }
    ],
    "Support & Settings": [
      {
        to: "/tourist/view-bookings",
        label: "View Bookings",
        icon: <FaMap size={24} />,
        variant: "secondary",
      },
      {
        to: "/tourist/change-password",
        label: "Change Password",
        icon: <FaLock size={24} />,
        variant: "secondary",
      },
      {
        to: "/tourist/complaints",
        label: "File a Complaint",
        icon: <FaExclamationCircle size={24} />,
        variant: "danger",
      },
      {
        to: "/tourist/my-complaints",
        label: "My Complaints",
        icon: <FaExclamationCircle size={24} />,
        variant: "secondary",
      }
    ]
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4 position-relative">
            {/* Top Bar with Notifications and Guide */}
            <div className="d-flex justify-content-between align-items-center position-absolute w-100" 
                 style={{ top: 0, left: 0, padding: '1rem' }}>
              <GuideButton />
              <NotificationBell />
            </div>

            {/* Welcome Section */}
            <div className="pt-5">
              <h1 className="mb-3">Welcome to the Tourist Homepage</h1>
              <p className="text-muted mb-4">Welcome back, {username}!</p>
              
              {/* Quick Start Guide Button */}
              <Button 
                variant="outline-primary"
                className="d-flex align-items-center gap-2 mx-auto mb-4"
                onClick={() => setShowGuide(true)}
                style={{ maxWidth: 'fit-content' }}
              >
                <FaQuestionCircle size={20} />
                <span>Start Quick Tour</span>
              </Button>
            </div>

            {/* Menu Categories */}
            {Object.entries(menuCategories).map(([category, items]) => (
              <div key={category} className="mb-5">
                <h3 className="mb-4 text-primary border-bottom pb-2 d-flex align-items-center gap-2">
                  {category === "Main Services" ? 
                    <FaCompass size={24} /> : 
                    <FaQuestionCircle size={24} />
                  }
                  {category}
                </h3>
                <Row className="g-4">
                  {items.map((item) => (
                    <Col key={item.to} xs={12} sm={6} md={4}>
                      <StyledMenuButton {...item} />
                    </Col>
                  ))}
                </Row>

                {category === "Main Services" && (
                  <div className="text-center mt-4">
                    <Button
                      as={Link}
                      to="/tourist/filter-historical-places"
                      variant="outline-primary"
                      className="d-flex align-items-center gap-2 mx-auto"
                      style={{ maxWidth: 'fit-content' }}
                    >
                      <FaMap size={20} />
                      <span>Filter Historical Places by Tags</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Vacation Guide Modal */}
      <VacationGuide 
        show={showGuide} 
        onHide={() => setShowGuide(false)} 
      />

      {/* First Visit Guide */}
      {isFirstVisit && (
        <VacationGuide 
          show={true} 
          onHide={() => setIsFirstVisit(false)}
          isFirstVisit={true}
        />
      )}
    </Container>
  );
};

export default TouristHomePage;