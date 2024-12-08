import React, { useState, useEffect } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Alert, 
  Spinner 
} from "react-bootstrap";
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaTicketAlt, 
  FaTags,
  FaChevronRight,
  FaLandmark
} from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import GovernorNavbar from './GovernorNavbar';

const GovernorCreatedPlaces = () => {
  const [places, setPlaces] = useState({ places: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [governorInfo, setGovernorInfo] = useState(null);

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

  const getGovernorFromToken = () => {
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

  const fetchGovernorPlaces = async () => {
    try {
      const governor = getGovernorFromToken();
      setGovernorInfo(governor);

      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        "http://localhost:5000/api/toursimGovernor/my-places",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle both possible API response formats
      const placesData = response.data.places || response.data;
      setPlaces({ places: Array.isArray(placesData) ? placesData : [] });
      setError("");
    } catch (error) {
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your historical places');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(`Error fetching historical places: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernorPlaces();
  }, []);

  const renderPlacesTable = () => {
    if (!Array.isArray(places.places)) {
      return (
        <Alert variant="info" className="rounded-3">
          No places data available.
        </Alert>
      );
    }

    if (places.places.length === 0) {
      return (
        <Alert variant="info" className="rounded-3">
          You haven't created any historical places yet.
        </Alert>
      );
    }

    return (
      <div className="table-responsive">
        <Table className="table-hover">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Location</th>
              <th>Ticket Prices</th>
              <th>Opening Hours</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {places.places.map((place) => (
              <tr key={place._id}>
                <td className="fw-bold">{place.name}</td>
                <td>{place.description}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="text-danger me-2" />
                    {place.location}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center mb-2">
                    <FaTicketAlt className="text-success me-2" />
                    <span className="fw-bold">Prices:</span>
                  </div>
                  {Array.isArray(place.ticketPrices) && place.ticketPrices.map((price, index) => (
                    <div key={index} className="mb-1 ms-4">
                      {price.type}: ${price.amount}
                    </div>
                  )) || 'No ticket prices available'}
                </td>
                <td>
                  <div className="d-flex align-items-center mb-2">
                    <FaClock className="text-warning me-2" />
                    <span className="fw-bold">Hours:</span>
                  </div>
                  {Array.isArray(place.openingHours) && place.openingHours.length > 0 ? (
                    place.openingHours.map((hours, index) => (
                      <div key={index} className="mb-1 ms-4">
                        {hours.day}: {hours.open} - {hours.close}
                      </div>
                    ))
                  ) : (
                    <div className="ms-4">No opening hours available</div>
                  )}
                </td>
                <td>
                  <div className="d-flex align-items-center mb-2">
                    <FaTags className="text-info me-2" />
                    <span className="fw-bold">Tags:</span>
                  </div>
                  <div className="ms-4">
                    {Array.isArray(place.tags) && place.tags.map((tag) => (
                      <Badge 
                        bg="info" 
                        className="me-1 mb-1" 
                        key={tag._id}
                        style={{
                          backgroundColor: '#1089ff',
                          fontWeight: 'normal'
                        }}
                      >
                        {tag.name}
                      </Badge>
                    )) || 'No tags'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <>
      <GovernorNavbar />
      <div className="places-page">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/governor" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  My Historical Places <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">My Historical Places</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading your places...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="rounded-3 shadow-sm">
              {error}
            </Alert>
          ) : (
            <Row>
              <Col lg={12}>
                <Card className="shadow-sm border-0 rounded-3">
                  <Card.Body className="p-4">
                    {governorInfo && (
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
                          <FaLandmark size={24} />
                        </div>
                        <h3 className="mb-0">Tourism Governor: {governorInfo.username}</h3>
                      </div>
                    )}

                    {renderPlacesTable()}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default GovernorCreatedPlaces;