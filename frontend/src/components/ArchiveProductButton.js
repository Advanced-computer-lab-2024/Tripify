import React from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const ArchiveProductButton = ({ productId, isArchived, onArchiveToggle }) => {
  const handleArchiveToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/products/${productId}/archive`,
        { isArchived: !isArchived },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (onArchiveToggle) {
        onArchiveToggle(productId, !isArchived);
      }
    } catch (error) {
      console.error('Error toggling product archive status:', error);
    }
  };

  return (
    <Button
      variant={isArchived ? "outline-success" : "outline-warning"}
      size="sm"
      onClick={handleArchiveToggle}
    >
      {isArchived ? "Unarchive" : "Archive"}
    </Button>
  );
};

export default ArchiveProductButton;