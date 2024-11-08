// RoleSelectorModal.js

import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";

const RoleSelectorModal = ({ show, onHide, roles = [], selectedRole, handleRoleSelect }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-grid gap-2">
          {roles.length > 0 ? (
            roles.map((role) => (
              <Button
                key={role.value}
                variant={selectedRole === role.value ? "primary" : "outline-primary"}
                onClick={() => handleRoleSelect(role.value)}
                className="text-start"
              >
                {role.label}
              </Button>
            ))
          ) : (
            <p>No roles available.</p>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Optional: Define PropTypes for validation
RoleSelectorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  selectedRole: PropTypes.string.isRequired,
  handleRoleSelect: PropTypes.func.isRequired,
};

// Default props (if needed)
RoleSelectorModal.defaultProps = {
  roles: [],
};

export default RoleSelectorModal;
