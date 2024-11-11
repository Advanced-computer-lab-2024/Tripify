// AuthPage.js

import React, { useState } from "react";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ChangePasswordForm from "./ChangePasswordForm";
import RoleSelectorModal from "./RoleSelectorModal";
import TabsNavigation from "./TabsNavigation";
import TourGuideRegistration from "../../components/TourGuideRegistration"; // Import new TourGuideRegistration component

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("tourist");

  // Handle role selection and clear errors
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleModal(false);
    setError("");
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
                  Role: {selectedRole}
                </Button>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Nav
                variant="tabs"
                className="mb-3"
              >
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

              {activeTab === "login" && (
                <LoginForm
                  selectedRole={selectedRole}
                  setLoading={setLoading}
                  setError={setError}
                  setIsAuthenticated={setIsAuthenticated}
                />
              )}

              {activeTab === "register" && selectedRole === "tourguide" && (
                <TourGuideRegistration /> // Use TourGuideRegistration for tour guides
              )}

              {activeTab === "register" && selectedRole !== "tourguide" && (
                <RegisterForm
                  selectedRole={selectedRole}
                  setLoading={setLoading}
                  setError={setError}
                  setIsAuthenticated={setIsAuthenticated}
                />
              )}

              {activeTab === "changePassword" && (
                <ChangePasswordForm
                  setLoading={setLoading}
                  setError={setError}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Selection Modal */}
      <Modal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
      >
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
