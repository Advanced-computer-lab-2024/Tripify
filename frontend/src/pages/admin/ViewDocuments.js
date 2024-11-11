import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Image, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const AdminVerificationDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for different user types
  const [sellers, setSellers] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [tourGuides, setTourGuides] = useState([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Headers configuration
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // Fetch all unverified users
  const fetchUnverifiedUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [sellersRes, advertisersRes, tourGuidesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/unverified-sellers', config),
        axios.get('http://localhost:5000/api/admin/unverified-advertisers', config),
        axios.get('http://localhost:5000/api/admin/unverified-tourguides', config)
      ]);

      setSellers(sellersRes.data);
      setAdvertisers(advertisersRes.data);
      setTourGuides(tourGuidesRes.data);
    } catch (err) {
      setError('Failed to fetch unverified users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedUsers();
  }, []);

  // Handle document preview
  const handlePreview = (user, documentType) => {
    setSelectedUser(user);
    
    // Construct the document URL using the path from MongoDB
    const documentPath = user[documentType]?.path; // Retrieve the path from the user object
  
    // Assuming your backend serves static files at /uploads
    const documentUrl = `http://localhost:5000/${documentPath.replace(/\\/g, '/')}`; // Replace backslashes for URL format
    
    setSelectedDocument({
      type: documentType,
      url: documentUrl,  // Use the full URL
      mimeType: user[documentType]?.mimetype // Use the mime type from the document object
    });
    
    setShowModal(true);
  };
  

  // Handle document verification
  const handleVerification = async (userId, userType, isApproved) => {
    setVerificationLoading(true);
    try {
      // Convert userType to the correct endpoint format
      const endpointType = userType === 'tourguide' ? 'tourguide' : 
                          userType === 'seller' ? 'seller' : 
                          userType === 'advertiser' ? 'advertiser' : '';
                          
      if (!endpointType) {
        throw new Error('Invalid user type');
      }
  
      const endpoint = `http://localhost:5000/api/admin/verify-${endpointType}/${userId}`;
      await axios.put(endpoint, { isApproved }, config);
      
      setSuccess(`${userType.charAt(0).toUpperCase() + userType.slice(1)} ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchUnverifiedUsers(); // Refresh the list
      setShowModal(false);
    } catch (err) {
      setError(`Failed to ${isApproved ? 'approve' : 'reject'} ${userType}: ${err.message}`);
    } finally {
      setVerificationLoading(false);
    }
  };
  
  // Render document preview modal
  const renderDocumentModal = () => (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Document Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedDocument?.mimeType?.startsWith('image/') ? (
          <Image src={selectedDocument.url} fluid />
        ) : (
          <div className="text-center">
            <p>PDF document preview not available</p>
            <a href={selectedDocument?.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Open PDF
            </a>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
        <Button
          variant="danger"
          onClick={() => handleVerification(selectedUser._id, selectedUser.userType, false)}
          disabled={verificationLoading}
        >
          Reject
        </Button>
        <Button
          variant="success"
          onClick={() => handleVerification(selectedUser._id, selectedUser.userType, true)}
          disabled={verificationLoading}
        >
          Approve
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Render user verification table
  const renderUserTable = (users, userType) => (
    <Table responsive striped bordered hover>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Registration Date</th>
          <th>Documents</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
              <div className="d-flex gap-2">
                {userType === 'tourguide' ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handlePreview(
                        { ...user, userType: 'tourguide' }, // Add userType here
                        'identificationDocument'
                      )}
                    >
                      View ID
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePreview(
                        { ...user, userType: 'tourguide' }, // Add userType here
                        'certificate'
                      )}
                    >
                      View Certificate
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handlePreview(
                        { ...user, userType }, // Add userType here
                        'businessLicense'
                      )}
                    >
                      View License
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePreview(
                        { ...user, userType }, // Add userType here
                        'identificationDocument'
                      )}
                    >
                      View ID
                    </Button>
                  </>
                )}
              </div>
            </td>
            <td>
              <Badge bg={user.isVerified ? 'success' : 'warning'}>
                {user.isVerified ? 'Verified' : 'Pending'}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h2>Document Verification Dashboard</h2>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <Tabs defaultActiveKey="sellers" className="mb-3">
                  <Tab eventKey="sellers" title={`Sellers (${sellers.length})`}>
                    {renderUserTable(sellers, 'seller')}
                  </Tab>
                  <Tab eventKey="advertisers" title={`Advertisers (${advertisers.length})`}>
                    {renderUserTable(advertisers, 'advertiser')}
                  </Tab>
                  <Tab eventKey="tourguides" title={`Tour Guides (${tourGuides.length})`}>
                    {renderUserTable(tourGuides, 'tourguide')}
                  </Tab>
                </Tabs>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {renderDocumentModal()}
    </Container>
  );
};

export default AdminVerificationDashboard;
