import React, { useState } from "react";
import { Modal, Alert, Spinner } from "react-bootstrap";
import PaymentSelection from "../../components/PaymentSelection";
import { FaMoneyCheckAlt } from "react-icons/fa";

const EventPaymentModal = ({
  show,
  onHide,
  totalAmount,
  walletBalance,
  onPaymentComplete,
  eventDetails,
  appliedPromoCode = null,
  selectedCurrency = "USD",
}) => {
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (paymentMethod, paymentIntent) => {
    setProcessing(true);
    setError("");

    try {
      await onPaymentComplete(paymentMethod, paymentIntent);
      onHide();
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FaMoneyCheckAlt className="me-2" />
          Complete Your Booking
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="mb-4">
          <h5>Booking Details</h5>
          <div className="bg-light p-3 rounded">
            <p className="mb-2">
              <strong>Event:</strong> {eventDetails?.name}
            </p>
            <p className="mb-2">
              <strong>Type:</strong> {eventDetails?.type}
            </p>
            {appliedPromoCode && (
              <p className="mb-2 text-success">
                <strong>Promo Code Applied:</strong> {appliedPromoCode}
              </p>
            )}
            <p className="mb-0">
              <strong>Total Amount:</strong> {selectedCurrency}{" "}
              {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {processing ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Processing your payment...</p>
          </div>
        ) : (
          <PaymentSelection
            totalAmount={totalAmount}
            walletBalance={walletBalance}
            onPaymentComplete={handlePayment}
            onPaymentError={setError}
            selectedCurrency={selectedCurrency}
            disableCOD={true} // Add this prop to disable Cash on Delivery
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EventPaymentModal;
