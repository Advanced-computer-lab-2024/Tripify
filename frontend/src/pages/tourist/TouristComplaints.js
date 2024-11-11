import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
    <Container className="py-5">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0">My Complaints</h2>
            </Col>
            <Col xs="auto">
              <Badge bg="primary" className="px-3 py-2">
                Total: {complaints.length}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Error</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {complaints.length === 0 && !error ? (
        <Alert variant="info" className="shadow-sm">
          <Alert.Heading>No Complaints Found</Alert.Heading>
          <p className="mb-0">You haven't filed any complaints yet.</p>
        </Alert>
      ) : (
        <Row>
          {complaints.map((complaint) => (
            <Col key={complaint._id} xs={12} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Filed on {new Date(complaint.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </small>
                  <Badge bg={getStatusBadgeVariant(complaint.status)} className="px-3 py-2">
                    {complaint.status || 'Pending'}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title className="h4 mb-3">{complaint.title}</Card.Title>
                  <Card.Text className="text-muted mb-4">
                    {complaint.problem}
                  </Card.Text>
                  {complaint.reply && (
                    <Alert variant="light" className="mb-0">
                      <Alert.Heading className="h6">Official Response:</Alert.Heading>
                      <p className="mb-0">{complaint.reply}</p>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TouristComplaints;