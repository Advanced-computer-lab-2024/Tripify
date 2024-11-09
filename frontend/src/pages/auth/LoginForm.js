// LoginForm.js

import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = ({ selectedRole, setLoading, setError, setIsAuthenticated }) => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [localLoading, setLocalLoading] = useState(false); // Local loading state
  const [localError, setLocalError] = useState(""); // Local error state
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError("");
    setLocalError("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/${selectedRole}/login`,
        loginData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data[selectedRole]));
        localStorage.setItem("userRole", selectedRole);
        setIsAuthenticated(true);
        navigate(`/${selectedRole}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed.";
      setError(errorMsg); // Pass error to parent if necessary
      setLocalError(errorMsg); // Show error locally
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      {localError && <Alert variant="danger">{localError}</Alert>}
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

      <Button variant="primary" type="submit" className="w-100" disabled={localLoading}>
        {localLoading ? <Spinner animation="border" size="sm" /> : "Login"}
      </Button>
    </Form>
  );
};

export default LoginForm;
