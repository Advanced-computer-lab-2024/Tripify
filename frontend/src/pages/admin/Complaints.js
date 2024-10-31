import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Spinner, Form, Button } from "react-bootstrap";

const API_URL = "http://localhost:5000/api/complaints";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({}); // State to manage replies for each complaint

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(API_URL);
        const sortedComplaints = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setComplaints(sortedComplaints);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleReplyChange = (e, complaintId) => {
    setReply({ ...reply, [complaintId]: e.target.value });
  };

  const handleReplySubmit = async (complaintId) => {
    try {
      const response = await axios.post(`${API_URL}/${complaintId}/reply`, {
        replyText: reply[complaintId],
      });

      // Update the complaint with the new reply in the frontend state
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId ? response.data : complaint
        )
      );

      setReply({ ...reply, [complaintId]: "" });
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const toggleStatus = async (complaintId, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "resolved" : "pending";
      const response = await axios.patch(`${API_URL}/${complaintId}/status`, { status: newStatus });
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, status: response.data.status } : complaint
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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
      <h2>Complaints</h2>
      <Row>
        {complaints.map((complaint) => (
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
                  <strong>Date:</strong> {new Date(complaint.date).toLocaleDateString()}
                </Card.Text>
                <Button
                  variant={complaint.status === "pending" ? "success" : "warning"}
                  onClick={() => toggleStatus(complaint._id, complaint.status)}
                  className="mt-2 mb-3"
                >
                  Mark as {complaint.status === "pending" ? "Resolved" : "Pending"}
                </Button>
                
                {/* Display replies if there are any */}
                {complaint.replies && complaint.replies.length > 0 && (
                  <div className="mt-3">
                    <h6>Replies:</h6>
                    {complaint.replies.map((reply, index) => (
                      <p key={index} className="mb-1">
                        <strong>Date:</strong> {new Date(reply.replyDate).toLocaleDateString()}
                        <br />
                        {reply.replyText}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Show reply form if status is pending */}
                {complaint.status === "pending" && (
                  <>
                    <Form.Group controlId={`reply-${complaint._id}`} className="mt-3">
                      <Form.Control
                        type="text"
                        placeholder="Write a reply..."
                        value={reply[complaint._id] || ""}
                        onChange={(e) => handleReplyChange(e, complaint._id)}
                        className="mb-2"
                      />
                      <Button
                        variant="primary"
                        onClick={() => handleReplySubmit(complaint._id)}
                        disabled={!reply[complaint._id]}
                        className="w-100"
                      >
                        Submit Reply
                      </Button>
                    </Form.Group>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Complaints;
