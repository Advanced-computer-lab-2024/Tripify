import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Form,
  Button,
  Modal,
} from "react-bootstrap";

const API_URL = "http://localhost:5000/api/complaints";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(API_URL);
        const sortedComplaints = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
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

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId ? response.data : complaint
        )
      );

      setReply({ ...reply, [complaintId]: "" });

      // Update selectedComplaint if the modal is open for the complaint being replied to
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint(response.data);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const toggleStatus = async (complaintId, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "resolved" : "pending";
      const response = await axios.patch(`${API_URL}/${complaintId}/status`, {
        status: newStatus,
      });
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, status: response.data.status }
            : complaint
        )
      );

      // Update selectedComplaint if the modal is open for the complaint being updated
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint({
          ...selectedComplaint,
          status: response.data.status,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCardClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
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
            <Card
              className="shadow-sm h-100"
              onClick={() => handleCardClick(complaint)}
              style={{ cursor: "pointer" }}
            >
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
                  <strong>Date:</strong>{" "}
                  {new Date(complaint.date).toLocaleDateString()}
                </Card.Text>
                <Button
                  variant={
                    complaint.status === "pending" ? "success" : "warning"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(complaint._id, complaint.status);
                  }}
                  className="mt-2 mb-3"
                >
                  Mark as{" "}
                  {complaint.status === "pending" ? "Resolved" : "Pending"}
                </Button>

                {/* Display reply form if status is pending */}
                {complaint.status === "pending" && (
                  <>
                    <Form.Group
                      controlId={`reply-${complaint._id}`}
                      className="mt-3"
                    >
                      <Form.Control
                        type="text"
                        placeholder="Write a reply..."
                        value={reply[complaint._id] || ""}
                        onChange={(e) => handleReplyChange(e, complaint._id)}
                        className="mb-2"
                      />
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplySubmit(complaint._id);
                        }}
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

      {/* Complaint Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        {selectedComplaint && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedComplaint.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <strong>Complainant Name:</strong>{" "}
                {selectedComplaint.name || "Not provided"}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {selectedComplaint.phone || "Not provided"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedComplaint.date
                  ? new Date(selectedComplaint.date).toLocaleDateString()
                  : "Not provided"}
              </p>
              <p>
                <strong>Problem:</strong>{" "}
                {selectedComplaint.problem || "No description provided"}
              </p>
              {selectedComplaint.replies &&
              selectedComplaint.replies.length > 0 ? (
                <>
                  <h6>Replies:</h6>
                  {selectedComplaint.replies.map((reply, index) => (
                    <p key={index} className="mb-1">
                      <strong>Date:</strong>{" "}
                      {reply.replyDate
                        ? new Date(reply.replyDate).toLocaleDateString()
                        : "Not provided"}
                      <br />
                      {reply.replyText}
                    </p>
                  ))}
                </>
              ) : (
                <p>No replies yet.</p>
              )}

              {/* Reply Form in Modal if Status is Pending */}
              {selectedComplaint.status === "pending" && (
                <Form.Group
                  controlId={`reply-modal-${selectedComplaint._id}`}
                  className="mt-3"
                >
                  <Form.Control
                    type="text"
                    placeholder="Write a reply..."
                    value={reply[selectedComplaint._id] || ""}
                    onChange={(e) =>
                      handleReplyChange(e, selectedComplaint._id)
                    }
                    className="mb-2"
                  />
                  <Button
                    variant="primary"
                    onClick={() => handleReplySubmit(selectedComplaint._id)}
                    disabled={!reply[selectedComplaint._id]}
                    className="w-100"
                  >
                    Submit Reply
                  </Button>
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Complaints;
