import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AdvertiserRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    companyName: '',
    companyDescription: '',
    website: '',
    hotline: '',
    companyLogo: ''
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('http://localhost:5000/api/advertiser/register', formData);
      setMessage({ type: 'success', text: 'Registration successful!' });

      // Redirect to advertiser homepage after successful registration
      navigate("/advertiser"); // Redirect to advertiser homepage

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred during registration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Advertiser Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
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
          <label htmlFor="email" className="form-label">Email</label>
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
          <label htmlFor="password" className="form-label">Password</label>
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
          <label htmlFor="companyName" className="form-label">Company Name</label>
          <input
            type="text"
            className="form-control"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="companyDescription" className="form-label">Company Description</label>
          <textarea
            className="form-control"
            id="companyDescription"
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="website" className="form-label">Website</label>
          <input
            type="url"
            className="form-control"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="hotline" className="form-label">Hotline</label>
          <input
            type="tel"
            className="form-control"
            id="hotline"
            name="hotline"
            value={formData.hotline}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="companyLogo" className="form-label">Company Logo URL</label>
          <input
            type="url"
            className="form-control"
            id="companyLogo"
            name="companyLogo"
            value={formData.companyLogo}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && (
        <div className={`alert mt-3 ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AdvertiserRegister;
