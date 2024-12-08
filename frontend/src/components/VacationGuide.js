import React, { useState } from 'react';
import { Container, Card, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaWallet,
  FaMapMarkedAlt,
  FaHotel,
  FaPlane,
  FaCar,
  FaBookmark,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';

const VacationGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to Your Vacation Planning!",
      description: "Let's get started with planning your perfect vacation. We'll guide you through everything you need to do.",
      icon: <FaInfoCircle className="text-primary" size={48} />,
      action: null
    },
    {
      title: "Step 1: Fund Your Wallet",
      description: "First, add money to your wallet. This will enable you to make bookings and purchases.",
      icon: <FaWallet className="text-success" size={48} />,
      action: {
        text: "Go to Wallet",
        path: "/tourist/my-profile"
      }
    },
    {
      title: "Step 2: Explore Available Events",
      description: "Browse through historical places, activities, and guided tours. Save your favorites for later reference.",
      icon: <FaMapMarkedAlt className="text-info" size={48} />,
      action: {
        text: "View Events",
        path: "/tourist/view-events"
      }
    },
    {
      title: "Step 3: Book Your Stay",
      description: "Find and book the perfect accommodation for your trip.",
      icon: <FaHotel className="text-primary" size={48} />,
      action: {
        text: "Book Hotel",
        path: "/tourist/book-hotel"
      }
    },
    {
      title: "Step 4: Plan Transportation",
      description: "Book your flights and arrange local transportation.",
      icon: <FaCar className="text-warning" size={48} />,
      multipleActions: [
        {
          text: "Book Flight",
          path: "/tourist/book-flight",
          icon: <FaPlane />
        },
        {
          text: "Book Transportation",
          path: "/tourist/book-transportation",
          icon: <FaCar />
        }
      ]
    },
    {
      title: "Step 5: Review Your Plans",
      description: "Check all your bookings and saved places in one convenient location.",
      icon: <FaCheckCircle className="text-success" size={48} />,
      multipleActions: [
        {
          text: "View Bookings",
          path: "/tourist/view-bookings",
          icon: <FaCheckCircle />
        },
        {
          text: "Saved Places",
          path: "/tourist/saved-events",
          icon: <FaBookmark />
        }
      ]
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (path) => {
    navigate(path);
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          <ProgressBar now={progress} className="mb-4" />
          
          <div className="text-center mb-4">
            <div className="mb-4">
              {steps[currentStep].icon}
            </div>
            <h2 className="mb-3">{steps[currentStep].title}</h2>
            <p className="text-muted mb-4">{steps[currentStep].description}</p>
            
            {steps[currentStep].action && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleAction(steps[currentStep].action.path)}
              >
                {steps[currentStep].action.text}
              </Button>
            )}

            {steps[currentStep].multipleActions && (
              <div className="d-flex justify-content-center gap-3">
                {steps[currentStep].multipleActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline-primary"
                    size="lg"
                    onClick={() => handleAction(action.path)}
                    className="d-flex align-items-center gap-2"
                  >
                    {action.icon}
                    {action.text}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between mt-5 pt-3 border-top">
            <Button
              variant="link"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-decoration-none"
            >
              <FaArrowLeft className="me-2" />
              Previous
            </Button>
            <div className="text-muted">
              Step {currentStep + 1} of {steps.length}
            </div>
            <Button
              variant="link"
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="text-decoration-none"
            >
              Next
              <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VacationGuide;