import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TouristChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "danger",
        text: "New passwords don't match",
      });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "danger",
          text: "No authentication token found. Please login again.",
        });
        setIsLoading(false);
        navigate("/login");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/tourist/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.clear();
      setMessage({
        type: "success",
        text: "Password updated successfully! Please log in with your new password.",
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setMessage({
        type: "danger",
        text:
          error.response?.data?.message ||
          "Error changing password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Change Password</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="currentPassword"
                    className="form-label"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="newPassword"
                    className="form-label"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="confirmPassword"
                    className="form-label"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Changing Password..." : "Change Password"}
                  </button>
                </div>
              </form>
              {message && (
                <div
                  className={`alert alert-${message.type} mt-3`}
                  role="alert"
                >
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristChangePassword;
