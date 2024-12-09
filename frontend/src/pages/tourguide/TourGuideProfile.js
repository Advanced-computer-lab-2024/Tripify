import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Spinner, Image } from 'react-bootstrap';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaTrash, 
  FaExclamationTriangle,
  FaBriefcase,
  FaUpload,
  FaChevronRight,
  FaIdCard,
  FaCertificate,
  FaCamera
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TourGuideProfile = () => {
  // State Management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [previousWork, setPreviousWork] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [newWorkEntry, setNewWorkEntry] = useState({
    
    jobTitle: '',
    company: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const navigate = useNavigate();
  const handleNavigateToDashboard = () => {
    navigate('/tourguide/');
  };

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/tourguide/profile/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);
      setPreviousWork(response.data.previousWork || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle work experience input changes
  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleProfilePictureSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('File size should not exceed 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file');
        return;
      }

      setProfilePicture(file);
      setUploadError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle profile picture upload
  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return;

    const formData = new FormData();
    formData.append('profilePicture', profilePicture);

    try {
      setUploadProgress(0);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/tourguide/upload/profilePicture',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
          },
        }
      );

      if (response.data.success) {
        await fetchProfile(); // Refresh profile data
        setUploadError('');
        setUploadProgress(0);
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to upload profile picture');
      setUploadProgress(0);
    }
  };
  const renderProfilePictureSection = () => {
    return (
      <div className="p-4 bg-light rounded-3 mb-4">
        <h5 className="mb-3 text-primary">Profile Picture</h5>
        <div className="d-flex flex-column align-items-center">
          {/* Profile Picture Display */}
          <div className="position-relative mb-3">
            {(previewUrl || profile?.profilePicture?.path) ? (
              <Image
                src={previewUrl || `http://localhost:5000/${profile?.profilePicture?.path}`}
                alt="Profile"
                roundedCircle
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                className="border shadow-sm"
              />
            ) : (
              <div 
                className="bg-secondary d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '150px', height: '150px' }}
              >
                <FaUser size={50} className="text-white" />
              </div>
            )}
            
            {/* Upload button overlay */}
            <label 
              className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <input
                type="file"
                className="d-none"
                accept="image/*"
                onChange={handleProfilePictureSelect}
              />
              <FaCamera className="text-white" size={20} />
            </label>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="w-100 mb-3">
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${uploadProgress}%` }}
                  aria-valuenow={uploadProgress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {uploadProgress}%
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <Alert variant="danger" className="mt-2 w-100">
              {uploadError}
            </Alert>
          )}

          {/* Upload Button */}
          {profilePicture && (
            <Button
              variant="primary"
              onClick={handleProfilePictureUpload}
              className="mt-3"
              disabled={uploadProgress > 0}
            >
              <FaUpload className="me-2" />
              Upload Profile Picture
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Add new work experience
  const handleAddWorkExperience = () => {
    setPreviousWork(prev => [...prev, newWorkEntry]);
    setNewWorkEntry({
      jobTitle: '',
      company: '',
      description: '',
      startDate: '',
      endDate: ''
    });
  };

  // Remove work experience
  const handleRemoveWorkExperience = (index) => {
    setPreviousWork(prev => prev.filter((_, i) => i !== index));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.put(
        `http://localhost:5000/api/tourguide/profile/${user.username}`,
        {
          email: profile.email,
          mobileNumber: profile.mobileNumber,
          yearsOfExperience: profile.yearsOfExperience,
          previousWork: previousWork,
          TandC: profile.TandC
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.tourGuide);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/tourguide/upload/${type}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      fetchProfile(); // Refresh profile data
    } catch (err) {
      setError(`Failed to upload ${type}. Please try again.`);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (confirmText !== profile?.username) {
      setDeleteError('Please enter your username correctly to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.delete(
        `http://localhost:5000/api/tourguide/delete/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '8rem 0 4rem 0',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        />
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <Button
                  variant="link"
                  className="text-white text-decoration-none p-0"
                  onClick={handleNavigateToDashboard}
                >
                  Dashboard <FaChevronRight className="small mx-2" />
                </Button>
              </span>
              <span>My Profile</span>
            </p>
            <h1 className="display-4 mb-0">Tour Guide Profile</h1>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-4">
                {/* Header with Logout Button */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <FaUser className="text-primary me-3" size={24} />
                    <h3 className="mb-0">Profile Information</h3>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleLogout}
                    className="rounded-pill px-4"
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </div>

                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {!isEditing ? (
                  // View Mode
                  <div>
                    {/* Profile Picture Section */}
                    <div className="p-4 bg-light rounded-3 mb-4">
                      <h5 className="mb-3 text-primary">Profile Picture</h5>
                      <div className="d-flex flex-column align-items-center">
                        <div className="position-relative mb-3">
                          {(previewUrl || profile?.profilePicture?.path) ? (
                            <Image
                              src={previewUrl || `http://localhost:5000/${profile?.profilePicture?.path}`}
                              alt="Profile"
                              roundedCircle
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                              className="border shadow-sm"
                            />
                          ) : (
                            <div 
                              className="bg-secondary d-flex align-items-center justify-content-center rounded-circle"
                              style={{ width: '150px', height: '150px' }}
                            >
                              <FaUser size={50} className="text-white" />
                            </div>
                          )}
                          
                          <label 
                            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2"
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="file"
                              className="d-none"
                              accept="image/*"
                              onChange={handleProfilePictureSelect}
                            />
                            <FaCamera className="text-white" size={20} />
                          </label>
                        </div>

                        {uploadProgress > 0 && (
                          <div className="w-100 mb-3">
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                role="progressbar" 
                                style={{ width: `${uploadProgress}%` }}
                                aria-valuenow={uploadProgress} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              >
                                {uploadProgress}%
                              </div>
                            </div>
                          </div>
                        )}

                        {uploadError && (
                          <Alert variant="danger" className="mt-2 w-100">
                            {uploadError}
                          </Alert>
                        )}

                        {/* {profilePicture && (
                          <Button
                            variant="primary"
                            onClick={handleProfilePictureUpload}
                            className="mt-3"
                            disabled={uploadProgress > 0}
                          >
                            <FaUpload className="me-2" />
                            Upload Profile Picture
                          </Button>
                        )} */}
                      </div>
                    </div>

                    {/* Basic Information Section */}
                    <Row className="gy-4">
                      <Col md={6}>
                        <div className="p-4 bg-light rounded-3">
                          <h5 className="mb-3 text-primary">Basic Information</h5>
                          <div className="mb-3">
                            <strong>Username:</strong>
                            <p className="mb-0">{profile?.username}</p>
                          </div>
                          <div className="mb-3">
                            <strong>Email:</strong>
                            <p className="mb-0">{profile?.email}</p>
                          </div>
                          <div className="mb-3">
                            <strong>Mobile Number:</strong>
                            <p className="mb-0">{profile?.mobileNumber}</p>
                          </div>
                          <div className="mb-3">
                            <strong>Years of Experience:</strong>
                            <p className="mb-0">{profile?.yearsOfExperience}</p>
                          </div>
                        </div>
                      </Col>

                      {/* Documents Section */}
                      <Col md={6}>
                        <div className="p-4 bg-light rounded-3">
                          <h5 className="mb-3 text-primary">Verification Documents</h5>
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaIdCard className="me-2" />
                              <strong>ID Document:</strong>
                            </div>
                            <p className="mb-0 text-muted">
                              {profile?.identificationDocument?.isVerified ? 
                                'Verified' : 'Pending Verification'}
                            </p>
                          </div>
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaCertificate className="me-2" />
                              <strong>Certificate:</strong>
                            </div>
                            <p className="mb-0 text-muted">
                              {profile?.certificate?.isVerified ? 
                                'Verified' : 'Pending Verification'}
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Work Experience Section */}
                    <div className="mt-4 p-4 bg-light rounded-3">
                      <h5 className="mb-3 text-primary">Work Experience</h5>
                      {previousWork.map((work, index) => (
                        <div key={index} className="mb-4 p-3 border rounded">
                          <h6>{work.jobTitle} at {work.company}</h6>
                          <p className="text-muted mb-2">
                            {work.startDate} - {work.endDate}
                          </p>
                          <p className="mb-0">{work.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 d-flex gap-3">
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        className="rounded-pill px-4"
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => setShowDeleteModal(true)}
                        className="rounded-pill px-4"
                      >
                        <FaTrash className="me-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Edit Mode Form
                  <Form onSubmit={handleUpdateProfile}>
                    <Row className="gy-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profile?.email || ''}
                            onChange={handleInputChange}
                            className="rounded-pill"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="mobileNumber"
                            value={profile?.mobileNumber || ''}
                            onChange={handleInputChange}
                            className="rounded-pill"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Years of Experience</Form.Label>
                          <Form.Control
                            type="number"
                            name="yearsOfExperience"
                            value={profile?.yearsOfExperience || ''}
                            onChange={handleInputChange}
                            className="rounded-pill"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Work Experience Form */}
                    <div className="mt-4">
                      <h5 className="mb-3">Work Experience</h5>
                      {previousWork.map((work, index) => (
                        <div key={index} className="mb-4 p-3 border rounded">
                          <div className="d-flex justify-content-between">
                            <h6>{work.jobTitle}</h6>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveWorkExperience(index)}
                            >
                              <FaTimes />
                            </Button>
                          </div>
                          <p className="text-muted mb-0">
                            {work.company} ({work.startDate} - {work.endDate})
                          </p>
                        </div>
                      ))}

                      <div className="mt-3 p-3 border rounded">
                        <h6>Add New Experience</h6>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Control
                              placeholder="Job Title"
                              name="jobTitle"
                              value={newWorkEntry.jobTitle}
                              onChange={handleWorkInputChange}
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Control
                              placeholder="Company"
                              name="company"
                              value={newWorkEntry.company}
                              onChange={handleWorkInputChange}
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Control
                              type="date"
                              name="startDate"
                              value={newWorkEntry.startDate}
                              onChange={handleWorkInputChange}
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Control
                              type="date"
                              name="endDate"
                              value={newWorkEntry.endDate}
                              onChange={handleWorkInputChange}
                            />
                          </Col>
                          <Col md={12}>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Description"
                              name="description"
                              value={newWorkEntry.description}
                              onChange={handleWorkInputChange}
                            />
                          </Col>
                          <Col md={12}>
                            <Button
                              variant="primary"
                              onClick={handleAddWorkExperience}
                              disabled={!newWorkEntry.jobTitle || !newWorkEntry.company}
                            >
                              <FaBriefcase className="me-2" />
                              Add Experience
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="mt-4 d-flex gap-3">
                      <Button type="submit" variant="primary" className="rounded-pill px-4">
                        <FaSave className="me-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => setIsEditing(false)}
                        className="rounded-pill px-4"
                      >
                        <FaTimes className="me-2" />
                        Cancel
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default TourGuideProfile;