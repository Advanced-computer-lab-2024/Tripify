import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";

const API_URL = "http://localhost:5000/api/complaints"; // Adjust the API endpoint as needed

const TouristComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(API_URL);
        // Filter complaints to show only those issued by the logged-in tourist
        const filteredComplaints = response.data.filter(complaint => complaint.issuedBy === "touristId"); // Replace 'touristId' with actual logged-in tourist ID
        const sortedComplaints = filteredComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));
        setComplaints(sortedComplaints);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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
      <h2>My Complaints</h2>
      <Row>
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <Col md={6} lg={4} key={complaint._id} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    {complaint.title}
                    <Badge
                      bg={complaint.status === "resolved" ? "success" : "warning"}
                      className="p-2"
                    >
                      {complaint.status.toUpperCase()}
                    </Badge>
                  </Card.Title>
                  <Card.Text>{complaint.problem}</Card.Text>
                  <Card.Text className="text-muted">
                    <strong>Date Issued:</strong> {new Date(complaint.date).toLocaleDateString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <h5>No complaints issued yet.</h5>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default TouristComplaints;
