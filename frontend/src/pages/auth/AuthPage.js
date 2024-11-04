import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Nav,
  Modal,
  Spinner,
} from "react-bootstrap";
import axios from "axios";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("tourist");
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Tourist fields
    mobileNumber: "",
    nationality: "",
    dob: "",
    jobStatus: "student",
    jobTitle: "",
    // Advertiser fields
    companyName: "",
    companyDescription: "",
    website: "",
    hotline: "",
    // Tour guide fields
    yearsOfExperience: "",
  });

  const roles = [
    { value: "tourist", label: "Tourist", endpoint: "tourist" },
    { value: "admin", label: "Admin", endpoint: "admin" },
    { value: "advertiser", label: "Advertiser", endpoint: "advertiser" },
    { value: "seller", label: "Seller", endpoint: "seller" },
    { value: "tourguide", label: "Tour Guide", endpoint: "tourguide" },
    {
      value: "governor",
      label: "Tourism Governor",
      endpoint: "tourismGovernor",
    },
  ];

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleModal(false);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const role = roles.find((r) => r.value === selectedRole);
      const response = await axios.post(
        `http://localhost:5000/api/${role.endpoint}/login`,
        loginData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data[role.value] || response.data.tourist)
        );
        localStorage.setItem("userRole", role.value);
        navigate(`/${role.value}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const role = roles.find((r) => r.value === selectedRole);
      const registrationData = { ...registerData };
      delete registrationData.confirmPassword;

      // Add validation for tourist registration
      if (selectedRole === "tourist" && registerData.dob) {
        const today = new Date();
        const birthDate = new Date(registerData.dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          throw new Error("You must be 18 or older to register");
        }
      }

      const response = await axios.post(
        `http://localhost:5000/api/${role.endpoint}/register`,
        registrationData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data[role.value]));
        localStorage.setItem("userRole", role.value);
        navigate(`/${role.value}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case "tourist":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobileNumber"
                value={registerData.mobileNumber}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nationality</Form.Label>
              <Form.Control
                type="text"
                name="nationality"
                value={registerData.nationality}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={registerData.dob}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Status</Form.Label>
              <Form.Select
                name="jobStatus"
                value={registerData.jobStatus}
                onChange={handleRegisterChange}
                required
              >
                <option value="student">Student</option>
                <option value="job">Employed</option>
              </Form.Select>
            </Form.Group>
            {registerData.jobStatus === "job" && (
              <Form.Group className="mb-3">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                  type="text"
                  name="jobTitle"
                  value={registerData.jobTitle}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
            )}
          </>
        );

      case "advertiser":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={registerData.companyName}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Company Description</Form.Label>
              <Form.Control
                as="textarea"
                name="companyDescription"
                value={registerData.companyDescription}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={registerData.website}
                onChange={handleRegisterChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hotline</Form.Label>
              <Form.Control
                type="text"
                name="hotline"
                value={registerData.hotline}
                onChange={handleRegisterChange}
              />
            </Form.Group>
          </>
        );

      case "tourguide":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobileNumber"
                value={registerData.mobileNumber}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Years of Experience</Form.Label>
              <Form.Control
                type="number"
                name="yearsOfExperience"
                value={registerData.yearsOfExperience}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Welcome</h2>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowRoleModal(true)}
                >
                  Role: {roles.find((r) => r.value === selectedRole)?.label}
                </Button>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link
                    onClick={() => setActiveTab("login")}
                    active={activeTab === "login"}
                  >
                    Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    onClick={() => setActiveTab("register")}
                    active={activeTab === "register"}
                  >
                    Register
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === "login" ? (
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username or Email</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  {renderRoleSpecificFields()}

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Selection Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            {roles.map((role) => (
              <Button
                key={role.value}
                variant={
                  selectedRole === role.value ? "primary" : "outline-primary"
                }
                onClick={() => handleRoleSelect(role.value)}
                className="text-start"
              >
                {role.label}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AuthPage;
