import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductManagement = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    imageUrl: "",
    seller: "",
    rating: "",
    review: "",
  });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch all products on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data.products);
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to fetch products",
        });
      }
    };

    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle adding a new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editMode) {
        // Update an existing product
        const response = await axios.put(
          `http://localhost:5000/api/products/${editId}`,
          formData
        );
        setMessage({ type: "success", text: "Product updated successfully!" });
      } else {
        // Add a new product
        const response = await axios.post(
          "http://localhost:5000/api/products",
          formData
        );
        setMessage({ type: "success", text: "Product added successfully!" });
      }

      // Clear form and fetch updated product list
      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        imageUrl: "",
        seller: "",
        rating: "",
        review: "",
      });
      setEditMode(false);
      setEditId(null);
      fetchProducts();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products for the table
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data.products);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to fetch products",
      });
    }
  };

  // Handle editing a product
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl,
      seller: product.seller,
      rating: product.rating,
      review: product.review,
    });
    setEditMode(true);
    setEditId(product._id);
  };

  // Handle deleting a product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setMessage({ type: "success", text: "Product deleted successfully!" });
      fetchProducts(); // Fetch updated product list
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to delete product",
      });
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">{editMode ? "Edit Product" : "Add New Product"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label
            htmlFor="name"
            className="form-label"
          >
            Product Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="description"
            className="form-label"
          >
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label
            htmlFor="price"
            className="form-label"
          >
            Price
          </label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="quantity"
            className="form-label"
          >
            Quantity
          </label>
          <input
            type="number"
            className="form-control"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="imageUrl"
            className="form-label"
          >
            Image URL
          </label>
          <input
            type="url"
            className="form-control"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="seller"
            className="form-label"
          >
            Seller
          </label>
          <input
            type="text"
            className="form-control"
            id="seller"
            name="seller"
            value={formData.seller}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="rating"
            className="form-label"
          >
            Rating
          </label>
          <input
            type="number"
            className="form-control"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            step="0.1"
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="review"
            className="form-label"
          >
            Review
          </label>
          <textarea
            className="form-control"
            id="review"
            name="review"
            value={formData.review}
            onChange={handleChange}
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : editMode
            ? "Update Product"
            : "Add Product"}
        </button>
      </form>

      {message && (
        <div
          className={`alert mt-3 ${
            message.type === "success" ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <h2 className="mt-5">Product List</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(product._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;
