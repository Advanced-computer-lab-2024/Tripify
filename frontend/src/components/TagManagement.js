import React, { useState, useEffect } from "react";
import axios from "axios";
import GovernorNavbar from '../pages/tourismGovernor/GovernorNavbar';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  ListGroup, 
  Spinner,
  Badge,
  Row,
  Col
} from "react-bootstrap";
import { 
  FaTags, 
  FaPlus, 
  FaTrash, 
  FaChevronRight,
  FaHistory
} from "react-icons/fa";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/tags";

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagPeriod, setNewTagPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTags(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError("Failed to fetch tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (newTagName.trim() && newTagPeriod.trim()) {
      try {
        const response = await axios.post(API_URL, {
          name: newTagName.trim(),
          historicalPeriod: newTagPeriod.trim(),
        });
        setTags([...tags, response.data]);
        setNewTagName("");
        setNewTagPeriod("");
        setSuccess("Tag added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error adding tag:", error);
        setError("Failed to add tag. Please try again.");
      }
    }
  };

  const handleDeleteTag = async (id) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTags(tags.filter((t) => t._id !== id));
        setSuccess("Tag deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting tag:", error);
        setError("Failed to delete tag. Please try again.");
      }
    }
  };

  return (
    <>
     <GovernorNavbar />
    <div className="tag-management">
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Link to="/governor" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </Link>
              </span>
              <span>
                Historical Tags <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Historical Tag Management</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
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
                <FaTags size={24} />
              </div>
              <h3 className="mb-0">Manage Historical Tags</h3>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-4">
                {success}
              </Alert>
            )}

            {/* Add Tag Form */}
            <Form onSubmit={handleAddTag} className="mb-4">
              <Row className="g-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Tag Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Historical Period</Form.Label>
                    <Form.Control
                      type="text"
                      value={newTagPeriod}
                      onChange={(e) => setNewTagPeriod(e.target.value)}
                      placeholder="Enter historical period"
                      className="rounded-pill"
                      style={{
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #eee'
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Label className="invisible">Add Button</Form.Label>
                  <Button 
                    type="submit"
                    className="w-100 rounded-pill"
                    style={{
                      backgroundColor: '#1089ff',
                      border: 'none',
                      padding: '0.75rem'
                    }}
                  >
                    <FaPlus className="me-2" />
                    Add Tag
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* Tags List */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading tags...</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {tags.map((tag) => (
                  <ListGroup.Item 
                    key={tag._id}
                    className="py-3"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge 
                          bg="info" 
                          className="me-2"
                          style={{
                            backgroundColor: '#1089ff',
                            fontSize: '1rem',
                            fontWeight: 'normal',
                            padding: '0.5rem 1rem'
                          }}
                        >
                          {tag.name}
                        </Badge>
                        <span className="text-muted d-inline-flex align-items-center">
                          <FaHistory className="me-2" />
                          {tag.historicalPeriod}
                        </span>
                      </div>
                      <Button
                        variant="danger"
                        className="rounded-pill"
                        onClick={() => handleDeleteTag(tag._id)}
                      >
                        <FaTrash className="me-2" />
                        Delete
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
    </>
  );
};

export default TagManagement;