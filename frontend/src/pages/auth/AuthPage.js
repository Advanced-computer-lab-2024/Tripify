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

              <TabsNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isAuthenticated={isAuthenticated}
              />

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

      <RoleSelectorModal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        roles={[
          { value: "tourist", label: "Tourist" },
          { value: "admin", label: "Admin" },
          { value: "advertiser", label: "Advertiser" },
          { value: "seller", label: "Seller" },
          { value: "tourguide", label: "Tour Guide" },
          { value: "governor", label: "Tourism Governor" },
        ]}
        selectedRole={selectedRole}
        handleRoleSelect={handleRoleSelect}
      />
    </Container>
  );
};

export default AuthPage;
