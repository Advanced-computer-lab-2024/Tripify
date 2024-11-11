import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert, Image, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const TourGuideRegistration = () => {
  const initialFormState = {
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    yearsOfExperience: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [files, setFiles] = useState({
    identificationDocument: null,
    certificate: null
  });
  const [previews, setPreviews] = useState({
    identificationDocument: null,
    certificate: null
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    
    if (fileList && fileList[0]) {
      // Validate file type
      if (!fileList[0].type.startsWith('image/')) {
        setAlert({
          type: 'danger',
          message: `Please upload an image file for ${name === 'identificationDocument' ? 'ID' : 'Certificate'}`
        });
        return;
      }

      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));

      // Create preview for image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(fileList[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });

    // Validate required files
    if (!files.identificationDocument || !files.certificate) {
      setAlert({
        type: 'danger',
        message: 'Both ID document and certificate images are required'
      });
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    // Append text data
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formDataToSend.append(key, files[key]);
      }
    });

    try {
      const response = await axios.post(
        'http://localhost:5000/api/tourguide/register',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAlert({
        type: 'success',
        message: 'Registration successful!'
      });
      
      // Reset form
      setFormData(initialFormState);
      setFiles({
        identificationDocument: null,
        certificate: null
      });
      setPreviews({
        identificationDocument: null,
        certificate: null
      });

    } catch (err) {
      console.error('Registration Error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      setAlert({
        type: 'danger',
        message: err.response?.data?.message || err.message || 'Error during registration'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow">
        <Card.Header as="h4" className="bg-primary text-white py-3">
          Tour Guide Registration
        </Card.Header>
        <Card.Body>
          {alert.message && (
            <Alert variant={alert.type} dismissible onClose={() => setAlert({ type: '', message: '' })}>
              {alert.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header className="bg-light">Personal Information</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Years of Experience</Form.Label>
                      <Form.Control
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card>
                  <Card.Header className="bg-light">Required Documents</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-4">
                      <Form.Label>ID Document (Image only)</Form.Label>
                      <Form.Control
                        type="file"
                        name="identificationDocument"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                      />
                      {previews.identificationDocument && (
                        <div className="mt-2">
                          <Image
                            src={previews.identificationDocument}
                            alt="ID Preview"
                            thumbnail
                            style={{ maxWidth: '200px' }}
                          />
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Certificate (Image only)</Form.Label>
                      <Form.Control
                        type="file"
                        name="certificate"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                      />
                      {previews.certificate && (
                        <div className="mt-2">
                          <Image
                            src={previews.certificate}
                            alt="Certificate Preview"
                            thumbnail
                            style={{ maxWidth: '200px' }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-grid gap-2 mt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TourGuideRegistration;