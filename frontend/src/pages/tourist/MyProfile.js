import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  FaUser,
  FaSignOutAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaGift,
  FaExchangeAlt,
  FaChevronRight,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Redeemption Points Component
const RedeemPoints = ({ loyaltyPoints, onRedeem, onUpdate }) => {
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add new function to fetch preference tags

  const handleRedeem = async () => {
    try {
      setError("");
      setSuccess("");

      const points = parseInt(pointsToRedeem);
      if (!points || points < 10000 || points % 10000 !== 0) {
        setError("Points must be at least 10,000 and in multiples of 10,000");
        return;
      }

      if (points > loyaltyPoints) {
        setError("Insufficient points");
        return;
      }

      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = JSON.parse(userStr);

      const response = await axios.post(
        `http://localhost:5000/api/tourist/loyalty/redeem/${user.id}`,
        { pointsToRedeem: points },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          `Successfully redeemed ${points} points for ${
            (points / 10000) * 100
          } EGP`
        );
        setPointsToRedeem("");

        // Update parent components
        if (onRedeem) onRedeem();

        // Fetch updated loyalty status
        await fetchUpdatedStatus(user.id, token);
      }
    } catch (err) {
      console.error("Redemption error:", err);
      setError("Failed to redeem points. Please try again.");
    }
  };

  const fetchUpdatedStatus = async (userId, token) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tourist/loyalty/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && onUpdate) {
        onUpdate(response.data.loyaltyStatus);
      }
    } catch (err) {
      console.error("Error fetching updated status:", err);
    }
  };

  return (
    <div className="mt-4">
      <h4>Redeem Loyalty Points</h4>
      <p className="text-muted">10,000 points = 100 EGP</p>
      <Form.Group className="mb-3">
        <Form.Label>Points to Redeem</Form.Label>
        <Form.Control
          type="number"
          value={pointsToRedeem}
          onChange={(e) => setPointsToRedeem(e.target.value)}
          placeholder="Enter points (minimum 10,000)"
          step="10000"
          min="10000"
        />
      </Form.Group>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Button
        onClick={handleRedeem}
        disabled={!pointsToRedeem || parseInt(pointsToRedeem) < 10000}
        className="me-2"
      >
        Redeem Points
      </Button>
    </div>
  );
};

