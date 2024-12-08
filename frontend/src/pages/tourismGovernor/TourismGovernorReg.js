import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPlus, 
  FaCheck, 
  FaChevronRight,
  FaUserTie
} from "react-icons/fa";
import GovernorNavbar from './GovernorNavbar';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tourismGovernor/register",
        formData
      );
      setMessage({ type: "success", text: "Governor registered successfully!" });
      setTimeout(() => {
        navigate("/governor");
      }, 1500);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "An error occurred during registration"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
     <GovernorNavbar />
      <div className="register-page">
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/admin" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  Register Governor <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Register New Governor</h1>
            </div>
          </Container>
        </div>

        {/* Registration Form */}
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card 
                className="shadow-sm border-0" 
                style={{ borderRadius: '15px' }}
              >
                <Card.Body className="p-4">
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
                      <FaUserTie size={24} />
                    </div>
                    <h3 className="mb-0">Register New Tourism Governor</h3>
                  </div>

                  {message && (
                    <Alert 
                      variant={message.type} 
                      className="mb-4 rounded-3"
                    >
                      <div className="d-flex align-items-center">
                        {message.type === "success" ? (
                          <FaCheck className="me-2" />
                        ) : (
                          <FaLock className="me-2" />
                        )}
                        {message.text}
                      </div>
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaUser className="me-2" />
                        Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                        placeholder="Enter username"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                        placeholder="Enter email address"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaLock className="me-2" />
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                        placeholder="Enter password"
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      className="w-100 rounded-pill"
                      style={{
                        backgroundColor: '#1089ff',
                        border: 'none',
                        padding: '0.75rem'
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Registering Governor...
                        </>
                      ) : (
                        <>
                          <FaPlus className="me-2" />
                          Register Governor
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default RegisterPage;