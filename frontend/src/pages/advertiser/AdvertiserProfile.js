import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  Row,
  Col
} from 'react-bootstrap';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaChevronRight,
  FaEnvelope,
  FaBuilding,
  FaGlobe,
  FaPhone,
  FaCheck
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import AdvertiserNavbar from './AdvertiserNavbar';

const AdvertiserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");

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
    fetchUserProfile();
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

  const fetchUserProfile = async () => {
    try {
      const user = getUserFromToken();
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/advertiser/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUserDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.message === 'No authentication token found') {
        setError('Please log in to view your profile');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to fetch profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/advertiser/profile/${userDetails.username}`,
        userDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setError(null);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  return (
    <>
      <AdvertiserNavbar />
      <div className="profile-page">
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
                  My Profile <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Company Profile</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading your profile...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="rounded-3 shadow-sm">
              {error}
            </Alert>
          ) : userDetails && (
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
                    <FaUser size={24} />
                  </div>
                  <h3 className="mb-0">{isEditing ? 'Edit Profile' : 'Profile Information'}</h3>
                </div>

                {success && (
                  <Alert variant="success" className="mb-4">
                    <FaCheck className="me-2" />
                    {success}
                  </Alert>
                )}

                <Form>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaUser className="me-2" />
                          Username
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={userDetails.username}
                          readOnly
                          className="rounded-pill"
                          style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid #eee',
                            backgroundColor: '#f8f9fa'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaEnvelope className="me-2" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={userDetails.email}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className="rounded-pill"
                          style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid #eee',
                            backgroundColor: !isEditing ? '#f8f9fa' : 'white'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaBuilding className="me-2" />
                          Company Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="companyName"
                          value={userDetails.companyName}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className="rounded-pill"
                          style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid #eee',
                            backgroundColor: !isEditing ? '#f8f9fa' : 'white'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaGlobe className="me-2" />
                          Website
                        </Form.Label>
                        <Form.Control
                          type="url"
                          name="website"
                          value={userDetails.website}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className="rounded-pill"
                          style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid #eee',
                            backgroundColor: !isEditing ? '#f8f9fa' : 'white'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <FaPhone className="me-2" />
                          Hotline
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="hotline"
                          value={userDetails.hotline}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className="rounded-pill"
                          style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid #eee',
                            backgroundColor: !isEditing ? '#f8f9fa' : 'white'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-3 mt-4">
                    {!isEditing ? (
                      <Button 
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        className="rounded-pill px-4"
                        style={{
                          backgroundColor: '#1089ff',
                          border: 'none'
                        }}
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="light"
                          onClick={() => setIsEditing(false)}
                          className="rounded-pill px-4"
                        >
                          <FaTimes className="me-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleUpdate}
                          className="rounded-pill px-4"
                          style={{
                            backgroundColor: '#1089ff',
                            border: 'none'
                          }}
                        >
                          <FaSave className="me-2" />
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </>
  );
};

export default AdvertiserProfile;