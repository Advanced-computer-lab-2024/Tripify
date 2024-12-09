
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Badge,
  Alert,
  Card,
  Spinner,
  Row,
  Col
} from "react-bootstrap";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaDollarSign,
  FaTags,
  FaMapMarkerAlt,
  FaChevronRight,
  FaClipboardList,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AdvertiserNavbar from './AdvertiserNavbar';

const AdvertiserActivities = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    padding: '8rem 0 4rem 0',
    marginBottom: '2rem'
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

  useEffect(() => {
    fetchAdvertiserActivities();
  }, []);

  const getAdvertiserFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid authentication token');
    }
  };

  const fetchAdvertiserActivities = async () => {
    try {
      const advertiser = getAdvertiserFromToken();
      setAdvertiserInfo(advertiser);

      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        "http://localhost:5000/api/advertiser/activities/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setActivities(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching activities:", error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your activities');
      } else if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(error.response?.data?.message || "Error fetching activities. Please try again later.");
      }
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdvertiserNavbar />
      <div className="activities-page">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/advertiser" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  My Activities <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">My Activities</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-4">
              {/* Header Section */}
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="icon-circle me-3"
                  style={{
                    backgroundColor: '#1089ff',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <FaClipboardList size={24} />
                </div>
                <div>
                  <h3 className="mb-0">Activity List</h3>
                  {advertiserInfo && (
                    <p className="text-muted mb-0">
                      Showing activities for: {advertiserInfo.username}
                    </p>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading your activities...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="rounded-3">
                  {error}
                </Alert>
              ) : activities.length === 0 ? (
                <Alert variant="info" className="rounded-3">
                  No activities found.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Activity Details</th>
                        <th>Date & Time</th>
                        <th>Price</th>
                        <th>Category & Tags</th>
                        <th>Status</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity) => (
                        <tr key={activity._id}>
                          <td>
                            <div className="fw-bold">{activity.name}</div>
                            <small className="text-muted">{activity.description}</small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="text-primary me-2" />
                              {new Date(activity.date).toLocaleDateString()}
                              <FaClock className="text-warning ms-3 me-2" />
                              {activity.time}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaDollarSign className="text-success me-1" />
                              {activity.price}
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg="primary" 
                              className="me-2"
                              style={{
                                backgroundColor: '#1089ff',
                                fontWeight: 'normal'
                              }}
                            >
                              {activity.category?.name || "No Category"}
                            </Badge>
                            <div className="mt-1">
                              {activity.tags?.map((tag) => (
                                <Badge 
                                  bg="info" 
                                  className="me-1" 
                                  key={tag._id}
                                  style={{
                                    backgroundColor: '#6c757d',
                                    fontWeight: 'normal'
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg={activity.bookingOpen ? "success" : "secondary"}
                              className="rounded-pill"
                            >
                              {activity.bookingOpen ? (
                                <><FaCheck className="me-1" /> Booking Open</>
                              ) : (
                                <><FaTimes className="me-1" /> Booking Closed</>
                              )}
                            </Badge>
                          </td>
                          <td>
                            {activity.location ? (
                              <div className="d-flex align-items-center">
                                <FaMapMarkerAlt className="text-danger me-2" />
                                <small>
                                  {activity.location.coordinates[1].toFixed(6)},
                                  <br />
                                  {activity.location.coordinates[0].toFixed(6)}
                                </small>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default AdvertiserActivities;
