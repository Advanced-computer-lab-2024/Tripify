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
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import "./assets/css/animate.css";
import "./assets/css/bootstrap-datepicker.css"
import "./assets/css/bootstrap.min.css"
import "./assets/css/flaticon.css"
import "./assets/css/jquery.timepicker.css"
import "./assets/css/magnific-popup.css"
import "./assets/css/owl.carousel.min.css"
import "./assets/css/owl.theme.default.min.css"
import "./assets/css/style.css";
import "./assets/css/bootstrap/bootstrap-grid.css"
import "./assets/css/bootstrap/bootstrap-reboot.css"
import Navbar from "./components/Navbar";
// Redeemption Points Component
const RedeemPoints = ({ loyaltyPoints, onRedeem, onUpdate }) => {
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [touristLevel, setTouristLevel] = useState("null");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletionChecking, setIsDeletionChecking] = useState(false);
  const navigate = useNavigate();

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
    if (!user || !token) {
      navigate("/login");
    } else {
      fetchProfile();
      fetchLoyaltyStatus();
    }
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
          email: profile?.email,
          mobileNumber: profile?.mobileNumber,
          nationality: profile?.nationality,
          jobStatus: profile?.jobStatus,
          jobTitle:
            profile?.jobStatus === "job" ? profile?.jobTitle : undefined,
          preferences: profile?.preferences,
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

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setProfile((prev) => {
        const newTripTypes = checked
          ? [...(prev.preferences.tripTypes || []), value]
          : prev.preferences.tripTypes.filter((type) => type !== value);
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            tripTypes: newTripTypes,
          },
        };
      });
    } else {
      setProfile((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: value,
        },
      }));
    }
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
    <div className="">
    <Navbar/>
   
    <Container className="mt-5"
        style={{
          paddingTop: "70px", // Adjust based on your navbar height
        }}>
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
                    <Col>{profile?.wallet} EGP</Col>
                  </Row>

                  {/* Loyalty Information */}
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Loyalty Points:</strong>
                    </Col>
                    <Col>{loyaltyPoints}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Tourist Level:</strong>
                    </Col>
                    <Col>{touristLevel}</Col>
                  </Row>

                  {/* Vacation Preferences */}
                  <h4 className="mt-4">Vacation Preferences</h4>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Budget Limit:</strong>
                    </Col>
                    <Col>{profile?.preferences?.budgetLimit}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Preferred Destinations:</strong>
                    </Col>
                    <Col>{profile?.preferences?.preferredDestinations}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Trip Types:</strong>
                    </Col>
                    <Col>{profile?.preferences?.tripTypes?.join(", ")}</Col>
                  </Row>

                  {/* Loyalty Points Redemption */}
                  <RedeemPoints
                    loyaltyPoints={loyaltyPoints}
                    onRedeem={fetchProfile}
                    onUpdate={handleLoyaltyUpdate}
                  />

                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="mt-3"
                  >
                    Edit Profile
                  </Button>
                  {/* Delete Account Section */}
                  <hr className="my-4" />
                  <div className="text-center">
                    <Button
                      variant="outline-danger"
                      onClick={() => setShowDeleteModal(true)}
                      className="mt-3"
                    >
                      <FaTrash className="me-2" />
                      Delete Account
                    </Button>
                  </div>

                  {/* Delete Account Modal */}
                  <DeleteAccountModal />
                </div>
              ) : (
                // Edit Mode
                <Form onSubmit={handleUpdateProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile?.email || ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="mobileNumber"
                      value={profile?.mobileNumber || ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Control
                      type="text"
                      name="nationality"
                      value={profile?.nationality || ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Job Status</Form.Label>
                    <Form.Select
                      name="jobStatus"
                      value={profile?.jobStatus || ""}
                      onChange={handleInputChange}
                    >
                      <option value="student">Student</option>
                      <option value="job">Employed</option>
                    </Form.Select>
                  </Form.Group>

                  {profile?.jobStatus === "job" && (
                    <Form.Group className="mb-3">
                      <Form.Label>Job Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="jobTitle"
                        value={profile?.jobTitle || ""}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  )}

                  {/* Preferences Section */}
                  <h4 className="mt-4">Vacation Preferences</h4>
                  <Form.Group className="mb-3">
                    <Form.Label>Budget Limit</Form.Label>
                    <Form.Control
                      type="number"
                      name="budgetLimit"
                      value={profile?.preferences?.budgetLimit || ""}
                      onChange={(e) => handlePreferencesChange(e)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Destinations</Form.Label>
                    <Form.Control
                      type="text"
                      name="preferredDestinations"
                      value={profile?.preferences?.preferredDestinations || ""}
                      onChange={(e) => handlePreferencesChange(e)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Trip Types</Form.Label>
                    <div>
                      {["Adventure", "Relaxation", "Cultural", "Nature"].map(
                        (type) => (
                          <Form.Check
                            key={type}
                            type="checkbox"
                            label={type}
                            value={type}
                            checked={profile?.preferences?.tripTypes?.includes(
                              type
                            )}
                            onChange={(e) => handlePreferencesChange(e)}
                          />
                        )
                      )}
                    </div>
                  </Form.Group>

                  <div className="mt-4">
                    <Button type="submit" variant="primary" className="me-2">
                      Save Changes
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
    </div>
  );
};

export default MyProfile;
