import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationDialog = ({ show, onClose, onConfirm, userRole }) => {
  const getRoleSpecificMessage = () => {
    switch (userRole) {
      case 'tourist':
        return "All your bookings and reviews will be permanently deleted.";
      case 'tourguide':
        return "All your itineraries and tour information will be permanently removed.";
      case 'advertiser':
        return "All your activities and advertisements will be permanently removed.";
      case 'seller':
        return "All your products and seller information will be permanently removed.";
      default:
        return "";
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Confirm Account Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Warning: This action cannot be undone!</strong></p>
        <p>{getRoleSpecificMessage()}</p>
        <p>Are you absolutely sure you want to proceed?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Delete My Account
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationDialog;