import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import RoleSpecificFields from "./RoleSpecificFields";

const RegisterForm = ({
  selectedRole,
  setLoading,
  setError,
  setIsAuthenticated,
}) => {
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

  const handlePhoto = (e) => {
    const { name, files } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
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
      // Create FormData object
      const formData = new FormData();

      // Append all regular fields
      Object.keys(registerData).forEach((key) => {
        // Skip null or undefined values
        if (registerData[key] != null) {
          // Check if the value is a File object
          if (registerData[key] instanceof File) {
            formData.append(key, registerData[key]);
          } else {
            formData.append(key, registerData[key].toString());
          }
        }
      });

      const response = await axios.post(
        `http://localhost:5000/api/${selectedRole}/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data[selectedRole])
        );
        localStorage.setItem("userRole", selectedRole);
        setIsAuthenticated(true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed.";
      setError(errorMsg);
      setLocalError(errorMsg);
      console.error("Registration error:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleRegister}
      encType="multipart/form-data"
    >
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

      <RoleSpecificFields
        registerData={registerData}
        handleRegisterChange={handleRegisterChange}
        selectedRole={selectedRole}
        handlePhoto={handlePhoto}
      />

      <Button
        variant="primary"
        type="submit"
        className="w-100"
        disabled={localLoading}
      >
        {localLoading ? (
          <Spinner
            animation="border"
            size="sm"
          />
        ) : (
          "Register"
        )}
      </Button>
    </Form>
  );
};

export default RegisterForm;
