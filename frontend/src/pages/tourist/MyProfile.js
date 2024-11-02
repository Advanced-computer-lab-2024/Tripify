import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/tourist/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile data:", response.data);
      setProfile(response.data.tourist);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/tourist/profile/${user.username}`,
        {
          email: profile.email,
          mobileNumber: profile.mobileNumber,
          nationality: profile.nationality,
          jobStatus: profile.jobStatus,
          jobTitle: profile.jobStatus === "job" ? profile.jobTitle : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.tourist);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">My Profile</h2>
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {!isEditing ? (
                // View Mode
                <div>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Username:</strong>
                    </Col>
                    <Col>{profile?.username}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Email:</strong>
                    </Col>
                    <Col>{profile?.email}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Mobile Number:</strong>
                    </Col>
                    <Col>{profile?.mobileNumber}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Nationality:</strong>
                    </Col>
                    <Col>{profile?.nationality}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Job Status:</strong>
                    </Col>
                    <Col>{profile?.jobStatus}</Col>
                  </Row>
                  {profile?.jobStatus === "job" && (
                    <Row className="mb-3">
                      <Col sm={4}>
                        <strong>Job Title:</strong>
                      </Col>
                      <Col>{profile?.jobTitle}</Col>
                    </Row>
                  )}
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Wallet Balance:</strong>
                    </Col>
                    <Col>{profile?.Wallet}</Col>
                  </Row>

                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="mt-3"
                  >
                    Edit Profile
                  </Button>
                </div>
              ) : (
                // Edit Mode
                <Form onSubmit={handleUpdateProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="mobileNumber"
                      value={profile.mobileNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Control
                      type="text"
                      name="nationality"
                      value={profile.nationality}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Job Status</Form.Label>
                    <Form.Select
                      name="jobStatus"
                      value={profile.jobStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="job">Employed</option>
                    </Form.Select>
                  </Form.Group>

                  {profile.jobStatus === "job" && (
                    <Form.Group className="mb-3">
                      <Form.Label>Job Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="jobTitle"
                        value={profile.jobTitle || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  )}

                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyProfile;
