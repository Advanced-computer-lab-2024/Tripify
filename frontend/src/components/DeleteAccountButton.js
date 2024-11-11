import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DeleteAccountButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline-danger"
      onClick={() => navigate('/profile/delete-account')}
      className="mt-3"
    >
      Delete Account
    </Button>
  );
};

export default DeleteAccountButton;