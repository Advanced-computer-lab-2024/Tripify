import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { FaExclamationCircle, FaChevronRight, FaRegClock, FaReply, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Navbar from "./components/Navbar";


const TouristComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your complaints');
          setLoading(false);
          return;
        }
        const decodedToken = jwtDecode(token);
        const userId = decodedToken._id;
        const response = await axios.get(
          `http://localhost:5000/api/complaints/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setComplaints(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setError(
          error.response?.data?.message ||
          'Failed to fetch complaints. Please try again later.'
        );
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <p className="text-muted">Loading your complaints...</p>
        </div>
      </Container>
    );
  }

  return (
    
     <>
     <Navbar/>
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '8rem 0 4rem 0',
          marginBottom: '2rem'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        ></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <a href="/tourist" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </a>
              </span>
              <span>
                My Complaints <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">My Complaints History</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Stats Card */}
        <Card className="shadow-sm mb-5" style={{ borderRadius: '15px', border: 'none' }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <FaClipboardList className="text-primary me-3" style={{ fontSize: '2rem' }} />
                  <div>
                    <h2 className="mb-0">Total Complaints: {complaints.length}</h2>
                    <p className="text-muted mb-0">Track your submitted complaints</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger" className="shadow-sm" style={{ borderRadius: '15px' }}>
            <Alert.Heading>Error</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        {complaints.length === 0 && !error ? (
          <Alert 
            variant="info" 
            className="shadow-sm text-center p-5"
            style={{ borderRadius: '15px' }}
          >
            <FaExclamationCircle size={40} className="text-info mb-3" />
            <Alert.Heading>No Complaints Found</Alert.Heading>
            <p className="mb-0">You haven't filed any complaints yet.</p>
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {complaints.map((complaint) => (
              <Col key={complaint._id}>
                <Card 
                  className="h-100 shadow-hover"
                  style={{
                    borderRadius: '15px',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div 
                    className="card-img-top"
                    style={{
                      height: '120px',
                      backgroundImage: 'url("/images/bg_2.jpg")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px',
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px'
                      }}
                    />
                    <div 
                      className="p-3" 
                      style={{ 
                        position: 'relative',
                        zIndex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Badge 
                        bg={getStatusBadgeVariant(complaint.status)}
                        style={{
                          padding: '8px 15px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          alignSelf: 'flex-start'
                        }}
                      >
                        {complaint.status || 'Pending'}
                      </Badge>
                      <div className="text-white">
                        <small>
                          <FaRegClock className="me-2" />
                          {new Date(complaint.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <Card.Body className="p-4">
                    <Card.Title className="h5 mb-3">{complaint.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {complaint.problem}
                    </Card.Text>
                    
                    {complaint.reply && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center mb-2">
                          <FaReply className="text-primary me-2" />
                          <small className="fw-bold">Official Response:</small>
                        </div>
                        <p className="mb-0 small">{complaint.reply}</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default TouristComplaints;