import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const LogoUpload = () => {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCurrentLogo();
  }, [id]);

  const fetchCurrentLogo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/seller/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.profilePicture && response.data.profilePicture.path) {
        const path = response.data.profilePicture.path.replace(/^uploads[\\\/]/, '');
        setCurrentLogo(`http://localhost:5000/uploads/${path}`);
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
      setError('Error loading current logo. Please try again later.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError(null);
    setSuccess(null);

    // Validate file type
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please select a valid image file (JPEG or PNG)');
      return;
    }

    // Validate file size (2MB)
    if (file && file.size > 2 * 1024 * 1024) {
      setError('File size should not exceed 2MB');
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
    formData.append('logo', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/seller/upload-logo/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Logo uploaded successfully!');
      if (response.data.profilePicture && response.data.profilePicture.path) {
        const path = response.data.profilePicture.path.replace(/^uploads[\\\/]/, '');
        setCurrentLogo(`http://localhost:5000/uploads/${path}`);
      }
      setSelectedFile(null);
      setPreviewUrl(null);

      // Refresh the logo
      fetchCurrentLogo();
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 401) {
        setError('Please login to upload a logo');
      } else {
        setError(err.response?.data?.message || 'Error uploading logo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Company Logo</h4>
            </Card.Header>
            <Card.Body>
              {/* Current Logo Display */}
              <div className="text-center mb-4">
                <div className="mb-3 d-flex justify-content-center align-items-center">
                  <div 
                    style={{
                      width: '200px',
                      height: '200px',
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      src={currentLogo || '/default-logo.png'}
                      alt="Company Logo"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
                <h5 className="text-muted">Current Logo</h5>
              </div>

              {/* Upload Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => document.getElementById('logoInput').click()}
                  >
                    Select New Logo
                  </Button>
                  <input
                    id="logoInput"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="text-center mt-4">
                    <p className="text-muted mb-2">Preview:</p>
                    <div className="d-flex justify-content-center">
                      <div 
                        style={{
                          width: '150px',
                          height: '150px',
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}
                      >
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {selectedFile && (
                  <div className="text-center mt-3">
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
                        'Upload Logo'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {/* Requirements */}
              <div className="text-muted text-center small">
                <p className="mb-1">Accepted formats: JPEG, PNG</p>
                <p className="mb-0">Maximum file size: 2MB</p>
                <p className="mb-0">Recommended dimensions: 200x200 pixels</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LogoUpload;