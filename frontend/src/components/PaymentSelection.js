// src/components/PaymentSelection.js
import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaWallet, FaCreditCard, FaTruck } from "react-icons/fa";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentSelection = ({
  totalAmount,
  walletBalance,
  onPaymentComplete,
  onPaymentError,
  selectedCurrency = "USD",
}) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
    setError("");
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/stripe/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: totalAmount,
            currency: selectedCurrency.toLowerCase(),
          }),
        }
      );

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await onPaymentComplete("card", result.paymentIntent);
    } catch (err) {
      setError(err.message);
      onPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setError("");

    try {
      switch (selectedMethod) {
        case "wallet":
          if (walletBalance < totalAmount) {
            throw new Error("Insufficient wallet balance");
          }
          await onPaymentComplete("wallet");
          break;

        case "cod":
          await onPaymentComplete("cod");
          break;

        default:
          throw new Error("Please select a payment method");
      }
    } catch (err) {
      setError(err.message);
      onPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-selection">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form>
        <div className="mb-4">
          {/* Wallet Payment Option */}
          <div
            className={`payment-option p-3 mb-3 border rounded cursor-pointer ${
              selectedMethod === "wallet" ? "border-primary bg-light" : ""
            }`}
            onClick={() => handlePaymentMethodSelect("wallet")}
            style={{ cursor: "pointer" }}
          >
            <Form.Check
              type="radio"
              id="wallet-payment"
              name="payment-method"
              checked={selectedMethod === "wallet"}
              onChange={() => handlePaymentMethodSelect("wallet")}
              label={
                <div className="d-flex align-items-center ms-2">
                  <FaWallet className="me-2" size={20} />
                  <div>
                    <div className="fw-bold">Pay with Wallet</div>
                    <small className="text-muted">
                      Available Balance: ${walletBalance.toFixed(2)}
                    </small>
                  </div>
                </div>
              }
            />
          </div>

          {/* Credit Card Option */}
          <div
            className={`payment-option p-3 mb-3 border rounded cursor-pointer ${
              selectedMethod === "card" ? "border-primary bg-light" : ""
            }`}
            onClick={() => handlePaymentMethodSelect("card")}
            style={{ cursor: "pointer" }}
          >
            <Form.Check
              type="radio"
              id="card-payment"
              name="payment-method"
              checked={selectedMethod === "card"}
              onChange={() => handlePaymentMethodSelect("card")}
              label={
                <div className="d-flex align-items-center ms-2">
                  <FaCreditCard className="me-2" size={20} />
                  <div>
                    <div className="fw-bold">Credit/Debit Card</div>
                    <small className="text-muted">
                      Secure payment via Stripe
                    </small>
                  </div>
                </div>
              }
            />
            {selectedMethod === "card" && (
              <div className="mt-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
                <Button
                  variant="primary"
                  className="w-100 mt-3"
                  disabled={!stripe || isProcessing}
                  onClick={handleStripePayment}
                >
                  {isProcessing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${selectedCurrency} ${totalAmount.toFixed(2)}`
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Cash on Delivery Option */}
          <div
            className={`payment-option p-3 mb-3 border rounded cursor-pointer ${
              selectedMethod === "cod" ? "border-primary bg-light" : ""
            }`}
            onClick={() => handlePaymentMethodSelect("cod")}
            style={{ cursor: "pointer" }}
          >
            <Form.Check
              type="radio"
              id="cod-payment"
              name="payment-method"
              checked={selectedMethod === "cod"}
              onChange={() => handlePaymentMethodSelect("cod")}
              label={
                <div className="d-flex align-items-center ms-2">
                  <FaTruck className="me-2" size={20} />
                  <div>
                    <div className="fw-bold">Cash on Delivery</div>
                    <small className="text-muted">
                      Pay when you receive the order
                    </small>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {selectedMethod !== "card" && (
          <div className="d-grid">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePaymentSubmit}
              disabled={isProcessing || !selectedMethod}
            >
              {isProcessing ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : (
                `Pay ${selectedCurrency} ${totalAmount.toFixed(2)}`
              )}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default PaymentSelection;
