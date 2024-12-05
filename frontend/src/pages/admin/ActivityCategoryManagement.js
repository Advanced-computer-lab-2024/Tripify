import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";

const API_URL = "http://localhost:5000/api/activities/category";

const ActivityCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to fetch categories. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editingId !== null) {
        // Update existing category
        const response = await axios.put(`${API_URL}/${editingId}`, {
          name: categoryName,
        });
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category._id === editingId ? response.data : category
          )
        );
        setMessage({ type: "success", text: "Category updated successfully" });
        setEditingId(null);
      } else {
        // Add new category
        const response = await axios.post(API_URL, { name: categoryName });
        setCategories((prevCategories) => [...prevCategories, response.data]);
        setMessage({ type: "success", text: "Category added successfully" });
      }
      setCategoryName("");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingId(category._id);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== id)
      );
      setMessage({ type: "success", text: "Category deleted successfully" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to delete category. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && categories.length === 0) {
    return <div className="text-center mt-5">Loading categories...</div>;
  }

  return (
    <>
    <AdminNavbar/>
    <div className="container" style={{marginTop:"100px"}}>
      <h2 className="mb-4">Activity Category Management</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : editingId !== null
              ? "Update"
              : "Add"}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <h3>Categories</h3>
      <ul className="list-group">
        {categories.map((category) => (
          <li
            key={category._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {category.name}
            <div>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={() => handleEdit(category)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(category._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default ActivityCategoryManagement;
