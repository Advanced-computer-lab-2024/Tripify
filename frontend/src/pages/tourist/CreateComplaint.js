import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { FaChevronRight, FaExclamationCircle, FaPencilAlt, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar";


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

      const decodedToken = jwtDecode(token);
      const createdBy = decodedToken._id;

      const response = await axios.post(
        "http://localhost:5000/api/complaints",
        {
          title,
          problem,
          date: new Date(),
          createdBy
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
                File a Complaint <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Submit Your Complaint</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Info Card */}
        <Card 
          className="shadow-sm mb-5" 
          style={{ 
            borderRadius: '15px', 
            border: 'none',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center text-primary">
              <FaClipboardList className="me-3" style={{ fontSize: '2rem' }} />
              <div>
                <h5 className="mb-1">Need Assistance?</h5>
                <p className="mb-0 text-muted">We're here to help. Please provide detailed information about your concern.</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Complaint Form */}
        <Card 
          className="shadow-sm" 
          style={{ 
            borderRadius: '15px', 
            border: 'none' 
          }}
        >
          <Card.Body className="p-4">
            {error && (
              <Alert 
                variant="danger" 
                className="mb-4"
                style={{ borderRadius: '10px' }}
              >
                <div className="d-flex align-items-center">
                  <FaExclamationCircle className="me-2" />
                  {error}
                </div>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="title" className="mb-4">
                <Form.Label className="fw-bold">Complaint Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter a brief title for your complaint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                  className="form-control-lg"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #eee',
                    padding: '0.8rem 1.2rem'
                  }}
                />
              </Form.Group>

              <Form.Group controlId="problem" className="mb-4">
                <Form.Label className="fw-bold">Problem Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="Please provide detailed information about your issue..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                  minLength={10}
                  maxLength={1000}
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #eee',
                    padding: '1rem'
                  }}
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary"
                  type="submit"
                  size="lg"
                  style={{
                    borderRadius: '10px',
                    padding: '1rem',
                    backgroundColor: '#1089ff',
                    border: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  className="shadow-sm hover-lift"
                >
                  <FaPencilAlt className="me-2" />
                  Submit Complaint
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default CreateComplaint;