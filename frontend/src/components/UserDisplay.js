import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Alert, Container, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const UserDisplay = () => {
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
        `http://localhost:5000/api/seller/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile data:", response.data);
      setProfile(response.data.seller);
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
        `http://localhost:5000/api/seller/profile/${profile.id}`,
        {
          username: profile.username,
          email: profile.email,
          name: profile.name,
          description: profile.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.seller);
      setIsEditing(false);
      setError("");
      alert("Profile updated successfully!");
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
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Username:</strong>
                </Form.Label>
                <div>{profile?.username}</div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Email:</strong>
                </Form.Label>
                <div>{profile?.email}</div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Name:</strong>
                </Form.Label>
                <div>{profile?.name}</div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Description:</strong>
                </Form.Label>
                <div>{profile?.description}</div>
              </Form.Group>

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
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  disabled
                />
              </Form.Group>

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
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={profile.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserDisplay;
