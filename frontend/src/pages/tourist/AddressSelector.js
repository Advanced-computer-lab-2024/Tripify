import React, { useState, useEffect } from "react";
import { Form, Alert, Spinner } from "react-bootstrap";
import { FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const AddressSelector = ({ onSelect, selectedAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/tourist/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAddresses(response.data.addresses);
        // If there's a selected address and it's in the list, keep it selected
        if (!selectedAddress && response.data.addresses.length > 0) {
          onSelect(response.data.addresses[0]);
        }
      }
    } catch (error) {
      setError("Failed to load addresses");
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (addresses.length === 0) {
    return (
      <Alert variant="info">
        No delivery addresses found. Please add an address from your profile.
      </Alert>
    );
  }

  return (
    <div>
      <h6 className="mb-3">Delivery Address</h6>
      <Form>
        {addresses.map((address) => (
          <div
            key={address._id}
            className={`border rounded p-3 mb-2 cursor-pointer ${
              selectedAddress?._id === address._id
                ? "border-primary bg-light"
                : ""
            }`}
            onClick={() => onSelect(address)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-start">
              <Form.Check
                type="radio"
                name="deliveryAddress"
                checked={selectedAddress?._id === address._id}
                onChange={() => onSelect(address)}
                className="me-3 mt-1"
              />
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  <span className="fw-bold">{address.label || "Address"}</span>
                </div>
                <p className="mb-1 small">{address.street}</p>
                <p className="mb-1 small">{`${address.city}, ${address.state} ${address.postalCode}`}</p>
                <p className="mb-0 small">{address.country}</p>
              </div>
            </div>
          </div>
        ))}
      </Form>
    </div>
  );
};

export default AddressSelector;
