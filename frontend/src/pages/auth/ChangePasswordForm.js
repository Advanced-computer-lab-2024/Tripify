// ChangePasswordForm.js

import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const ChangePasswordForm = ({ setLoading, setError }) => {
  const [changePasswordData, setChangePasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState("");

  const handleChangePasswordChange = (e) => {
    setChangePasswordData({
      ...changePasswordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError("");

    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setLocalError("New passwords do not match");
      setLocalLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      await axios.put(
        `http://localhost:5000/api/${role}/profile/change-password`,
        {
          oldPassword: changePasswordData.oldPassword,
          newPassword: changePasswordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Password changed successfully!");
      setLocalLoading(false);
    } catch (err) {
      setLocalError(err.response?.data?.message || "Password change failed.");
      setLocalLoading(false);
    }
  };

  return (
    <Form onSubmit={handleChangePassword}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Old Password</Form.Label>
        <Form.Control
          type="password"
          name="oldPassword"
          value={changePasswordData.oldPassword}
          onChange={handleChangePasswordChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          name="newPassword"
          value={changePasswordData.newPassword}
          onChange={handleChangePasswordChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          name="confirmNewPassword"
          value={changePasswordData.confirmNewPassword}
          onChange={handleChangePasswordChange}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            Changing Password...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </Form>
  );
};

export default ChangePasswordForm;
