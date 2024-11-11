import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
const UserApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState({
    tourGuides: [],
    advertisers: [],
    sellers: [],
  });
  const [statistics, setStatistics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPendingApprovals();
    fetchStatistics();
  }, []);
  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/approvals/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingApprovals(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      setLoading(false);
    }
  };
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/approvals/statistics",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };
  const handleApproval = async (user, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/admin/approvals/update",
        {
          userId: user._id,
          userType: user.userType,
          status,
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPendingApprovals();
      fetchStatistics();
      setShowModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error updating approval status:", error);
    }
  };
  const handleReject = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  const renderStatistics = () => {
    if (!statistics) return null;
    return (
      <div className="mb-4 p-3 bg-light rounded">
        <h4>Approval Statistics</h4>
        <div className="row">
          {Object.entries(statistics).map(([userType, stats]) => (
            <div
              key={userType}
              className="col-md-4"
            >
              <h5>{userType.replace(/([A-Z])/g, " $1").trim()}</h5>
              <div>Pending: {stats.pending}</div>
              <div>Approved: {stats.approved}</div>
              <div>Rejected: {stats.rejected}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderDocuments = (user) => {
    if (!user.documents || user.documents.length === 0) {
      return <span className="text-muted">No documents uploaded</span>;
    }
    return user.documents.map((doc, index) => (
      <div key={index}>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {doc.type}
        </a>
      </div>
    ));
  };
  return (
    <div className="container mt-4">
      <h2>User Approvals Management</h2>

      {renderStatistics()}
      {loading ? (
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        Object.entries(pendingApprovals).map(([userType, users]) => (
          <div
            key={userType}
            className="mb-4"
          >
            <h3>{userType.replace(/([A-Z])/g, " $1").trim()}</h3>
            {users.length === 0 ? (
              <p>No pending approvals</p>
            ) : (
              <Table
                striped
                bordered
                hover
              >
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Documents</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{renderDocuments(user)}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproval(user, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(user)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        ))
      )}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Reject User Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleApproval(selectedUser, "rejected")}
            disabled={!rejectionReason.trim()}
          >
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default UserApprovals;
