import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Define the key directly since it's a public key
const STRIPE_PUBLISHABLE_KEY = "pk_test_51QSS8lFgEJ8fkCAwsrteHfbBOZEUgfrILER1TdeO8JeP5IZJBQZtCw9NSIiyZHmBW3DQrJlKR0QaJozNkJFlNTew00ZrXxhwLf";

// Initialize Stripe with the key
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const StripeWrapper = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeWrapper;