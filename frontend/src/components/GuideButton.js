import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import VacationGuide from './VacationGuide';

const GuideButton = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <Button
        variant="info"
        className="position-fixed"
        style={{
          bottom: '2rem',
          right: '2rem',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
        onClick={() => setShowGuide(true)}
      >
        <FaQuestionCircle size={24} />
      </Button>

      <Modal
        show={showGuide}
        onHide={() => setShowGuide(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Vacation Planning Guide</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <VacationGuide />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default GuideButton;