const MyProfile = () => {
  // Existing states
  const [preferenceTags, setPreferenceTags] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [touristLevel, setTouristLevel] = useState("null");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletionChecking, setIsDeletionChecking] = useState(false);

  // Add these new states
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPreferenceTags = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/preference-tags",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Return the data instead of setting state directly
    } catch (err) {
      console.error("Error fetching preference tags:", err);
      throw new Error("Failed to load preference tags");
    }
  };

  const navigate = useNavigate();
  const handleDeleteAccount = async () => {
    if (confirmText !== profile?.username) {
      setDeleteError(
        "Please enter your username correctly to confirm deletion"
      );
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        throw new Error("User ID not found");
      }

      const checkResponse = await axios.get(
        `http://localhost:5000/api/tourist/check-deletion/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!checkResponse.data.canDelete) {
        setDeleteError(checkResponse.data.message);
        setIsDeleting(false);
        return;
      }

      const deleteResponse = await axios.delete(
        `http://localhost:5000/api/tourist/delete/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (deleteResponse.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError(
        error.response?.data?.message ||
          "Unable to delete account at this time. Please try again later."
      );
    } finally {
      setIsDeleting(false);
    }
  };
  const handleRedeem = async () => {
    try {
      setError("");
      setSuccess("");

      const points = parseInt(pointsToRedeem);
      if (!points || points < 10000 || points % 10000 !== 0) {
        setError("Points must be at least 10,000 and in multiples of 10,000");
        return;
      }

      if (points > loyaltyPoints) {
        setError("Insufficient points");
        return;
      }

      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = JSON.parse(userStr);

      const response = await axios.post(
        `http://localhost:5000/api/tourist/loyalty/redeem/${user.id}`,
        { pointsToRedeem: points },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          `Successfully redeemed ${points} points for ${
            (points / 10000) * 100
          } EGP`
        );
        setPointsToRedeem("");

        fetchProfile();
        fetchLoyaltyStatus();
      }
    } catch (err) {
      console.error("Redemption error:", err);
      setError("Failed to redeem points. Please try again.");
    }
  };

  // Account Deletion Modal
  const DeleteAccountModal = () => {
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
      if (confirmText !== profile?.username) {
        setDeleteError(
          "Please enter your username correctly to confirm deletion"
        );
        return;
      }

      setIsDeleting(true);
      setDeleteError("");

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          throw new Error("User ID not found");
        }

        // First check if deletion is possible
        const checkResponse = await axios.get(
          `http://localhost:5000/api/tourist/check-deletion/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!checkResponse.data.canDelete) {
          setDeleteError(checkResponse.data.message);
          setIsDeleting(false);
          return;
        }

        // If checks pass, proceed with deletion
        const deleteResponse = await axios.delete(
          `http://localhost:5000/api/tourist/delete/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (deleteResponse.data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } catch (error) {
        console.error("Delete account error:", error);
        setDeleteError(
          error.response?.data?.message ||
            "Unable to delete account at this time. Please try again later."
        );
      } finally {
        setIsDeleting(false);
      }
    };
    return (
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Delete Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Warning:</strong> This action cannot be undone. Your account
            will be permanently deleted.
          </Alert>
          <p>Please note that account deletion is only possible if you have:</p>
          <ul>
            <li>No upcoming bookings</li>
            <li>No pending payments</li>
            <li>No active itineraries</li>
          </ul>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>
              Please type <strong>{profile?.username}</strong> to confirm
              deletion
            </Form.Label>
            <Form.Control
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter your username"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmText !== profile?.username}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete My Account
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const fetchLoyaltyStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) return;

      const response = await axios.get(
        `http://localhost:5000/api/tourist/loyalty/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setLoyaltyPoints(response.data.loyaltyStatus.points);
        setTouristLevel(response.data.loyaltyStatus.level);
      }
    } catch (error) {
      console.error("Error fetching loyalty status:", error);
    }
  };
  const handleLoyaltyUpdate = (newStatus) => {
    setLoyaltyPoints(newStatus.points);
    setTouristLevel(newStatus.level);
    fetchProfile(); // Refresh the entire profile to get updated wallet balance
  };

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) {
        navigate("/login");
        return;
      }

      try {
        await fetchProfile();
        await fetchLoyaltyStatus();
        const tags = await fetchPreferenceTags(token);
        setPreferenceTags(tags);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load profile data");
      }
    };

    loadData();

    const storedPoints = JSON.parse(localStorage.getItem("loyaltyPoints"));
    const storedLevel = JSON.parse(localStorage.getItem("touristLevel"));

    if (storedPoints !== null) setLoyaltyPoints(storedPoints);
    if (storedLevel !== null) setTouristLevel(storedLevel);
  }, []);
  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tourist/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.tourist);
      // Convert preferences to array of IDs if they exist
      const preferences = response.data.tourist.preferences || [];
      const preferenceIds = preferences.map((pref) =>
        typeof pref === "object" ? pref._id : pref
      );
      setSelectedPreferences(preferenceIds);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
      setLoading(false);
    }
  };

  // Add handler for preference changes
  const handlePreferenceChange = (preferenceId) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(preferenceId)) {
        return prev.filter((id) => id !== preferenceId);
      } else {
        return [...prev, preferenceId];
      }
    });
  };

  // Update handleUpdateProfile to include preferences
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/tourist/profile/${user.username}`,
        {
          email: profile?.email,
          mobileNumber: profile?.mobileNumber,
          nationality: profile?.nationality,
          jobStatus: profile?.jobStatus,
          jobTitle:
            profile?.jobStatus === "job" ? profile?.jobTitle : undefined,
          preferences: selectedPreferences, // This will send the array of preference IDs
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

  if (!profile) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          {error || "Profile not found."}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "8rem 0 4rem 0",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        ></div>
        <Container style={{ position: "relative", zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Link to="/tourist" className="text-white text-decoration-none">
                  Home <FaChevronRight className="small mx-2" />
                </Link>
              </span>
              <span>
                My Profile <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">My Profile</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading your profile...</p>
          </div>
        ) : !profile ? (
          <Alert variant="danger" className="text-center">
            {error || "Profile not found."}
          </Alert>
        ) : (
          <Row className="justify-content-center">
            <Col lg={8}>
              {/* Profile Card */}
              <Card
                className="shadow-sm mb-4"
                style={{
                  borderRadius: "15px",
                  border: "none",
                }}
              >
                <Card.Body className="p-4">
                  {/* Header with Logout Button */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                      <FaUser className="text-primary me-3" size={24} />
                      <h3 className="mb-0">Profile Information</h3>
                    </div>
                    <Button
                      variant="danger"
                      onClick={handleLogout}
                      className="rounded-pill px-4"
                    >
                      <FaSignOutAlt className="me-2" />
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
                      <Row className="gy-4">
                        <Col md={6}>
                          <div className="p-4 bg-light rounded-3">
                            <h5 className="mb-3 text-primary">
                              Basic Information
                            </h5>
                            <div className="mb-3">
                              <strong>Username:</strong>
                              <p className="mb-0">{profile?.username}</p>
                            </div>
                            <div className="mb-3">
                              <strong>Email:</strong>
                              <p className="mb-0">{profile?.email}</p>
                            </div>
                            <div className="mb-3">
                              <strong>Mobile Number:</strong>
                              <p className="mb-0">{profile?.mobileNumber}</p>
                            </div>
                            <div className="mb-3">
                              <strong>Nationality:</strong>
                              <p className="mb-0">{profile?.nationality}</p>
                            </div>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="p-4 bg-light rounded-3">
                            <h5 className="mb-3 text-primary">
                              Financial Information
                            </h5>
                            <div className="mb-3">
                              <strong>Wallet Balance:</strong>
                              <p className="mb-0">{profile?.wallet} EGP</p>
                            </div>
                            <div className="mb-3">
                              <strong>Loyalty Points:</strong>
                              <p className="mb-0">{loyaltyPoints}</p>
                            </div>
                            <div className="mb-3">
                              <strong>Tourist Level:</strong>
                              <p className="mb-0">Level {touristLevel}</p>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Selected Preferences Display */}
                      {selectedPreferences.length > 0 && (
                        <div className="mt-4 p-4 bg-light rounded-3">
                          <h5 className="mb-3 text-primary">
                            Travel Preferences
                          </h5>
                          <div className="d-flex flex-wrap gap-2">
                            {preferenceTags
                              .filter((tag) =>
                                selectedPreferences.includes(tag._id)
                              )
                              .map((tag) => (
                                <span
                                  key={tag._id}
                                  className="badge bg-primary rounded-pill px-3 py-2"
                                >
                                  {tag.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 d-flex gap-3">
                        <Button
                          variant="primary"
                          onClick={() => setIsEditing(true)}
                          className="rounded-pill px-4"
                        >
                          <FaEdit className="me-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => setShowDeleteModal(true)}
                          className="rounded-pill px-4"
                        >
                          <FaTrash className="me-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode Form - Updated with styled form controls
                    <Form onSubmit={handleUpdateProfile}>
                      {/* Form fields with improved styling */}
                      <Row className="gy-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={profile?.email || ""}
                              onChange={handleInputChange}
                              className="rounded-pill"
                              style={{
                                padding: "0.75rem 1.25rem",
                                border: "2px solid #eee",
                              }}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">
                              Mobile Number
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="mobileNumber"
                              value={profile?.mobileNumber || ""}
                              onChange={handleInputChange}
                              className="rounded-pill"
                              style={{
                                padding: "0.75rem 1.25rem",
                                border: "2px solid #eee",
                              }}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">
                              Nationality
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="nationality"
                              value={profile?.nationality || ""}
                              onChange={handleInputChange}
                              className="rounded-pill"
                              style={{
                                padding: "0.75rem 1.25rem",
                                border: "2px solid #eee",
                              }}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">
                              Job Status
                            </Form.Label>
                            <Form.Select
                              name="jobStatus"
                              value={profile?.jobStatus || ""}
                              onChange={handleInputChange}
                              className="rounded-pill"
                              style={{
                                padding: "0.75rem 1.25rem",
                                border: "2px solid #eee",
                              }}
                            >
                              <option value="student">Student</option>
                              <option value="job">Employed</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        {profile?.jobStatus === "job" && (
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="fw-bold">
                                Job Title
                              </Form.Label>
                              <Form.Control
                                type="text"
                                name="jobTitle"
                                value={profile?.jobTitle || ""}
                                onChange={handleInputChange}
                                className="rounded-pill"
                                style={{
                                  padding: "0.75rem 1.25rem",
                                  border: "2px solid #eee",
                                }}
                              />
                            </Form.Group>
                          </Col>
                        )}
                      </Row>

                      {/* Preferences Section */}
                      {/* Add this new Preferences Section in edit mode */}
                      <div className="mt-5">
                        <h5 className="mb-4 text-primary">
                          Travel Preferences
                        </h5>
                        <Row className="gy-4">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label className="fw-bold">
                                Select Your Travel Preferences
                              </Form.Label>
                              <div className="d-flex flex-wrap gap-3">
                                {preferenceTags.map((tag) => (
                                  <Form.Check
                                    key={tag._id}
                                    type="checkbox"
                                    label={tag.name}
                                    checked={selectedPreferences.includes(
                                      tag._id
                                    )}
                                    onChange={() =>
                                      handlePreferenceChange(tag._id)
                                    }
                                    className="user-select-none"
                                  />
                                ))}
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>

                      {/* Form Action Buttons */}
                      <div className="mt-5 d-flex gap-3">
                        <Button
                          type="submit"
                          variant="primary"
                          className="rounded-pill px-4"
                          style={{
                            backgroundColor: "#1089ff",
                            border: "none",
                          }}
                        >
                          <FaSave className="me-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="light"
                          onClick={() => setIsEditing(false)}
                          className="rounded-pill px-4"
                        >
                          <FaTimes className="me-2" />
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}

                  {/* Points Redemption Section */}
                  <div className="mt-5 p-4 bg-light rounded-3">
                    <RedeemPoints
                      loyaltyPoints={loyaltyPoints}
                      onRedeem={fetchProfile}
                      onUpdate={handleLoyaltyUpdate}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Delete Account Modal - styled version */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header
            closeButton
            className="bg-danger text-white"
            style={{
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Modal.Title>
              <FaExclamationTriangle className="me-2" />
              Delete Account
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Alert variant="warning">
              <strong>Warning:</strong> This action cannot be undone. Your
              account will be permanently deleted.
            </Alert>
            <p>
              Please note that account deletion is only possible if you have:
            </p>
            <ul>
              <li>No upcoming bookings</li>
              <li>No pending payments</li>
              <li>No active itineraries</li>
            </ul>
            {deleteError && <Alert variant="danger">{deleteError}</Alert>}
            <Form.Group>
              <Form.Label className="fw-bold">
                Please type <strong>{profile?.username}</strong> to confirm
                deletion
              </Form.Label>
              <Form.Control
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Enter your username"
                className="rounded-pill mt-2"
                style={{
                  padding: "0.75rem 1.25rem",
                  border: "2px solid #eee",
                }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-pill px-4"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== profile?.username}
              className="rounded-pill px-4"
            >
              {isDeleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Delete Account
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* RedeemPoints Component - Styled version */}
        <Card
          className="shadow-sm mb-4"
          style={{
            borderRadius: "15px",
            border: "none",
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaGift className="text-primary me-3" size={24} />
              <h3 className="mb-0">Redeem Points</h3>
            </div>
            <p className="text-muted mb-4">
              Convert your loyalty points to wallet balance - 10,000 points =
              100 EGP
            </p>

            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Points to Redeem</Form.Label>
                <Form.Control
                  type="number"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  placeholder="Enter points (minimum 10,000)"
                  step="10000"
                  min="10000"
                  className="rounded-pill"
                  style={{
                    padding: "0.75rem 1.25rem",
                    border: "2px solid #eee",
                  }}
                />
                <Form.Text className="text-muted">
                  Available points: {loyaltyPoints}
                </Form.Text>
              </Form.Group>

              {error && (
                <Alert variant="danger" className="mb-3 rounded-3">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-3 rounded-3">
                  {success}
                </Alert>
              )}

              <Button
                onClick={handleRedeem}
                disabled={!pointsToRedeem || parseInt(pointsToRedeem) < 10000}
                className="rounded-pill px-4"
                style={{
                  backgroundColor: "#1089ff",
                  border: "none",
                }}
              >
                <FaExchangeAlt className="me-2" />
                Redeem Points
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MyProfile;
