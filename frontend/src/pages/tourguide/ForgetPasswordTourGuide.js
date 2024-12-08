import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleBack = () => {
    if (step === 1) {
      // If at first step, go back to main page
      navigate('/');
    } else {
      // Otherwise, go back one step
      setStep(prev => prev - 1);
      setStatus({ type: '', message: '' }); // Clear any status messages
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('http://localhost:5000/api/tourguide/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setStatus({ type: 'success', message: 'OTP sent successfully!' });
      setStep(2);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error sending OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('http://localhost:5000/api/tourguide/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setStatus({ type: 'success', message: 'OTP verified successfully!' });
      setStep(3);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error verifying OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('http://localhost:5000/api/tourguide/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setStatus({ type: 'success', message: 'Password reset successfully!' });
      // Navigate to home page after successful reset
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error resetting password' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Form>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                onClick={handleSendOtp}
                disabled={loading || !email}
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
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </div>
          </Form>
        );
      case 2:
        return (
          <Form>
            <Form.Group className="mb-3" controlId="formOtp">
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Please check your email for the OTP
              </Form.Text>
            </Form.Group>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
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
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </div>
          </Form>
        );
      case 3:
        return (
          <Form>
            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                onClick={handleResetPassword}
                disabled={loading || !newPassword}
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
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Button 
                  variant="link" 
                  className="text-decoration-none p-0"
                  onClick={handleBack}
                >
                  ← Back
                </Button>
                <h3 className="mb-0">Reset Password</h3>
                <div style={{ width: '44px' }}></div> {/* Spacer for centering */}
              </div>
              
              {status.message && (
                <Alert variant={status.type === 'error' ? 'danger' : 'success'} className="mb-4">
                  {status.message}
                </Alert>
              )}

              {/* Progress indicator */}
              <div className="d-flex justify-content-center mb-4">
                <div className="text-center">
                  <small className="text-muted">
                    Step {step} of 3: {
                      step === 1 ? 'Email Verification' :
                      step === 2 ? 'OTP Verification' :
                      'Reset Password'
                    }
                  </small>
                </div>
              </div>

              {renderStep()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgetPassword;