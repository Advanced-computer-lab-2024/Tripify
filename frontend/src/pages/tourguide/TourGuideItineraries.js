import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Badge,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import {
  FaRoute,
  FaLanguage,
  FaDollarSign,
  FaMapMarkerAlt,
  FaTags,
  FaWheelchair,
  FaDeaf,
  FaEye,
  FaClock,
  FaChevronRight,
  FaUser
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TourguideNavbar from './TourguideNavbar';
function TourGuideItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserItineraries();
  }, []);

  const getUserFromToken = () => {
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

  const fetchUserItineraries = async () => {
    try {
      const user = getUserFromToken();
      setUserInfo(user);

      const token = localStorage.getItem('token');
      
      // Updated endpoint to match the new route
      const response = await axios.get(
        "http://localhost:5000/api/tourguide/my-itineraries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched itineraries:", response.data);
      setItineraries(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your itineraries');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(`Error fetching itineraries: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      </Container>
    );
  }

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

  return (
    <>
     <TourguideNavbar />
      <div className="tour-guide-itineraries">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/guide" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  My Itineraries <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">My Itineraries</h1>
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
                  <FaRoute size={24} />
                </div>
                <div>
                  <h3 className="mb-0">My Itineraries</h3>
                  {userInfo && (
                    <p className="text-muted mb-0">
                      <FaUser className="me-2" />
                      Guide: {userInfo.username}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="danger" className="rounded-3 mb-4">
                  {error}
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading your itineraries...</p>
                </div>
              ) : itineraries.length === 0 ? (
                <div className="text-center py-5">
                  <FaRoute size={48} className="text-muted mb-3" />
                  <h4>No Itineraries Found</h4>
                  <p className="text-muted">You haven't created any itineraries yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Details</th>
                        <th>Locations</th>
                        <th>Tags & Accessibility</th>
                        <th>Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itineraries.map((itinerary) => (
                        <tr key={itinerary._id}>
                          <td>
                            <h5 className="mb-1">{itinerary.name}</h5>
                            <div className="d-flex align-items-center text-muted mb-2">
                              <FaLanguage className="me-2" />
                              {itinerary.language}
                            </div>
                            <div className="d-flex align-items-center text-muted">
                              <FaDollarSign className="me-2" />
                              ${itinerary.totalPrice}
                            </div>
                          </td>
                          
                          <td>
                            <div className="mb-2">
                              <div className="d-flex align-items-center text-muted mb-1">
                                <FaMapMarkerAlt className="text-primary me-2" />
                                <strong>Pickup:</strong>
                              </div>
                              <div className="ms-4">{itinerary.pickupLocation}</div>
                            </div>
                            <div>
                              <div className="d-flex align-items-center text-muted mb-1">
                                <FaMapMarkerAlt className="text-danger me-2" />
                                <strong>Dropoff:</strong>
                              </div>
                              <div className="ms-4">{itinerary.dropoffLocation}</div>
                            </div>
                          </td>

                          <td>
                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <FaTags className="text-primary me-2" />
                                <strong>Tags:</strong>
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {itinerary.preferenceTags.map((tag) => (
                                  <Badge
                                    key={tag._id}
                                    bg="info"
                                    className="rounded-pill"
                                    style={{
                                      backgroundColor: '#1089ff',
                                      fontWeight: 'normal'
                                    }}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="d-flex align-items-center mb-2">
                                <FaWheelchair className="text-primary me-2" />
                                <strong>Accessibility:</strong>
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {itinerary.accessibility.wheelchairAccessible && (
                                  <Badge bg="primary" className="rounded-pill">
                                    <FaWheelchair className="me-1" /> Wheelchair
                                  </Badge>
                                )}
                                {itinerary.accessibility.hearingImpaired && (
                                  <Badge bg="warning" text="dark" className="rounded-pill">
                                    <FaDeaf className="me-1" /> Hearing
                                  </Badge>
                                )}
                                {itinerary.accessibility.visuallyImpaired && (
                                  <Badge bg="danger" className="rounded-pill">
                                    <FaEye className="me-1" /> Visual
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center mb-2">
                              <FaClock className="text-primary me-2" />
                              <strong>Schedule:</strong>
                            </div>
                            <div className="timeline-list">
                              {itinerary.timeline.map((item, index) => (
                                <div key={index} className="mb-2 ps-3 border-start border-primary">
                                  <div className="fw-bold">{item.activity}</div>
                                  <small className="text-muted">
                                    {item.startTime} - {item.endTime}
                                  </small>
                                </div>
                              ))}
                            </div>
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
}

export default TourGuideItineraries;