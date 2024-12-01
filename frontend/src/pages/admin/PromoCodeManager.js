import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Table, Modal, Alert } from "react-bootstrap";

const PromoCodeManager = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoCode, setPromoCode] = useState({
    code: "",
    discount: "",
    expiryDate: "",
    usageLimit: 1,
    isActive: true,
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/promo-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromoCodes(response.data);
    } catch (err) {
      setError("Failed to fetch promo codes.");
    }
  };

  const handleShowModal = (promoCode = {}, edit = false) => {
    setPromoCode(promoCode);
    setEditMode(edit);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPromoCode((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setPromoCode((prevState) => ({
      ...prevState,
      isActive: e.target.checked,
    }));
  };

  const handleCreateOrUpdate = async () => {
    try {
      // Ensure all required fields are provided
      if (!promoCode.code || !promoCode.discount || !promoCode.expiryDate) {
        setError("Code, discount, and expiry date are required.");
        return;
      }

      // Prepare the promo code data
      const promoData = {
        ...promoCode,
        expiryDate: new Date(promoCode.expiryDate), // Convert expiryDate to Date object
      };

      if (editMode) {
        // Update existing promo code
        await axios.put(
          `http://localhost:5000/api/admin/promo-codes/${promoCode._id}`,
          promoData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess("Promo code updated successfully!");
      } else {
        // Create new promo code
        await axios.post(
          "http://localhost:5000/api/admin/promo-codes",
          promoData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess("Promo code created successfully!");
      }

      fetchPromoCodes(); // Refresh the list of promo codes
      setShowModal(false); // Close the modal
    } catch (err) {
      setError(err.response ? err.response.data.message : "Error creating/updating promo code.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/promo-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Promo code deleted successfully!");
      fetchPromoCodes();
    } catch (err) {
      setError("Error deleting promo code.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Promo Code Management</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => handleShowModal()}
      >
        Create Promo Code
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Promo Code</th>
            <th>Discount</th>
            <th>Expiry Date</th>
            <th>Usage Limit</th>
            <th>Is Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promoCodes.map((promo) => (
            <tr key={promo._id}>
              <td>{promo.code}</td>
              <td>{promo.discount}%</td>
              <td>{new Date(promo.expiryDate).toLocaleDateString()}</td>
              <td>{promo.usageLimit}</td>
              <td>{promo.isActive ? "Yes" : "No"}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleShowModal(promo, true)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(promo._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Promo Code" : "Create Promo Code"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPromoCode">
              <Form.Label>Promo Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter promo code"
                name="code"
                value={promoCode.code}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formDiscount">
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter discount"
                name="discount"
                value={promoCode.discount}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formExpiryDate">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                name="expiryDate"
                value={promoCode.expiryDate}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formUsageLimit">
              <Form.Label>Usage Limit</Form.Label>
              <Form.Control
                type="number"
                name="usageLimit"
                value={promoCode.usageLimit}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formIsActive">
              <Form.Check
                type="checkbox"
                label="Is Active"
                name="isActive"
                checked={promoCode.isActive}
                onChange={handleCheckboxChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateOrUpdate}>
            {editMode ? "Update" : "Create"} Promo Code
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PromoCodeManager;
