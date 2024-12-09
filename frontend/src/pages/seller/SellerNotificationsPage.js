import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container,
  Card,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Pagination
} from 'react-bootstrap';
import { format } from 'date-fns';
import { FaBell, FaTrash, FaCheckCircle, FaExternalLinkAlt, FaChevronLeft } from 'react-icons/fa';

const SellerNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      
      // Handle different token structures
      let userId = null;
      if (decoded.seller) {
        userId = decoded.seller._id;
      } else if (decoded.user) {
        userId = decoded.user._id;
      } else if (decoded._id) {
        userId = decoded._id;
      }
  
      if (!userId) {
        console.error('No user ID found in token:', decoded);
        return null;
      }
  
      return {
        userId: userId,
        userType: 'Seller'
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userInfo = getUserInfo();
      
      if (!userInfo || !userInfo.userId) {
        console.error('No valid user info found:', userInfo);
        setError('Seller not authenticated');
        return;
      }
  
      console.log('Fetching notifications for:', userInfo);
  
      const response = await axios.get(`http://localhost:5000/api/notifications`, {
        params: {
          userId: userInfo.userId,
          userType: userInfo.userType,
          page: page,
          limit: 10
        }
      });
  
      console.log('Notifications response:', response.data);
      
      setNotifications(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.userId) {
        console.error('No valid user info found for unread count');
        return;
      }
  
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
      
      setNotifications(notifications.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userInfo = getUserInfo();
      await axios.patch(
        'http://localhost:5000/api/notifications/mark-all-read',
        {},
        {
          params: {
            userId: userInfo.userId,
            userType: userInfo.userType
          }
        }
      );
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const userInfo = getUserInfo();
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
        params: { userId: userInfo.userId }
      });
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_RECEIVED':
        return '🛍️';
      case 'PAYMENT_RECEIVED':
        return '💰';
      case 'REVIEW_RECEIVED':
        return '⭐';
      case 'STOCK_ALERT':
        return '📦';
      case 'PRODUCT_UPDATE':
        return '🔄';
      case 'SHOP_UPDATE':
        return '🏪';
      case 'CUSTOMER_INQUIRY':
        return '💬';
      case 'PROMOTION_UPDATE':
        return '🏷️';
      case 'SHIPPING_UPDATE':
        return '🚚';
      case 'SYSTEM_NOTIFICATION':
        return '📢';
      default:
        return '📌';
    }
  };

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setError('Seller not authenticated');
    }
  }, [page]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button
        variant="link"
        onClick={() => window.history.back()}
        className="mb-4 ps-0"
        style={{ 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          color: '#1089ff'
        }}
      >
        <FaChevronLeft className="me-1" /> Back to Shop Dashboard
      </Button>
      
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-2">
            <FaBell className="me-2" />
            Shop Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="mb-0">
              You have <Badge bg="primary">{unreadCount}</Badge> unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          )}
        </Col>
        <Col xs="auto">
          {unreadCount > 0 && (
            <Button variant="outline-primary" onClick={markAllAsRead}>
              <FaCheckCircle className="me-2" />
              Mark All as Read
            </Button>
          )}
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {notifications.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaBell size={40} className="mb-3 text-muted" />
            <h4>No notifications</h4>
            <p className="text-muted">You're all caught up!</p>
          </Card.Body>
        </Card>
      ) : (
        notifications.map(notification => (
          <Card 
            key={notification._id} 
            className={`mb-3 ${!notification.isRead ? 'border-primary' : ''}`}
            style={{ cursor: notification.link ? 'pointer' : 'default' }}
          >
            <Card.Body>
              <Row className="align-items-start">
                <Col>
                  <h5 className="mb-1">
                    {getNotificationIcon(notification.type)} {notification.title}
                    {!notification.isRead && (
                      <Badge bg="primary" className="ms-2">New</Badge>
                    )}
                  </h5>
                  <p className="mb-2">{notification.message}</p>
                  <small className="text-muted">
                    {format(new Date(notification.createdAt), 'PPp')}
                    <Badge 
                      bg={getPriorityBadgeVariant(notification.priority)}
                      className="ms-2"
                    >
                      {notification.priority}
                    </Badge>
                  </small>
                </Col>
                <Col xs="auto" className="d-flex gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                    >
                      <FaCheckCircle className="me-1" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </Button>
                  {notification.link && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = notification.link;
                      }}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      View Details
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
            <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
            
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={page === index + 1}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default SellerNotificationsPage;