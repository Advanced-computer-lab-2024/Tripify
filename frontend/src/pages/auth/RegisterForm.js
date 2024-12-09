// RegisterForm.js

import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import RoleSpecificFields from "./RoleSpecificFields";

const RegisterForm = ({ selectedRole, setLoading, setError, setIsAuthenticated }) => {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    setLocalLoading(true);
    setError("");
    setLocalError("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/${selectedRole}/register`,
        registerData
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data[selectedRole]));
        localStorage.setItem("userRole", selectedRole);
        setIsAuthenticated(true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed.";
      setError(errorMsg);
      setLocalError(errorMsg);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Form onSubmit={handleRegister}>
      {localError && <Alert variant="danger">{localError}</Alert>}
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

      {/* Role-specific fields */}
      <RoleSpecificFields
        registerData={registerData}
        handleRegisterChange={handleRegisterChange}
        selectedRole={selectedRole}
      />

      <Button variant="primary" type="submit" className="w-100" disabled={localLoading}>
        {localLoading ? <Spinner animation="border" size="sm" /> : "Register"}
      </Button>
    </Form>
  );
};

export default RegisterForm;
