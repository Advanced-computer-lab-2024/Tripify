import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TouristRegistration = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    mobileNumber: "",
    nationality: "",
    dob: "",
    jobStatus: "",
    jobTitle: "",
    tripTypes: [], // Vacation preferences
    budgetLimit: "", // Budget limit
    preferredDestinations: "", // Preferred destinations
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the navigate function from react-router-dom
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => {
        const updatedTripTypes = checked
          ? [...prevData.tripTypes, value]
          : prevData.tripTypes.filter((tripType) => tripType !== value);
        return { ...prevData, tripTypes: updatedTripTypes };
      });
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tourist/register",
        formData
      );
      setMessage({ type: "success", text: response.data.message });

      // Redirect to the TouristHomePage after successful registration
      navigate("/tourist");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Tourist Registration</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Information Fields */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="mobileNumber" className="form-label">
            Mobile Number
          </label>
          <input
            type="tel"
            className="form-control"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="nationality" className="form-label">
            Nationality
          </label>
          <input
            type="text"
            className="form-control"
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="dob" className="form-label">
            Date of Birth
          </label>
          <input
            type="date"
            className="form-control"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="jobStatus" className="form-label">
            Job Status
          </label>
          <select
            className="form-select"
            id="jobStatus"
            name="jobStatus"
            value={formData.jobStatus}
            onChange={handleChange}
            required
          >
            <option value="">Select job status</option>
            <option value="student">Student</option>
            <option value="job">Employed</option>
          </select>
        </div>
        {formData.jobStatus === "job" && (
          <div className="mb-3">
            <label htmlFor="jobTitle" className="form-label">
              Job Title
            </label>
            <input
              type="text"
              className="form-control"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Preferences Section */}
        <h4>Vacation Preferences:</h4>
        <div className="mb-3">
          <label className="form-label">Trip Types</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="historic"
              checked={formData.tripTypes.includes("historic")}
              onChange={handleChange}
            />
            <label className="form-check-label">Historic Areas</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="beaches"
              checked={formData.tripTypes.includes("beaches")}
              onChange={handleChange}
            />
            <label className="form-check-label">Beaches</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="shopping"
              checked={formData.tripTypes.includes("shopping")}
              onChange={handleChange}
            />
            <label className="form-check-label">Shopping</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="family-friendly"
              checked={formData.tripTypes.includes("family-friendly")}
              onChange={handleChange}
            />
            <label className="form-check-label">Family-Friendly</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="adventures"
              checked={formData.tripTypes.includes("adventures")}
              onChange={handleChange}
            />
            <label className="form-check-label">Adventures</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="luxury"
              checked={formData.tripTypes.includes("luxury")}
              onChange={handleChange}
            />
            <label className="form-check-label">Luxury</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="budget-friendly"
              checked={formData.tripTypes.includes("budget-friendly")}
              onChange={handleChange}
            />
            <label className="form-check-label">Budget-Friendly</label>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="budgetLimit" className="form-label">
            Budget Limit
          </label>
          <input
            type="number"
            className="form-control"
            id="budgetLimit"
            name="budgetLimit"
            value={formData.budgetLimit}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="preferredDestinations" className="form-label">
            Preferred Destinations
          </label>
          <input
            type="text"
            className="form-control"
            id="preferredDestinations"
            name="preferredDestinations"
            value={formData.preferredDestinations}
            onChange={handleChange}
            placeholder="Comma-separated destinations"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
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
    </div>
  );
};

export default TouristRegistration;
