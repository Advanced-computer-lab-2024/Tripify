import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProfilePictureUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tourGuide, setTourGuide] = useState(null);

  useEffect(() => {
    fetchTourGuideProfile();
  }, []);

  const fetchTourGuideProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use the getProfileByToken endpoint instead
      const response = await axios.get('http://localhost:5000/api/tourguide/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTourGuide(response.data.tourGuide);
      if (response.data.tourGuide.profilePicture) {
        setCurrentProfilePic(response.data.tourGuide.profilePicture.path);
        console.log(response.data.tourGuide.profilePicture.path);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 403) {
        navigate('/login');
      }
      setError('Error loading profile. Please try again later.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError(null);
    setSuccess(null);

    // Validate file type
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/tourguide/upload-profile-picture/${tourGuide.id}`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Profile picture updated successfully!');
      setCurrentProfilePic(response.data.profilePicture);
   
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh the profile data
      fetchTourGuideProfile();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error uploading profile picture');
      if (err.response?.status === 403) {
        setError('You are not authorized to upload a profile picture for this account');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tourGuide) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow">
              <Card.Body className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Update Profile Picture</h4>
            </Card.Header>
            <Card.Body>
              {/* Current Profile Picture */}
              <div className="text-center mb-4">
                <Image
                  src={currentProfilePic || '/default-profile.png'}
                  roundedCircle
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  className="border shadow-sm"
                />
                <h5 className="mt-3">{tourGuide.username}'s Profile Picture</h5>
              </div>

              {/* Upload Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-center mb-3">
                  <Button
                    variant="outline-primary"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    Select New Picture
                  </Button>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="text-center mb-3">
                    <p className="text-muted">Preview:</p>
                    <Image
                      src={previewUrl}
                      roundedCircle
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      className="border shadow-sm"
                    />
                  </div>
                )}

                {/* Upload Button */}
                {selectedFile && (
                  <div className="text-center">
                    <Button
                      variant="success"
                      onClick={handleUpload}
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Uploading...
                        </>
                      ) : (
                        'Upload Picture'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Error and Success Messages */}
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {/* File Requirements */}
              <div className="text-muted text-center small">
                <p className="mb-1">Accepted formats: JPEG, PNG, WebP</p>
                <p className="mb-0">Maximum file size: 5MB</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePictureUpload;