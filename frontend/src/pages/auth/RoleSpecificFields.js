// RoleSpecificFields.js

import React from "react";
import { Form } from "react-bootstrap";

const RoleSpecificFields = ({ registerData, handleRegisterChange, selectedRole }) => {
  if (selectedRole === "tourist") {
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control
            type="text"
            name="mobileNumber"
            value={registerData.mobileNumber || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nationality</Form.Label>
          <Form.Control
            type="text"
            name="nationality"
            value={registerData.nationality || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            name="dob"
            value={registerData.dob || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
      </>
    );
  }

  if (selectedRole === "advertiser") {
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            name="companyName"
            value={registerData.companyName || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Company Description</Form.Label>
          <Form.Control
            as="textarea"
            name="companyDescription"
            value={registerData.companyDescription || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Website</Form.Label>
          <Form.Control
            type="url"
            name="website"
            value={registerData.website || ""}
            onChange={handleRegisterChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Hotline</Form.Label>
          <Form.Control
            type="text"
            name="hotline"
            value={registerData.hotline || ""}
            onChange={handleRegisterChange}
          />
        </Form.Group>
      </>
    );
  }

  if (selectedRole === "tourguide") {
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control
            type="text"
            name="mobileNumber"
            value={registerData.mobileNumber || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Years of Experience</Form.Label>
          <Form.Control
            type="number"
            name="yearsOfExperience"
            value={registerData.yearsOfExperience || ""}
            onChange={handleRegisterChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Previous Work</Form.Label>
          <Form.Control
            as="textarea"
            name="previousWork"
            value={registerData.previousWork || ""}
            onChange={handleRegisterChange}
          />
        </Form.Group>
      </>
    );
  }

  // Add more cases for other roles if needed
  return null;
};

export default RoleSpecificFields;
