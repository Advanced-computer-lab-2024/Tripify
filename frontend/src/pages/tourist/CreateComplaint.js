import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed and imported correctly

const CreateComplaint = () => {
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      // Decode the token to get user information
      const decodedToken = jwtDecode(token);
      const createdBy = decodedToken._id; 

      const response = await axios.post(
        "http://localhost:5000/api/complaints",
        {
          title,
          problem,
          date: new Date(),
          createdBy // Include the creator's ID in the payload
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        alert("Complaint filed successfully!");
        navigate("/tourist");
      }
    } catch (error) {
      console.error("Error filing complaint:", error);
      setError(
        error.response?.data?.message || 
        "There was an error filing your complaint. Please try again."
      );
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">File a Complaint</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="title" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter complaint title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={100}
              />
            </Form.Group>
            <Form.Group controlId="problem" className="mb-3">
              <Form.Label>Problem Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describe the issue"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                required
                minLength={10}
                maxLength={1000}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit Complaint
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateComplaint;
