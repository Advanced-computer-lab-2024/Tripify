import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const ItineraryComment = ({ itineraryId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchComments();
  }, [itineraryId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/itineraries/${itineraryId}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      if (userRole !== "tourist") {
        throw new Error("Only tourists can add comments");
      }

      await axios.post(
        `http://localhost:5000/api/itineraries/${itineraryId}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewComment("");
      setSuccess("Comment posted successfully!");
      fetchComments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to post comment"
      );
    } finally {
      setLoading(false);
    }
  };

  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="mt-4">
      <h5>Comments</h5>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {isLoggedIn && userRole === "tourist" && (
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Share your experience with this itinerary..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </Form>
      )}

      {!isLoggedIn && (
        <Alert variant="info">
          Please log in as a tourist to add comments.
        </Alert>
      )}

      {comments.length === 0 ? (
        <p className="text-muted">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <Card key={comment._id} className="mb-3">
            <Card.Body>
              <Card.Text>{comment.content}</Card.Text>
              <div className="text-muted small">
                Posted by {comment.tourist?.username || "Anonymous"} on{" "}
                {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default ItineraryComment;
